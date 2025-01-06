import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ExecError extends Error {
  message: string;
}

async function setupDb() {
  const dbName = 'roadmap';
  const username = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';

  try {
    // Create database using createdb command
    console.log('Creating database if it doesn\'t exist...');
    try {
      await execAsync(`createdb -h ${host} -p ${port} -U ${username} ${dbName}`);
      console.log('Database created successfully');
    } catch (error) {
      const err = error as ExecError;
      // Ignore error if database already exists
      if (!err.message.includes('already exists')) {
        throw err;
      }
      console.log('Database already exists');
    }

    // Now connect to our roadmap database
    const pool = new Pool({
      host: host,
      port: parseInt(port),
      database: dbName,
      user: username,
      password: password
    });

    try {
      // Read and execute migration files in order
      const migrationsDir = path.join(__dirname, '../../migrations');
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      for (const file of migrationFiles) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await pool.query(sql);
      }

      console.log('Database setup completed successfully');
    } finally {
      await pool.end();
    }
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDb().catch(console.error); 