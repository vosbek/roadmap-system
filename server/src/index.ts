import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { createRoutes } from './routes/index';

dotenv.config();
const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Create database pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Successfully connected to database:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('Initial database connection failed:', err);
    return false;
  }
}

// Use the router
const routes = createRoutes(pool);
app.use('/api', routes);

const PORT = process.env.PORT || 3001;

// Start server only after testing database connection
testConnection().then((success) => {
  if (success) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } else {
    console.error('Failed to connect to database. Check your connection settings.');
    process.exit(1);
  }
});