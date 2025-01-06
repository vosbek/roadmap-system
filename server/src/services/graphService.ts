import { Driver, Session, Record } from 'neo4j-driver';

export class GraphService {
  constructor(private driver: Driver) {}

  getSession(): Session {
    return this.driver.session();
  }

  async addApplication(application: {
    id: string;
    name: string;
    type: string;
    ecosystem: string;
    teamId: string;
    description?: string;
    subtitle?: string;
  }) {
    const session = this.driver.session();
    try {
      await session.run(`
        MATCH (t:Team {id: $teamId})
        MATCH (type:ApplicationType {name: $appType})
        MERGE (a:Application {
          id: $id,
          name: $name,
          ecosystem: $ecosystem,
          description: $description,
          subtitle: $subtitle
        })
        MERGE (a)-[:OWNED_BY]->(t)
        MERGE (a)-[:IS_TYPE]->(type)
      `, {
        id: application.id,
        name: application.name,
        appType: application.type,
        ecosystem: application.ecosystem,
        teamId: application.teamId,
        description: application.description || '',
        subtitle: application.subtitle || ''
      });
    } finally {
      await session.close();
    }
  }

  async addIntegration(integration: {
    id: string;
    name: string;
    type: string;
    sourceAppId: string;
    targetAppId: string;
    dataTypes: string[];
    businessDomains: string[];
    frequency?: string;
    schedule?: string;
    description?: string;
  }) {
    const session = this.driver.session();
    try {
      await session.run(`
        MATCH (source:Application {id: $sourceAppId})
        MATCH (target:Application {id: $targetAppId})
        MATCH (intType:IntegrationType {name: $type})
        MERGE (i:Integration {
          id: $id,
          name: $name,
          frequency: $frequency,
          schedule: $schedule,
          description: $description
        })
        MERGE (i)-[:CONNECTS]->(target)
        MERGE (source)-[:CONNECTS]->(i)
        MERGE (i)-[:USES]->(intType)
        WITH i
        UNWIND $dataTypes as dataType
        MATCH (dt:DataType {name: dataType})
        MERGE (i)-[:TRANSFERS]->(dt)
        WITH i
        UNWIND $businessDomains as domain
        MATCH (bd:BusinessDomain {name: domain})
        MERGE (i)-[:BELONGS_TO]->(bd)
      `, {
        id: integration.id,
        name: integration.name,
        type: integration.type,
        sourceAppId: integration.sourceAppId,
        targetAppId: integration.targetAppId,
        dataTypes: integration.dataTypes,
        businessDomains: integration.businessDomains,
        frequency: integration.frequency || '',
        schedule: integration.schedule || '',
        description: integration.description || ''
      });
    } finally {
      await session.close();
    }
  }

  async getApplicationGraph(filters: {
    ecosystem?: string;
    teamId?: string;
    businessDomain?: string;
    dataType?: string;
  }) {
    const session = this.driver.session();
    try {
      let query = `
        MATCH (a1:Application)
        OPTIONAL MATCH (a1)-[r:CONNECTS]->(i:Integration)-[r2:CONNECTS]->(a2:Application)
      `;

      const whereConditions = [];
      if (filters.ecosystem) {
        whereConditions.push('a1.ecosystem = $ecosystem');
      }
      if (filters.teamId) {
        whereConditions.push('EXISTS((a1)-[:OWNED_BY]->(:Team {id: $teamId}))');
      }
      if (filters.businessDomain) {
        whereConditions.push('EXISTS((i)-[:BELONGS_TO]->(:BusinessDomain {name: $businessDomain}))');
      }
      if (filters.dataType) {
        whereConditions.push('EXISTS((i)-[:TRANSFERS]->(:DataType {name: $dataType}))');
      }

      if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
      }

      query += ' RETURN a1, r, i, r2, a2';

      const result = await session.run(query, filters);
      return result.records.map(record => ({
        source: record.get('a1').properties,
        integration: record.get('i')?.properties,
        target: record.get('a2')?.properties
      }));
    } finally {
      await session.close();
    }
  }

  async getDataLineage(productId: string) {
    const session = this.driver.session();
    try {
      const result = await session.run(`
        MATCH (p:Product {id: $productId})-[:USES]->(start:Application)
        MATCH path = (start)-[r:CONNECTS*]->(end:Application)
        RETURN path
      `, { productId });

      return result.records.map(record => record.get('path'));
    } finally {
      await session.close();
    }
  }
} 