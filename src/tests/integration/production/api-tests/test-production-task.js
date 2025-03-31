const axios = require('axios');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Configure axios client
const api = axios.create({
  baseURL: 'https://portal-jb-backend-production.up.railway.app/api',
  timeout: 60000,  // Increased to 60 seconds
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for logging
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ETIMEDOUT') {
      logger.error('Request timed out. Please check if the server is running and accessible.');
    } else if (error.code === 'ECONNREFUSED') {
      logger.error('Connection refused. The server might be down or not accepting connections.');
    } else {
      logger.error('API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout
        }
      });
    }
    return Promise.reject(error);
  }
);

// Sample sponsor data for registration
const sampleSponsor = {
  profile: {
    walletAddress: '0x1211111111111111111111111111111111111111',
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
  sponsorId: '0x1211111111111111111111111111111111111111',
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

async function createTask() {
  logger.info('Running Create Task Test...');
  try {
    const createResponse = await api.post('/task/create', { task: sampleTask });
    logger.info('Create Task Response:', createResponse.data);
    return createResponse.data.task.id;
  } catch (error) {
    logger.error('Create Task Error:', error.response?.data || error.message);
    throw error;
  }
}

async function verifySponsorUpdate(taskId) {
  logger.info('Verifying Sponsor Profile Update...');
  try {
    // Wait for database update
    logger.info('Waiting for database update...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get updated sponsor profile
    const sponsorResponse = await api.get('/sponsor', {
      headers: {
        Cookie: api.defaults.headers.common['Cookie']
      }
    });
    logger.info('Sponsor Profile After Task Creation:', sponsorResponse.data);

    // Verify task ID was added to sponsor's taskIds array
    const sponsor = sponsorResponse.data.sponsor;
    if (!sponsor.taskIds.includes(taskId)) {
      throw new Error(`Task ID ${taskId} was not added to sponsor's taskIds array: ${JSON.stringify(sponsor.taskIds)}`);
    }

    logger.info('Successfully verified task ID in sponsor profile');
  } catch (error) {
    logger.error('Sponsor Update Verification Error:', error.response?.data || error.message);
    throw error;
  }
}

async function runTests() {
  try {
    // Test 1: Health Check
    logger.info('Running Health Check...');
    const healthResponse = await api.get('/health');
    logger.info('Health Check Response:', healthResponse.data);

    // Test 2: Register Sponsor
    logger.info('Running Register Sponsor Test...');
    let sponsorAuthToken;
    try {
      const registerResponse = await api.post('/sponsor/register', sampleSponsor);
      logger.info('Register Sponsor Response:', registerResponse.data);

      // Login sponsor
      const loginResponse = await api.post('/sponsor/login', {
        wallet: sampleSponsor.profile.walletAddress
      });
      logger.info('Full Login Response:', {
        data: loginResponse.data,
        headers: loginResponse.headers,
        status: loginResponse.status
      });

      // Extract session token from Set-Cookie header
      const setCookieHeader = loginResponse.headers['set-cookie'];
      if (setCookieHeader) {
        const sessionTokenCookie = setCookieHeader.find(cookie => cookie.startsWith('next-auth.session-token='));
        if (sessionTokenCookie) {
          const sessionToken = sessionTokenCookie.split(';')[0];
          // Set the cookie for subsequent requests
          api.defaults.headers.common['Cookie'] = sessionToken;
          logger.info('Session token cookie set:', sessionToken);
        } else {
          logger.error('Session token cookie not found in Set-Cookie header');
        }
      } else {
        logger.error('Set-Cookie header not found in response');
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        logger.info('Sponsor already exists, proceeding with login');
        const loginResponse = await api.post('/sponsor/login', {
          wallet: sampleSponsor.profile.walletAddress
        });
        logger.info('Full Login Response:', {
          data: loginResponse.data,
          headers: loginResponse.headers,
          status: loginResponse.status
        });

        // Extract session token from Set-Cookie header
        const setCookieHeader = loginResponse.headers['set-cookie'];
        if (setCookieHeader) {
          const sessionTokenCookie = setCookieHeader.find(cookie => cookie.startsWith('next-auth.session-token='));
          if (sessionTokenCookie) {
            const sessionToken = sessionTokenCookie.split(';')[0];
            // Set the cookie for subsequent requests
            api.defaults.headers.common['Cookie'] = sessionToken;
            logger.info('Session token cookie set:', sessionToken);
          } else {
            logger.error('Session token cookie not found in Set-Cookie header');
          }
        } else {
          logger.error('Set-Cookie header not found in response');
        }
      } else {
        throw error;
      }
    }

    // Test 3: Create Task and Verify Sponsor Update
    const taskId = await createTask();
    await verifySponsorUpdate(taskId);

    logger.info('All tests completed');
  } catch (error) {
    logger.error('Test execution failed:', error);
    process.exit(1);
  }
}

runTests(); 