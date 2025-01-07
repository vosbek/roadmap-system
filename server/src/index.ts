import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { initNeo4j, driver } from './config/neo4j';
import ingestionRoutes from './routes/ingestion';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', routes);
app.use('/api/ingestion', ingestionRoutes);

async function startServer() {
  try {
    // Initialize Neo4j connection
    await initNeo4j();

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle cleanup on server shutdown
process.on('SIGTERM', async () => {
  console.log('Server is shutting down...');
  await driver.close();
  process.exit(0);
});

startServer();