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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 