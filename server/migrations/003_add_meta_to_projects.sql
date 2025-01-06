-- Add meta column to projects table
ALTER TABLE roadmap.projects ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb; 