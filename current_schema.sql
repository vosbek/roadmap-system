--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: roadmap; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA roadmap;


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: roadmap; Owner: -
--

CREATE FUNCTION roadmap.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applications; Type: TABLE; Schema: roadmap; Owner: -
--

CREATE TABLE roadmap.applications (
    id integer NOT NULL,
    team_id integer,
    architect_id integer,
    name character varying(255) NOT NULL,
    description text,
    status character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    enterprise_id character varying(50)
);


--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: roadmap; Owner: -
--

CREATE SEQUENCE roadmap.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: roadmap; Owner: -
--

ALTER SEQUENCE roadmap.applications_id_seq OWNED BY roadmap.applications.id;


--
-- Name: architects; Type: TABLE; Schema: roadmap; Owner: -
--

CREATE TABLE roadmap.architects (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    contact_info character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: architects_id_seq; Type: SEQUENCE; Schema: roadmap; Owner: -
--

CREATE SEQUENCE roadmap.architects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: architects_id_seq; Type: SEQUENCE OWNED BY; Schema: roadmap; Owner: -
--

ALTER SEQUENCE roadmap.architects_id_seq OWNED BY roadmap.architects.id;


--
-- Name: areas; Type: TABLE; Schema: roadmap; Owner: -
--

CREATE TABLE roadmap.areas (
    id integer NOT NULL,
    organization_id integer,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: areas_id_seq; Type: SEQUENCE; Schema: roadmap; Owner: -
--

CREATE SEQUENCE roadmap.areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: areas_id_seq; Type: SEQUENCE OWNED BY; Schema: roadmap; Owner: -
--

ALTER SEQUENCE roadmap.areas_id_seq OWNED BY roadmap.areas.id;


--
-- Name: capabilities; Type: TABLE; Schema: roadmap; Owner: -
--

CREATE TABLE roadmap.capabilities (
    id integer NOT NULL,
    subsystem_id integer,
    name character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'active'::character varying,
    type character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: capabilities_id_seq; Type: SEQUENCE; Schema: roadmap; Owner: -
--

CREATE SEQUENCE roadmap.capabilities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: capabilities_id_seq; Type: SEQUENCE OWNED BY; Schema: roadmap; Owner: -
--

ALTER SEQUENCE roadmap.capabilities_id_seq OWNED BY roadmap.capabilities.id;


--
-- Name: organizations; Type: TABLE; Schema: roadmap; Owner: -
--

CREATE TABLE roadmap.organizations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    contact_info character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: roadmap; Owner: -
--

CREATE SEQUENCE roadmap.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: roadmap; Owner: -
--

ALTER SEQUENCE roadmap.organizations_id_seq OWNED BY roadmap.organizations.id;


--
-- Name: project_dependencies; Type: TABLE; Schema: roadmap; Owner: -
--

CREATE TABLE roadmap.project_dependencies (
    id integer NOT NULL,
    project_id integer,
    dependency_project_id integer,
    dependency_type character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_self_dependency CHECK ((project_id <> dependency_project_id))
);


--
-- Name: project_dependencies_id_seq; Type: SEQUENCE; Schema: roadmap; Owner: -
--

CREATE SEQUENCE roadmap.project_dependencies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_dependencies_id_seq; Type: SEQUENCE OWNED BY; Schema: roadmap; Owner: -
--

ALTER SEQUENCE roadmap.project_dependencies_id_seq OWNED BY roadmap.project_dependencies.id;


--
-- Name: project_subscriptions; Type: TABLE; Schema: roadmap; Owner: -
--

CREATE TABLE roadmap.project_subscriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid,
    team_id uuid,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying NOT NULL,
    is_starred boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK ((end_date >= start_date))
);


--
-- Name: project_subsystems; Type: TABLE; Schema: roadmap; Owner: -
--

CREATE TABLE roadmap.project_subsystems (
    id integer NOT NULL,
    project_id integer,
    subsystem_id integer,
    custom_start_date date,
    custom_end_date date,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: project_subsystems_id_seq; Type: SEQUENCE; Schema: roadmap; Owner: -
--

CREATE SEQUENCE roadmap.project_subsystems_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_subsystems_id_seq; Type: SEQUENCE OWNED BY; Schema: roadmap; Owner: -
--

ALTER SEQUENCE roadmap.project_subsystems_id_seq OWNED BY roadmap.project_subsystems.id;


--
-- Name: projects; Type: TABLE; Schema: roadmap; Owner: -
--

CREATE TABLE roadmap.projects (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    type character varying(50),
    funding_status character varying(50),
    start_date date,
    end_date date,
    business_impact text,
    status character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    meta jsonb DEFAULT '{}'::jsonb
);


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: roadmap; Owner: -
--

CREATE SEQUENCE roadmap.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: roadmap; Owner: -
--

ALTER SEQUENCE roadmap.projects_id_seq OWNED BY roadmap.projects.id;


--
-- Name: roadmap_projects; Type: TABLE; Schema: roadmap; Owner: -
--

CREATE TABLE roadmap.roadmap_projects (
    id integer NOT NULL,
    application_id integer,
    project_id integer,
    custom_start_date date,
    custom_end_date date,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: roadmap_projects_id_seq; Type: SEQUENCE; Schema: roadmap; Owner: -
--

CREATE SEQUENCE roadmap.roadmap_projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roadmap_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: roadmap; Owner: -
--

ALTER SEQUENCE roadmap.roadmap_projects_id_seq OWNED BY roadmap.roadmap_projects.id;


--
-- Name: subsystems; Type: TABLE; Schema: roadmap; Owner: -
--

CREATE TABLE roadmap.subsystems (
    id integer NOT NULL,
    application_id integer,
    name character varying(255) NOT NULL,
    description text,
    enterprise_id character varying(50) NOT NULL,
    type character varying(50) NOT NULL,
    status character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT subsystems_type_check CHECK (((type)::text = ANY ((ARRAY['web'::character varying, 'batch'::character varying, 'mainframe'::character varying, 'other'::character varying])::text[])))
);


--
-- Name: subsystems_id_seq; Type: SEQUENCE; Schema: roadmap; Owner: -
--

CREATE SEQUENCE roadmap.subsystems_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subsystems_id_seq; Type: SEQUENCE OWNED BY; Schema: roadmap; Owner: -
--

ALTER SEQUENCE roadmap.subsystems_id_seq OWNED BY roadmap.subsystems.id;


--
-- Name: teams; Type: TABLE; Schema: roadmap; Owner: -
--

CREATE TABLE roadmap.teams (
    id integer NOT NULL,
    area_id integer,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: roadmap; Owner: -
--

CREATE SEQUENCE roadmap.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: roadmap; Owner: -
--

ALTER SEQUENCE roadmap.teams_id_seq OWNED BY roadmap.teams.id;


--
-- Name: applications id; Type: DEFAULT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.applications ALTER COLUMN id SET DEFAULT nextval('roadmap.applications_id_seq'::regclass);


--
-- Name: architects id; Type: DEFAULT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.architects ALTER COLUMN id SET DEFAULT nextval('roadmap.architects_id_seq'::regclass);


--
-- Name: areas id; Type: DEFAULT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.areas ALTER COLUMN id SET DEFAULT nextval('roadmap.areas_id_seq'::regclass);


--
-- Name: capabilities id; Type: DEFAULT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.capabilities ALTER COLUMN id SET DEFAULT nextval('roadmap.capabilities_id_seq'::regclass);


--
-- Name: organizations id; Type: DEFAULT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.organizations ALTER COLUMN id SET DEFAULT nextval('roadmap.organizations_id_seq'::regclass);


--
-- Name: project_dependencies id; Type: DEFAULT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.project_dependencies ALTER COLUMN id SET DEFAULT nextval('roadmap.project_dependencies_id_seq'::regclass);


--
-- Name: project_subsystems id; Type: DEFAULT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.project_subsystems ALTER COLUMN id SET DEFAULT nextval('roadmap.project_subsystems_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.projects ALTER COLUMN id SET DEFAULT nextval('roadmap.projects_id_seq'::regclass);


--
-- Name: roadmap_projects id; Type: DEFAULT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.roadmap_projects ALTER COLUMN id SET DEFAULT nextval('roadmap.roadmap_projects_id_seq'::regclass);


--
-- Name: subsystems id; Type: DEFAULT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.subsystems ALTER COLUMN id SET DEFAULT nextval('roadmap.subsystems_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.teams ALTER COLUMN id SET DEFAULT nextval('roadmap.teams_id_seq'::regclass);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: architects architects_email_key; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.architects
    ADD CONSTRAINT architects_email_key UNIQUE (email);


--
-- Name: architects architects_pkey; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.architects
    ADD CONSTRAINT architects_pkey PRIMARY KEY (id);


--
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id);


--
-- Name: capabilities capabilities_pkey; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.capabilities
    ADD CONSTRAINT capabilities_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: project_dependencies project_dependencies_pkey; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.project_dependencies
    ADD CONSTRAINT project_dependencies_pkey PRIMARY KEY (id);


--
-- Name: project_subscriptions project_subscriptions_pkey; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.project_subscriptions
    ADD CONSTRAINT project_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: project_subsystems project_subsystems_pkey; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.project_subsystems
    ADD CONSTRAINT project_subsystems_pkey PRIMARY KEY (id);


--
-- Name: project_subsystems project_subsystems_project_id_subsystem_id_key; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.project_subsystems
    ADD CONSTRAINT project_subsystems_project_id_subsystem_id_key UNIQUE (project_id, subsystem_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: roadmap_projects roadmap_projects_application_id_project_id_key; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.roadmap_projects
    ADD CONSTRAINT roadmap_projects_application_id_project_id_key UNIQUE (application_id, project_id);


--
-- Name: roadmap_projects roadmap_projects_pkey; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.roadmap_projects
    ADD CONSTRAINT roadmap_projects_pkey PRIMARY KEY (id);


--
-- Name: subsystems subsystems_pkey; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.subsystems
    ADD CONSTRAINT subsystems_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: project_dependencies unique_dependency; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.project_dependencies
    ADD CONSTRAINT unique_dependency UNIQUE (project_id, dependency_project_id);


--
-- Name: project_subscriptions unique_subscription; Type: CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.project_subscriptions
    ADD CONSTRAINT unique_subscription UNIQUE (project_id, team_id);


--
-- Name: idx_applications_architect; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_applications_architect ON roadmap.applications USING btree (architect_id);


--
-- Name: idx_applications_team; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_applications_team ON roadmap.applications USING btree (team_id);


--
-- Name: idx_applications_team_id; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_applications_team_id ON roadmap.applications USING btree (team_id);


--
-- Name: idx_areas_organization; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_areas_organization ON roadmap.areas USING btree (organization_id);


--
-- Name: idx_areas_organization_id; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_areas_organization_id ON roadmap.areas USING btree (organization_id);


--
-- Name: idx_capabilities_subsystem; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_capabilities_subsystem ON roadmap.capabilities USING btree (subsystem_id);


--
-- Name: idx_project_dependencies_dependency; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_project_dependencies_dependency ON roadmap.project_dependencies USING btree (dependency_project_id);


--
-- Name: idx_project_dependencies_project; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_project_dependencies_project ON roadmap.project_dependencies USING btree (project_id);


--
-- Name: idx_project_subscriptions_project; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_project_subscriptions_project ON roadmap.project_subscriptions USING btree (project_id);


--
-- Name: idx_project_subscriptions_team; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_project_subscriptions_team ON roadmap.project_subscriptions USING btree (team_id);


--
-- Name: idx_project_subsystems_project_id; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_project_subsystems_project_id ON roadmap.project_subsystems USING btree (project_id);


--
-- Name: idx_project_subsystems_subsystem_id; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_project_subsystems_subsystem_id ON roadmap.project_subsystems USING btree (subsystem_id);


--
-- Name: idx_roadmap_projects_app; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_roadmap_projects_app ON roadmap.roadmap_projects USING btree (application_id);


--
-- Name: idx_roadmap_projects_project; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_roadmap_projects_project ON roadmap.roadmap_projects USING btree (project_id);


--
-- Name: idx_subsystems_application_id; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_subsystems_application_id ON roadmap.subsystems USING btree (application_id);


--
-- Name: idx_teams_area; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_teams_area ON roadmap.teams USING btree (area_id);


--
-- Name: idx_teams_area_id; Type: INDEX; Schema: roadmap; Owner: -
--

CREATE INDEX idx_teams_area_id ON roadmap.teams USING btree (area_id);


--
-- Name: applications update_applications_updated_at; Type: TRIGGER; Schema: roadmap; Owner: -
--

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON roadmap.applications FOR EACH ROW EXECUTE FUNCTION roadmap.update_updated_at_column();


--
-- Name: architects update_architects_updated_at; Type: TRIGGER; Schema: roadmap; Owner: -
--

CREATE TRIGGER update_architects_updated_at BEFORE UPDATE ON roadmap.architects FOR EACH ROW EXECUTE FUNCTION roadmap.update_updated_at_column();


--
-- Name: areas update_areas_updated_at; Type: TRIGGER; Schema: roadmap; Owner: -
--

CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON roadmap.areas FOR EACH ROW EXECUTE FUNCTION roadmap.update_updated_at_column();


--
-- Name: organizations update_organizations_updated_at; Type: TRIGGER; Schema: roadmap; Owner: -
--

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON roadmap.organizations FOR EACH ROW EXECUTE FUNCTION roadmap.update_updated_at_column();


--
-- Name: project_dependencies update_project_dependencies_updated_at; Type: TRIGGER; Schema: roadmap; Owner: -
--

CREATE TRIGGER update_project_dependencies_updated_at BEFORE UPDATE ON roadmap.project_dependencies FOR EACH ROW EXECUTE FUNCTION roadmap.update_updated_at_column();


--
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: roadmap; Owner: -
--

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON roadmap.projects FOR EACH ROW EXECUTE FUNCTION roadmap.update_updated_at_column();


--
-- Name: roadmap_projects update_roadmap_projects_updated_at; Type: TRIGGER; Schema: roadmap; Owner: -
--

CREATE TRIGGER update_roadmap_projects_updated_at BEFORE UPDATE ON roadmap.roadmap_projects FOR EACH ROW EXECUTE FUNCTION roadmap.update_updated_at_column();


--
-- Name: teams update_teams_updated_at; Type: TRIGGER; Schema: roadmap; Owner: -
--

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON roadmap.teams FOR EACH ROW EXECUTE FUNCTION roadmap.update_updated_at_column();


--
-- Name: applications applications_architect_id_fkey; Type: FK CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.applications
    ADD CONSTRAINT applications_architect_id_fkey FOREIGN KEY (architect_id) REFERENCES roadmap.architects(id);


--
-- Name: applications applications_team_id_fkey; Type: FK CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.applications
    ADD CONSTRAINT applications_team_id_fkey FOREIGN KEY (team_id) REFERENCES roadmap.teams(id);


--
-- Name: areas areas_organization_id_fkey; Type: FK CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.areas
    ADD CONSTRAINT areas_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES roadmap.organizations(id);


--
-- Name: capabilities capabilities_subsystem_id_fkey; Type: FK CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.capabilities
    ADD CONSTRAINT capabilities_subsystem_id_fkey FOREIGN KEY (subsystem_id) REFERENCES roadmap.subsystems(id);


--
-- Name: project_dependencies project_dependencies_dependency_project_id_fkey; Type: FK CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.project_dependencies
    ADD CONSTRAINT project_dependencies_dependency_project_id_fkey FOREIGN KEY (dependency_project_id) REFERENCES roadmap.projects(id);


--
-- Name: project_dependencies project_dependencies_project_id_fkey; Type: FK CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.project_dependencies
    ADD CONSTRAINT project_dependencies_project_id_fkey FOREIGN KEY (project_id) REFERENCES roadmap.projects(id);


--
-- Name: project_subsystems project_subsystems_project_id_fkey; Type: FK CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.project_subsystems
    ADD CONSTRAINT project_subsystems_project_id_fkey FOREIGN KEY (project_id) REFERENCES roadmap.projects(id);


--
-- Name: project_subsystems project_subsystems_subsystem_id_fkey; Type: FK CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.project_subsystems
    ADD CONSTRAINT project_subsystems_subsystem_id_fkey FOREIGN KEY (subsystem_id) REFERENCES roadmap.subsystems(id);


--
-- Name: roadmap_projects roadmap_projects_application_id_fkey; Type: FK CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.roadmap_projects
    ADD CONSTRAINT roadmap_projects_application_id_fkey FOREIGN KEY (application_id) REFERENCES roadmap.applications(id);


--
-- Name: roadmap_projects roadmap_projects_project_id_fkey; Type: FK CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.roadmap_projects
    ADD CONSTRAINT roadmap_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES roadmap.projects(id);


--
-- Name: subsystems subsystems_application_id_fkey; Type: FK CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.subsystems
    ADD CONSTRAINT subsystems_application_id_fkey FOREIGN KEY (application_id) REFERENCES roadmap.applications(id);


--
-- Name: teams teams_area_id_fkey; Type: FK CONSTRAINT; Schema: roadmap; Owner: -
--

ALTER TABLE ONLY roadmap.teams
    ADD CONSTRAINT teams_area_id_fkey FOREIGN KEY (area_id) REFERENCES roadmap.areas(id);


--
-- PostgreSQL database dump complete
--

