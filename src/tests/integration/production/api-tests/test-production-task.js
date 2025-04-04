const axios = require('axios');
const winston = require('winston');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const chalk = require('chalk');

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });

// Create a test logger with custom format
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ level, message, ...metadata }) => {
      let msg = `${level}: ${message}`;
      if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
      }
      return msg;
    })
  ),
  transports: [new winston.transports.Console()]
});

// Production API configuration
const PROD_BASE_URL = 'https://portal-jb-backend-production.up.railway.app/api';
const prodClient = axios.create({
  baseURL: PROD_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for better error logging
prodClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      logger.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.response.config.url,
        method: error.response.config.method,
        headers: error.response.headers
      });
    } else if (error.request) {
      logger.error('No response received:', {
        method: error.request.method,
        url: error.request.url,
        headers: error.request.headers
      });
    } else {
      logger.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Generate JWT token for testing
const generateAuthToken = (user) => {
  const AUTH_SECRET = process.env.AUTH_SECRET || 'development_auth_secret';
  return jwt.sign(user, AUTH_SECRET, { expiresIn: '1h' });
};

// Sample sponsor data for registration
const sampleSponsor = {
  profile: {
    walletAddress: '0x' + '1'.repeat(40),
    name: 'Test Sponsor',
    logo: 'https://example.com/sponsor-logo.png',
    description: 'Test sponsor for task testing',
    website: 'https://example.com',
    x: 'https://twitter.com/test',
    discord: 'https://discord.gg/test',
    telegram: 'https://t.me/test',
    contactEmail: 'test@example.com',
    categories: ['development', 'design'],
    taskIds: []
  }
};

// Sample task data
const sampleTask = {
  title: 'Test Integration Task',
  sponsorId: sampleSponsor.profile.walletAddress,
  logo: 'https://example.com/task-logo.png',
  description: 'Test task for integration testing',
  requirements: ['Requirement 1', 'Requirement 2'],
  deliverables: ['Deliverable 1', 'Deliverable 2'],
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  reward: 1000,
  postedTime: new Date().toISOString(),
  status: 'open',
  priority: 'medium',
  category: ['development'],
  skills: ['javascript', 'nodejs'],
  submissions: []
};

// Sample submission data
const sampleSubmission = {
  id: 'test_submission_' + Date.now(),
  taskId: '', // Will be set when creating submission
  walletAddress: '0x' + '2'.repeat(40),
  submissionLinks: ['https://example.com/submission'],
  submissionTime: new Date().toISOString(),
  status: 'pending',
  isAccepted: false
};

async function runTest(name, testFn) {
  try {
    console.log(chalk.blue(`\nRunning ${name}...`));
    await testFn();
    console.log(chalk.green(`✓ ${name} passed`));
    return true;
  } catch (error) {
    console.log(chalk.red(`✗ ${name} failed: ${error.message}`));
    if (error.response?.data) {
      console.log(chalk.yellow('Error details:'), error.response.data);
    }
    return false;
  }
}

async function runTests() {
  console.log(chalk.cyan('\n=== Starting Task API Tests ===\n'));
  let allTestsPassed = true;

  // Test 1: Health Check
  allTestsPassed &= await runTest('Health Check', async () => {
    const healthResponse = await prodClient.get('/health');
    console.log(chalk.gray('Response:'), healthResponse.data);
  });

  // Test 2: Register Sponsor
  allTestsPassed &= await runTest('Register Sponsor', async () => {
    try {
      const registerResponse = await prodClient.post('/sponsor/register', sampleSponsor);
      console.log(chalk.gray('Response:'), registerResponse.data);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log(chalk.yellow('Sponsor already exists, proceeding with login'));
      } else {
        throw error;
      }
    }
  });

  // Login sponsor
  allTestsPassed &= await runTest('Sponsor Login', async () => {
    const loginResponse = await prodClient.post('/sponsor/login', {
      wallet: sampleSponsor.profile.walletAddress
    });
    console.log(chalk.gray('Response:'), loginResponse.data);
  });

  // Generate auth token for the sponsor
  const sponsorToken = generateAuthToken({
    id: sampleSponsor.profile.walletAddress,
    role: 'sponsor',
    permissions: ['read:profile', 'update:profile', 'delete:profile', 'create:task', 'update:task', 'delete:task', 'read:tasks', 'read:submissions', 'review:submission']
  });

  // Set auth header for subsequent requests
  prodClient.defaults.headers.common['Authorization'] = `Bearer ${sponsorToken}`;

  // Test 3: Create First Task (for deletion test)
  let firstTask;
  allTestsPassed &= await runTest('Create First Task', async () => {
    const createResponse = await prodClient.post('/task/create', {
      task: { ...sampleTask, title: 'First Test Task' }
    });
    firstTask = createResponse.data.task;
    console.log(chalk.gray('Response:'), createResponse.data);
  });

  // Test 4: Create Second Task (for submission test)
  let secondTask;
  allTestsPassed &= await runTest('Create Second Task', async () => {
    const createResponse = await prodClient.post('/task/create', {
      task: { ...sampleTask, title: 'Second Test Task' }
    });
    secondTask = createResponse.data.task;
    console.log(chalk.gray('Response:'), createResponse.data);
  });

  // Test 5: Create Submission for Second Task
  allTestsPassed &= await runTest('Create Submission', async () => {
    const submissionData = {
      ...sampleSubmission,
      taskId: secondTask.id
    };
    const createResponse = await prodClient.post('/submission/create', {
      submission: submissionData
    });
    console.log(chalk.gray('Response:'), createResponse.data);
  });

  // Test 6: Try to Delete Task with Submissions (Should Fail)
  allTestsPassed &= await runTest('Attempt to Delete Task with Submissions', async () => {
    try {
      await prodClient.delete(`/task/${secondTask.id}`);
      throw new Error('Task deletion should have failed');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Cannot delete task with existing submissions')) {
        console.log(chalk.gray('Expected error received:'), error.response.data);
        return true;
      }
      throw error;
    }
  });

  // Test 7: Delete First Task (Should Succeed)
  allTestsPassed &= await runTest('Delete First Task', async () => {
    const deleteResponse = await prodClient.delete(`/task/${firstTask.id}`);
    console.log(chalk.gray('Response:'), deleteResponse.data);
  });

  // Test 8: Verify Task IDs in Sponsor Profile
  allTestsPassed &= await runTest('Verify Task IDs in Sponsor Profile', async () => {
    const sponsorResponse = await prodClient.get('/sponsor/profile');
    const taskIds = sponsorResponse.data.sponsor.taskIds;
    
    // First task should be removed
    if (taskIds.includes(firstTask.id)) {
      throw new Error('First task ID still exists in sponsor profile');
    }
    
    // Second task should still exist
    if (!taskIds.includes(secondTask.id)) {
      throw new Error('Second task ID missing from sponsor profile');
    }
    
    console.log(chalk.gray('Sponsor task IDs:'), taskIds);
  });

  console.log(chalk.cyan('\n=== Test Summary ==='));
  if (allTestsPassed) {
    console.log(chalk.green('✓ All tests passed successfully!'));
  } else {
    console.log(chalk.red('✗ Some tests failed. Check the logs above for details.'));
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
}); 