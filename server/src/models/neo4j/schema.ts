import { Driver } from 'neo4j-driver';

export const initializeSchema = async (driver: Driver) => {
  const session = driver.session();
  try {
    // Create constraints
    const constraints = [
      `CREATE CONSTRAINT application_id IF NOT EXISTS FOR (a:Application) REQUIRE a.id IS UNIQUE`,
      `CREATE CONSTRAINT ecosystem_name IF NOT EXISTS FOR (e:Ecosystem) REQUIRE e.name IS UNIQUE`,
      `CREATE CONSTRAINT datatype_name IF NOT EXISTS FOR (d:DataType) REQUIRE d.name IS UNIQUE`,
      `CREATE CONSTRAINT team_id IF NOT EXISTS FOR (t:Team) REQUIRE t.id IS UNIQUE`,
      `CREATE CONSTRAINT area_id IF NOT EXISTS FOR (a:Area) REQUIRE a.id IS UNIQUE`,
      `CREATE CONSTRAINT product_id IF NOT EXISTS FOR (p:Product) REQUIRE p.id IS UNIQUE`,
      `CREATE CONSTRAINT integration_id IF NOT EXISTS FOR (i:Integration) REQUIRE i.id IS UNIQUE`,
      `CREATE CONSTRAINT application_type_name IF NOT EXISTS FOR (t:ApplicationType) REQUIRE t.name IS UNIQUE`,
      `CREATE CONSTRAINT integration_type_name IF NOT EXISTS FOR (t:IntegrationType) REQUIRE t.name IS UNIQUE`,
      `CREATE CONSTRAINT business_domain_name IF NOT EXISTS FOR (d:BusinessDomain) REQUIRE d.name IS UNIQUE`
    ];

    for (const constraint of constraints) {
      await session.run(constraint);
    }
    console.log('Constraints created successfully');

    // Create indexes
    const indexes = [
      `CREATE INDEX application_name IF NOT EXISTS FOR (a:Application) ON (a.name)`,
      `CREATE INDEX application_type IF NOT EXISTS FOR (a:Application) ON (a.type)`,
      `CREATE INDEX integration_type IF NOT EXISTS FOR (i:Integration) ON (i.type)`,
      `CREATE INDEX datatype_category IF NOT EXISTS FOR (d:DataType) ON (d.category)`
    ];

    for (const index of indexes) {
      await session.run(index);
    }
    console.log('Indexes created successfully');

    // Define application types
    await session.run(`
      MERGE (web:ApplicationType {name: 'Web Application'})
      MERGE (admin:ApplicationType {name: 'Admin System'})
      MERGE (db:ApplicationType {name: 'Database'})
      MERGE (api:ApplicationType {name: 'API'})
      MERGE (ext:ApplicationType {name: 'External Entity'})
    `);
    console.log('Application types created successfully');

    // Define integration types
    await session.run(`
      MERGE (api:IntegrationType {name: 'API'})
      MERGE (file:IntegrationType {name: 'File'})
      MERGE (db:IntegrationType {name: 'Database'})
      MERGE (etl:IntegrationType {name: 'ETL'})
      MERGE (cloud:IntegrationType {name: 'Cloud'})
    `);
    console.log('Integration types created successfully');

    // Define business domains
    await session.run(`
      MERGE (life:BusinessDomain {name: 'Life Insurance'})
      MERGE (annuity:BusinessDomain {name: 'Annuities'})
      MERGE (claims:BusinessDomain {name: 'Claims'})
      MERGE (commission:BusinessDomain {name: 'Commissions'})
      MERGE (policy:BusinessDomain {name: 'Policy Admin'})
    `);
    console.log('Business domains created successfully');

    console.log('Neo4j schema initialized successfully');
  } catch (error) {
    console.error('Error initializing Neo4j schema:', error);
    throw error;
  } finally {
    await session.close();
  }
};

// Node types and their relationships:
/*
(:Application) -[:BELONGS_TO]-> (:Ecosystem)
(:Application) -[:OWNED_BY]-> (:Team)
(:Team) -[:BELONGS_TO]-> (:Area)
(:Integration) -[:CONNECTS {
  type: String,
  frequency: String,
  schedule: String,
  description: String,
  dataTypes: [String],
  businessDomains: [String]
}]-> (:Application)
(:Integration) -[:USES]-> (:IntegrationType)
(:Integration) -[:TRANSFERS]-> (:DataType)
(:DataType) -[:BELONGS_TO]-> (:BusinessDomain)
(:Application) -[:IS_TYPE]-> (:ApplicationType)
(:Product) -[:USES]-> (:Application)
(:Product) -[:INVOLVES]-> (:DataType)
*/

// Example query to get all applications and their integrations in an ecosystem:
/*
MATCH (a1:Application)-[i:CONNECTS]->(a2:Application)
WHERE a1.ecosystem = $ecosystem
RETURN a1, i, a2
*/

// Example query to get data lineage for a specific product:
/*
MATCH path = (start:Application)-[r:CONNECTS*]->(end:Application)
WHERE start.id IN $productApps
RETURN path
*/

// Example query to get all integrations for a team:
/*
MATCH (t:Team {id: $teamId})<-[:OWNED_BY]-(a:Application)
MATCH (a)-[i:CONNECTS]->(other:Application)
RETURN a, i, other
*/ 