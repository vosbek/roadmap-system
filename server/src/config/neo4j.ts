import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'dota2024';

export const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

export const initNeo4j = async () => {
  try {
    await driver.verifyConnectivity();
    console.log('Successfully connected to Neo4j');
  } catch (error) {
    console.error('Failed to connect to Neo4j:', error);
    throw error;
  }
};

// Close driver on process termination
process.on('exit', () => {
  driver.close();
}); 