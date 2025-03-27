const axios = require('axios');
const winston = require('winston');
const crypto = require('crypto');

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
  withCredentials: true
});

// Add response interceptor for logging
api.interceptors.response.use(
  response => response,
  error => {
    logger.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Generate a random skill ID
const generateSkillId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Generate test skill data
const generateTestSkillData = () => {
  return {
    name: `Test Skill ${Date.now()}`
  };
};

// Sample skill data
const sampleSkill = {
  name: 'Test Skill'
};

async function runTests() {
  try {
    // Test 1: Health Check
    logger.info('Running Health Check...');
    const healthResponse = await api.get('/health');
    logger.info('Health Check Response:', healthResponse.data);

    // Test 2: Get All Skills
    logger.info('Running Get All Skills Test...');
    const getAllResponse = await api.get('/skill/all');
    logger.info('Get All Skills Response:', getAllResponse.data);

    // Test 3: Create Skill (requires admin auth)
    logger.info('Running Create Skill Test...');
    try {
      const createResponse = await api.post('/skill/create', sampleSkill);
      logger.info('Create Skill Response:', createResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        logger.info('Create Skill failed as expected (requires admin auth)');
      } else {
        throw error;
      }
    }

    // Test 4: Get Skill by ID (requires valid ID)
    logger.info('Running Get Skill by ID Test...');
    try {
      const getByIdResponse = await api.get('/skill/123'); // Using invalid ID
      logger.info('Get Skill by ID Response:', getByIdResponse.data);
    } catch (error) {
      if (error.response?.status === 404) {
        logger.info('Get Skill by ID failed as expected (invalid ID)');
      } else {
        throw error;
      }
    }

    logger.info('All tests completed');
  } catch (error) {
    logger.error('Test execution failed:', error);
    process.exit(1);
  }
}

runTests(); 