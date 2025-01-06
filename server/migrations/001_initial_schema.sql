-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS roadmap;

-- Create architects table if it doesn't exist
CREATE TABLE IF NOT EXISTS roadmap.architects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS roadmap.applications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50),
    architect_id INTEGER REFERENCES roadmap.architects(id),
    enterprise_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subsystems table if it doesn't exist
CREATE TABLE IF NOT EXISTS roadmap.subsystems (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES roadmap.applications(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    enterprise_id VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('web', 'batch', 'mainframe', 'other')),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS roadmap.projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    status VARCHAR(50),
    start_date DATE,
    end_date DATE,
    meta JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create project_subsystems table if it doesn't exist
CREATE TABLE IF NOT EXISTS roadmap.project_subsystems (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES roadmap.projects(id),
    subsystem_id INTEGER REFERENCES roadmap.subsystems(id),
    custom_start_date DATE,
    custom_end_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, subsystem_id)
);

-- Insert sample data
DO $$ 
BEGIN
    -- Insert architect if not exists
    INSERT INTO roadmap.architects (name, email) 
    VALUES ('John Doe', 'john.doe@example.com')
    ON CONFLICT (email) DO NOTHING;

    -- Insert eB2B application if not exists
    INSERT INTO roadmap.applications (name, description, status, architect_id, enterprise_id) 
    SELECT 'eB2B', 'Electronic Business-to-Business Platform', 'Active', 
            (SELECT id FROM roadmap.architects WHERE email = 'john.doe@example.com'), 
            '4030'
    WHERE NOT EXISTS (
        SELECT 1 FROM roadmap.applications WHERE name = 'eB2B'
    );

    -- Insert subsystems if they don't exist
    INSERT INTO roadmap.subsystems (application_id, name, description, enterprise_id, type, status) 
    SELECT 
        (SELECT id FROM roadmap.applications WHERE name = 'eB2B'),
        'eB2B Web Apps', 'Web Application Frontend', '4030', 'web', 'Active'
    WHERE NOT EXISTS (
        SELECT 1 FROM roadmap.subsystems WHERE name = 'eB2B Web Apps'
    );

    INSERT INTO roadmap.subsystems (application_id, name, description, enterprise_id, type, status) 
    SELECT 
        (SELECT id FROM roadmap.applications WHERE name = 'eB2B'),
        'eB2B Feeds Processing', 'Batch Processing System', '1710', 'batch', 'Active'
    WHERE NOT EXISTS (
        SELECT 1 FROM roadmap.subsystems WHERE name = 'eB2B Feeds Processing'
    );

    INSERT INTO roadmap.subsystems (application_id, name, description, enterprise_id, type, status) 
    SELECT 
        (SELECT id FROM roadmap.applications WHERE name = 'eB2B'),
        'eB2B Electronic New Business', 'Mainframe System', '4040', 'mainframe', 'Active'
    WHERE NOT EXISTS (
        SELECT 1 FROM roadmap.subsystems WHERE name = 'eB2B Electronic New Business'
    );

    -- Insert sample projects if they don't exist
    INSERT INTO roadmap.projects (title, description, type, status, start_date, end_date)
    SELECT 'Web UI Modernization', 'Upgrade web interface to modern standards', 'infrastructure', 'In Progress', '2024-01-01', '2024-06-30'
    WHERE NOT EXISTS (SELECT 1 FROM roadmap.projects WHERE title = 'Web UI Modernization');

    INSERT INTO roadmap.projects (title, description, type, status, start_date, end_date)
    SELECT 'Batch Processing Optimization', 'Improve feed processing efficiency', 'business initiative', 'Planned', '2024-03-01', '2024-08-31'
    WHERE NOT EXISTS (SELECT 1 FROM roadmap.projects WHERE title = 'Batch Processing Optimization');

    INSERT INTO roadmap.projects (title, description, type, status, start_date, end_date)
    SELECT 'Mainframe Integration', 'Enhanced mainframe connectivity', 'infrastructure', 'Planned', '2024-07-01', '2024-12-31'
    WHERE NOT EXISTS (SELECT 1 FROM roadmap.projects WHERE title = 'Mainframe Integration');

    -- Link projects to subsystems if not already linked
    INSERT INTO roadmap.project_subsystems (project_id, subsystem_id, custom_start_date, custom_end_date)
    SELECT p.id, s.id, p.start_date, p.end_date
    FROM roadmap.projects p
    CROSS JOIN roadmap.subsystems s
    WHERE 
        ((p.title = 'Web UI Modernization' AND s.name = 'eB2B Web Apps') OR
        (p.title = 'Batch Processing Optimization' AND s.name = 'eB2B Feeds Processing') OR
        (p.title = 'Mainframe Integration' AND s.name = 'eB2B Electronic New Business'))
        AND NOT EXISTS (
            SELECT 1 
            FROM roadmap.project_subsystems ps 
            WHERE ps.project_id = p.id AND ps.subsystem_id = s.id
        );
END $$; 