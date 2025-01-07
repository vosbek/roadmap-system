import express from 'express';
import { driver } from '../config/neo4j';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'roadmap',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

interface Integration {
  targetId: string | null;
  targetName: string | null;
  type: string | null;
  dataTypes: string[];
  businessDomains: string[];
}

interface Application {
  id: string;
  name: string;
  type: string;
  ecosystem: string;
  dataTypes: string[];
  businessDomains: string[];
  integrations: Integration[];
}

const router = express.Router();

// Get all applications for the current architect
router.get('/applications', async (req, res) => {
  try {
    // TODO: Replace with actual architect ID from auth session
    const architectId = 1; // Temporary hardcoded value

    const result = await pool.query(`
      WITH application_data AS (
        SELECT 
          a.id as app_id,
          a.*,
          s.id as subsystem_id,
          s.name as subsystem_name,
          s.description as subsystem_description,
          s.type as subsystem_type,
          s.enterprise_id as subsystem_enterprise_id,
          s.status as subsystem_status,
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
        WHERE a.architect_id = $1
      )
      SELECT 
        DISTINCT ON (app_id) id, name, description, status, enterprise_id, created_at,
        (
          SELECT json_agg(DISTINCT jsonb_build_object(
            'id', subsystem_id,
            'name', subsystem_name,
            'description', subsystem_description,
            'type', subsystem_type,
            'enterprise_id', subsystem_enterprise_id,
            'status', subsystem_status,
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
    `, [architectId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching architect applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get all applications with their relationships
router.get('/applications/integrations', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (app:Application)
      OPTIONAL MATCH (app)-[r:INTEGRATES_WITH]->(target:Application)
      WITH app, collect({
        targetId: target.id,
        targetName: target.name,
        type: r.type,
        dataTypes: CASE WHEN r IS NOT NULL THEN r.dataTypes ELSE [] END,
        businessDomains: CASE WHEN r IS NOT NULL THEN r.businessDomains ELSE [] END
      }) as integrations
      RETURN {
        id: app.id,
        name: app.name,
        type: app.type,
        ecosystem: app.ecosystem,
        dataTypes: CASE WHEN app.dataTypes IS NOT NULL THEN app.dataTypes ELSE [] END,
        businessDomains: CASE WHEN app.businessDomains IS NOT NULL THEN app.businessDomains ELSE [] END,
        integrations: integrations
      } as application
    `);

    const applications = result.records.map(record => {
      const app = record.get('application') as Application;
      return {
        ...app,
        dataTypes: app.dataTypes || [],
        businessDomains: app.businessDomains || [],
        integrations: app.integrations.filter((i: Integration) => i.targetId !== null).map(i => ({
          ...i,
          dataTypes: i.dataTypes || [],
          businessDomains: i.businessDomains || []
        }))
      };
    });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ 
      error: 'Failed to fetch applications',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await session.close();
  }
});

// Update application tags
router.patch('/:id', async (req, res) => {
  const session = driver.session();
  try {
    const { id } = req.params;
    const { dataTypes, businessDomains } = req.body;

    const result = await session.run(`
      MATCH (app:Application {id: $id})
      SET app.dataTypes = $dataTypes,
          app.businessDomains = $businessDomains
      RETURN app
    `, {
      id,
      dataTypes: dataTypes || [],
      businessDomains: businessDomains || []
    });

    if (result.records.length === 0) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    const updatedApp = result.records[0].get('app').properties;
    res.json({
      ...updatedApp,
      dataTypes: updatedApp.dataTypes || [],
      businessDomains: updatedApp.businessDomains || []
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ 
      error: 'Failed to update application',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await session.close();
  }
});

export default router; 