import express from 'express';
import multer from 'multer';
import { Pool } from 'pg';
import csv from 'csv-parse';
import { promises as fs } from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'roadmap_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'dota'
});

interface OrganizationRow {
    organization_name: string;
    organization_description: string;
    organization_contact_info: string;
    area_name: string;
    area_description: string;
    team_name: string;
    team_description: string;
    architect_name: string;
    architect_email: string;
    architect_contact_info: string;
    application_name: string;
    application_description: string;
    application_status: string;
    application_enterprise_id: string;
    subsystem_name: string;
    subsystem_description: string;
    subsystem_enterprise_id: string;
    subsystem_type: string;
    subsystem_status: string;
    capability_name: string;
    capability_description: string;
    capability_type: string;
    capability_status: string;
}

interface ProjectRow {
    project_name: string;
    project_title: string;
    project_type: string;
    project_description: string;
    start_date: string;
    end_date: string;
    status: string;
    is_shared: string;
    owner_architect_email: string;
    owner_team_name: string;
    subscribed_team_names: string;
    dependency_project_ids: string;
    subsystem_enterprise_ids: string;
    custom_start_dates: string;
    custom_end_dates: string;
    notes: string;
}

interface DbArchitect {
    id: number;
    email: string;
}

interface DbTeam {
    id: number;
    name: string;
}

interface DbSubsystem {
    id: number;
    enterprise_id: string;
}

async function processOrganizationData(client: any, data: OrganizationRow[]) {
    // Group data by organization
    const organizations = new Map<string, OrganizationRow>();
    data.forEach(row => {
        if (!organizations.has(row.organization_name)) {
            organizations.set(row.organization_name, row);
        }
    });

    // Insert organizations and store IDs
    const orgIds = new Map<string, number>();
    for (const [orgName, row] of organizations) {
        const result = await client.query(
            'INSERT INTO roadmap.organizations (name, description, contact_info) VALUES ($1, $2, $3) RETURNING id',
            [orgName, row.organization_description, row.organization_contact_info]
        );
        orgIds.set(orgName, result.rows[0].id);
    }

    // Process areas
    const areas = new Map<string, { row: OrganizationRow; orgId: number }>();
    data.forEach(row => {
        const key = `${row.organization_name}|${row.area_name}`;
        if (!areas.has(key)) {
            areas.set(key, { row, orgId: orgIds.get(row.organization_name)! });
        }
    });

    const areaIds = new Map<string, number>();
    for (const [key, { row, orgId }] of areas) {
        const result = await client.query(
            'INSERT INTO roadmap.areas (organization_id, name, description) VALUES ($1, $2, $3) RETURNING id',
            [orgId, row.area_name, row.area_description]
        );
        areaIds.set(key, result.rows[0].id);
    }

    // Process teams
    const teams = new Map<string, { row: OrganizationRow; areaId: number }>();
    data.forEach(row => {
        const areaKey = `${row.organization_name}|${row.area_name}`;
        const teamKey = `${areaKey}|${row.team_name}`;
        if (!teams.has(teamKey)) {
            teams.set(teamKey, { row, areaId: areaIds.get(areaKey)! });
        }
    });

    const teamIds = new Map<string, number>();
    for (const [key, { row, areaId }] of teams) {
        const result = await client.query(
            'INSERT INTO roadmap.teams (area_id, name, description) VALUES ($1, $2, $3) RETURNING id',
            [areaId, row.team_name, row.team_description]
        );
        teamIds.set(key, result.rows[0].id);
    }

    // Process architects
    const architects = new Map<string, OrganizationRow>();
    data.forEach(row => {
        if (!architects.has(row.architect_email)) {
            architects.set(row.architect_email, row);
        }
    });

    const architectIds = new Map<string, number>();
    for (const [email, row] of architects) {
        const result = await client.query(
            'INSERT INTO roadmap.architects (name, email, contact_info) VALUES ($1, $2, $3) RETURNING id',
            [row.architect_name, email, row.architect_contact_info]
        );
        architectIds.set(email, result.rows[0].id);
    }

    // Process applications
    const applications = new Map<string, { row: OrganizationRow; teamId: number; architectId: number }>();
    data.forEach(row => {
        const teamKey = `${row.organization_name}|${row.area_name}|${row.team_name}`;
        const appKey = `${teamKey}|${row.application_name}`;
        if (!applications.has(appKey)) {
            applications.set(appKey, {
                row,
                teamId: teamIds.get(teamKey)!,
                architectId: architectIds.get(row.architect_email)!
            });
        }
    });

    const applicationIds = new Map<string, number>();
    for (const [key, { row, teamId, architectId }] of applications) {
        const result = await client.query(
            'INSERT INTO roadmap.applications (team_id, architect_id, name, description, status, enterprise_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [teamId, architectId, row.application_name, row.application_description, row.application_status, row.application_enterprise_id]
        );
        applicationIds.set(key, result.rows[0].id);
    }

    // Process subsystems
    const subsystems = new Map<string, { row: OrganizationRow; applicationId: number }>();
    data.forEach(row => {
        const appKey = `${row.organization_name}|${row.area_name}|${row.team_name}|${row.application_name}`;
        const subsystemKey = `${appKey}|${row.subsystem_name}`;
        if (!subsystems.has(subsystemKey)) {
            subsystems.set(subsystemKey, {
                row,
                applicationId: applicationIds.get(appKey)!
            });
        }
    });

    const subsystemIds = new Map<string, number>();
    for (const [key, { row, applicationId }] of subsystems) {
        const result = await client.query(
            'INSERT INTO roadmap.subsystems (application_id, name, description, enterprise_id, type, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [applicationId, row.subsystem_name, row.subsystem_description, row.subsystem_enterprise_id, row.subsystem_type, row.subsystem_status]
        );
        subsystemIds.set(key, result.rows[0].id);
    }

    // Process capabilities
    for (const row of data) {
        const appKey = `${row.organization_name}|${row.area_name}|${row.team_name}|${row.application_name}`;
        const subsystemKey = `${appKey}|${row.subsystem_name}`;
        const subsystemId = subsystemIds.get(subsystemKey);

        await client.query(
            'INSERT INTO roadmap.capabilities (subsystem_id, name, description, type, status) VALUES ($1, $2, $3, $4, $5)',
            [subsystemId, row.capability_name, row.capability_description, row.capability_type, row.capability_status]
        );
    }
}

async function processProjectData(client: any, data: ProjectRow[]) {
    // First, get all architects and teams for reference
    const architectResults = await client.query(
        'SELECT id, email FROM roadmap.architects'
    );
    const architectMap = new Map(
        architectResults.rows.map((row: DbArchitect) => [row.email, row.id])
    );

    const teamResults = await client.query(
        'SELECT id, name FROM roadmap.teams'
    );
    const teamMap = new Map(
        teamResults.rows.map((row: DbTeam) => [row.name, row.id])
    );

    const subsystemResults = await client.query(
        'SELECT id, enterprise_id FROM roadmap.subsystems'
    );
    const subsystemMap = new Map(
        subsystemResults.rows.map((row: DbSubsystem) => [row.enterprise_id, row.id])
    );

    // Insert projects with proper type handling
    const projectIds = new Map<string, number>();
    for (const row of data) {
        const ownerArchitectId = architectMap.get(row.owner_architect_email);
        const ownerTeamId = teamMap.get(row.owner_team_name);

        if (!ownerArchitectId || !ownerTeamId) {
            throw new Error(`Owner architect or team not found for project ${row.project_name}`);
        }

        // Validate and normalize project type
        let projectType = row.project_type.toLowerCase();
        if (!['business', 'infrastructure', 'capability'].includes(projectType)) {
            projectType = 'business'; // Default to business if invalid type
        }

        const result = await client.query(
            `INSERT INTO roadmap.projects 
            (name, title, type, description, start_date, end_date, status, owner_architect_id, owner_team_id, is_shared) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING id`,
            [
                row.project_name,
                row.project_title,
                projectType,
                row.project_description,
                row.start_date,
                row.end_date,
                row.status,
                ownerArchitectId,
                ownerTeamId,
                row.is_shared.toLowerCase() === 'true'
            ]
        );
        projectIds.set(row.project_name, result.rows[0].id);
    }

    // Process project subscriptions
    for (const row of data as ProjectRow[]) {
        const projectId = projectIds.get(row.project_name);
        if (!projectId) continue;

        const subscribedTeams = row.subscribed_team_names.split('|').filter(Boolean);
        for (const teamName of subscribedTeams) {
            const teamId = teamMap.get(teamName.trim());
            if (!teamId) continue;

            await client.query(
                `INSERT INTO roadmap.project_subscriptions 
                (project_id, team_id, start_date, end_date, status) 
                VALUES ($1, $2, $3, $4, $5)`,
                [projectId, teamId, row.start_date, row.end_date, 'active']
            );
        }
    }

    // Process project dependencies
    for (const row of data as ProjectRow[]) {
        const projectId = projectIds.get(row.project_name);
        if (!projectId) continue;

        const dependencyIds = row.dependency_project_ids.split('|').filter(Boolean);
        for (const depId of dependencyIds) {
            const dependencyProjectId = projectIds.get(depId.trim());
            if (!dependencyProjectId) continue;

            await client.query(
                `INSERT INTO roadmap.project_dependencies 
                (project_id, dependency_project_id, dependency_type) 
                VALUES ($1, $2, $3)`,
                [projectId, dependencyProjectId, 'depends_on']
            );
        }
    }

    // Process project subsystems
    for (const row of data as ProjectRow[]) {
        const projectId = projectIds.get(row.project_name);
        if (!projectId) continue;

        const subsystemIds = row.subsystem_enterprise_ids.split('|').filter(Boolean);
        const customStartDates = row.custom_start_dates.split('|').filter(Boolean);
        const customEndDates = row.custom_end_dates.split('|').filter(Boolean);
        const notes = row.notes.split('|').filter(Boolean);

        for (let i = 0; i < subsystemIds.length; i++) {
            const subsystemId = subsystemMap.get(subsystemIds[i].trim());
            if (!subsystemId) continue;

            await client.query(
                `INSERT INTO roadmap.project_subsystems 
                (project_id, subsystem_id, custom_start_date, custom_end_date, notes) 
                VALUES ($1, $2, $3, $4, $5)`,
                [
                    projectId,
                    subsystemId,
                    customStartDates[i] || null,
                    customEndDates[i] || null,
                    notes[i] || null
                ]
            );
        }
    }
}

router.post('/organization', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const client = await pool.connect();
    try {
        // Read and parse CSV file
        const fileContent = await fs.readFile(req.file.path, 'utf-8');
        const records: OrganizationRow[] = await new Promise((resolve, reject) => {
            csv.parse(fileContent, {
                columns: true,
                skip_empty_lines: true
            }, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        // Start transaction
        await client.query('BEGIN');

        // Process data
        await processOrganizationData(client, records);

        // Commit transaction
        await client.query('COMMIT');

        // Clean up uploaded file
        await fs.unlink(req.file.path);

        res.json({ message: 'Data ingested successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Failed to process file' });
    } finally {
        client.release();
    }
});

router.post('/projects', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const client = await pool.connect();
    try {
        // Read and parse CSV file
        const fileContent = await fs.readFile(req.file.path, 'utf-8');
        const records: ProjectRow[] = await new Promise((resolve, reject) => {
            csv.parse(fileContent, {
                columns: true,
                skip_empty_lines: true
            }, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        // Start transaction
        await client.query('BEGIN');

        // Process data
        await processProjectData(client, records);

        // Commit transaction
        await client.query('COMMIT');

        // Clean up uploaded file
        await fs.unlink(req.file.path);

        res.json({ message: 'Project data ingested successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing project file:', error);
        res.status(500).json({ error: 'Failed to process project file' });
    } finally {
        client.release();
    }
});

export default router; 