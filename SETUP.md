# Development Environment Setup

## Prerequisites

1. PostgreSQL 12 or higher with pgAdmin 4
2. Neo4j 5.x or higher
3. Node.js 16 or higher
4. npm 8 or higher

## Cleanup of Existing Installation

If you have a previous installation, the setup script will:
1. Remove existing `node_modules` directories
2. Clear all Neo4j database data
3. Backup existing `.env` files to `.env.backup`

For PostgreSQL, you'll need to manually:
1. Open pgAdmin 4
2. Right-click on the existing 'roadmap_system' database
3. Select "Delete/Drop" with the "Drop with CASCADE" option
4. Create a new database named 'roadmap_system'

## Installation Steps

### 1. PostgreSQL Setup using pgAdmin

1. Open pgAdmin 4
2. Connect to your PostgreSQL server
3. If exists, drop the 'roadmap_system' database
4. Create a new database named 'roadmap_system'
5. Open the Query Tool
6. Copy the contents of `database/schema.sql` into the Query Tool
7. Execute the query

### 2. Install Neo4j

#### Windows
1. Download Neo4j Desktop from https://neo4j.com/download/
2. Install Neo4j Desktop
3. Create a new project
4. Add a new database (version 5.x)
5. Set password to 'dota2024'
6. Start the database

#### Linux/Mac
```bash
# Ubuntu/Debian
sudo apt install neo4j
sudo systemctl start neo4j
sudo neo4j-admin set-initial-password dota2024

# Mac (using Homebrew)
brew install neo4j
brew services start neo4j
neo4j-admin set-initial-password dota2024
```

### 3. Setup Development Environment

1. Clone the repository:
```bash
git clone [repository-url]
cd roadmap-system
```

2. Run the setup script:
```bash
# Make the script executable
chmod +x scripts/setup_dev.sh

# Run the setup script
./scripts/setup_dev.sh
```

The setup script will:
- Clean up existing installation
- Back up existing environment files
- Set up Neo4j database schema
- Install backend dependencies
- Install frontend dependencies
- Create necessary environment files

## Starting the Application

1. Start Neo4j (if not already running)
```bash
# Ubuntu/Debian
sudo systemctl start neo4j

# Mac
brew services start neo4j

# Windows
# Use Neo4j Desktop to start the database
```

2. Start the backend server:
```bash
cd server
npm run dev
```

3. Start the frontend development server:
```bash
cd client
npm run dev
```

The application should now be running at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Troubleshooting

### PostgreSQL Issues
1. If you get permission denied in pgAdmin:
   - Right-click on the PostgreSQL server
   - Select "Properties"
   - Under "Connection", verify the username and password
   - Default superuser is "postgres" with password "postgres"

2. If database drop/creation fails:
   - Ensure no active connections to the database
   - In pgAdmin, right-click the database
   - Select "Disconnect Database" to force close connections
   - Try dropping the database again

### Neo4j Issues
1. If authentication fails:
```bash
neo4j-admin set-initial-password dota2024
```

2. If ports are in use:
- Check if another instance is running
- Default ports: 7687 (Bolt), 7474 (HTTP)

3. If data cleanup fails:
```bash
# Stop Neo4j
sudo systemctl stop neo4j  # Linux
brew services stop neo4j   # Mac

# Delete the data directory
rm -rf /path/to/neo4j/data/*

# Start Neo4j
sudo systemctl start neo4j  # Linux
brew services start neo4j   # Mac
```

### Node.js Issues
1. If modules are missing or corrupted:
```bash
# In server directory
rm -rf node_modules package-lock.json
npm install

# In client directory
rm -rf node_modules package-lock.json
npm install
```

## Environment Variables

### Server (.env)
```plaintext
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=roadmap_system
DB_USER=postgres
DB_PASSWORD=postgres
DB_SCHEMA=roadmap
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=dota2024
```

### Client (.env)
```plaintext
VITE_API_URL=http://localhost:3001
```

## Restoring Backups

If you need to restore the previous environment configuration:
```bash
# Restore server environment
cp server/.env.backup server/.env

# Restore client environment
cp client/.env.backup client/.env
``` 