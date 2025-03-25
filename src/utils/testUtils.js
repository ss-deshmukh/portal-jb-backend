const axios = require('axios');
const logger = require('./logger');

// Base URL for the API
const BASE_URL = 'http://localhost:5001/api';

// Test data
const testData = {
  contributor: {
    register: {
      basicInfo: {
        email: 'test@example.com',
        displayName: 'Test Contributor',
        bio: 'Test bio',
        walletAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CERvfJmcNSUKcBdUjcMVT', // Valid Polkadot address
        website: 'https://github.com/test',
        x: 'https://twitter.com/test',
        telegram: 'https://t.me/test',
        joinDate: new Date().toISOString() // Add join date
      },
      skills: {
        primarySkills: [
          {
            name: 'JavaScript',
            level: 'intermediate'
          },
          {
            name: 'Node.js',
            level: 'intermediate'
          }
        ]
      }
    },
    login: {
      email: 'test@example.com'
    }
  },
  sponsor: {
    register: {
      profile: {
        walletAddress: '1xN1QjpCiNSPfSoqZAbL33RxbsCcskASzYNs3GBs1h8dc7f', // Valid Polkadot address
        name: 'Test Sponsor',
        logo: 'https://example.com/logo.png',
        description: 'Test sponsor description',
        website: 'https://example.com',
        contactEmail: 'sponsor@example.com'
      }
    },
    login: {
      wallet: '1xN1QjpCiNSPfSoqZAbL33RxbsCcskASzYNs3GBs1h8dc7f' // Same as register wallet
    }
  },
  task: {
    create: {
      task: {
        title: 'Test Task',
        sponsorId: '0x9876543210987654321098765432109876543210', // Using actual sponsor wallet address
        logo: 'https://example.com/task-logo.png',
        description: 'Test task description',
        requirements: ['Requirement 1', 'Requirement 2'],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        postedTime: new Date().toISOString(), // Add posted time
        status: 'open', // Add status
        reward: 100,
        maxAccepted: 1, // Add max accepted value
        priority: 'high',
        category: ['development'],
        skills: ['JavaScript', 'Node.js']
      }
    }
  },
  skill: {
    create: 'Test Skill',
    update: {
      id: null, // Will be set after creation
      updated: {
        name: 'Updated Skill'
      }
    }
  },
  submission: {
    create: {
      submission: {
        taskId: 'test_task_id', // Will be replaced with actual task ID
        contributorId: 'test_contributor_id', // Will be replaced with actual contributor ID
        content: 'Test submission content',
        status: 'pending',
        description: 'Test submission description',
        links: ['https://github.com/test/repo'],
        walletAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CERvfJmcNSUKcBdUjcMVT', // Using the same wallet address as the contributor
        submissions: ['https://github.com/test/repo/pull/1'] // Add submissions array
      }
    }
  }
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Log the request data
    logger.info(`Making ${method} request to ${endpoint} with data:`, JSON.stringify(data, null, 2));

    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      data,
      headers
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      logger.error('Request failed with response:', JSON.stringify(error.response.data, null, 2));
      throw new Error(`Request failed with status code ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
};

// Test functions for each API endpoint
const apiTests = {
  contributor: {
    async register() {
      logger.info('POST /api/contributor/register');
      const response = await makeAuthenticatedRequest('POST', '/contributor/register', testData.contributor.register);
      logger.info('API Test - POST /contributor/register: Success');
      return response;
    },
    async login() {
      logger.info('POST /api/contributor/login');
      const response = await makeAuthenticatedRequest('POST', '/contributor/login', testData.contributor.login);
      logger.info('API Test - POST /contributor/login: Success');
      return response;
    },
    async update() {
      logger.info('PUT /api/contributor');
      const response = await makeAuthenticatedRequest('PUT', '/contributor', {
        ...testData.contributor.register,
        bio: 'Updated bio'
      }, 'test_token');
      logger.info('API Test - PUT /contributor: Success');
      return response;
    },
    async delete() {
      logger.info('DELETE /api/contributor');
      const response = await makeAuthenticatedRequest('DELETE', '/contributor', {
        wallet: testData.contributor.register.walletAddress
      }, 'test_token');
      logger.info('API Test - DELETE /contributor: Success');
      return response;
    }
  },
  sponsor: {
    async register() {
      logger.info('POST /api/sponsor/register');
      const response = await makeAuthenticatedRequest('POST', '/sponsor/register', testData.sponsor.register);
      logger.info('API Test - POST /sponsor/register: Success');
      return response;
    },
    async login() {
      logger.info('POST /api/sponsor/login');
      const response = await makeAuthenticatedRequest('POST', '/sponsor/login', testData.sponsor.login);
      logger.info('API Test - POST /sponsor/login: Success');
      return response;
    },
    async update() {
      logger.info('PUT /api/sponsor');
      const response = await makeAuthenticatedRequest('PUT', '/sponsor', {
        ...testData.sponsor.register,
        description: 'Updated description'
      }, 'test_token');
      logger.info('API Test - PUT /sponsor: Success');
      return response;
    },
    async delete() {
      logger.info('DELETE /api/sponsor');
      const response = await makeAuthenticatedRequest('DELETE', '/sponsor', {
        wallet: testData.sponsor.register.profile.walletAddress
      }, 'test_token');
      logger.info('API Test - DELETE /sponsor: Success');
      return response;
    }
  },
  task: {
    async create() {
      logger.info('POST /api/task/create');
      const response = await makeAuthenticatedRequest('POST', '/task/create', testData.task.create, 'test_token');
      logger.info('API Test - POST /task/create: Success');
      return response;
    },
    async fetch() {
      logger.info('POST /api/task/fetch');
      const response = await makeAuthenticatedRequest('POST', '/task/fetch', {
        taskIds: ['test_task_id']
      }, 'test_token');
      logger.info('API Test - POST /task/fetch: Success');
      return response;
    },
    async delete() {
      logger.info('DELETE /api/task');
      const response = await makeAuthenticatedRequest('DELETE', '/task', {
        id: 'test_task_id'
      }, 'test_token');
      logger.info('API Test - DELETE /task: Success');
      return response;
    }
  },
  skill: {
    async create() {
      logger.info('POST /api/skill/create');
      const response = await makeAuthenticatedRequest('POST', '/skill/create', {
        name: testData.skill.create
      }, 'test_token');
      logger.info('API Test - POST /skill/create: Success');
      return response;
    },
    async update() {
      logger.info('PUT /api/skill');
      const response = await makeAuthenticatedRequest('PUT', '/skill', {
        id: testData.skill.update.id,
        updated: testData.skill.update.updated
      }, 'test_token');
      logger.info('API Test - PUT /skill: Success');
      return response;
    },
    async delete() {
      logger.info('DELETE /api/skill');
      const response = await makeAuthenticatedRequest('DELETE', '/skill', {
        id: testData.skill.update.id
      }, 'test_token');
      logger.info('API Test - DELETE /skill: Success');
      return response;
    }
  },
  submission: {
    async create() {
      logger.info('POST /api/submission');
      const response = await makeAuthenticatedRequest('POST', '/submission', testData.submission.create, 'test_token');
      logger.info('API Test - POST /submission: Success');
      return response;
    },
    async delete() {
      logger.info('DELETE /api/submission');
      const response = await makeAuthenticatedRequest('DELETE', '/submission', {
        submissionId: 'test_submission_id'
      }, 'test_token');
      logger.info('API Test - DELETE /submission: Success');
      return response;
    },
    async fetch() {
      logger.info('GET /api/submission');
      const response = await makeAuthenticatedRequest('GET', '/submission', {
        ids: ['test_submission_id'] // Will be replaced with actual submission ID
      }, 'test_token');
      logger.info('API Test - GET /submission: Success');
      return response;
    }
  }
};

// Function to run all tests in sequence
const runAllTests = async () => {
  logger.info('Starting API tests...');
  
  try {
    // Test Contributor endpoints
    logger.info('Testing Contributor endpoints...');
    const contributorRegister = await apiTests.contributor.register();
    logger.info('Contributor registration response:', JSON.stringify(contributorRegister, null, 2));
    
    const contributorLogin = await apiTests.contributor.login();
    
    // Store contributor ID and wallet address from registration response
    const contributorId = contributorRegister.contributor._id;
    const contributorWalletAddress = contributorRegister.contributor.basicInfo.walletAddress;
    logger.info('Stored contributor ID:', contributorId);
    logger.info('Stored contributor wallet address:', contributorWalletAddress);
    
    // Test Sponsor endpoints
    logger.info('Testing Sponsor endpoints...');
    const sponsorRegister = await apiTests.sponsor.register();
    const sponsorLogin = await apiTests.sponsor.login();
    
    // Test Task endpoints
    logger.info('Testing Task endpoints...');
    const taskCreate = await apiTests.task.create();
    
    // Update task fetch test with actual task ID
    const taskId = taskCreate.id;
    const taskFetch = await makeAuthenticatedRequest('POST', '/task/fetch', {
      ids: [taskId]
    }, 'test_token');
    
    // Test Skill endpoints
    logger.info('Testing Skill endpoints...');
    const skillCreate = await apiTests.skill.create();
    
    // Store the skill ID from create response
    const skillId = skillCreate.skill.id;
    testData.skill.update.id = skillId;
    
    // Update skill with the stored ID
    const skillUpdate = await makeAuthenticatedRequest('PUT', '/skill', {
      id: skillId,
      updated: {
        name: 'Updated Skill'
      }
    }, 'test_token');
    
    // Delete skill with the stored ID
    await makeAuthenticatedRequest('DELETE', '/skill', {
      id: skillId
    }, 'test_token');
    
    // Test Submission endpoints
    logger.info('Testing Submission endpoints...');
    
    // Update submission test data with actual IDs and wallet address
    testData.submission.create.submission.taskId = taskId;
    testData.submission.create.submission.contributorId = contributorId;
    testData.submission.create.submission.walletAddress = contributorWalletAddress;
    
    // Log the submission data before creating
    logger.info('Creating submission with data:', JSON.stringify(testData.submission.create, null, 2));
    
    const submissionCreate = await apiTests.submission.create();
    
    // Update submission fetch test with actual submission ID
    const submissionId = submissionCreate.submission.id;
    const submissionFetch = await makeAuthenticatedRequest('GET', '/submission', {
      ids: [submissionId]
    }, 'test_token');
    
    // Delete task after submission is created
    await makeAuthenticatedRequest('DELETE', '/task', {
      id: taskId
    }, 'test_token');
    
    logger.info('All API tests completed successfully!');
  } catch (error) {
    logger.error('API tests failed:', error);
    throw error;
  }
};

module.exports = {
  apiTests,
  runAllTests
}; 