const axios = require('axios');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

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

// Sample test data (from sample-data/contributors.json)
const sampleContributor = {
  basicInfo: {
    email: "alice@example.com",
    displayName: "Alice",
    bio: "Experienced smart contract developer",
    profileImage: "https://example.com/profiles/alice.png",
    joinDate: "2024-01-01T00:00:00Z",
    walletAddress: "0x1111111111111111111111111111111111111111",
    website: "https://alice.dev",
    x: "@alice",
    discord: "alice#1234",
    telegram: "@alice"
  },
  contactPreferences: {
    emailNotifications: true,
    newsletterSubscription: {
      subscribed: true,
      interests: ["Smart Contracts", "DeFi"]
    },
    canBeContactedBySponsors: true
  },
  preferences: {
    interfaceSettings: {
      theme: "dark",
      language: "en"
    },
    opportunityPreferences: {
      preferredCategories: ["Smart Contracts", "Security"],
      minimumReward: 3000,
      preferredDifficulty: "expert",
      timeCommitment: "full-time"
    },
    privacySettings: {
      profileVisibility: "public",
      submissionVisibility: "public",
      skillsVisibility: "public",
      reputationVisibility: "public",
      contactabilityBySponsors: "public"
    }
  },
  skills: {
    primarySkills: [
      { name: "Smart Contracts", level: "expert" },
      { name: "Security", level: "expert" }
    ],
    secondarySkills: [
      { name: "Solidity", level: "expert" },
      { name: "DeFi", level: "advanced" }
    ],
    skillTrajectory: {
      improvementRate: 0.95,
      consistencyScore: 0.98
    }
  }
};

async function runTests() {
  let authToken = null;
  let testContributorId = null;

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

  // Test 2: Register Contributor
  logger.info('Testing contributor registration...');
  try {
    logger.info('Attempting to register contributor:', sampleContributor.basicInfo.email);

    const registerResponse = await prodClient.post('/contributor/register', {
      profile: sampleContributor
    });
    logger.info('Registration successful:', registerResponse.data);
    testContributorId = registerResponse.data.contributor._id;
  } catch (error) {
    if (error.response?.data?.message === 'Contributor already exists') {
      logger.info('Contributor already exists, continuing with login...');
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

  // Test 3: Login Contributor
  logger.info('Testing contributor login...');
  try {
    logger.info('Attempting to login with email:', sampleContributor.basicInfo.email);
    
    const loginResponse = await prodClient.post('/contributor/login', {
      email: sampleContributor.basicInfo.email
    });
    logger.info('Login successful:', loginResponse.data);

    // Generate JWT token
    const user = {
      id: loginResponse.data.contributor.id,
      role: loginResponse.data.contributor.role,
      permissions: loginResponse.data.contributor.permissions
    };
    authToken = generateAuthToken(user);
    logger.info('Generated JWT token for authenticated requests');

    // Set the token for subsequent requests
    prodClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
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

  // Test 4: Get Contributor Profile
  logger.info('Testing get contributor profile...');
  try {
    const profileResponse = await prodClient.get('/contributor/profile');
    logger.info('Profile retrieved successfully:', profileResponse.data);
  } catch (error) {
    logger.error('Profile retrieval failed:', error.message);
    if (error.response) {
      logger.error('Profile retrieval error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
  }

  logger.info('All tests completed');
}

// Run the tests
runTests().catch(error => {
  logger.error('Test suite error:', error);
  process.exit(1);
}); 