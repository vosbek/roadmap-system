import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'roadmap_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'dota'
});

interface Organization {
    name: string;
    description?: string;
    contact_info?: string;
}

interface Area {
    organization_id: number;
    name: string;
    description?: string;
}

interface Team {
    area_id: number;
    name: string;
}

interface Architect {
    name: string;
    email: string;
    contact_info?: string;
}

interface Application {
    team_id: number;
    architect_id: number;
    name: string;
    description?: string;
    status?: string;
    enterprise_id?: string;
}

async function ingestOrganizations(organizations: Organization[]): Promise<number[]> {
    const client = await pool.connect();
    const insertedIds: number[] = [];
    try {
        await client.query('BEGIN');
        
        for (const org of organizations) {
            const result = await client.query(
                'INSERT INTO roadmap.organizations (name, description, contact_info) VALUES ($1, $2, $3) RETURNING id',
                [org.name, org.description, org.contact_info]
            );
            insertedIds.push(result.rows[0].id);
            console.log(`Inserted organization ${org.name} with ID ${result.rows[0].id}`);
        }
        
        await client.query('COMMIT');
        return insertedIds;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error ingesting organizations:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function ingestAreas(areas: Area[]): Promise<number[]> {
    const client = await pool.connect();
    const insertedIds: number[] = [];
    try {
        await client.query('BEGIN');
        
        for (const area of areas) {
            const result = await client.query(
                'INSERT INTO roadmap.areas (organization_id, name, description) VALUES ($1, $2, $3) RETURNING id',
                [area.organization_id, area.name, area.description]
            );
            insertedIds.push(result.rows[0].id);
            console.log(`Inserted area ${area.name} with ID ${result.rows[0].id}`);
        }
        
        await client.query('COMMIT');
        return insertedIds;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error ingesting areas:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function ingestTeams(teams: Team[]): Promise<number[]> {
    const client = await pool.connect();
    const insertedIds: number[] = [];
    try {
        await client.query('BEGIN');
        
        for (const team of teams) {
            const result = await client.query(
                'INSERT INTO roadmap.teams (area_id, name) VALUES ($1, $2) RETURNING id',
                [team.area_id, team.name]
            );
            insertedIds.push(result.rows[0].id);
            console.log(`Inserted team ${team.name} with ID ${result.rows[0].id}`);
        }
        
        await client.query('COMMIT');
        return insertedIds;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error ingesting teams:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function ingestArchitects(architects: Architect[]): Promise<number[]> {
    const client = await pool.connect();
    const insertedIds: number[] = [];
    try {
        await client.query('BEGIN');
        
        for (const architect of architects) {
            const result = await client.query(
                'INSERT INTO roadmap.architects (name, email, contact_info) VALUES ($1, $2, $3) RETURNING id',
                [architect.name, architect.email, architect.contact_info]
            );
            insertedIds.push(result.rows[0].id);
            console.log(`Inserted architect ${architect.name} with ID ${result.rows[0].id}`);
        }
        
        await client.query('COMMIT');
        return insertedIds;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error ingesting architects:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function ingestApplications(applications: Application[]): Promise<number[]> {
    const client = await pool.connect();
    const insertedIds: number[] = [];
    try {
        await client.query('BEGIN');
        
        for (const app of applications) {
            const result = await client.query(
                'INSERT INTO roadmap.applications (team_id, architect_id, name, description, status, enterprise_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [app.team_id, app.architect_id, app.name, app.description, app.status, app.enterprise_id]
            );
            insertedIds.push(result.rows[0].id);
            console.log(`Inserted application ${app.name} with ID ${result.rows[0].id}`);
        }
        
        await client.query('COMMIT');
        return insertedIds;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error ingesting applications:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Example usage function
async function runIngestion() {
    try {
        // Sample data - replace with your actual data
        const sampleOrg: Organization = {
            name: "Test Organization",
            description: "Test Description",
            contact_info: "test@example.com"
        };

        await ingestOrganizations([sampleOrg]);
        
        // Continue with other ingestions...
        
        console.log('Data ingestion completed successfully');
    } catch (error) {
        console.error('Data ingestion failed:', error);
    } finally {
        await pool.end();
    }
}

// Only run if this is the main module
if (require.main === module) {
    runIngestion().catch(console.error);
}

export {
    ingestOrganizations,
    ingestAreas,
    ingestTeams,
    ingestArchitects,
    ingestApplications,
    type Organization,
    type Area,
    type Team,
    type Architect,
    type Application
}; 