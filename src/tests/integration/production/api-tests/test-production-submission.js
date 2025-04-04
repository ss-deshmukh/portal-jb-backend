const axios = require('axios');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Configure axios client
const axiosClient = axios.create({
  baseURL: 'https://portal-jb-backend-production.up.railway.app/api',
  timeout: 60000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Generate JWT token for testing
const generateAuthToken = (user) => {
  const AUTH_SECRET = process.env.AUTH_SECRET;
  if (!AUTH_SECRET) {
    throw new Error('AUTH_SECRET environment variable is required');
  }
  return jwt.sign(user, AUTH_SECRET, { expiresIn: '1h' });
};

// Helper to create a mock Auth.js session cookie
const createMockSessionCookie = (userData) => {
  const session = {
    user: {
      id: userData.id || 'test-user-id',
      role: userData.role || 'user',
      permissions: userData.permissions || []
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
  };

  const AUTH_SECRET = process.env.AUTH_SECRET;
  if (!AUTH_SECRET) {
    throw new Error('AUTH_SECRET environment variable is required');
  }

  return jwt.sign(session, AUTH_SECRET);
};

// Sample data
const sampleSponsor = {
  profile: {
    name: 'Test Sponsor',
    description: 'Test sponsor for submission testing',
    website: 'https://example.com',
    logo: 'https://example.com/sponsor-logo.png',
    contactEmail: 'test@example.com',
    walletAddress: '0x1111111111111111111111111111111111111111',
    categories: ['development', 'design'],
    x: 'https://twitter.com/test',
    discord: 'https://discord.gg/test',
    telegram: 'https://t.me/test'
  }
};

const sampleTask = {
  title: "Test Task for Submission",
  description: "Test task for submission testing",
  category: ["development"],
  skills: ["javascript", "nodejs"],
  requirements: ["Requirement 1", "Requirement 2"],
  deliverables: ["Deliverable 1", "Deliverable 2"],
  reward: 1000,
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  priority: "medium",
  logo: "https://example.com/task-logo.png",
  sponsorId: sampleSponsor.profile.walletAddress,
  postedTime: new Date().toISOString(),
  status: "open",
  submissions: []
};

const sampleSubmission = {
  submission: {
    taskId: '', // Will be set after task creation
    walletAddress: '0x1111111111111111111111111111111111111111',
    submissionLinks: ["https://github.com/test/repo", "https://example.com/demo"],
    submissionTime: new Date().toISOString(),
    status: 'pending',
    isAccepted: false
  }
};

const sampleSubmission2 = {
  taskId: '', // Will be set after task creation
  walletAddress: '0x2222222222222222222222222222222222222222', // Different wallet address
  submissionTime: new Date().toISOString(),
  status: 'pending',
  isAccepted: false,
  submissions: ['https://github.com/test/repo2', 'https://example.com/demo2']
};

// Helper function to verify task submissions
async function verifyTaskSubmissions(taskId, expectedSubmissionIds) {
  logger.info('Verifying task submissions...', { taskId, expectedSubmissionIds });
  const taskResponse = await axiosClient.post('/task/fetch', {
    ids: [taskId]
  });
  const task = taskResponse.data.tasks[0];
  
  // Check if all expected submission IDs are present
  const missingIds = expectedSubmissionIds.filter(id => !task.submissions.includes(id));
  if (missingIds.length > 0) {
    throw new Error(`Missing submission IDs in task: ${missingIds.join(', ')}`);
  }

  // Check if there are any unexpected submission IDs
  const unexpectedIds = task.submissions.filter(id => !expectedSubmissionIds.includes(id));
  if (unexpectedIds.length > 0) {
    throw new Error(`Unexpected submission IDs in task: ${unexpectedIds.join(', ')}`);
  }

  logger.info('Task submissions verified successfully', {
    taskId,
    currentSubmissions: task.submissions,
    expectedSubmissions: expectedSubmissionIds
  });
}

// Helper function to verify contributor taskIds
async function verifyContributorTaskIds(walletAddress, expectedTaskIds) {
  logger.info('Verifying contributor taskIds...', { walletAddress, expectedTaskIds });
  
  // Instead of directly accessing contributor data, we'll verify through task submissions
  const submissionsResponse = await axiosClient.get('/submission', {
    params: { walletAddress }
  });
  const submissions = submissionsResponse.data.submissions;
  
  // Get all unique taskIds from submissions
  const actualTaskIds = [...new Set(submissions.map(sub => sub.taskId))];
  
  // Check if all expected task IDs are present
  const missingIds = expectedTaskIds.filter(id => !actualTaskIds.includes(id));
  if (missingIds.length > 0) {
    throw new Error(`Missing task IDs in contributor submissions: ${missingIds.join(', ')}`);
  }

  logger.info('Contributor taskIds verified successfully', {
    walletAddress,
    expectedTaskIds,
    actualTaskIds
  });
}

async function runTests() {
  try {
    // Health Check
    logger.info('Running Health Check...');
    const healthResponse = await axiosClient.get('/health');
    logger.info('Health Check Response:', healthResponse.data);

    // Register Sponsor
    logger.info('Running Register Sponsor Test...');
    try {
      await axiosClient.post('/sponsor/register', sampleSponsor);
      logger.info('Sponsor registered successfully');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message === 'Sponsor already exists') {
        logger.info('Sponsor already exists, proceeding with login');
      } else {
        throw error;
      }
    }

    // Login with the sponsor
    logger.info('Running Login Test...');
    const loginResponse = await axiosClient.post('/sponsor/login', {
      wallet: sampleSponsor.profile.walletAddress
    });
    logger.info('Login Response:', {
      data: loginResponse.data,
      headers: loginResponse.headers,
      status: loginResponse.status
    });

    // Generate auth token for the sponsor
    const sponsorToken = generateAuthToken({
      id: sampleSponsor.profile.walletAddress,
      role: 'sponsor',
      permissions: ['read:profile', 'update:profile', 'delete:profile', 'create:task', 'update:task', 'delete:task', 'read:tasks', 'read:submissions', 'review:submission', 'grade:submission']
    });

    // Set auth header for subsequent requests
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${sponsorToken}`;

    // Create Task
    logger.info('Running Create Task Test...');
    logger.info('Task payload:', { task: sampleTask });
    const createTaskResponse = await axiosClient.post('/task/create', { task: sampleTask });
    logger.info('Create Task Response:', {
      data: createTaskResponse.data,
      headers: createTaskResponse.headers,
      status: createTaskResponse.status
    });
    
    if (!createTaskResponse.data.task || !createTaskResponse.data.task.id) {
      throw new Error('Task creation failed - no task ID returned');
    }
    
    const taskId = createTaskResponse.data.task.id;
    logger.info('Set submission taskId to:', taskId);

    // Set taskId in submission payload
    sampleSubmission.submission.taskId = taskId;

    // Verify task submissions
    await verifyTaskSubmissions(taskId, []);

    // Verify contributor taskIds
    await verifyContributorTaskIds(sampleSubmission.submission.walletAddress, []);
    await verifyContributorTaskIds(sampleSubmission2.walletAddress, []);

    // Create First Submission
    logger.info('Running Create First Submission Test...');

    // Generate contributor token
    const contributorToken = generateAuthToken({
      id: sampleSubmission.submission.walletAddress,
      role: 'contributor',
      permissions: ['create:submission', 'read:submission', 'update:submission', 'delete:submission']
    });

    // Set contributor token in axios client
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${contributorToken}`;

    logger.info('Submission payload:', sampleSubmission);

    const response = await axiosClient.post('/submission', sampleSubmission);
    logger.info('Create First Submission Response:', response.data);
    const firstSubmissionId = response.data.submission.id;

    // Switch back to sponsor token for verification
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${sponsorToken}`;

    // Verify task submissions and contributor taskIds after first submission
    await verifyTaskSubmissions(taskId, [firstSubmissionId]);
    await verifyContributorTaskIds(sampleSubmission.submission.walletAddress, [taskId]);
    await verifyContributorTaskIds(sampleSubmission2.walletAddress, []);

    // Create Second Submission
    logger.info('Running Create Second Submission Test...');

    // Generate contributor token for second submission
    const contributorToken2 = generateAuthToken({
      id: sampleSubmission2.walletAddress,
      role: 'contributor',
      permissions: ['create:submission', 'read:submission', 'update:submission', 'delete:submission']
    });

    // Set contributor token in axios client
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${contributorToken2}`;

    const createSecondSubmissionResponse = await axiosClient.post('/submission', {
      submission: {
        taskId: taskId,
        walletAddress: sampleSubmission2.walletAddress,
        submissionLinks: sampleSubmission2.submissions,
        submissionTime: sampleSubmission2.submissionTime,
        status: sampleSubmission2.status,
        isAccepted: sampleSubmission2.isAccepted
      }
    });
    logger.info('Create Second Submission Response:', createSecondSubmissionResponse.data);
    const secondSubmissionId = createSecondSubmissionResponse.data.submission.id;

    // Switch back to sponsor token for verification
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${sponsorToken}`;

    // Verify task submissions and contributor taskIds after second submission
    await verifyTaskSubmissions(taskId, [firstSubmissionId, secondSubmissionId]);
    await verifyContributorTaskIds(sampleSubmission.submission.walletAddress, [taskId]);
    await verifyContributorTaskIds(sampleSubmission2.walletAddress, [taskId]);

    // Get All Submissions
    logger.info('Running Get All Submissions Test...');
    const getAllSubmissionsResponse = await axiosClient.get('/submission', {
      params: { taskId: sampleSubmission.submission.taskId }
    });
    logger.info('Get All Submissions Response:', getAllSubmissionsResponse.data);

    // Switch to contributor token for deletion
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${contributorToken}`;

    // Delete first submission
    logger.info('Running Delete First Submission Test...');
    try {
      const deleteResponse = await axiosClient.delete('/submission', {
        data: { submissionId: firstSubmissionId }
      });
      logger.info('Delete First Submission Response:', {
        status: deleteResponse.status,
        data: deleteResponse.data
      });
    } catch (error) {
      logger.error('Test execution failed:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      throw error;
    }

    // Switch back to sponsor token for verification
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${sponsorToken}`;

    // Verify task submissions and contributor taskIds after first submission deletion
    await verifyTaskSubmissions(taskId, [secondSubmissionId]);
    await verifyContributorTaskIds(sampleSubmission.submission.walletAddress, []);
    await verifyContributorTaskIds(sampleSubmission2.walletAddress, [taskId]);

    // Switch to second contributor token for deletion
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${contributorToken2}`;

    // Delete Second Submission
    logger.info('Running Delete Second Submission Test...');
    const deleteSecondSubmissionResponse = await axiosClient.delete('/submission', {
      data: { submissionId: secondSubmissionId }
    });
    logger.info('Delete Second Submission Response:', deleteSecondSubmissionResponse.data);

    // Switch back to sponsor token for verification
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${sponsorToken}`;

    // Verify task submissions and contributor taskIds after second submission deletion
    await verifyTaskSubmissions(taskId, []);
    await verifyContributorTaskIds(sampleSubmission.submission.walletAddress, []);
    await verifyContributorTaskIds(sampleSubmission2.walletAddress, []);

    // Delete Task
    logger.info('Running Delete Task Test...');
    try {
      const deleteTaskResponse = await axiosClient.delete(`/task/${taskId}`);
      logger.info('Delete Task Response:', {
        status: deleteTaskResponse.status,
        data: deleteTaskResponse.data
      });
    } catch (error) {
      logger.error('Test execution failed:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      throw error;
    }

    logger.info('All tests completed successfully');
  } catch (error) {
    logger.error('Test execution failed:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  logger.error('Test suite failed:', error);
  process.exit(1);
}); 