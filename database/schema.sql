-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema
CREATE SCHEMA IF NOT EXISTS roadmap;

-- Organizations table
CREATE TABLE roadmap.organizations (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name varchar(255) NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Areas table
CREATE TABLE roadmap.areas (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    name varchar(255) NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE roadmap.teams (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    area_id uuid,
    name varchar(255) NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Architects table
CREATE TABLE roadmap.architects (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    team_id uuid,
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE roadmap.applications (
    id uuid NOT NULL,
    architect_id uuid,
    name varchar(255) NOT NULL,
    description text,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Subsystems table
CREATE TABLE roadmap.subsystems (
    id SERIAL PRIMARY KEY,
    application_id uuid REFERENCES roadmap.applications(id),
    name varchar(255) NOT NULL,
    description text,
    enterprise_id varchar(50) NOT NULL,
    type varchar(50) NOT NULL,
    status varchar(50),
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Capabilities table
CREATE TABLE roadmap.capabilities (
    id SERIAL PRIMARY KEY,
    subsystem_id integer REFERENCES roadmap.subsystems(id),
    name varchar(255) NOT NULL,
    description text,
    type varchar(50),
    status varchar(50) DEFAULT 'active',
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE roadmap.projects (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name varchar(255) NOT NULL,
    description text,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status varchar(50) NOT NULL,
    owner_architect_id uuid,
    owner_team_id uuid,
    project_type varchar(50) NOT NULL,
    is_shared bool DEFAULT false,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Project Subscriptions table
CREATE TABLE roadmap.project_subscriptions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    project_id uuid,
    team_id uuid,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status varchar(50) NOT NULL DEFAULT 'active',
    is_starred bool DEFAULT false,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Project Dependencies table
CREATE TABLE roadmap.project_dependencies (
    id SERIAL PRIMARY KEY,
    project_id uuid REFERENCES roadmap.projects(id),
    dependency_project_id uuid REFERENCES roadmap.projects(id),
    dependency_type varchar(50),
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, dependency_project_id)
);

-- Project Subsystems table
CREATE TABLE roadmap.project_subsystems (
    id SERIAL PRIMARY KEY,
    project_id uuid REFERENCES roadmap.projects(id),
    subsystem_id integer REFERENCES roadmap.subsystems(id),
    custom_start_date date,
    custom_end_date date,
    notes text,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, subsystem_id)
);

-- Roadmap Projects table
CREATE TABLE roadmap.roadmap_projects (
    id SERIAL PRIMARY KEY,
    subsystem_id integer REFERENCES roadmap.subsystems(id),
    project_id uuid REFERENCES roadmap.projects(id),
    custom_start_date date,
    custom_end_date date,
    notes text,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Foreign Key Constraints
ALTER TABLE roadmap.architects ADD CONSTRAINT architects_team_id_fkey FOREIGN KEY (team_id) REFERENCES roadmap.teams (id);
ALTER TABLE roadmap.areas ADD CONSTRAINT areas_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES roadmap.organizations (id);
ALTER TABLE roadmap.project_subscriptions ADD CONSTRAINT project_subscriptions_project_id_fkey FOREIGN KEY (project_id) REFERENCES roadmap.projects (id);
ALTER TABLE roadmap.project_subscriptions ADD CONSTRAINT project_subscriptions_team_id_fkey FOREIGN KEY (team_id) REFERENCES roadmap.teams (id);
ALTER TABLE roadmap.projects ADD CONSTRAINT projects_owner_architect_id_fkey FOREIGN KEY (owner_architect_id) REFERENCES roadmap.architects (id);
ALTER TABLE roadmap.projects ADD CONSTRAINT projects_owner_team_id_fkey FOREIGN KEY (owner_team_id) REFERENCES roadmap.teams (id);
ALTER TABLE roadmap.teams ADD CONSTRAINT teams_area_id_fkey FOREIGN KEY (area_id) REFERENCES roadmap.areas (id);

-- Indexes
CREATE UNIQUE INDEX applications_pkey ON roadmap.applications USING btree (id);
CREATE INDEX idx_applications_architect ON roadmap.applications USING btree (architect_id);
CREATE UNIQUE INDEX organizations_pkey ON roadmap.organizations USING btree (id);
CREATE UNIQUE INDEX areas_pkey ON roadmap.areas USING btree (id);
CREATE UNIQUE INDEX teams_pkey ON roadmap.teams USING btree (id);
CREATE UNIQUE INDEX architects_pkey ON roadmap.architects USING btree (id);
CREATE UNIQUE INDEX architects_email_key ON roadmap.architects USING btree (email);
CREATE UNIQUE INDEX projects_pkey ON roadmap.projects USING btree (id);
CREATE INDEX idx_projects_owner_architect ON roadmap.projects USING btree (owner_architect_id);
CREATE INDEX idx_projects_owner_team ON roadmap.projects USING btree (owner_team_id);
CREATE INDEX idx_projects_dates ON roadmap.projects USING btree (start_date, end_date);
CREATE INDEX idx_projects_status ON roadmap.projects USING btree (status);
CREATE INDEX idx_architects_team ON roadmap.architects USING btree (team_id);
CREATE INDEX idx_architects_email ON roadmap.architects USING btree (email);
CREATE INDEX idx_teams_area ON roadmap.teams USING btree (area_id);
CREATE INDEX idx_teams_name ON roadmap.teams USING btree (name);
CREATE INDEX idx_teams_area_name ON roadmap.teams USING btree (area_id, name);
CREATE INDEX idx_projects_lookups ON roadmap.projects USING btree (id, owner_architect_id, owner_team_id);
CREATE UNIQUE INDEX project_subscriptions_pkey ON roadmap.project_subscriptions USING btree (id);
CREATE UNIQUE INDEX unique_subscription ON roadmap.project_subscriptions USING btree (project_id, team_id);
CREATE INDEX idx_project_subscriptions_project ON roadmap.project_subscriptions USING btree (project_id);
CREATE INDEX idx_project_subscriptions_team ON roadmap.project_subscriptions USING btree (team_id);
CREATE INDEX idx_subsystems_application ON roadmap.subsystems(application_id);
CREATE INDEX idx_capabilities_subsystem ON roadmap.capabilities(subsystem_id);
CREATE INDEX idx_project_dependencies_project ON roadmap.project_dependencies(project_id);
CREATE INDEX idx_project_dependencies_dependency ON roadmap.project_dependencies(dependency_project_id);
CREATE INDEX idx_project_subsystems_project ON roadmap.project_subsystems(project_id);
CREATE INDEX idx_project_subsystems_subsystem ON roadmap.project_subsystems(subsystem_id); 