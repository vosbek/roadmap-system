# Database Setup Instructions

This document provides instructions for setting up the roadmap system database locally.

## Prerequisites

1. PostgreSQL 12 or higher installed on your machine
2. psql command-line tool or pgAdmin 4 installed

## Setup Steps

1. Create a new database:
```sql
CREATE DATABASE roadmap;
```

2. Connect to the database:
```sql
\c roadmap
```

3. Run the schema creation script:
```bash
psql -U postgres -d roadmap -f schema.sql
```

Or if using pgAdmin 4:
1. Open pgAdmin 4
2. Connect to your PostgreSQL server
3. Create a new database named 'roadmap'
4. Open the Query Tool
5. Copy the contents of schema.sql into the Query Tool
6. Execute the query

## Schema Overview

The database consists of the following tables:
- organizations: Stores organization information
- areas: Represents different areas within organizations
- teams: Teams within areas
- architects: System architects
- applications: Applications owned by architects
- subsystems: Subsystems within applications
- projects: Projects associated with subsystems
- project_dependencies: Dependencies between projects
- project_subsystems: Mapping between projects and subsystems
- capabilities: Capabilities of subsystems

## Notes

- The schema uses UUIDs for most primary keys
- Timestamps are stored in UTC using timestamp with time zone
- Foreign key constraints and indexes are automatically created
- The roadmap schema is used to namespace all tables 