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

    // Test 3: Create Task
    logger.info('Running Create Task Test...');
    let createdTaskId;
    try {
      const createResponse = await api.post('/task/create', { task: sampleTask });
      logger.info('Create Task Response:', createResponse.data);
      createdTaskId = createResponse.data.task.id;

      // Verify sponsor's taskIds
      logger.info('Verifying sponsor taskIds...');
      const sponsorResponse = await api.get('/sponsor', {
        headers: {
          Authorization: `Bearer ${api.defaults.headers.common.Cookie.split('=')[1]}`
        }
      });
      logger.info('Sponsor Data After Task Creation:', sponsorResponse.data);
    } catch (error) {
      logger.error('Create Task Error:', error.response?.data || error.message);
      throw error;
    }

    // Test 4: Get All Tasks
    logger.info('Running Get All Tasks Test...');
    const getAllResponse = await api.post('/task/fetch', { ids: ['*'] });
    logger.info('Get All Tasks Response:', getAllResponse.data);

    // Test 5: Get Task by ID
    if (createdTaskId) {
      logger.info('Running Get Task by ID Test...');
      const getByIdResponse = await api.post('/task/fetch', { ids: [createdTaskId] });
      logger.info('Get Task by ID Response:', getByIdResponse.data);

      // Test 6: Update Task
      logger.info('Running Update Task Test...');
      const updateData = {
        task: {
          id: createdTaskId,
          title: 'Updated Test Task',
          description: 'Updated test description'
        }
      };
      const updateResponse = await api.put('/task/update', updateData);
      logger.info('Update Task Response:', updateResponse.data);

      // Test 7: Delete Task
      logger.info('Running Delete Task Test...');
      const deleteResponse = await api.delete('/task', {
        data: { id: createdTaskId }
      });
      logger.info('Delete Task Response:', deleteResponse.data);

      // Verify sponsor's taskIds after deletion
      logger.info('Verifying sponsor taskIds after deletion...');
      const sponsorResponseAfterDelete = await api.get('/sponsor', {
        headers: { Authorization: `Bearer ${api.defaults.headers.common.Cookie.split('=')[1]}` }
      });
      logger.info('Sponsor Data After Task Deletion:', sponsorResponseAfterDelete.data);
    }

    logger.info('All tests completed');
  } catch (error) {
    logger.error('Test execution failed:', error);
    process.exit(1);
  }
}

runTests(); 