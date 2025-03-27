const axios = require('axios');
const winston = require('winston');

// Create a test logger that doesn't write to files
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
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

describe('Production API Tests', () => {
  let authToken = null;
  let testContributorId = null;

  // Increase timeout for all tests
  jest.setTimeout(30000);

  // Test health endpoint
  test('Health endpoint should be accessible', async () => {
    try {
      const response = await prodClient.get('/health');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'ok');
      expect(response.data).toHaveProperty('environment', 'production');
      expect(response.data).toHaveProperty('database');
      expect(response.data.database).toHaveProperty('status', 'connected');
    } catch (error) {
      logger.error('Health check failed:', error.message);
      throw error;
    }
  });

  // Test contributor registration
  test('Should register a new contributor', async () => {
    const timestamp = Date.now();
    const contributorData = {
      basicInfo: {
        email: `test${timestamp}@example.com`,
        password: 'TestPassword123!',
        name: 'Test User'
      },
      walletAddress: `0x1234567890abcdef${timestamp}`,
      skills: ['JavaScript', 'Node.js']
    };

    try {
      const response = await prodClient.post('/contributor/register', contributorData);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      testContributorId = response.data.id;
      logger.info('Successfully registered contributor:', testContributorId);
    } catch (error) {
      logger.error('Registration failed:', error.message);
      throw error;
    }
  });

  // Test contributor login
  test('Should login with registered contributor', async () => {
    const timestamp = Date.now();
    const loginData = {
      email: `test${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    try {
      const response = await prodClient.post('/contributor/login', loginData);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      authToken = response.data.token;
      
      // Set auth token for subsequent requests
      prodClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      logger.info('Successfully logged in and set auth token');
    } catch (error) {
      logger.error('Login failed:', error.message);
      throw error;
    }
  });

  // Test getting contributor profile
  test('Should get contributor profile', async () => {
    const response = await prodClient.get('/contributor/profile');
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('basicInfo');
  });

  // Test getting all skills
  test('Should get all skills', async () => {
    try {
      const response = await prodClient.get('/skills/all');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      logger.info(`Retrieved ${response.data.length} skills`);
    } catch (error) {
      logger.error('Failed to get skills:', error.message);
      throw error;
    }
  });

  // Test creating a task
  test('Should create a new task', async () => {
    const taskData = {
      title: 'Test Task',
      description: 'This is a test task',
      skills: ['JavaScript'],
      reward: 100
    };

    const response = await prodClient.post('/tasks/create', taskData);
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
  });

  // Test getting all tasks
  test('Should get all tasks', async () => {
    const response = await prodClient.get('/tasks');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  // Test creating a submission
  test('Should create a new submission', async () => {
    const submissionData = {
      taskId: 'task-id-here', // Replace with actual task ID
      description: 'Test submission',
      links: ['https://github.com/test/repo']
    };

    const response = await prodClient.post('/submissions', submissionData);
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
  });

  // Test getting all submissions
  test('Should get all submissions', async () => {
    const response = await prodClient.get('/submissions');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  // Test sponsor registration
  test('Should register a new sponsor', async () => {
    const sponsorData = {
      basicInfo: {
        email: `sponsor${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'Test Sponsor'
      },
      walletAddress: '0xabcdef1234567890'
    };

    const response = await prodClient.post('/sponsor/register', sponsorData);
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
  });

  // Test sponsor login
  test('Should login with registered sponsor', async () => {
    const loginData = {
      email: 'sponsor@example.com',
      password: 'TestPassword123!'
    };

    const response = await prodClient.post('/sponsor/login', loginData);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('token');
  });

  // Cleanup: Delete test contributor if created
  afterAll(async () => {
    if (authToken && testContributorId) {
      try {
        const response = await prodClient.delete('/contributor/profile');
        expect(response.status).toBe(200);
        logger.info('Successfully cleaned up test contributor');
      } catch (error) {
        logger.error('Cleanup failed:', error.message);
      }
    }
  });
}); 