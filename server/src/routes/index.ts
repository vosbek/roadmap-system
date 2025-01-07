import express from 'express';
import { Pool } from 'pg';
import integrationRoutes from './integrations';
import architectRoutes from './architect';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'roadmap',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

const router = express.Router();

// PostgreSQL routes
router.get('/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roadmap.projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        p.*,
        t.name as owner_team_name,
        a.name as owner_architect_name
      FROM roadmap.projects p
      LEFT JOIN roadmap.teams t ON t.id = p.owner_team_id
      LEFT JOIN roadmap.architects a ON a.id = p.owner_architect_id
      WHERE p.id = $1::uuid`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.get('/areas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        o.name as organization_name,
        o.description as organization_description
      FROM roadmap.areas a
      JOIN roadmap.organizations o ON o.id = a.organization_id
      ORDER BY o.name, a.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching areas:', err);
    res.status(500).json({ error: 'Failed to fetch areas' });
  }
});

router.get('/teams', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        a.name as area_name,
        o.name as organization_name
      FROM roadmap.teams t
      JOIN roadmap.areas a ON a.id = t.area_id
      JOIN roadmap.organizations o ON o.id = a.organization_id
      ORDER BY o.name, a.name, t.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Add teams roadmaps endpoint
router.get('/teams/roadmaps', async (req, res) => {
  try {
    const result = await pool.query(`
      WITH team_data AS (
        SELECT 
          t.id as team_id,
          t.name as team_name,
          t.description as team_description,
          a.id as area_id,
          a.name as area_name,
          o.id as organization_id,
          o.name as organization_name,
          app.id as app_id,
          app.name as app_name,
          app.status as app_status,
          s.id as subsystem_id,
          s.name as subsystem_name,
          s.type as subsystem_type,
          s.status as subsystem_status,
          p.id as project_id,
          p.title as project_title,
          p.description as project_description,
          p.status as project_status,
          p.start_date as project_start_date,
          p.end_date as project_end_date,
          p.type as project_type
        FROM roadmap.teams t
        JOIN roadmap.areas a ON a.id = t.area_id
        JOIN roadmap.organizations o ON o.id = a.organization_id
        LEFT JOIN roadmap.applications app ON app.team_id = t.id
        LEFT JOIN roadmap.subsystems s ON s.application_id = app.id
        LEFT JOIN roadmap.project_subsystems ps ON ps.subsystem_id = s.id
        LEFT JOIN roadmap.projects p ON p.id = ps.project_id
      )
      SELECT 
        DISTINCT ON (team_id) team_id as id,
        team_name as name,
        team_description as description,
        jsonb_build_object(
          'id', area_id,
          'name', area_name,
          'organization', jsonb_build_object(
            'id', organization_id,
            'name', organization_name
          )
        ) as area,
        (
          SELECT json_agg(DISTINCT jsonb_build_object(
            'id', d.app_id,
            'name', d.app_name,
            'status', COALESCE(d.app_status, 'Inactive'),
            'subsystems', (
              SELECT json_agg(DISTINCT jsonb_build_object(
                'id', d2.subsystem_id,
                'name', d2.subsystem_name,
                'type', d2.subsystem_type,
                'status', d2.subsystem_status,
                'projects', (
                  SELECT json_agg(DISTINCT jsonb_build_object(
                    'id', d3.project_id,
                    'title', d3.project_title,
                    'description', d3.project_description,
                    'status', d3.project_status,
                    'start_date', d3.project_start_date,
                    'end_date', d3.project_end_date,
                    'type', d3.project_type
                  ))
                  FROM team_data d3
                  WHERE d3.subsystem_id = d2.subsystem_id
                  AND d3.project_id IS NOT NULL
                )
              ))
              FROM team_data d2
              WHERE d2.app_id = d.app_id
              AND d2.subsystem_id IS NOT NULL
            )
          ))
          FROM team_data d
          WHERE d.team_id = team_data.team_id
          AND d.app_id IS NOT NULL
        ) as applications
      FROM team_data
      ORDER BY team_id, team_name;
    `);

    // Ensure applications is an array even if null
    const teams = result.rows.map(team => ({
      ...team,
      applications: team.applications || []
    }));

    res.json(teams);
  } catch (err) {
    console.error('Error fetching team roadmaps:', err);
    res.status(500).json({ error: 'Failed to fetch team roadmaps' });
  }
});

// Add single team endpoint
router.get('/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      WITH team_data AS (
        SELECT 
          t.id,
          t.name,
          t.description,
          a.id as area_id,
          a.name as area_name,
          o.id as organization_id,
          o.name as organization_name,
          app.id as app_id,
          app.name as app_name,
          app.status as app_status,
          arch.name as architect_name,
          arch.email as architect_email,
          p.id as project_id,
          p.title as project_title,
          p.status as project_status,
          p.start_date as project_start_date,
          p.end_date as project_end_date
        FROM roadmap.teams t
        JOIN roadmap.areas a ON a.id = t.area_id
        JOIN roadmap.organizations o ON o.id = a.organization_id
        LEFT JOIN roadmap.applications app ON app.team_id = t.id
        LEFT JOIN roadmap.architects arch ON arch.id = app.architect_id
        LEFT JOIN roadmap.project_subsystems ps ON ps.subsystem_id IN (
          SELECT id FROM roadmap.subsystems WHERE application_id = app.id
        )
        LEFT JOIN roadmap.projects p ON p.id = ps.project_id
        WHERE t.id = $1
      )
      SELECT 
        DISTINCT ON (id) id,
        name,
        description,
        jsonb_build_object(
          'id', area_id,
          'name', area_name,
          'organization', jsonb_build_object(
            'id', organization_id,
            'name', organization_name
          )
        ) as area,
        (
          SELECT json_agg(DISTINCT jsonb_build_object(
            'id', d.app_id,
            'name', d.app_name,
            'status', COALESCE(d.app_status, 'Inactive'),
            'architect', jsonb_build_object(
              'name', d.architect_name,
              'email', d.architect_email
            )
          ))
          FROM team_data d
          WHERE d.app_id IS NOT NULL
        ) as applications,
        (
          SELECT json_agg(DISTINCT jsonb_build_object(
            'id', d.project_id,
            'title', d.project_title,
            'status', d.project_status,
            'start_date', d.project_start_date,
            'end_date', d.project_end_date
          ))
          FROM team_data d
          WHERE d.project_id IS NOT NULL
        ) as projects
      FROM team_data
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Ensure applications and projects are arrays even if null
    const team = result.rows[0];
    team.applications = team.applications || [];
    team.projects = team.projects || [];

    res.json(team);
  } catch (err) {
    console.error('Error fetching team:', err);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Add organizations endpoint
router.get('/organizations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roadmap.organizations ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching organizations:', err);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// Update applications endpoint to be simpler for debugging
router.get('/applications', async (req, res) => {
  try {
    const result = await pool.query(`
      WITH application_data AS (
        SELECT 
          a.id as app_id,
          a.*,
          s.id as subsystem_id,
          s.name as subsystem_name,
          s.description as subsystem_description,
          s.type as subsystem_type,
          s.created_at as subsystem_created_at,
          p.id as project_id,
          p.title as project_title,
          p.description as project_description,
          p.status as project_status,
          p.start_date as project_start_date,
          p.end_date as project_end_date,
          p.type as project_type,
          p.created_at as project_created_at
        FROM roadmap.applications a
        LEFT JOIN roadmap.subsystems s ON s.application_id = a.id
        LEFT JOIN roadmap.project_subsystems ps ON ps.subsystem_id = s.id
        LEFT JOIN roadmap.projects p ON p.id = ps.project_id
      )
      SELECT 
        DISTINCT ON (app_id) id, name, description, created_at,
        (
          SELECT json_agg(DISTINCT jsonb_build_object(
            'id', subsystem_id,
            'name', subsystem_name,
            'description', subsystem_description,
            'type', subsystem_type,
            'created_at', subsystem_created_at,
            'projects', (
              SELECT json_agg(DISTINCT jsonb_build_object(
                'id', CAST(d2.project_id AS TEXT),
                'title', d2.project_title,
                'description', d2.project_description,
                'status', d2.project_status,
                'start_date', d2.project_start_date,
                'end_date', d2.project_end_date,
                'type', d2.project_type,
                'created_at', d2.project_created_at
              ))
              FROM application_data d2
              WHERE d2.subsystem_id = d1.subsystem_id
              AND d2.project_id IS NOT NULL
            )
          ))
          FROM application_data d1
          WHERE d1.app_id = application_data.app_id
          AND d1.subsystem_id IS NOT NULL
        ) as subsystems
      FROM application_data
      ORDER BY app_id, name;
    `);
    
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result.rows));
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.get('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      WITH application_data AS (
        SELECT 
          a.id as app_id,
          a.*,
          s.id as subsystem_id,
          s.name as subsystem_name,
          s.description as subsystem_description,
          s.type as subsystem_type,
          s.created_at as subsystem_created_at,
          p.id as project_id,
          p.title as project_title,
          p.description as project_description,
          p.status as project_status,
          p.start_date as project_start_date,
          p.end_date as project_end_date,
          p.type as project_type,
          p.created_at as project_created_at
        FROM roadmap.applications a
        LEFT JOIN roadmap.subsystems s ON s.application_id = a.id
        LEFT JOIN roadmap.project_subsystems ps ON ps.subsystem_id = s.id
        LEFT JOIN roadmap.projects p ON p.id = ps.project_id
        WHERE a.id = $1
      )
      SELECT 
        DISTINCT ON (app_id) id, name, description, created_at,
        (
          SELECT json_agg(DISTINCT jsonb_build_object(
            'id', subsystem_id,
            'name', subsystem_name,
            'description', subsystem_description,
            'type', subsystem_type,
            'created_at', subsystem_created_at,
            'projects', (
              SELECT json_agg(DISTINCT jsonb_build_object(
                'id', d2.project_id,
                'title', d2.project_title,
                'description', d2.project_description,
                'status', d2.project_status,
                'start_date', d2.project_start_date,
                'end_date', d2.project_end_date,
                'type', d2.project_type,
                'created_at', d2.project_created_at
              ))
              FROM application_data d2
              WHERE d2.subsystem_id = d1.subsystem_id
              AND d2.project_id IS NOT NULL
            )
          ))
          FROM application_data d1
          WHERE d1.app_id = application_data.app_id
          AND d1.subsystem_id IS NOT NULL
        ) as subsystems
      FROM application_data
      ORDER BY app_id, name;
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result.rows[0]));
  } catch (err) {
    console.error('Error fetching application:', err);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Add capabilities endpoint
router.get('/capabilities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roadmap.capabilities ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching capabilities:', err);
    res.status(500).json({ error: 'Failed to fetch capabilities' });
  }
});

// Neo4j routes
router.use('/integrations', integrationRoutes);

// Architect routes
router.use('/architect', architectRoutes);

// Add project impact endpoint
router.get('/projects/:id/impact', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        p.*,
        (
          SELECT json_agg(jsonb_build_object(
            'subsystem_name', s.name,
            'subsystem_type', s.type,
            'subsystem_status', s.status
          ))
          FROM roadmap.project_subsystems ps
          JOIN roadmap.subsystems s ON s.id = ps.subsystem_id
          WHERE ps.project_id = p.id
        ) as impacted_subsystems,
        (
          SELECT COUNT(DISTINCT s.application_id)
          FROM roadmap.project_subsystems ps
          JOIN roadmap.subsystems s ON s.id = ps.subsystem_id
          WHERE ps.project_id = p.id
        ) as impacted_applications_count
      FROM roadmap.projects p
      WHERE p.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Format the response to match the ProjectImpact interface
    const project = result.rows[0];
    const response = {
      id: project.id,
      title: project.title,
      status: project.status,
      type: project.type,
      description: project.description,
      metrics: {
        impactedTeams: 0,
        organizations: project.impacted_applications_count || 0,
        timeline: `${project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'} - ${project.end_date ? new Date(project.end_date).toLocaleDateString() : 'TBD'}`,
        dependencies: 0
      },
      timelineItems: [
        {
          team: 'Unassigned',
          date: project.start_date || 'TBD',
          status: project.status === 'completed' ? 'completed' : project.status === 'in_progress' ? 'in-progress' : 'planned',
          progress: project.status === 'completed' ? 100 : project.status === 'in_progress' ? 50 : 0
        }
      ],
      orgImpact: project.impacted_subsystems ? project.impacted_subsystems.map((s: any) => ({
        name: s.subsystem_name,
        teams: 1,
        risk: 'medium',
        impact: `Affects ${s.subsystem_type} subsystem (${s.subsystem_status})`
      })) : []
    };
    
    res.json(response);
  } catch (err) {
    console.error('Error fetching project impact:', err);
    res.status(500).json({ error: 'Failed to fetch project impact' });
  }
});

// Add organizations with details endpoint
router.get('/organizations/details', async (req, res) => {
  try {
    const result = await pool.query(`
      WITH RECURSIVE 
        organizations AS (
          SELECT 
            o.id,
            o.name,
            o.description
          FROM roadmap.organizations o
        ),
        areas AS (
          SELECT 
            a.id,
            a.organization_id,
            a.name,
            jsonb_build_object(
              'id', a.id,
              'name', a.name
            ) as area_data
          FROM roadmap.areas a
        ),
        teams AS (
          SELECT 
            t.id,
            t.area_id,
            t.name,
            jsonb_build_object(
              'id', t.id,
              'name', t.name
            ) as team_data
          FROM roadmap.teams t
        ),
        applications AS (
          SELECT 
            app.id,
            app.team_id,
            app.name,
            jsonb_build_object(
              'id', app.id,
              'name', app.name
            ) as app_data
          FROM roadmap.applications app
        ),
        projects AS (
          SELECT DISTINCT ON (p.id, s.application_id)
            p.id,
            s.application_id,
            jsonb_build_object(
              'id', p.id,
              'title', p.title,
              'description', p.description,
              'status', p.status,
              'type', p.type,
              'start_date', p.start_date,
              'end_date', p.end_date
            ) as project_data
          FROM roadmap.projects p
          JOIN roadmap.project_subsystems ps ON ps.project_id = p.id
          JOIN roadmap.subsystems s ON s.id = ps.subsystem_id
        ),
        app_projects AS (
          SELECT 
            application_id,
            jsonb_agg(project_data) as projects
          FROM projects
          GROUP BY application_id
        ),
        app_with_projects AS (
          SELECT 
            a.id,
            a.team_id,
            jsonb_build_object(
              'id', a.id,
              'name', a.name,
              'projects', COALESCE(ap.projects, '[]'::jsonb)
            ) as app_data
          FROM applications a
          LEFT JOIN app_projects ap ON ap.application_id = a.id
        ),
        team_apps AS (
          SELECT 
            team_id,
            jsonb_agg(app_data) as applications
          FROM app_with_projects
          GROUP BY team_id
        ),
        teams_with_apps AS (
          SELECT 
            t.id,
            t.area_id,
            jsonb_build_object(
              'id', t.id,
              'name', t.name,
              'applications', COALESCE(ta.applications, '[]'::jsonb)
            ) as team_data
          FROM teams t
          LEFT JOIN team_apps ta ON ta.team_id = t.id
        ),
        area_teams AS (
          SELECT 
            area_id,
            jsonb_agg(team_data) as teams
          FROM teams_with_apps
          GROUP BY area_id
        ),
        areas_with_teams AS (
          SELECT 
            a.id,
            a.organization_id,
            jsonb_build_object(
              'id', a.id,
              'name', a.name,
              'teams', COALESCE(at.teams, '[]'::jsonb)
            ) as area_data
          FROM areas a
          LEFT JOIN area_teams at ON at.area_id = a.id
        ),
        org_areas AS (
          SELECT 
            organization_id,
            jsonb_agg(area_data) as areas
          FROM areas_with_teams
          GROUP BY organization_id
        )
      SELECT 
        o.id,
        o.name,
        o.description,
        COALESCE(oa.areas, '[]'::jsonb) as areas
      FROM organizations o
      LEFT JOIN org_areas oa ON oa.organization_id = o.id
      ORDER BY o.name;
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching organization details:', err);
    res.status(500).json({ error: 'Failed to fetch organization details' });
  }
});

// Update roadmap_projects endpoint to include more details
router.get('/roadmap_projects', async (req, res) => {
  try {
    const result = await pool.query(`
      WITH project_data AS (
        SELECT 
          ps.id,
          s.application_id,
          ps.project_id,
          ps.custom_start_date,
          ps.custom_end_date,
          p.title as project_title,
          p.description as project_description,
          p.status as project_status,
          p.type as project_type,
          p.start_date,
          p.end_date,
          app.name as application_name,
          t.name as team_name,
          a.name as area_name
        FROM roadmap.project_subsystems ps
        JOIN roadmap.subsystems s ON s.id = ps.subsystem_id
        JOIN roadmap.projects p ON p.id = ps.project_id
        JOIN roadmap.applications app ON app.id = s.application_id
        JOIN roadmap.teams t ON t.id = app.team_id
        JOIN roadmap.areas a ON a.id = t.area_id
      )
      SELECT 
        pd.*,
        jsonb_build_object(
          'id', pd.project_id,
          'title', pd.project_title,
          'description', pd.project_description,
          'status', pd.project_status,
          'type', pd.project_type,
          'start_date', COALESCE(pd.custom_start_date, pd.start_date),
          'end_date', COALESCE(pd.custom_end_date, pd.end_date)
        ) as project_details
      FROM project_data pd
      ORDER BY pd.area_name, pd.team_name, pd.application_name, pd.start_date
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching roadmap projects:', err);
    res.status(500).json({ error: 'Failed to fetch roadmap projects' });
  }
});

// Add systems endpoint (this is actually fetching subsystems)
router.get('/systems', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.type,
        s.application_id,
        s.status,
        s.enterprise_id
      FROM roadmap.subsystems s
      ORDER BY s.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching systems:', err);
    res.status(500).json({ error: 'Failed to fetch systems' });
  }
});

// Add executive view endpoint
router.get('/executive-view', async (req, res) => {
  try {
    const result = await pool.query(`
      WITH project_teams AS (
        SELECT DISTINCT ON (p.id)
          p.id as project_id,
          t.id as team_id,
          t.name as team_name,
          a.id as area_id,
          a.name as area_name,
          p.title as project_title,
          p.description as project_description,
          p.status as project_status,
          p.type as project_type,
          p.start_date,
          p.end_date
        FROM roadmap.projects p
        JOIN roadmap.project_subsystems ps ON ps.project_id = p.id
        JOIN roadmap.subsystems s ON s.id = ps.subsystem_id
        JOIN roadmap.applications app ON app.id = s.application_id
        JOIN roadmap.teams t ON t.id = app.team_id
        JOIN roadmap.areas a ON a.id = t.area_id
        ORDER BY p.id, ps.created_at ASC
      ),
      area_metrics AS (
        SELECT 
          area_id,
          COUNT(DISTINCT project_id) as project_count,
          COUNT(DISTINCT CASE WHEN project_status = 'in_progress' THEN project_id END) as in_progress_count,
          COUNT(DISTINCT CASE WHEN project_status = 'planned' THEN project_id END) as planned_count
        FROM project_teams
        GROUP BY area_id
      ),
      team_metrics AS (
        SELECT 
          team_id,
          COUNT(DISTINCT project_id) as project_count
        FROM project_teams
        GROUP BY team_id
      )
      SELECT 
        pt.area_name,
        pt.team_name,
        pt.project_id,
        pt.project_title,
        pt.project_description,
        pt.project_status,
        pt.project_type,
        pt.start_date,
        pt.end_date,
        am.project_count as area_project_count,
        am.in_progress_count as area_in_progress_count,
        am.planned_count as area_planned_count,
        tm.project_count as team_project_count
      FROM project_teams pt
      JOIN area_metrics am ON am.area_id = pt.area_id
      JOIN team_metrics tm ON tm.team_id = pt.team_id
      WHERE pt.project_title NOT ILIKE '%test%'
        AND pt.project_title != ''
        AND pt.project_status IN ('in_progress', 'planned')
      ORDER BY 
        pt.area_name,
        pt.team_name,
        pt.start_date;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching executive view:', err);
    res.status(500).json({ error: 'Failed to fetch executive view' });
  }
});

// Add project creation endpoint
router.post('/projects', async (req, res) => {
  try {
    const { name, title, description, type, project_type, start_date, end_date, status } = req.body;

    // Validate required fields
    if (!name || !title || !description || !type || !start_date || !end_date || !status) {
      console.error('Missing required fields:', { name, title, description, type, start_date, end_date, status });
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'All fields (name, title, description, type, start_date, end_date, status) are required'
      });
    }

    console.log('Creating project with data:', { name, title, description, type, start_date, end_date, status });

    const result = await pool.query(
      `INSERT INTO roadmap.projects 
        (name, title, description, type, project_type, start_date, end_date, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, title, description, type.toLowerCase(), project_type.toLowerCase(), start_date, end_date, status]
    );

    console.log('Project created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating project:', err);
    console.error('Error details:', err instanceof Error ? err.message : 'Unknown error');
    console.error('Request body:', req.body);
    res.status(500).json({ 
      error: 'Failed to create project', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    });
  }
});

// Add project-subsystem linking endpoint
router.post('/project_subsystems', async (req, res) => {
  try {
    const { project_id, subsystem_id } = req.body;

    const result = await pool.query(
      `INSERT INTO roadmap.project_subsystems 
        (project_id, subsystem_id) 
       VALUES ($1, $2)
       RETURNING *`,
      [project_id, subsystem_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error linking project to subsystem:', err);
    res.status(500).json({ error: 'Failed to link project to subsystem' });
  }
});

// Add project update endpoint
router.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, description, status, start_date, end_date } = req.body;

    const result = await pool.query(
      `UPDATE roadmap.projects 
       SET type = COALESCE($1, type),
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           status = COALESCE($4, status),
           start_date = COALESCE($5, start_date),
           end_date = COALESCE($6, end_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [type, title, description, status, start_date, end_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

export default router;