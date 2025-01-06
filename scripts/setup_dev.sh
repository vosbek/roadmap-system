#!/bin/bash

echo "Setting up development environment..."

# Cleanup steps
echo "Cleaning up existing installation..."

# Clean up Node modules and dependencies
echo "Cleaning up Node modules..."
if [ -d "server/node_modules" ]; then
    rm -rf server/node_modules
fi
if [ -d "client/node_modules" ]; then
    rm -rf client/node_modules
fi

# Clean up Neo4j database
echo "Cleaning up Neo4j database..."
if nc -z localhost 7687; then
    echo "Dropping existing Neo4j data..."
    cypher-shell -u neo4j -p dota2024 "MATCH (n) DETACH DELETE n"
fi

# Backup existing .env files if they exist
if [ -f server/.env ]; then
    echo "Backing up server .env to server/.env.backup"
    cp server/.env server/.env.backup
fi
if [ -f client/.env ]; then
    echo "Backing up client .env to client/.env.backup"
    cp client/.env client/.env.backup
fi

# Setup Neo4j
echo "Setting up Neo4j..."
if ! nc -z localhost 7687; then
    echo "Neo4j is not running. Please start Neo4j and try again."
    exit 1
fi

# Run Neo4j setup script
echo "Initializing Neo4j schema..."
cypher-shell -u neo4j -p dota2024 < server/src/models/neo4j/schema.ts

# Install backend dependencies
echo "Installing backend dependencies..."
cd server
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd client
npm install
cd ..

# Create environment files if they don't exist
if [ ! -f server/.env ]; then
    echo "Creating server .env file..."
    cat > server/.env << EOL
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
EOL
fi

if [ ! -f client/.env ]; then
    echo "Creating client .env file..."
    cat > client/.env << EOL
VITE_API_URL=http://localhost:3001
EOL
fi

echo "Development environment setup completed!"
echo ""
echo "Next steps:"
echo "1. In pgAdmin:"
echo "   - Drop the existing 'roadmap_system' database if it exists"
echo "   - Create a new 'roadmap_system' database"
echo "   - Run the schema.sql script from database/schema.sql"
echo "2. Start Neo4j if not already running"
echo "3. In server directory: npm run dev"
echo "4. In client directory: npm run dev"
echo ""
echo "Note: Previous .env files were backed up with .env.backup extension if they existed." 