# Portal JB Backend

A Node.js backend service for the Portal JB platform, handling contributor and sponsor interactions, task management, and submissions.

## Features

- Contributor and Sponsor Management
- Task Creation and Management
- Submission Handling
- Skill Management
- Authentication and Authorization
- Error Handling and Logging

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/portal-jb-backend.git
cd portal-jb-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

## Development

- Run tests: `npm test`
- Run API tests: `npm run test:api`
- Run with nodemon: `npm run dev`

## API Endpoints

### Contributor Routes
- POST `/api/contributor/register` - Register a new contributor
- POST `/api/contributor/login` - Login contributor
- DELETE `/api/contributor` - Delete contributor account

### Sponsor Routes
- POST `/api/sponsor/register` - Register a new sponsor
- POST `/api/sponsor/login` - Login sponsor
- DELETE `/api/sponsor` - Delete sponsor account

### Task Routes
- POST `/api/task/create` - Create a new task
- POST `/api/task/fetch` - Fetch tasks by IDs
- DELETE `/api/task` - Delete a task

### Submission Routes
- POST `/api/submission` - Create a new submission
- GET `/api/submission` - Fetch submissions by IDs
- DELETE `/api/submission` - Delete a submission

### Skill Routes
- POST `/api/skill/create` - Create a new skill
- PUT `/api/skill` - Update a skill
- DELETE `/api/skill` - Delete a skill

## Error Handling

The API uses a consistent error handling pattern:
```json
{
  "status": "fail|error",
  "message": "Error message",
  "stack": "Stack trace (development only)"
}
```

## Authentication

The Portal JB Backend uses JWT (JSON Web Token) based authentication with NextAuth:

1. **Authentication Flow**:
   - Authentication and token generation are handled by NextAuth on the frontend
   - The backend only verifies JWT tokens sent in requests
   - The frontend includes the JWT token in the `Authorization: Bearer <token>` header for authenticated requests

2. **Token Verification**:
   - JWTs are verified using the same AUTH_SECRET that NextAuth uses to sign them
   - The backend extracts user ID, role (contributor or sponsor), and permissions from the token
   - No session state is maintained on the backend

3. **Permission-Based Access Control**:
   - Routes are protected based on specific permissions rather than just roles
   - Each user role comes with a set of permissions:
     
     **Contributor Permissions**:
     - `read:profile` - View own profile
     - `update:profile` - Update own profile
     - `delete:profile` - Delete own profile
     - `read:tasks` - View available tasks
     - `create:submission` - Submit work for a task
     - `update:submission` - Update own submissions
     - `delete:submission` - Delete own submissions
     - `read:submissions` - View submissions
     
     **Sponsor Permissions**:
     - `read:profile` - View own profile
     - `update:profile` - Update own profile
     - `delete:profile` - Delete own profile
     - `create:task` - Create new tasks
     - `update:task` - Update own tasks
     - `delete:task` - Delete own tasks
     - `read:tasks` - View tasks
     - `read:submissions` - View submissions
     - `review:submission` - Review submissions for own tasks
     
     **Admin Permissions**:
     - `admin:users` - Manage all users
     - `admin:tasks` - Manage all tasks
     - `admin:skills` - Manage skills
   
4. **Required Environment Variables**:
   ```env
   AUTH_SECRET=same_secret_used_by_nextauth_for_token_signing
   ```

5. **Example Request with JWT**:
   ```javascript
   // Using token from NextAuth for authenticated requests
   fetch('/api/protected', {
     headers: { 'Authorization': `Bearer ${session.token}` }
   });
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 