import express, { Request, Response, Router, RequestHandler } from 'express';
import { Pool } from 'pg';
import { ParamsDictionary } from 'express-serve-static-core';

interface ImpactParams extends ParamsDictionary {
  id: string;
}

export function createRoutes(pool: Pool) {
  const router: Router = express.Router();
  
  // Get all projects
  router.get('/projects', async (req: Request, res: Response) => {
    try {
      const result = await pool.query('SELECT * FROM roadmap.projects ORDER BY created_at DESC');
      console.log('Available projects:', result.rows.map(p => ({ id: p.id, title: p.title })));
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching projects:', err);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  // Get all roadmap projects
  router.get('/roadmap_projects', async (req: Request, res: Response) => {
    try {
      const result = await pool.query('SELECT * FROM roadmap.roadmap_projects');
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching roadmap projects:', err);
      res.status(500).json({ error: 'Failed to fetch roadmap projects' });
    }
  });

  // Get project impact details
  router.get('/projects/:id/impact', async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      console.log('Fetching impact for project:', id);
      
      const result = await pool.query(
        `WITH impact_metrics AS (
          SELECT 
            p.id,
            p.title,
            p.status,
            p.start_date,
            p.end_date,
            p.type,
            p.description,
            COUNT(DISTINCT o.id) as impacted_organizations,
            COUNT(DISTINCT t.id) as impacted_teams,
            (SELECT COUNT(*) FROM roadmap.project_dependencies WHERE dependency_project_id = p.id) as dependencies
          FROM roadmap.projects p
          LEFT JOIN roadmap.roadmap_projects rp ON p.id = rp.project_id
          LEFT JOIN roadmap.applications a ON rp.application_id = a.id
          LEFT JOIN roadmap.teams t ON a.team_id = t.id
          LEFT JOIN roadmap.areas ar ON t.area_id = ar.id
          LEFT JOIN roadmap.organizations o ON ar.organization_id = o.id
          WHERE p.id = $1
          GROUP BY p.id, p.title, p.status, p.start_date, p.end_date, p.type, p.description
        ),
        timeline_items AS (
          SELECT json_agg(
            json_build_object(
              'team', t.name,
              'date', to_char(rp.custom_start_date, 'Mon YYYY'),
              'status', 
                CASE 
                  WHEN rp.custom_start_date < CURRENT_DATE THEN 'completed'
                  WHEN rp.custom_start_date = CURRENT_DATE THEN 'in-progress'
                  ELSE 'planned'
                END,
              'progress',
                CASE 
                  WHEN rp.custom_start_date < CURRENT_DATE THEN 100
                  WHEN rp.custom_start_date = CURRENT_DATE THEN 50
                  ELSE 0
                END
            )
            ORDER BY rp.custom_start_date
          ) FILTER (WHERE t.name IS NOT NULL) as items
          FROM roadmap.projects p
          LEFT JOIN roadmap.roadmap_projects rp ON p.id = rp.project_id
          LEFT JOIN roadmap.applications a ON rp.application_id = a.id
          LEFT JOIN roadmap.teams t ON a.team_id = t.id
          WHERE p.id = $1
        ),
        org_metrics AS (
          SELECT 
            o.id,
            o.name,
            COUNT(DISTINCT t.id) as team_count,
            (
              SELECT COUNT(*) 
              FROM roadmap.project_dependencies pd2 
              WHERE pd2.dependency_project_id = p.id
            ) as dep_count
          FROM roadmap.projects p
          LEFT JOIN roadmap.roadmap_projects rp ON p.id = rp.project_id
          LEFT JOIN roadmap.applications a ON rp.application_id = a.id
          LEFT JOIN roadmap.teams t ON a.team_id = t.id
          LEFT JOIN roadmap.areas ar ON t.area_id = ar.id
          LEFT JOIN roadmap.organizations o ON ar.organization_id = o.id
          WHERE p.id = $1 AND o.name IS NOT NULL
          GROUP BY o.id, o.name, p.id
        ),
        org_impact AS (
          SELECT json_agg(
            json_build_object(
              'name', name,
              'teams', team_count,
              'risk',
                CASE 
                  WHEN dep_count > 2 THEN 'high'
                  WHEN dep_count > 0 THEN 'medium'
                  ELSE 'low'
                END,
              'impact',
                CASE 
                  WHEN dep_count > 2 THEN 'Major refactoring needed'
                  WHEN dep_count > 0 THEN 'Service interruption expected'
                  ELSE 'Minor system updates required'
                END
            )
            ORDER BY name
          ) as items
          FROM org_metrics
        )
        SELECT 
          im.*,
          COALESCE(ti.items, '[]'::json) as "timelineItems",
          COALESCE(oi.items, '[]'::json) as "orgImpact",
          json_build_object(
            'impactedTeams', im.impacted_teams,
            'organizations', im.impacted_organizations,
            'timeline', to_char(im.start_date, 'Mon YYYY') || ' - ' || to_char(im.end_date, 'Mon YYYY'),
            'dependencies', im.dependencies
          ) as metrics
        FROM impact_metrics im
        LEFT JOIN timeline_items ti ON true
        LEFT JOIN org_impact oi ON true`,
        [id]
      );

      if (result.rows.length === 0) {
        console.log('No rows found for project:', id);
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      console.log('Query result:', result.rows[0]);
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching project impact:', err);
      res.status(500).json({ error: 'Failed to fetch project impact details' });
    }
  });

  // Get all organizations
  router.get('/organizations', async (req: Request, res: Response) => {
    try {
      const result = await pool.query('SELECT * FROM roadmap.organizations ORDER BY name');
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      res.status(500).json({ error: 'Failed to fetch organizations' });
    }
  });

  // Get all areas
  router.get('/areas', async (req: Request, res: Response) => {
    try {
      const result = await pool.query('SELECT * FROM roadmap.areas ORDER BY name');
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching areas:', err);
      res.status(500).json({ error: 'Failed to fetch areas' });
    }
  });

  // Get all teams
  router.get('/teams', async (req: Request, res: Response) => {
    try {
      const result = await pool.query('SELECT * FROM roadmap.teams ORDER BY name');
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching teams:', err);
      res.status(500).json({ error: 'Failed to fetch teams' });
    }
  });

  // Get all applications
  router.get('/applications', async (req: Request, res: Response) => {
    try {
      const result = await pool.query('SELECT * FROM roadmap.applications ORDER BY name');
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching applications:', err);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  });

  // Get team details
  router.get('/teams/:id', async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT 
          t.id,
          t.name,
          t.description,
          json_build_object(
            'id', a.id,
            'name', a.name,
            'organization', json_build_object(
              'id', o.id,
              'name', o.name
            )
          ) as area,
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'id', app.id,
                'name', app.name,
                'status', app.status,
                'architect', json_build_object(
                  'name', arch.name,
                  'email', arch.email
                )
              )
            )
            FROM roadmap.applications app
            LEFT JOIN roadmap.architects arch ON app.architect_id = arch.id
            WHERE app.team_id = t.id
            ), '[]'::json
          ) as applications,
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'id', p.id,
                'title', p.title,
                'status', p.status,
                'start_date', p.start_date,
                'end_date', p.end_date
              )
            )
            FROM roadmap.roadmap_projects rp
            JOIN roadmap.projects p ON rp.project_id = p.id
            JOIN roadmap.applications app ON rp.application_id = app.id
            WHERE app.team_id = t.id
            ), '[]'::json
          ) as projects
        FROM roadmap.teams t
        JOIN roadmap.areas a ON t.area_id = a.id
        JOIN roadmap.organizations o ON a.organization_id = o.id
        WHERE t.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Team not found' });
        return;
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching team details:', err);
      res.status(500).json({ error: 'Failed to fetch team details' });
    }
  });

  // Create new project
  router.post('/projects', async (req: Request, res: Response) => {
    try {
      const {
        title,
        description,
        type,
        status,
        start_date,
        end_date,
        teams
      } = req.body;

      // Start a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insert project
        const projectResult = await client.query(
          `INSERT INTO roadmap.projects (
            title, description, type, status, start_date, end_date
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id`,
          [
            title, description, type, status, start_date, end_date
          ]
        );

        const projectId = projectResult.rows[0].id;

        // Create roadmap_projects entries for each team's applications
        if (teams && teams.length > 0) {
          const applications = await client.query(
            'SELECT id FROM roadmap.applications WHERE team_id = ANY($1)',
            [teams]
          );

          if (applications.rows.length > 0) {
            const appValues = applications.rows
              .map((app: { id: number }) => 
                `(${app.id}, ${projectId}, '${start_date}', '${end_date}')`
              )
              .join(',');

            await client.query(
              `INSERT INTO roadmap.roadmap_projects (
                application_id, project_id, custom_start_date, custom_end_date
              ) VALUES ${appValues}`
            );
          }
        }

        await client.query('COMMIT');
        res.status(201).json({ id: projectId });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error creating project:', err);
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  return router;
}