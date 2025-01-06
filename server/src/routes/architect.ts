import express from 'express';
import { driver } from '../config/neo4j';

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

// Get all applications with their relationships
router.get('/applications', async (req, res) => {
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