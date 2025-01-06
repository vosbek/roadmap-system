-- Create capabilities table
CREATE TABLE IF NOT EXISTS roadmap.capabilities (
    id SERIAL PRIMARY KEY,
    subsystem_id INTEGER REFERENCES roadmap.subsystems(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sample data for eB2B subsystems
INSERT INTO roadmap.capabilities (subsystem_id, name, description, type, status) VALUES
-- Web Apps (4030) capabilities
(1, 'Order Management', 'End-to-end order processing and tracking', 'core', 'active'),
(1, 'Customer Portal', 'Self-service customer interface', 'core', 'active'),
(1, 'Product Catalog', 'Digital product listing and management', 'core', 'active'),
(1, 'Quote Generation', 'Automated quote creation and management', 'supporting', 'active'),

-- Feeds Processing (1710) capabilities
(2, 'EDI Integration', 'Electronic Data Interchange processing', 'core', 'active'),
(2, 'Batch Processing', 'Automated batch job management', 'core', 'active'),
(2, 'Data Validation', 'Real-time data verification', 'supporting', 'active'),
(2, 'Error Handling', 'Automated error detection and reporting', 'supporting', 'active'),

-- Mainframe System (4040) capabilities
(3, 'Legacy Data Storage', 'Historical data management', 'core', 'active'),
(3, 'Transaction Processing', 'High-volume transaction handling', 'core', 'active'),
(3, 'Batch Scheduling', 'Automated job scheduling', 'supporting', 'active'),
(3, 'Data Archival', 'Long-term data retention management', 'supporting', 'active');

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_capabilities_subsystem ON roadmap.capabilities(subsystem_id); 