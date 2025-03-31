const axios = require('axios');
const winston = require('winston');

// Create a test logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()]
});

// Production API configuration
const PROD_BASE_URL = 'https://portal-jb-backend-production.up.railway.app/api';
const prodClient = axios.create({
  baseURL: PROD_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable cookie handling
});

// Add response interceptor for better error logging and cookie handling
prodClient.interceptors.response.use(
  response => {
    // Extract and store session cookie if present
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      const sessionCookie = cookies.find(cookie => cookie.startsWith('next-auth.session-token='));
      if (sessionCookie) {
        const token = sessionCookie.split(';')[0].split('=')[1];
        // Set the cookie for subsequent requests
        prodClient.defaults.headers.common['Cookie'] = `next-auth.session-token=${token}`;
        logger.info('Session cookie set successfully');
      }
    }
    return response;
  },
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

// Sample test data (from sample-data/sponsors.json)
const sampleSponsor = {
  walletAddress: "0x1211111111111111111111111111111111111111",
  verified: true,
  name: "Test Sponsor",
  logo: "https://example.com/logos/test-sponsor.png",
  description: "Test sponsor for testing",
  website: "https://example.com",
  x: "@test",
  discord: "test",
  telegram: "test",
  contactEmail: "test@example.com",
  categories: ["development", "design"],
  taskIds: [],
  registeredAt: "2024-01-01T00:00:00Z"
};

async function runTests() {
  let authToken = null;
  let testSponsorId = null;

  // Test 1: Health Check
  logger.info('Testing health endpoint...');
  try {
    const healthResponse = await prodClient.get('/health');
    logger.info('Health check response:', healthResponse.data);
    
    // Log database connection details
    if (healthResponse.data.database) {
      logger.info('Database connection details:', {
        status: healthResponse.data.database.status,
        host: healthResponse.data.database.host,
        database: healthResponse.data.database.database
      });
    }
  } catch (error) {
    logger.error('Health check test failed:', error.message);
  }

  // Test 2: Register Sponsor
  logger.info('Testing sponsor registration...');
  try {
    logger.info('Attempting to register sponsor:', sampleSponsor.name);

    const registerResponse = await prodClient.post('/sponsor/register', {
      profile: sampleSponsor
    });
    logger.info('Registration successful:', registerResponse.data);
    testSponsorId = registerResponse.data.sponsor._id;
  } catch (error) {
    if (error.response?.data?.message === 'Sponsor already exists') {
      logger.info('Sponsor already exists, continuing with login...');
    } else {
      logger.error('Registration failed:', error.message);
      if (error.response) {
        logger.error('Registration error details:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      return; // Stop testing if registration fails
    }
  }

  // Test 3: Login Sponsor
  logger.info('Testing sponsor login...');
  try {
    logger.info('Attempting to login with wallet:', sampleSponsor.walletAddress);
    
    const loginResponse = await prodClient.post('/sponsor/login', {
      wallet: sampleSponsor.walletAddress
    });
    logger.info('Login successful:', loginResponse.data);

    // Extract session cookie from response headers
    const cookies = loginResponse.headers['set-cookie'];
    if (!cookies) {
      logger.error('No session cookie received from login');
      return;
    }
  } catch (error) {
    logger.error('Login failed:', error.message);
    if (error.response) {
      logger.error('Login error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    return; // Stop testing if login fails
  }

  // Test 4: Get Sponsor Profile
  logger.info('Testing get sponsor profile...');
  try {
    const profileResponse = await prodClient.get('/sponsor');
    logger.info('Profile retrieved successfully:', profileResponse.data);
  } catch (error) {
    logger.error('Get profile failed:', error.message);
  }

  // Test 5: Update Sponsor Profile
  logger.info('Testing update sponsor profile...');
  try {
    // First get the current sponsor profile to see existing taskIds
    const currentProfile = await prodClient.get('/sponsor');
    logger.info('Current sponsor profile:', {
      taskIds: currentProfile.data.sponsor.taskIds
    });

    // Create updated sponsor data with new task ID
    const updateData = {
      updated: {
        ...currentProfile.data.sponsor,
        taskIds: [...(currentProfile.data.sponsor.taskIds || []), "task_004"],
        description: "Updated description: Test sponsor for testing",
        categories: ["development", "design", "testing"],
        registeredAt: undefined // Explicitly exclude registeredAt
      }
    };

    logger.info('Attempting to update sponsor with new taskId:', {
      currentTaskIds: currentProfile.data.sponsor.taskIds,
      newTaskId: "task_004"
    });

    const updateResponse = await prodClient.put('/sponsor', updateData);
    logger.info('Profile updated successfully:', {
      updatedTaskIds: updateResponse.data.sponsor.taskIds
    });
  } catch (error) {
    logger.error('Update profile failed:', error.message);
    if (error.response) {
      logger.error('Update error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
  }

  // Test 6: Get All Sponsors (Admin only)
  logger.info('Testing get all sponsors...');
  try {
    const response = await prodClient.get('/sponsor');
    logger.info('All sponsors retrieved successfully:', response.data);
  } catch (error) {
    logger.error('Get all sponsors failed:', error.message);
  }
}

// Run the tests
runTests().then(() => {
  logger.info('All tests completed');
}); 