# API Documentation

## Task Endpoints

### Create Task
```http
POST /api/task/create
```

Creates a new task in the system.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": ["string"],
  "skills": ["string"],
  "requirements": ["string"],
  "deliverables": ["string"],
  "reward": number,
  "deadline": "ISO date string",
  "priority": "low" | "medium" | "high",
  "logo": "string (URL)"
}
```

**Response:**
```json
{
  "message": "Task created successfully",
  "task": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "category": ["string"],
    "skills": ["string"],
    "requirements": ["string"],
    "deliverables": ["string"],
    "reward": number,
    "deadline": "ISO date string",
    "priority": "string",
    "logo": "string",
    "sponsorId": "string",
    "status": "open",
    "submissions": [],
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Fetch All Tasks
```http
POST /api/task/fetch
```

Retrieves all tasks from the system.

**Request Body:**
```json
{
  "page": number,
  "limit": number,
  "category": ["string"],
  "skills": ["string"],
  "status": "open" | "in_progress" | "completed" | "cancelled"
}
```

**Response:**
```json
{
  "tasks": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "category": ["string"],
      "skills": ["string"],
      "requirements": ["string"],
      "deliverables": ["string"],
      "reward": number,
      "deadline": "ISO date string",
      "priority": "string",
      "logo": "string",
      "sponsorId": "string",
      "status": "string",
      "submissions": ["string"],
      "createdAt": "ISO date string",
      "updatedAt": "ISO date string"
    }
  ]
}
```

### Fetch Task by ID
```http
POST /api/task/fetch
```

Retrieves a specific task by its ID.

**Request Body:**
```json
{
  "ids": ["string"]
}
```

**Response:**
```json
{
  "tasks": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "category": ["string"],
      "skills": ["string"],
      "requirements": ["string"],
      "deliverables": ["string"],
      "reward": number,
      "deadline": "ISO date string",
      "priority": "string",
      "logo": "string",
      "sponsorId": "string",
      "status": "string",
      "submissions": ["string"],
      "createdAt": "ISO date string",
      "updatedAt": "ISO date string"
    }
  ]
}
```

### Update Task
```http
PUT /api/task/update
```

Updates an existing task.

**Request Body:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "category": ["string"],
  "skills": ["string"],
  "requirements": ["string"],
  "deliverables": ["string"],
  "reward": number,
  "deadline": "ISO date string",
  "priority": "low" | "medium" | "high",
  "logo": "string (URL)",
  "status": "open" | "in_progress" | "completed" | "cancelled"
}
```

**Response:**
```json
{
  "message": "Task updated successfully",
  "task": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "category": ["string"],
    "skills": ["string"],
    "requirements": ["string"],
    "deliverables": ["string"],
    "reward": number,
    "deadline": "ISO date string",
    "priority": "string",
    "logo": "string",
    "sponsorId": "string",
    "status": "string",
    "submissions": ["string"],
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Delete Task
```http
DELETE /api/task
```

Deletes a task from the system.

**Request Body:**
```json
{
  "id": "string"
}
```

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

## Submission Endpoints

### Create Submission
```http
POST /api/submission
```

Creates a new submission for a task.

**Request Body:**
```json
{
  "submission": {
    "taskId": "string",
    "walletAddress": "string",
    "submissionTime": "ISO date string",
    "status": "pending" | "accepted" | "rejected",
    "isAccepted": boolean,
    "submissions": ["string (URL)"]
  }
}
```

**Response:**
```json
{
  "message": "Submission created successfully",
  "submission": {
    "_id": "string",
    "id": "string",
    "taskId": "string",
    "walletAddress": "string",
    "submissionTime": "ISO date string",
    "status": "string",
    "isAccepted": boolean,
    "submissions": ["string"],
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Get Submissions
```http
GET /api/submission
```

Retrieves submissions based on query parameters.

**Query Parameters:**
- `taskId`: Filter submissions by task ID
- `walletAddress`: Filter submissions by wallet address

**Response:**
```json
{
  "message": "Submissions retrieved successfully",
  "submissions": [
    {
      "_id": "string",
      "id": "string",
      "taskId": "string",
      "walletAddress": "string",
      "submissionTime": "ISO date string",
      "status": "string",
      "isAccepted": boolean,
      "submissions": ["string"],
      "createdAt": "ISO date string",
      "updatedAt": "ISO date string"
    }
  ]
}
```

### Delete Submission
```http
DELETE /api/submission
```

Deletes a submission from the system.

**Request Body:**
```json
{
  "submissionId": "string"
}
```

**Response:**
```json
{
  "message": "Submission deleted successfully"
}
```

## Authentication
All task and submission endpoints require authentication using a session token cookie. The token is obtained through the sponsor login process and is automatically handled by the client.

## Error Responses
All endpoints may return the following error responses:

```json
{
  "message": "string",
  "status": number
}
```

Common status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Contributor Endpoints

### Register Contributor
```http
POST /api/contributor/register
```

Registers a new contributor in the system.

**Request Body:**
```json
{
  "basicInfo": {
    "email": "string",
    "password": "string",
    "name": "string"
  },
  "walletAddress": "string"
}
```

**Response:**
```json
{
  "message": "Contributor registered successfully",
  "contributor": {
    "_id": "string",
    "basicInfo": {
      "email": "string",
      "name": "string"
    },
    "walletAddress": "string",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Login Contributor
```http
POST /api/contributor/login
```

Logs in a contributor.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "string",
  "contributor": {
    "_id": "string",
    "basicInfo": {
      "email": "string",
      "name": "string"
    },
    "walletAddress": "string"
  }
}
```

### Get Contributor Profile
```http
GET /api/contributor/profile
```

Retrieves the current contributor's profile.

**Response:**
```json
{
  "id": "string",
  "basicInfo": {
    "email": "string",
    "name": "string"
  },
  "walletAddress": "string",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### Update Contributor Profile
```http
PUT /api/contributor/update
```

Updates the current contributor's profile.

**Request Body:**
```json
{
  "basicInfo": {
    "name": "string"
  }
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "contributor": {
    "_id": "string",
    "basicInfo": {
      "email": "string",
      "name": "string"
    },
    "walletAddress": "string",
    "updatedAt": "ISO date string"
  }
}
```

### Delete Contributor
```http
DELETE /api/contributor/delete
```

Deletes the current contributor's account.

**Response:**
```json
{
  "message": "Contributor deleted successfully"
}
```

## Sponsor Endpoints

### Register Sponsor
```http
POST /api/sponsor/register
```

Registers a new sponsor in the system.

**Request Body:**
```json
{
  "profile": {
    "name": "string",
    "description": "string",
    "website": "string (URL)",
    "logo": "string (URL)",
    "contactEmail": "string",
    "walletAddress": "string",
    "categories": ["string"],
    "x": "string (URL)",
    "discord": "string (URL)",
    "telegram": "string (URL)"
  }
}
```

**Response:**
```json
{
  "message": "Sponsor registered successfully",
  "sponsor": {
    "_id": "string",
    "profile": {
      "name": "string",
      "description": "string",
      "website": "string",
      "logo": "string",
      "contactEmail": "string",
      "walletAddress": "string",
      "categories": ["string"],
      "x": "string",
      "discord": "string",
      "telegram": "string"
    },
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Login Sponsor
```http
POST /api/sponsor/login
```

Logs in a sponsor.

**Request Body:**
```json
{
  "wallet": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "sponsor": {
    "_id": "string",
    "profile": {
      "name": "string",
      "description": "string",
      "website": "string",
      "logo": "string",
      "contactEmail": "string",
      "walletAddress": "string",
      "categories": ["string"],
      "x": "string",
      "discord": "string",
      "telegram": "string"
    }
  }
}
```

### Get Sponsor Profile
```http
GET /api/sponsor/profile
```

Retrieves the current sponsor's profile.

**Response:**
```json
{
  "id": "string",
  "profile": {
    "name": "string",
    "description": "string",
    "website": "string",
    "logo": "string",
    "contactEmail": "string",
    "walletAddress": "string",
    "categories": ["string"],
    "x": "string",
    "discord": "string",
    "telegram": "string"
  },
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### Update Sponsor Profile
```http
PUT /api/sponsor/update
```

Updates the current sponsor's profile.

**Request Body:**
```json
{
  "profile": {
    "name": "string",
    "description": "string",
    "website": "string",
    "logo": "string",
    "contactEmail": "string",
    "categories": ["string"],
    "x": "string",
    "discord": "string",
    "telegram": "string"
  }
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "sponsor": {
    "_id": "string",
    "profile": {
      "name": "string",
      "description": "string",
      "website": "string",
      "logo": "string",
      "contactEmail": "string",
      "walletAddress": "string",
      "categories": ["string"],
      "x": "string",
      "discord": "string",
      "telegram": "string"
    },
    "updatedAt": "ISO date string"
  }
}
```

### Delete Sponsor
```http
DELETE /api/sponsor/delete
```

Deletes the current sponsor's account.

**Response:**
```json
{
  "message": "Sponsor deleted successfully"
}
```

## Skill Endpoints

### Create Skill
```http
POST /api/skill/create
```

Creates a new skill in the system.

**Request Body:**
```json
{
  "name": "string"
}
```

**Response:**
```json
{
  "message": "Skill created successfully",
  "skill": {
    "_id": "string",
    "name": "string",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Get All Skills
```http
GET /api/skill/all
```

Retrieves all skills from the system.

**Response:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
]
```

### Update Skill
```http
PUT /api/skill
```

Updates an existing skill.

**Request Body:**
```json
{
  "id": "string",
  "updated": {
    "name": "string"
  }
}
```

**Response:**
```json
{
  "message": "Skill updated successfully",
  "skill": {
    "_id": "string",
    "name": "string",
    "updatedAt": "ISO date string"
  }
}
```

### Delete Skill
```http
DELETE /api/skill
```

Deletes a skill from the system.

**Request Body:**
```json
{
  "id": "string"
}
```

**Response:**
```json
{
  "message": "Skill deleted successfully"
}
```

## Authentication
All endpoints require authentication using a session token cookie. The token is obtained through the login process and is automatically handled by the client.

## Rate Limiting
Login endpoints are rate-limited to 5 requests per 15 minutes to prevent brute force attacks.

## Error Responses
All endpoints may return the following error responses:

```json
{
  "message": "string",
  "status": "fail"
}
```

Common error messages:
- "Invalid wallet address format": The provided wallet address is not in the correct format
- "Missing required fields": One or more required fields are missing in the request
- "User already exists": The email or wallet address is already registered
- "Invalid credentials": The provided login credentials are incorrect
- "Not authorized": The user does not have permission to perform the action

Common status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error 