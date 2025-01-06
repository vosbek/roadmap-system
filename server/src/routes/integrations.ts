import express from 'express';
import { driver } from '../config/neo4j';
import multer from 'multer';
import csv from 'csv-parse';
import { Readable } from 'stream';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all data types
router.get('/datatypes', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (dt:DataType) RETURN dt.name as name ORDER BY dt.name');
    res.json(result.records.map(record => ({ name: record.get('name') })));
  } catch (error) {
    console.error('Error fetching data types:', error);
    res.status(500).json({ error: 'Failed to fetch data types' });
  } finally {
    await session.close();
  }
});

// Get all business domains
router.get('/businessdomains', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (bd:BusinessDomain) RETURN bd.name as name ORDER BY bd.name');
    res.json(result.records.map(record => ({ name: record.get('name') })));
  } catch (error) {
    console.error('Error fetching business domains:', error);
    res.status(500).json({ error: 'Failed to fetch business domains' });
  } finally {
    await session.close();
  }
});

// Get all applications
router.get('/applications', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (app:Application)
      RETURN app.id as id, app.name as name, app.type as type, app.ecosystem as ecosystem
      ORDER BY app.name
    `);
    res.json(result.records.map(record => ({
      id: record.get('id'),
      name: record.get('name'),
      type: record.get('type'),
      ecosystem: record.get('ecosystem')
    })));
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  } finally {
    await session.close();
  }
});

// Get the integration graph
router.get('/graph', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (source:Application)-[integration:INTEGRATES_WITH]->(target:Application)
      RETURN {
        source: {
          id: source.id,
          name: source.name,
          type: source.type,
          ecosystem: source.ecosystem
        },
        target: {
          id: target.id,
          name: target.name,
          type: target.type,
          ecosystem: target.ecosystem
        },
        integration: {
          type: integration.type,
          dataTypes: integration.dataTypes,
          businessDomains: integration.businessDomains
        }
      } as item
    `);
    res.json(result.records.map(record => record.get('item')));
  } catch (error) {
    console.error('Error fetching graph data:', error);
    res.status(500).json({ error: 'Failed to fetch graph data' });
  } finally {
    await session.close();
  }
});

// Create a new integration
router.post('/', async (req, res) => {
  const session = driver.session();
  try {
    const { sourceId, targetId, type, dataTypes, businessDomains } = req.body;

    // Validate required fields
    if (!sourceId || !targetId || !type) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Create the integration
    const result = await session.run(`
      MATCH (source:Application {id: $sourceId})
      MATCH (target:Application {id: $targetId})
      CREATE (source)-[r:INTEGRATES_WITH {
        type: $type,
        dataTypes: $dataTypes,
        businessDomains: $businessDomains
      }]->(target)
      RETURN r
    `, {
      sourceId,
      targetId,
      type,
      dataTypes: dataTypes || [],
      businessDomains: businessDomains || []
    });

    res.status(201).json({
      message: 'Integration created successfully',
      integration: result.records[0].get('r').properties
    });
  } catch (error) {
    console.error('Error creating integration:', error);
    res.status(500).json({ error: 'Failed to create integration' });
  } finally {
    await session.close();
  }
});

// Process CSV file upload for applications
router.post('/bulk/applications', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const session = driver.session();
  try {
    const records: any[] = [];
    const parser = csv.parse({
      columns: true,
      skip_empty_lines: true
    });

    parser.on('readable', function() {
      let record;
      while ((record = parser.read())) {
        records.push(record);
      }
    });

    await new Promise((resolve, reject) => {
      Readable.from(req.file!.buffer.toString())
        .pipe(parser)
        .on('end', resolve)
        .on('error', reject);
    });

    for (const record of records) {
      const businessDomains = record.business_domains.split(',').map((d: string) => d.trim());
      const dataTypes = record.data_types.split(',').map((d: string) => d.trim());

      await session.run(`
        MERGE (app:Application {
          id: $id,
          name: $name,
          type: $type,
          ecosystem: $ecosystem,
          description: $description
        })
        WITH app
        UNWIND $businessDomains as domain
        MERGE (bd:BusinessDomain {name: domain})
        MERGE (app)-[:BELONGS_TO]->(bd)
        WITH app
        UNWIND $dataTypes as dataType
        MERGE (dt:DataType {name: dataType})
        MERGE (app)-[:HANDLES]->(dt)
      `, {
        id: record.id,
        name: record.name,
        type: record.type,
        ecosystem: record.ecosystem,
        description: record.description,
        businessDomains,
        dataTypes
      });
    }

    res.json({ message: `Successfully imported ${records.length} applications` });
  } catch (error) {
    console.error('Error processing applications import:', error);
    res.status(500).json({ error: 'Failed to process applications import' });
  } finally {
    await session.close();
  }
});

// Process CSV file upload for integrations
router.post('/bulk/integrations', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const session = driver.session();
  try {
    const records: any[] = [];
    const parser = csv.parse({
      columns: true,
      skip_empty_lines: true
    });

    parser.on('readable', function() {
      let record;
      while ((record = parser.read())) {
        records.push(record);
      }
    });

    await new Promise((resolve, reject) => {
      Readable.from(req.file!.buffer.toString())
        .pipe(parser)
        .on('end', resolve)
        .on('error', reject);
    });

    for (const record of records) {
      const businessDomains = record.business_domains.split(',').map((d: string) => d.trim());
      const dataTypes = record.data_types.split(',').map((d: string) => d.trim());
      const direction = record.direction.toUpperCase();

      // Create base integration node
      await session.run(`
        MATCH (source:Application {id: $sourceId})
        MATCH (target:Application {id: $targetId})
        MERGE (i:Integration {
          name: $name,
          type: $type,
          description: $description,
          frequency: $frequency,
          schedule: $schedule,
          direction: $direction
        })
        WITH source, target, i
        // Handle direction-specific relationships
        CALL {
          WITH source, target, i
          WITH source, target, i,
          CASE $direction
            WHEN 'OUTBOUND' THEN [
              [(source)-[:PRODUCES]->(i), (i)-[:CONSUMED_BY]->(target)]
            ]
            WHEN 'INBOUND' THEN [
              [(target)-[:PRODUCES]->(i), (i)-[:CONSUMED_BY]->(source)]
            ]
            WHEN 'BIDIRECTIONAL' THEN [
              [(source)-[:PRODUCES]->(i), (i)-[:CONSUMED_BY]->(target)],
              [(target)-[:PRODUCES]->(i), (i)-[:CONSUMED_BY]->(source)]
            ]
          END as relationships
          UNWIND relationships as rels
          FOREACH (rel IN rels | CREATE rel)
        }
        WITH i
        UNWIND $businessDomains as domain
        MERGE (bd:BusinessDomain {name: domain})
        MERGE (i)-[:BELONGS_TO]->(bd)
        WITH i
        UNWIND $dataTypes as dataType
        MERGE (dt:DataType {name: dataType})
        MERGE (i)-[:TRANSFERS]->(dt)
      `, {
        sourceId: record.source_id,
        targetId: record.target_id,
        name: record.name,
        type: record.type,
        description: record.description,
        frequency: record.frequency,
        schedule: record.schedule,
        direction: direction,
        businessDomains,
        dataTypes
      });
    }

    res.json({ message: `Successfully imported ${records.length} integrations` });
  } catch (error) {
    console.error('Error processing integrations import:', error);
    res.status(500).json({ error: 'Failed to process integrations import' });
  } finally {
    await session.close();
  }
});

export default router; 