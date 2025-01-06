# Database Schema Documentation

## Overview
The database uses PostgreSQL and is organized in the `roadmap` schema. It follows a hierarchical structure to represent organizations, their areas, teams, architects, applications, and projects.

## Tables

### organizations
The root table representing top-level organizations.
- `id` (UUID PRIMARY KEY): Unique identifier
- `name` (VARCHAR(255)): Organization name
- `created_at` (TIMESTAMPTZ): Record creation timestamp
- `updated_at` (TIMESTAMPTZ): Record update timestamp

### areas
Represents major areas within an organization.
- `id` (UUID PRIMARY KEY): Unique identifier
- `organization_id` (UUID): Foreign key to organizations.id
- `name` (VARCHAR(255)): Area name
- `created_at` (TIMESTAMPTZ): Record creation timestamp
- `updated_at` (TIMESTAMPTZ): Record update timestamp

### teams
Represents teams within areas.
- `id` (UUID PRIMARY KEY): Unique identifier
- `area_id` (UUID): Foreign key to areas.id
- `name` (VARCHAR(255)): Team name
- `created_at` (TIMESTAMPTZ): Record creation timestamp
- `updated_at` (TIMESTAMPTZ): Record update timestamp

### architects
Represents system architects who can be assigned to projects.
- `id` (UUID PRIMARY KEY): Unique identifier
- `team_id` (UUID): Foreign key to teams.id
- `name` (VARCHAR(255)): Architect's name
- `email` (VARCHAR(255)): Architect's email address (unique)
- `created_at` (TIMESTAMPTZ): Record creation timestamp
- `updated_at` (TIMESTAMPTZ): Record update timestamp

### applications
Represents applications owned by architects.
- `id` (UUID PRIMARY KEY): Unique identifier
- `architect_id` (UUID): Foreign key to architects.id
- `name` (VARCHAR(255)): Application name
- `description` (TEXT): Application description
- `created_at` (TIMESTAMPTZ): Record creation timestamp
- `updated_at` (TIMESTAMPTZ): Record update timestamp

### subsystems
Represents subsystems within applications.
- `id` (SERIAL PRIMARY KEY): Unique identifier
- `application_id` (UUID): Foreign key to applications.id
- `name` (VARCHAR(255)): Subsystem name
- `description` (TEXT): Subsystem description
- `enterprise_id` (VARCHAR(50)): Enterprise system identifier
- `type` (VARCHAR(50)): Subsystem type (web, batch, mainframe, other)
- `status` (VARCHAR(50)): Current status
- `created_at` (TIMESTAMPTZ): Record creation timestamp
- `updated_at` (TIMESTAMPTZ): Record update timestamp

### capabilities
Represents capabilities provided by subsystems.
- `id` (SERIAL PRIMARY KEY): Unique identifier
- `subsystem_id` (INTEGER): Foreign key to subsystems.id
- `name` (VARCHAR(255)): Capability name
- `description` (TEXT): Capability description
- `type` (VARCHAR(50)): Capability type
- `status` (VARCHAR(50)): Current status
- `created_at` (TIMESTAMPTZ): Record creation timestamp
- `updated_at` (TIMESTAMPTZ): Record update timestamp

### projects
Represents projects in the roadmap.
- `id` (UUID PRIMARY KEY): Unique identifier
- `name` (VARCHAR(255)): Project name
- `description` (TEXT): Project description
- `start_date` (DATE): Project start date
- `end_date` (DATE): Project end date
- `status` (VARCHAR(50)): Project status
- `owner_architect_id` (UUID): Foreign key to architects.id
- `owner_team_id` (UUID): Foreign key to teams.id
- `project_type` (VARCHAR(50)): Type of project
- `is_shared` (BOOLEAN): Whether project is shared
- `created_at` (TIMESTAMPTZ): Record creation timestamp
- `updated_at` (TIMESTAMPTZ): Record update timestamp

### project_subscriptions
Represents team subscriptions to projects.
- `id` (UUID PRIMARY KEY): Unique identifier
- `project_id` (UUID): Foreign key to projects.id
- `team_id` (UUID): Foreign key to teams.id
- `start_date` (DATE): Subscription start date
- `end_date` (DATE): Subscription end date
- `status` (VARCHAR(50)): Subscription status
- `is_starred` (BOOLEAN): Whether project is starred by team
- `created_at` (TIMESTAMPTZ): Record creation timestamp
- `updated_at` (TIMESTAMPTZ): Record update timestamp

### project_dependencies
Represents dependencies between projects.
- `id` (SERIAL PRIMARY KEY): Unique identifier
- `project_id` (UUID): Foreign key to projects.id
- `dependency_project_id` (UUID): Foreign key to projects.id
- `dependency_type` (VARCHAR(50)): Type of dependency
- `created_at` (TIMESTAMPTZ): Record creation timestamp
- `updated_at` (TIMESTAMPTZ): Record update timestamp

### project_subsystems
Represents relationships between projects and subsystems.
- `id` (SERIAL PRIMARY KEY): Unique identifier
- `project_id` (UUID): Foreign key to projects.id
- `subsystem_id` (INTEGER): Foreign key to subsystems.id
- `custom_start_date` (DATE): Custom start date for this subsystem
- `custom_end_date` (DATE): Custom end date for this subsystem
- `notes` (TEXT): Additional notes
- `created_at` (TIMESTAMPTZ): Record creation timestamp

## Key Relationships

1. Organization → Areas (1:Many)
   - An organization can have multiple areas
   - Each area belongs to one organization

2. Area → Teams (1:Many)
   - An area can have multiple teams
   - Each team belongs to one area

3. Team → Architects (1:Many)
   - A team can have multiple architects
   - Each architect belongs to one team

4. Architect → Applications (1:Many)
   - An architect can oversee multiple applications
   - Each application has one architect

5. Application → Subsystems (1:Many)
   - An application can have multiple subsystems
   - Each subsystem belongs to one application

6. Subsystem → Capabilities (1:Many)
   - A subsystem can have multiple capabilities
   - Each capability belongs to one subsystem

7. Project → Subscriptions (1:Many)
   - A project can have multiple team subscriptions
   - Each subscription belongs to one project and one team

8. Project → Dependencies (1:Many)
   - A project can have multiple dependencies
   - Each dependency links two projects

9. Project → Subsystems (Many:Many through project_subsystems)
   - A project can involve multiple subsystems
   - A subsystem can be involved in multiple projects
   - The relationship includes custom dates and notes

## Status Values

### Project Status
- `planned`
- `in_progress`
- `completed`
- `cancelled`
- `on_hold`

### Subsystem Type
- `web`
- `batch`
- `mainframe`
- `other`

### Subsystem Status
- `active`
- `inactive`
- `deprecated`
- `in_development`

### Project Type
- `infrastructure`
- `innovation`
- `maintenance`
- `security`
- `compliance`

## Data Ingestion

The system supports two types of data ingestion:

1. Organization Structure Import
   - Hierarchical data: Organizations, Areas, Teams, Architects
   - Application data: Applications, Subsystems, Capabilities
   - Uses CSV format with specific column structure

2. Project Portfolio Import
   - Project details and relationships
   - Team subscriptions and dependencies
   - System relationships with custom dates
   - Uses CSV format with specific column structure

Templates for both import types are available through the Data Ingestion interface. 