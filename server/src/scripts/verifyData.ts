import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'roadmap_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'dota'
});

async function verifyData() {
    const client = await pool.connect();
    try {
        console.log('\n=== Organizations ===');
        const orgs = await client.query('SELECT * FROM roadmap.organizations ORDER BY created_at DESC LIMIT 5');
        console.table(orgs.rows);

        console.log('\n=== Areas ===');
        const areas = await client.query('SELECT * FROM roadmap.areas ORDER BY created_at DESC LIMIT 5');
        console.table(areas.rows);

        console.log('\n=== Teams ===');
        const teams = await client.query('SELECT * FROM roadmap.teams ORDER BY created_at DESC LIMIT 5');
        console.table(teams.rows);

        console.log('\n=== Architects ===');
        const architects = await client.query('SELECT * FROM roadmap.architects ORDER BY created_at DESC LIMIT 5');
        console.table(architects.rows);

        console.log('\n=== Applications ===');
        const apps = await client.query('SELECT * FROM roadmap.applications ORDER BY created_at DESC LIMIT 5');
        console.table(apps.rows);

        // Join query to show relationships
        console.log('\n=== Full Relationship View ===');
        const fullView = await client.query(`
            SELECT 
                a.name as application_name,
                t.name as team_name,
                ar.name as architect_name,
                ar.email as architect_email,
                area.name as area_name,
                o.name as organization_name
            FROM roadmap.applications a
            LEFT JOIN roadmap.teams t ON a.team_id = t.id
            LEFT JOIN roadmap.architects ar ON a.architect_id = ar.id
            LEFT JOIN roadmap.areas area ON t.area_id = area.id
            LEFT JOIN roadmap.organizations o ON area.organization_id = o.id
            ORDER BY a.created_at DESC
            LIMIT 5
        `);
        console.table(fullView.rows);

    } catch (error) {
        console.error('Error verifying data:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the verification
verifyData().catch(console.error); 