# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Authentication will be implemented using JWT tokens. All endpoints except public ones will require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Projects

#### Get All Projects
```http
GET /projects
```

Response:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Cloud Migration",
    "description": "Enterprise cloud migration",
    "project_type": "infrastructure",
    "status": "in_progress",
    "start_date": "2024-01-01",
    "end_date": "2024-06-30",
    "owner_architect_id": "123e4567-e89b-12d3-a456-426614174001",
    "owner_team_id": "123e4567-e89b-12d3-a456-426614174002",
    "is_shared": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Get Project Impact
```http
GET /projects/:id/impact
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Cloud Migration",
  "status": "in_progress",
  "project_type": "infrastructure",
  "description": "Enterprise cloud migration",
  "metrics": {
    "impactedTeams": 3,
    "organizations": 2,
    "timeline": "Jan 2024 - Jun 2024",
    "dependencies": 2
  },
  "timelineItems": [
    {
      "team": "Cloud Platform",
      "date": "Jan 2024",
      "status": "in-progress",
      "progress": 50
    }
  ],
  "orgImpact": [
    {
      "name": "Technology Division",
      "teams": 2,
      "risk": "medium",
      "impact": "Service interruption expected"
    }
  ]
}
```

#### Create Project
```http
POST /projects
```

Request Body:
```json
{
  "name": "New Project",
  "description": "Project description",
  "project_type": "infrastructure",
  "status": "planning",
  "start_date": "2024-01-01",
  "end_date": "2024-06-30",
  "owner_architect_id": "123e4567-e89b-12d3-a456-426614174001",
  "owner_team_id": "123e4567-e89b-12d3-a456-426614174002",
  "is_shared": false
}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174003"
}
```

### Project Subscriptions

#### Get Project Subscriptions
```http
GET /projects/:id/subscriptions
```

Response:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174004",
    "project_id": "123e4567-e89b-12d3-a456-426614174000",
    "team_id": "123e4567-e89b-12d3-a456-426614174005",
    "start_date": "2024-01-01",
    "end_date": "2024-06-30",
    "status": "active",
    "is_starred": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Create Project Subscription
```http
POST /projects/:id/subscriptions
```

Request Body:
```json
{
  "team_id": "123e4567-e89b-12d3-a456-426614174005",
  "start_date": "2024-01-01",
  "end_date": "2024-06-30",
  "status": "active",
  "is_starred": false
}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174004"
}
```

### Teams

#### Get All Teams
```http
GET /teams
```

Response:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174005",
    "name": "Cloud Platform",
    "area_id": "123e4567-e89b-12d3-a456-426614174006",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Get Team Details
```http
GET /teams/:id
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174005",
  "name": "Cloud Platform",
  "area": {
    "id": "123e4567-e89b-12d3-a456-426614174006",
    "name": "Infrastructure",
    "organization": {
      "id": "123e4567-e89b-12d3-a456-426614174007",
      "name": "Technology Division"
    }
  },
  "architects": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "name": "John Smith",
      "email": "john.smith@company.com"
    }
  ],
  "projects": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Cloud Migration",
      "status": "in_progress",
      "start_date": "2024-01-01",
      "end_date": "2024-06-30"
    }
  ]
}
```

### Organizations

#### Get All Organizations
```http
GET /organizations
```

Response:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174007",
    "name": "Technology Division",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Areas

#### Get All Areas
```http
GET /areas
```

Response:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174006",
    "name": "Infrastructure",
    "organization_id": "123e4567-e89b-12d3-a456-426614174007",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Applications

#### Get All Applications
```http
GET /applications
```

Response:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174008",
    "name": "Cloud Platform",
    "description": "Core cloud infrastructure",
    "architect_id": "123e4567-e89b-12d3-a456-426614174001",
    "subsystems": [
      {
        "id": 1,
        "name": "eB2B Feeds Processing",
        "description": "Electronic Business-to-Business feed processing",
        "enterprise_id": "1710",
        "type": "batch",
        "status": "active",
        "capabilities": [
          {
            "id": 1,
            "name": "Real-time Processing",
            "description": "Real-time feed processing capability",
            "type": "core",
            "status": "active"
          }
        ]
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Subsystems

#### Get Subsystem Details
```http
GET /subsystems/:id
```

Response:
```json
{
  "id": 1,
  "name": "eB2B Feeds Processing",
  "description": "Electronic Business-to-Business feed processing",
  "enterprise_id": "1710",
  "type": "batch",
  "status": "active",
  "application": {
    "id": 1,
    "name": "Cloud Platform",
    "status": "active"
  },
  "capabilities": [
    {
      "id": 1,
      "name": "Real-time Processing",
      "type": "core",
      "status": "active"
    }
  ],
  "projects": [
    {
      "id": 1,
      "title": "Processing Engine Upgrade",
      "type": "infrastructure",
      "status": "in_progress",
      "start_date": "2024-02-01",
      "end_date": "2024-05-31"
    }
  ]
}
```

### Capabilities

#### Get All Capabilities
```http
GET /capabilities
```

Response:
```json
[
  {
    "id": 1,
    "subsystem_id": 1,
    "name": "Real-time Processing",
    "description": "Real-time feed processing capability",
    "type": "core",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Roadmap Projects

#### Get All Roadmap Projects
```http
GET /roadmap_projects
```

Response:
```json
[
  {
    "id": 1,
    "application_id": 1,
    "project_id": 1,
    "custom_start_date": "2024-01-01",
    "custom_end_date": "2024-06-30",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse. The current limits are:
- 100 requests per minute per IP address
- 1000 requests per hour per IP address

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination using query parameters:
```
?page=1&per_page=20
```

Pagination metadata is included in the response headers:
```
X-Total-Count: 100
X-Total-Pages: 5
X-Current-Page: 1
```

## Filtering

List endpoints support filtering using query parameters:
```
?status=active&type=infrastructure
```

## Sorting

List endpoints support sorting using query parameters:
```
?sort=created_at&order=desc
```

## Data Types

| Type | Description | Format |
|------|-------------|--------|
| id | Integer | Numeric identifier |
| string | Text | UTF-8 encoded string |
| date | Date | ISO 8601 format (YYYY-MM-DD) |
| timestamp | Timestamp | ISO 8601 format with timezone |
| boolean | Boolean | true/false |

## Versioning

The API is versioned using URL path versioning. The current version is v1:
```
/api/v1/resources
``` 