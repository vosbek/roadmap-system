-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema
CREATE SCHEMA IF NOT EXISTS roadmap;

-- Organizations table
CREATE TABLE roadmap.organizations (
    id integer NOT NULL,
    name varchar(255) NOT NULL,
    description text,
    contact_info varchar(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE roadmap.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE roadmap.organizations_id_seq OWNED BY roadmap.organizations.id;
ALTER TABLE ONLY roadmap.organizations ALTER COLUMN id SET DEFAULT nextval('roadmap.organizations_id_seq'::regclass);
ALTER TABLE ONLY roadmap.organizations ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);

-- Areas table
CREATE TABLE roadmap.areas (
    id integer NOT NULL,
    organization_id integer,
    name varchar(255) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE roadmap.areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE roadmap.areas_id_seq OWNED BY roadmap.areas.id;
ALTER TABLE ONLY roadmap.areas ALTER COLUMN id SET DEFAULT nextval('roadmap.areas_id_seq'::regclass);
ALTER TABLE ONLY roadmap.areas ADD CONSTRAINT areas_pkey PRIMARY KEY (id);

-- Teams table
CREATE TABLE roadmap.teams (
    id integer NOT NULL,
    area_id integer,
    name varchar(255) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE roadmap.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE roadmap.teams_id_seq OWNED BY roadmap.teams.id;
ALTER TABLE ONLY roadmap.teams ALTER COLUMN id SET DEFAULT nextval('roadmap.teams_id_seq'::regclass);
ALTER TABLE ONLY roadmap.teams ADD CONSTRAINT teams_pkey PRIMARY KEY (id);

-- Architects table
CREATE TABLE roadmap.architects (
    id integer NOT NULL,
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    contact_info varchar(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE roadmap.architects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE roadmap.architects_id_seq OWNED BY roadmap.architects.id;
ALTER TABLE ONLY roadmap.architects ALTER COLUMN id SET DEFAULT nextval('roadmap.architects_id_seq'::regclass);
ALTER TABLE ONLY roadmap.architects ADD CONSTRAINT architects_pkey PRIMARY KEY (id);

-- Applications table
CREATE TABLE roadmap.applications (
    id integer NOT NULL,
    team_id integer,
    architect_id integer,
    name varchar(255) NOT NULL,
    description text,
    status varchar(50),
    enterprise_id varchar(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE roadmap.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE roadmap.applications_id_seq OWNED BY roadmap.applications.id;
ALTER TABLE ONLY roadmap.applications ALTER COLUMN id SET DEFAULT nextval('roadmap.applications_id_seq'::regclass);
ALTER TABLE ONLY roadmap.applications ADD CONSTRAINT applications_pkey PRIMARY KEY (id);

-- Foreign Key Constraints
ALTER TABLE ONLY roadmap.areas
    ADD CONSTRAINT areas_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES roadmap.organizations(id);

ALTER TABLE ONLY roadmap.teams
    ADD CONSTRAINT teams_area_id_fkey FOREIGN KEY (area_id) REFERENCES roadmap.areas(id);

ALTER TABLE ONLY roadmap.applications
    ADD CONSTRAINT applications_team_id_fkey FOREIGN KEY (team_id) REFERENCES roadmap.teams(id);

ALTER TABLE ONLY roadmap.applications
    ADD CONSTRAINT applications_architect_id_fkey FOREIGN KEY (architect_id) REFERENCES roadmap.architects(id);

-- Indexes
CREATE INDEX idx_areas_organization ON roadmap.areas(organization_id);
CREATE INDEX idx_teams_area ON roadmap.teams(area_id);
CREATE INDEX idx_applications_team ON roadmap.applications(team_id);
CREATE INDEX idx_applications_architect ON roadmap.applications(architect_id);
CREATE INDEX idx_organizations_name ON roadmap.organizations(name);
CREATE INDEX idx_architects_email ON roadmap.architects(email);

-- Subsystems table
CREATE TABLE roadmap.subsystems (
    id SERIAL PRIMARY KEY,
    application_id integer REFERENCES roadmap.applications(id),
    name varchar(255) NOT NULL,
    description text,
    enterprise_id varchar(50) NOT NULL,
    type varchar(50) NOT NULL,
    status varchar(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Capabilities table
CREATE TABLE roadmap.capabilities (
    id SERIAL PRIMARY KEY,
    subsystem_id integer REFERENCES roadmap.subsystems(id),
    name varchar(255) NOT NULL,
    description text,
    type varchar(50),
    status varchar(50) DEFAULT 'active',
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE roadmap.projects (
    id integer NOT NULL,
    name varchar(255) NOT NULL,
    title varchar(255) NOT NULL,
    type varchar(50),
    description text,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status varchar(50) NOT NULL,
    owner_architect_id integer,
    owner_team_id integer,
    project_type varchar(50) NOT NULL,
    is_shared boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE roadmap.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE roadmap.projects_id_seq OWNED BY roadmap.projects.id;
ALTER TABLE ONLY roadmap.projects ALTER COLUMN id SET DEFAULT nextval('roadmap.projects_id_seq'::regclass);
ALTER TABLE ONLY roadmap.projects ADD CONSTRAINT projects_pkey PRIMARY KEY (id);

-- Project Subscriptions table
CREATE TABLE roadmap.project_subscriptions (
    id integer NOT NULL,
    project_id integer,
    team_id integer,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status varchar(50) NOT NULL DEFAULT 'active',
    is_starred boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE roadmap.project_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE roadmap.project_subscriptions_id_seq OWNED BY roadmap.project_subscriptions.id;
ALTER TABLE ONLY roadmap.project_subscriptions ALTER COLUMN id SET DEFAULT nextval('roadmap.project_subscriptions_id_seq'::regclass);
ALTER TABLE ONLY roadmap.project_subscriptions ADD CONSTRAINT project_subscriptions_pkey PRIMARY KEY (id);

-- Project Dependencies table
CREATE TABLE roadmap.project_dependencies (
    id SERIAL PRIMARY KEY,
    project_id integer REFERENCES roadmap.projects(id),
    dependency_project_id integer REFERENCES roadmap.projects(id),
    dependency_type varchar(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_self_dependency CHECK ((project_id <> dependency_project_id))
);

-- Project Subsystems table
CREATE TABLE roadmap.project_subsystems (
    id SERIAL PRIMARY KEY,
    project_id integer REFERENCES roadmap.projects(id),
    subsystem_id integer REFERENCES roadmap.subsystems(id),
    custom_start_date date,
    custom_end_date date,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, subsystem_id)
);

-- Additional Foreign Key Constraints
ALTER TABLE ONLY roadmap.projects
    ADD CONSTRAINT projects_owner_architect_id_fkey FOREIGN KEY (owner_architect_id) REFERENCES roadmap.architects(id);

ALTER TABLE ONLY roadmap.projects
    ADD CONSTRAINT projects_owner_team_id_fkey FOREIGN KEY (owner_team_id) REFERENCES roadmap.teams(id);

ALTER TABLE ONLY roadmap.project_subscriptions
    ADD CONSTRAINT project_subscriptions_project_id_fkey FOREIGN KEY (project_id) REFERENCES roadmap.projects(id);

ALTER TABLE ONLY roadmap.project_subscriptions
    ADD CONSTRAINT project_subscriptions_team_id_fkey FOREIGN KEY (team_id) REFERENCES roadmap.teams(id);

-- Additional Indexes
CREATE INDEX idx_subsystems_application ON roadmap.subsystems(application_id);
CREATE INDEX idx_capabilities_subsystem ON roadmap.capabilities(subsystem_id);
CREATE INDEX idx_projects_owner_architect ON roadmap.projects(owner_architect_id);
CREATE INDEX idx_projects_owner_team ON roadmap.projects(owner_team_id);
CREATE INDEX idx_projects_dates ON roadmap.projects(start_date, end_date);
CREATE INDEX idx_project_dependencies_project ON roadmap.project_dependencies(project_id);
CREATE INDEX idx_project_dependencies_dependency ON roadmap.project_dependencies(dependency_project_id);
CREATE INDEX idx_project_subsystems_project ON roadmap.project_subsystems(project_id);
CREATE INDEX idx_project_subsystems_subsystem ON roadmap.project_subsystems(subsystem_id); 