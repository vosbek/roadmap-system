# Enterprise Technology Portfolio Dashboard

A modern web application for managing and visualizing enterprise technology initiatives, project roadmaps, and organizational impact analysis.

## Features

- Executive Dashboard with portfolio health metrics
- Interactive Technology Roadmap
- Project Impact Analysis
- Team & Organization Management
- Resource Allocation Tracking
- Strategic Initiative Planning

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL
- Styling: Tailwind CSS
- State Management: React Query
- Icons: Lucide React

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone [repository-url]
cd roadmap-system
```

### 2. Database Setup

1. Create a new PostgreSQL database:

```sql
CREATE DATABASE roadmap_system;
```

2. Create the schema and tables:

```sql
-- Create schema
CREATE SCHEMA roadmap;

-- Organizations
CREATE TABLE roadmap.organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Areas
CREATE TABLE roadmap.areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organization_id INTEGER REFERENCES roadmap.organizations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams
CREATE TABLE roadmap.teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    area_id INTEGER REFERENCES roadmap.areas(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Architects
CREATE TABLE roadmap.architects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications
CREATE TABLE roadmap.applications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50),
    team_id INTEGER REFERENCES roadmap.teams(id),
    architect_id INTEGER REFERENCES roadmap.architects(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE roadmap.projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    status VARCHAR(50),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Dependencies
CREATE TABLE roadmap.project_dependencies (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES roadmap.projects(id),
    dependency_project_id INTEGER REFERENCES roadmap.projects(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roadmap Projects (Applications-Projects relationship)
CREATE TABLE roadmap.roadmap_projects (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES roadmap.applications(id),
    project_id INTEGER REFERENCES roadmap.projects(id),
    custom_start_date DATE,
    custom_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. Load sample data:

```sql
-- Insert Organizations
INSERT INTO roadmap.organizations (name, description) VALUES
('Technology Division', 'Core technology and infrastructure'),
('Digital Products', 'Customer-facing digital solutions'),
('Enterprise Services', 'Internal enterprise systems');

-- Insert Areas
INSERT INTO roadmap.areas (name, description, organization_id) VALUES
('Infrastructure', 'Core infrastructure services', 1),
('Security', 'Security and compliance', 1),
('Digital Banking', 'Online banking solutions', 2),
('Enterprise Systems', 'Core enterprise applications', 3);

-- Insert Teams
INSERT INTO roadmap.teams (name, description, area_id) VALUES
('Cloud Platform', 'Cloud infrastructure team', 1),
('Security Operations', 'Security monitoring and operations', 2),
('Digital Experience', 'Digital banking experience', 3),
('Data Engineering', 'Enterprise data platform', 4);

-- Insert Architects
INSERT INTO roadmap.architects (name, email) VALUES
('John Smith', 'john.smith@company.com'),
('Sarah Johnson', 'sarah.johnson@company.com'),
('Michael Chen', 'michael.chen@company.com');

-- Insert Applications
INSERT INTO roadmap.applications (name, description, status, team_id, architect_id) VALUES
('Cloud Platform', 'Core cloud infrastructure', 'active', 1, 1),
('Security Gateway', 'Security monitoring platform', 'active', 2, 2),
('Mobile Banking', 'Mobile banking application', 'active', 3, 3),
('Data Lake Platform', 'Enterprise data lake', 'active', 4, 1);

-- Insert Projects
INSERT INTO roadmap.projects (title, description, type, status, start_date, end_date) VALUES
('Cloud Migration', 'Enterprise cloud migration', 'infrastructure', 'in_progress', '2024-01-01', '2024-06-30'),
('Security Modernization', 'Security infrastructure upgrade', 'security', 'planning', '2024-03-01', '2024-08-31'),
('AI Integration', 'AI/ML platform implementation', 'innovation', 'planning', '2024-02-01', '2024-07-31');

-- Insert Project Dependencies
INSERT INTO roadmap.project_dependencies (project_id, dependency_project_id) VALUES
(2, 1),
(3, 1);

-- Insert Roadmap Projects
INSERT INTO roadmap.roadmap_projects (application_id, project_id, custom_start_date, custom_end_date) VALUES
(1, 1, '2024-01-01', '2024-06-30'),
(2, 2, '2024-03-01', '2024-08-31'),
(4, 3, '2024-02-01', '2024-07-31');
```

### 3. Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file:
```plaintext
DB_HOST=localhost
DB_PORT=5432
DB_NAME=roadmap_system
DB_USER=your_username
DB_PASSWORD=your_password
PORT=3001
```

4. Start the server:
```bash
npm run dev
```

### 4. Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application should now be running at `http://localhost:5173`

## Available Scripts

In the project directory, you can run:

### Backend

- `npm run dev`: Starts the development server
- `npm run build`: Builds the production version
- `npm start`: Runs the production version

### Frontend

- `npm run dev`: Starts the development server
- `npm run build`: Builds the production version
- `npm run preview`: Previews the production build locally

## Project Structure

```plaintext
roadmap-system/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── types/        # TypeScript type definitions
│   │   └── App.tsx       # Main application component
│   └── package.json
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── routes/       # API routes
│   │   └── index.ts      # Server entry point
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 