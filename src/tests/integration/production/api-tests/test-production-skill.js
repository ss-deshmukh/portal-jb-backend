const axios = require('axios');
const winston = require('winston');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });

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

// Sample skill data
const sampleSkill = {
  name: 'Smart Contract Development',
  description: 'Ability to develop secure and efficient smart contracts',
  category: 'Development',
  level: 'Advanced',
  prerequisites: ['Solidity', 'Blockchain Fundamentals'],
  verificationCriteria: ['Code review', 'Security audit', 'Test coverage']
};

async function runTests() {
  let authToken = null;

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

  // Test 2: Get All Skills (Public endpoint)
  logger.info('Testing get all skills...');
  try {
    const getAllResponse = await prodClient.get('/skill/all');
    logger.info('Get all skills response:', getAllResponse.data);
  } catch (error) {
    logger.error('Get all skills failed:', error.message);
  }

  // Test 3: Create Skill (Admin only)
  logger.info('Testing create skill (should fail without admin auth)...');
  try {
    const createResponse = await prodClient.post('/skill/create', sampleSkill);
    logger.info('Create skill response:', createResponse.data);
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      logger.info('Create skill failed as expected (requires admin auth)');
    } else {
      logger.error('Create skill failed with unexpected error:', error.message);
    }
  }

  logger.info('All tests completed');
}

// Run the tests
runTests().catch(error => {
  logger.error('Test suite error:', error);
  process.exit(1);
}); 