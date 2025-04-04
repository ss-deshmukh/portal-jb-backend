# API Documentation

## Task Table

### Create Task
```http
POST /api/task/create
```

Creates a new task in the system. Requires sponsor authentication.

**Request Body:**
```json
{
  "task": {
    "title": "string",
    "sponsorId": "string",
    "logo": "string",
    "description": "string",
    "requirements": ["string"],
    "deliverables": ["string"],
    "deadline": "ISO date string",
    "reward": number,
    "postedTime": "ISO date string",
    "status": "open" | "completed" | "cancelled",
    "priority": "low" | "medium" | "high" | "urgent",
    "category": ["string"],
    "skills": ["string"]
  }
}
```

**Response:**
```json
{
  "message": "Task created successfully",
  "task": {
    "id": "string",
    "title": "string",
    "sponsorId": "string",
    "logo": "string",
    "description": "string",
    "requirements": ["string"],
    "deliverables": ["string"],
    "deadline": "ISO date string",
    "reward": number,
    "postedTime": "ISO date string",
    "status": "string",
    "priority": "string",
    "category": ["string"],
    "skills": ["string"],
    "submissions": [],
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Fetch Tasks
```http
POST /api/task/fetch
```

Retrieves tasks by IDs. All authenticated users can access this endpoint.

**Request Body:**
```json
{
  "ids": ["string"] // Use ["*"] to fetch all tasks
}
```

**Response:**
```json
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "sponsorId": "string",
      "logo": "string",
      "description": "string",
      "requirements": ["string"],
      "deliverables": ["string"],
      "deadline": "ISO date string",
      "reward": number,
      "postedTime": "ISO date string",
      "status": "string",
      "priority": "string",
      "category": ["string"],
      "skills": ["string"],
      "submissions": ["string"],
      "createdAt": "ISO date string",
      "updatedAt": "ISO date string"
    }
  ]
}
```

### Get Task By ID
```http
GET /api/task/:id
```

Retrieves a task by its ID. All authenticated users can access this endpoint.

**Response:**
```json
{
  "message": "Task retrieved successfully",
  "task": {
    "id": "string",
    "title": "string",
    "sponsorId": "string",
    "logo": "string",
    "description": "string",
    "requirements": ["string"],
    "deliverables": ["string"],
    "deadline": "ISO date string",
    "reward": number,
    "postedTime": "ISO date string",
    "status": "string",
    "priority": "string",
    "category": ["string"],
    "skills": ["string"],
    "submissions": ["string"],
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Update Task
```http
PUT /api/task/update
```

Updates an existing task. Requires sponsor authentication.

**Request Body:**
```json
{
  "task": {
    "id": "string",
    "title": "string",
    "description": "string",
    "requirements": ["string"],
    "deliverables": ["string"],
    "deadline": "ISO date string",
    "reward": number,
    "status": "open" | "completed" | "cancelled",
    "priority": "low" | "medium" | "high" | "urgent",
    "category": ["string"],
    "skills": ["string"]
  }
}
```

**Response:**
```json
{
  "message": "Task updated successfully",
  "task": {
    "id": "string",
    "title": "string",
    "sponsorId": "string",
    "logo": "string",
    "description": "string",
    "requirements": ["string"],
    "deliverables": ["string"],
    "deadline": "ISO date string",
    "reward": number,
    "postedTime": "ISO date string",
    "status": "string",
    "priority": "string",
    "category": ["string"],
    "skills": ["string"],
    "submissions": ["string"],
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Delete Task
```http
DELETE /api/task/:id
```

Deletes a task. Requires sponsor authentication. The task ID is provided as a route parameter.
Tasks with existing submissions cannot be deleted.

**Response (Success):**
```json
{
  "message": "Task deleted successfully",
  "details": {
    "taskId": "string"
  }
}
```

**Response (Task has submissions):**
```json
{
  "message": "Cannot delete task with existing submissions",
  "details": {
    "taskId": "string",
    "submissionCount": number
  }
}
```

**Error Responses:**
- `400` - Task has existing submissions
- `403` - Unauthorized (task belongs to another sponsor)
- `404` - Task not found

## Submission Table

### Create Submission
```http
POST /api/submission
```

Creates a new submission for a task. Requires contributor authentication.

**Request Body:**
```json
{
  "submission": {
    "taskId": "string",
    "walletAddress": "string",
    "submissionTime": "ISO date string",
    "status": "pending" | "accepted" | "rejected",
    "isAccepted": boolean,
    "feedback": "string",
    "rating": number,
    "reviewTime": "ISO date string",
    "reviewerWalletAddress": "string"
  }
}
```

**Response:**
```json
{
  "message": "Submission created successfully",
  "submission": {
    "id": "string",
    "taskId": "string",
    "walletAddress": "string",
    "submissionTime": "ISO date string",
    "status": "string",
    "isAccepted": boolean,
    "feedback": "string",
    "rating": number,
    "reviewTime": "ISO date string",
    "reviewerWalletAddress": "string",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Delete Submission
```http
DELETE /api/submission
```

Deletes a submission. Requires contributor authentication.

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

### Fetch Submissions
```http
GET /api/submission
```

Retrieves submissions by task ID or wallet address. All authenticated users can access this endpoint.

**Query Parameters:**
- `taskId`: Filter submissions by task ID
- `walletAddress`: Filter submissions by contributor's wallet address

**Response:**
```json
{
  "message": "Submissions retrieved successfully",
  "submissions": [
    {
      "id": "string",
      "taskId": "string",
      "walletAddress": "string",
      "submissionTime": "ISO date string",
      "status": "string",
      "isAccepted": boolean,
      "feedback": "string",
      "rating": number,
      "reviewTime": "ISO date string",
      "reviewerWalletAddress": "string",
      "createdAt": "ISO date string",
      "updatedAt": "ISO date string"
    }
  ]
}
```

## Contributor Table

### Register Contributor
```http
POST /api/contributor/register
```

Registers a new contributor in the system.

**Request Body:**
```json
{
  "profile": {
    "basicInfo": {
      "email": "string",
      "displayName": "string",
      "bio": "string",
      "profileImage": "string",
      "walletAddress": "string",
      "website": "string",
      "x": "string",
      "discord": "string",
      "telegram": "string"
    },
    "contactPreferences": {
      "emailNotifications": boolean,
      "newsletterSubscription": {
        "subscribed": boolean,
        "interests": ["string"]
      },
      "canBeContactedBySponsors": boolean
    },
    "preferences": {
      "interfaceSettings": {
        "theme": "string",
        "language": "string"
      },
      "opportunityPreferences": {
        "preferredCategories": ["string"],
        "minimumReward": number,
        "preferredDifficulty": "string",
        "timeCommitment": "string"
      },
      "privacySettings": {
        "profileVisibility": "string",
        "submissionVisibility": "string",
        "skillsVisibility": "string",
        "reputationVisibility": "string",
        "contactabilityBySponsors": "string"
      }
    },
    "skills": {
      "primarySkills": [{
        "name": "string",
        "level": "string"
      }],
      "secondarySkills": [{
        "name": "string",
        "level": "string"
      }],
      "skillTrajectory": {
        "improvementRate": number,
        "consistencyScore": number
      }
    }
  }
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
      "displayName": "string",
      "bio": "string",
      "profileImage": "string",
      "walletAddress": "string",
      "website": "string",
      "x": "string",
      "discord": "string",
      "telegram": "string"
    },
    "contactPreferences": {
      "emailNotifications": boolean,
      "newsletterSubscription": {
        "subscribed": boolean,
        "interests": ["string"]
      },
      "canBeContactedBySponsors": boolean
    },
    "preferences": {
      "interfaceSettings": {
        "theme": "string",
        "language": "string"
      },
      "opportunityPreferences": {
        "preferredCategories": ["string"],
        "minimumReward": number,
        "preferredDifficulty": "string",
        "timeCommitment": "string"
      },
      "privacySettings": {
        "profileVisibility": "string",
        "submissionVisibility": "string",
        "skillsVisibility": "string",
        "reputationVisibility": "string",
        "contactabilityBySponsors": "string"
      }
    },
    "skills": {
      "primarySkills": [{
        "name": "string",
        "level": "string"
      }],
      "secondarySkills": [{
        "name": "string",
        "level": "string"
      }],
      "skillTrajectory": {
        "improvementRate": number,
        "consistencyScore": number
      }
    },
    "reputation": {
      "overallScore": number,
      "metrics": {
        "taskCompletionRate": number,
        "qualityScore": number,
        "consistencyScore": number,
        "communityContributions": number
      },
      "badges": [{
        "name": "string",
        "description": "string",
        "category": "string",
        "difficulty": "string"
      }]
    },
    "contributionStats": {
      "totalTasksCompleted": number,
      "totalRewardsEarned": number,
      "averageQualityRating": number
    },
    "taskIds": ["string"],
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Login Contributor
```http
POST /api/contributor/login
```

Validates contributor credentials and returns user data. Token generation is handled by NextAuth on the frontend.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "contributor": {
    "id": "string",
    "displayName": "string",
    "email": "string",
    "role": "contributor"
  }
}
```

### Get Contributor Profile
```http
GET /api/contributor/profile
```

Retrieves the current contributor's profile. Requires contributor authentication.

**Response:**
```json
{
  "message": "Profile retrieved successfully",
  "contributor": {
    "_id": "string",
    "basicInfo": {
      "email": "string",
      "displayName": "string",
      "bio": "string",
      "profileImage": "string",
      "walletAddress": "string",
      "website": "string",
      "x": "string",
      "discord": "string",
      "telegram": "string"
    },
    "contactPreferences": {
      "emailNotifications": boolean,
      "newsletterSubscription": {
        "subscribed": boolean,
        "interests": ["string"]
      },
      "canBeContactedBySponsors": boolean
    },
    "preferences": {
      "interfaceSettings": {
        "theme": "string",
        "language": "string"
      },
      "opportunityPreferences": {
        "preferredCategories": ["string"],
        "minimumReward": number,
        "preferredDifficulty": "string",
        "timeCommitment": "string"
      },
      "privacySettings": {
        "profileVisibility": "string",
        "submissionVisibility": "string",
        "skillsVisibility": "string",
        "reputationVisibility": "string",
        "contactabilityBySponsors": "string"
      }
    },
    "skills": {
      "primarySkills": [{
        "name": "string",
        "level": "string"
      }],
      "secondarySkills": [{
        "name": "string",
        "level": "string"
      }],
      "skillTrajectory": {
        "improvementRate": number,
        "consistencyScore": number
      }
    },
    "reputation": {
      "overallScore": number,
      "metrics": {
        "taskCompletionRate": number,
        "qualityScore": number,
        "consistencyScore": number,
        "communityContributions": number
      },
      "badges": [{
        "name": "string",
        "description": "string",
        "category": "string",
        "difficulty": "string"
      }]
    },
    "contributionStats": {
      "totalTasksCompleted": number,
      "totalRewardsEarned": number,
      "averageQualityRating": number
    },
    "taskIds": ["string"],
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Update Contributor Profile
```http
PUT /api/contributor/profile
```

Updates the current contributor's profile. Requires contributor authentication.

**Request Body:**
```json
{
  "email": "string",
  "updated": {
    "basicInfo": {
      "displayName": "string",
      "bio": "string",
      "profileImage": "string",
      "walletAddress": "string",
      "website": "string",
      "x": "string",
      "discord": "string",
      "telegram": "string"
    },
    "contactPreferences": {
      "emailNotifications": boolean,
      "newsletterSubscription": {
        "subscribed": boolean,
        "interests": ["string"]
      },
      "canBeContactedBySponsors": boolean
    },
    "preferences": {
      "interfaceSettings": {
        "theme": "string",
        "language": "string"
      },
      "opportunityPreferences": {
        "preferredCategories": ["string"],
        "minimumReward": number,
        "preferredDifficulty": "string",
        "timeCommitment": "string"
      },
      "privacySettings": {
        "profileVisibility": "string",
        "submissionVisibility": "string",
        "skillsVisibility": "string",
        "reputationVisibility": "string",
        "contactabilityBySponsors": "string"
      }
    },
    "skills": {
      "primarySkills": [{
        "name": "string",
        "level": "string"
      }],
      "secondarySkills": [{
        "name": "string",
        "level": "string"
      }],
      "skillTrajectory": {
        "improvementRate": number,
        "consistencyScore": number
      }
    }
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
      "displayName": "string",
      "bio": "string",
      "profileImage": "string",
      "walletAddress": "string",
      "website": "string",
      "x": "string",
      "discord": "string",
      "telegram": "string"
    },
    "contactPreferences": {
      "emailNotifications": boolean,
      "newsletterSubscription": {
        "subscribed": boolean,
        "interests": ["string"]
      },
      "canBeContactedBySponsors": boolean
    },
    "preferences": {
      "interfaceSettings": {
        "theme": "string",
        "language": "string"
      },
      "opportunityPreferences": {
        "preferredCategories": ["string"],
        "minimumReward": number,
        "preferredDifficulty": "string",
        "timeCommitment": "string"
      },
      "privacySettings": {
        "profileVisibility": "string",
        "submissionVisibility": "string",
        "skillsVisibility": "string",
        "reputationVisibility": "string",
        "contactabilityBySponsors": "string"
      }
    },
    "skills": {
      "primarySkills": [{
        "name": "string",
        "level": "string"
      }],
      "secondarySkills": [{
        "name": "string",
        "level": "string"
      }],
      "skillTrajectory": {
        "improvementRate": number,
        "consistencyScore": number
      }
    },
    "reputation": {
      "overallScore": number,
      "metrics": {
        "taskCompletionRate": number,
        "qualityScore": number,
        "consistencyScore": number,
        "communityContributions": number
      },
      "badges": [{
        "name": "string",
        "description": "string",
        "category": "string",
        "difficulty": "string"
      }]
    },
    "contributionStats": {
      "totalTasksCompleted": number,
      "totalRewardsEarned": number,
      "averageQualityRating": number
    },
    "taskIds": ["string"],
    "updatedAt": "ISO date string"
  }
}
```

### Delete Contributor Profile
```http
DELETE /api/contributor/profile
```

Deletes the current contributor's account. Requires contributor authentication.

**Response:**
```json
{
  "message": "Contributor deleted successfully"
}
```

## Sponsor Table

### Register Sponsor
```http
POST /api/sponsor/register
```

Registers a new sponsor in the system.

**Request Body:**
```json
{
  "profile": {
    "walletAddress": "string",
    "name": "string",
    "logo": "string",
    "description": "string",
    "website": "string",
    "x": "string",
    "discord": "string",
    "telegram": "string",
    "contactEmail": "string",
    "categories": ["string"]
  }
}
```

**Response:**
```json
{
  "message": "Sponsor registered successfully",
  "sponsor": {
    "_id": "string",
    "walletAddress": "string",
    "verified": boolean,
    "name": "string",
    "logo": "string",
    "description": "string",
    "website": "string",
    "x": "string",
    "discord": "string",
    "telegram": "string",
    "contactEmail": "string",
    "categories": ["string"],
    "taskIds": ["string"],
    "registeredAt": "ISO date string",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Login Sponsor
```http
POST /api/sponsor/login
```

Validates sponsor credentials and returns user data. Token generation is handled by NextAuth on the frontend.

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
    "id": "string",
    "name": "string",
    "walletAddress": "string",
    "role": "sponsor"
  }
}
```

### Get Sponsor Profile
```http
GET /api/sponsor
```

Retrieves the current sponsor's profile. Requires sponsor authentication.

**Response:**
```json
{
  "message": "Profile retrieved successfully",
  "sponsor": {
    "_id": "string",
    "walletAddress": "string",
    "verified": boolean,
    "name": "string",
    "logo": "string",
    "description": "string",
    "website": "string",
    "x": "string",
    "discord": "string",
    "telegram": "string",
    "contactEmail": "string",
    "categories": ["string"],
    "taskIds": ["string"],
    "registeredAt": "ISO date string",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Update Sponsor Profile
```http
PUT /api/sponsor
```

Updates the current sponsor's profile. Requires sponsor authentication.

**Request Body:**
```json
{
  "updated": {
    "name": "string",
    "logo": "string",
    "description": "string",
    "website": "string",
    "x": "string",
    "discord": "string",
    "telegram": "string",
    "contactEmail": "string",
    "categories": ["string"]
  }
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "sponsor": {
    "_id": "string",
    "walletAddress": "string",
    "verified": boolean,
    "name": "string",
    "logo": "string",
    "description": "string",
    "website": "string",
    "x": "string",
    "discord": "string",
    "telegram": "string",
    "contactEmail": "string",
    "categories": ["string"],
    "taskIds": ["string"],
    "registeredAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Delete Sponsor Profile
```http
DELETE /api/sponsor
```

Deletes the current sponsor's account. Requires sponsor authentication.

**Response:**
```json
{
  "message": "Sponsor deleted successfully"
}
```

## Skill Table

### Create Skill
```http
POST /api/skill/create
```

Creates a new skill in the system. Requires admin authentication.

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
    "id": "string",
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

Retrieves all skills from the system. Public endpoint.

**Response:**
```json
{
  "message": "Skills retrieved successfully",
  "skills": [
    {
      "_id": "string",
      "id": "string",
      "name": "string",
      "createdAt": "ISO date string",
      "updatedAt": "ISO date string"
    }
  ]
}
```

### Get Skill by ID
```http
GET /api/skill/:id
```

Retrieves a specific skill by ID. Public endpoint.

**Response:**
```json
{
  "message": "Skill retrieved successfully",
  "skill": {
    "_id": "string",
    "id": "string",
    "name": "string",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Update Skill
```http
PUT /api/skill/:id
```

Updates an existing skill. Requires admin authentication.

**Request Body:**
```json
{
  "name": "string"
}
```

**Response:**
```json
{
  "message": "Skill updated successfully",
  "skill": {
    "_id": "string",
    "id": "string",
    "name": "string",
    "updatedAt": "ISO date string"
  }
}
```

### Delete Skill
```http
DELETE /api/skill/:id
```

Deletes a skill from the system. Requires admin authentication.

**Response:**
```json
{
  "message": "Skill deleted successfully"
}
```

# Authentication

This API uses JWT-based authentication in conjunction with NextAuth. The frontend handles authentication and token generation with NextAuth, while the backend verifies the tokens.

## Permission System

The API implements permission-based access control. Each endpoint requires specific permissions to access. The permissions are provided in the JWT token and verified by the backend.

### Permission Types

#### Contributor Permissions
- `read:profile` - View own profile
- `update:profile` - Update own profile
- `delete:profile` - Delete own profile
- `read:tasks` - View available tasks
- `create:submission` - Submit work for a task
- `update:submission` - Update own submissions
- `delete:submission` - Delete own submissions
- `read:submissions` - View submissions

#### Sponsor Permissions
- `read:profile` - View own profile
- `update:profile` - Update own profile
- `delete:profile` - Delete own profile
- `create:task` - Create new tasks
- `update:task` - Update own tasks
- `delete:task` - Delete own tasks
- `read:tasks` - View tasks
- `read:submissions` - View submissions
- `review:submission` - Review submissions for own tasks

#### Admin Permissions
- `admin:users` - Manage all users
- `admin:tasks` - Manage all tasks
- `admin:skills` - Manage skills

### JWT Token Structure

The JWT token should include:

```json
{
  "id": "user_id",
  "role": "contributor|sponsor|admin",
  "permissions": ["permission1", "permission2", ...]
}
```

## Contributor Registration
```http
POST /api/contributor/register
```

Registers a new contributor in the system.

**Request Body:**
```json
{
  "profile": {
    "basicInfo": {
      "email": "string",
      "displayName": "string",
      "bio": "string",
      "profileImage": "string",
      "walletAddress": "string",
      "website": "string",
      "x": "string",
      "discord": "string",
      "telegram": "string"
    }
  }
}
```

**Response:**
```json
{
  "message": "Contributor registered successfully",
  "contributor": {
    // contributor details
  }
}
```

## Contributor Login
```http
POST /api/contributor/login
```

Validates contributor credentials and returns user data. Token generation is handled by NextAuth on the frontend.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "contributor": {
    "id": "string",
    "displayName": "string",
    "email": "string",
    "role": "contributor"
  }
}
```

## Sponsor Registration
```http
POST /api/sponsor/register
```

Registers a new sponsor in the system.

**Request Body:**
```json
{
  "profile": {
    "walletAddress": "string",
    "name": "string",
    "logo": "string",
    "description": "string",
    "website": "string",
    "x": "string",
    "discord": "string",
    "telegram": "string",
    "contactEmail": "string",
    "categories": ["string"]
  }
}
```

**Response:**
```json
{
  "message": "Sponsor registered successfully",
  "sponsor": {
    // sponsor details
  }
}
```

## Sponsor Login
```http
POST /api/sponsor/login
```

Validates sponsor credentials and returns user data. Token generation is handled by NextAuth on the frontend.

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
    "id": "string",
    "name": "string",
    "walletAddress": "string",
    "role": "sponsor"
  }
}
```

## Authentication Header

For all protected endpoints, include the JWT token from NextAuth in the Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
``` 