# Deployment Guide

## Prerequisites

### System Requirements
- CPU: 2+ cores
- RAM: 4GB+ minimum
- Storage: 20GB+ available space
- OS: Ubuntu 20.04 LTS or newer

### Software Requirements
- Node.js v14+
- PostgreSQL v12+
- Nginx
- PM2 (for Node.js process management)
- Redis (optional, for caching)

## Environment Setup

### 1. Install System Dependencies

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# (Optional) Install Redis
sudo apt install -y redis-server
```

### 2. Configure PostgreSQL

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE roadmap_system;
CREATE USER roadmap_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE roadmap_system TO roadmap_user;

-- Create schema and grant permissions
\c roadmap_system
CREATE SCHEMA roadmap;
GRANT ALL ON SCHEMA roadmap TO roadmap_user;
\q

# Enable remote connections (if needed)
sudo nano /etc/postgresql/12/main/postgresql.conf
# Set listen_addresses = '*'

sudo nano /etc/postgresql/12/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

sudo systemctl restart postgresql
```

### 3. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/roadmap-system

server {
    listen 80;
    server_name your_domain.com;

    # Frontend
    location / {
        root /var/www/roadmap-system/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/roadmap-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Application Deployment

### 1. Backend Deployment

```bash
# Clone repository
git clone https://github.com/vosbek/roadmap-system.git
cd roadmap-system/server

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=roadmap_system
DB_USER=roadmap_user
DB_PASSWORD=your_password
DB_SCHEMA=roadmap
PORT=3001
EOL

# Build the application
npm run build

# Start with PM2
pm2 start dist/index.js --name roadmap-backend
pm2 save
```

### 2. Frontend Deployment

```bash
# Navigate to frontend directory
cd ../client

# Install dependencies
npm install

# Build the application
npm run build

# Copy to web root
sudo mkdir -p /var/www/roadmap-system
sudo cp -r dist /var/www/roadmap-system/client
```

## SSL Configuration

### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

```bash
sudo certbot --nginx -d your_domain.com
```

## Monitoring Setup

### 1. Configure PM2 Monitoring

```bash
pm2 install pm2-server-monit
pm2 install pm2-logrotate
```

### 2. Set Up Application Logging

```bash
# Create log directory
sudo mkdir -p /var/log/roadmap-system
sudo chown -R $USER:$USER /var/log/roadmap-system

# Configure PM2 to use log directory
pm2 start dist/index.js --name roadmap-backend --log /var/log/roadmap-system/backend.log
```

## Backup Configuration

### 1. Database Backup Script

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/roadmap-system"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database with schema
pg_dump -U roadmap_user -n roadmap roadmap_system > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete
```

### 2. Configure Automated Backups

```bash
# Add to crontab
crontab -e

# Add line:
0 0 * * * /path/to/backup_script.sh
```

## Security Considerations

### 1. Firewall Configuration

```bash
# Configure UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 2. Security Headers

Add to Nginx configuration:
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self';";
```

## Maintenance Procedures

### 1. Application Updates

```bash
# Backend update
cd /path/to/roadmap-system/server
git pull
npm install
npm run build
pm2 restart roadmap-backend

# Frontend update
cd /path/to/roadmap-system/client
git pull
npm install
npm run build
sudo cp -r dist /var/www/roadmap-system/client
```

### 2. Database Maintenance

```sql
-- Analyze tables
ANALYZE VERBOSE;

-- Vacuum database
VACUUM ANALYZE;

-- Reindex database
REINDEX DATABASE roadmap_system;
```

## Troubleshooting

### Common Issues

1. **Application Not Starting**
```bash
# Check PM2 logs
pm2 logs roadmap-backend

# Check system logs
journalctl -u nginx
journalctl -u postgresql
```

2. **Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql-12-main.log
```

3. **Nginx Issues**
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

## Performance Optimization

### 1. Node.js Optimization

```bash
# PM2 Cluster Mode
pm2 start dist/index.js -i max --name roadmap-backend
```

### 2. Nginx Optimization

Add to nginx.conf:
```nginx
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 3. PostgreSQL Optimization

Add to postgresql.conf:
```ini
# Memory Configuration
shared_buffers = 256MB                  # 25% of available RAM
work_mem = 32MB                         # Increased for complex joins
maintenance_work_mem = 256MB            # Increased for vacuum operations
effective_cache_size = 768MB            # 75% of available RAM

# Query Planner
random_page_cost = 1.1                  # Optimized for SSDs
effective_io_concurrency = 200          # Increased for SSDs
default_statistics_target = 100         # Default statistics target

# Write Ahead Log
wal_buffers = 16MB                      # Increased for write performance
checkpoint_completion_target = 0.9
min_wal_size = 1GB
max_wal_size = 4GB

# Connection Settings
max_connections = 100                   # Adjust based on load
```

Create appropriate indexes:
```sql
-- Application and Subsystem lookups
CREATE INDEX idx_applications_team ON roadmap.applications(team_id);
CREATE INDEX idx_applications_architect ON roadmap.applications(architect_id);
CREATE INDEX idx_subsystems_application ON roadmap.subsystems(application_id);
CREATE INDEX idx_subsystems_type ON roadmap.subsystems(type);
CREATE INDEX idx_subsystems_status ON roadmap.subsystems(status);

-- Capability lookups
CREATE INDEX idx_capabilities_subsystem ON roadmap.capabilities(subsystem_id);
CREATE INDEX idx_capabilities_type ON roadmap.capabilities(type);
CREATE INDEX idx_capabilities_status ON roadmap.capabilities(status);

-- Project lookups
CREATE INDEX idx_projects_type ON roadmap.projects(type);
CREATE INDEX idx_projects_status ON roadmap.projects(status);
CREATE INDEX idx_projects_dates ON roadmap.projects(start_date, end_date);
CREATE INDEX idx_projects_meta ON roadmap.projects USING gin(meta);

-- Roadmap project lookups
CREATE INDEX idx_roadmap_projects_subsystem ON roadmap.roadmap_projects(subsystem_id);
CREATE INDEX idx_roadmap_projects_project ON roadmap.roadmap_projects(project_id);
CREATE INDEX idx_roadmap_projects_dates ON roadmap.roadmap_projects(custom_start_date, custom_end_date);

-- Enterprise ID lookups
CREATE INDEX idx_applications_enterprise_id ON roadmap.applications(enterprise_id);
CREATE INDEX idx_subsystems_enterprise_id ON roadmap.subsystems(enterprise_id);
```

Vacuum and analyze settings:
```sql
-- Regular maintenance
ALTER TABLE roadmap.projects SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE roadmap.roadmap_projects SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE roadmap.subsystems SET (autovacuum_vacuum_scale_factor = 0.05);

-- Analyze all tables
ANALYZE VERBOSE roadmap.organizations;
ANALYZE VERBOSE roadmap.areas;
ANALYZE VERBOSE roadmap.teams;
ANALYZE VERBOSE roadmap.architects;
ANALYZE VERBOSE roadmap.applications;
ANALYZE VERBOSE roadmap.subsystems;
ANALYZE VERBOSE roadmap.capabilities;
ANALYZE VERBOSE roadmap.projects;
ANALYZE VERBOSE roadmap.project_dependencies;
ANALYZE VERBOSE roadmap.roadmap_projects;
```

## Scaling Considerations

### 1. Horizontal Scaling
- Use load balancer for multiple application instances
- Configure database replication
- Implement Redis for session management
- Use CDN for static assets

### 2. Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching strategies
- Use connection pooling

## Monitoring and Alerts

### 1. Set Up Monitoring

```bash
# Install monitoring tools
pm2 install pm2-prometheus
pm2 install pm2-server-monit

# Configure alert thresholds
pm2 set pm2-server-monit:cpu:threshold 80
pm2 set pm2-server-monit:mem:threshold 80
```

### 2. Configure Alerts

```bash
# Email alerts
pm2 set pm2-server-monit:email:to your-email@domain.com
pm2 set pm2-server-monit:email:from alerts@your-domain.com
```

## Disaster Recovery

### 1. Database Recovery

```bash
# Restore from backup
gunzip -c /var/backups/roadmap-system/backup_TIMESTAMP.sql.gz | psql -U roadmap_user roadmap_system
```

### 2. Application Recovery

```bash
# Restore application state
pm2 resurrect
```

### 3. System Recovery

Document complete system restore procedure including:
- OS installation
- Software installation
- Configuration restoration
- Data restoration
- Service restart sequence 