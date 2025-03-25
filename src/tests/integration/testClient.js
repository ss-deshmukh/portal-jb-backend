const axios = require('axios');
const logger = require('../../utils/logger');

const BASE_URL = `http://localhost:${process.env.TEST_PORT || 5001}/api`;

const testClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for better error handling
testClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      logger.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      logger.error('No response received:', error.request);
    } else {
      logger.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper methods for common API operations
const api = {
  // Contributor endpoints
  contributor: {
    register: async (data) => {
      logger.info('POST /api/contributor/register');
      try {
        const response = await testClient.post('/contributor/register', {
          basicInfo: data.basicInfo
        });
        return response;
      } catch (error) {
        logger.error('Registration failed:', error.response?.data || error.message);
        throw error;
      }
    },
    login: async (data) => {
      logger.info('POST /api/contributor/login');
      try {
        const response = await testClient.post('/contributor/login', {
          email: data.email
        });
        return response;
      } catch (error) {
        logger.error('Login failed:', error.response?.data || error.message);
        throw error;
      }
    },
    getProfile: async (contributorId) => {
      logger.info('GET /api/contributor/profile');
      try {
        const response = await testClient.get('/contributor/profile', {
          headers: { Authorization: `Bearer ${contributorId}` }
        });
        return response;
      } catch (error) {
        logger.error('Profile retrieval failed:', error.response?.data || error.message);
        throw error;
      }
    },
    updateProfile: async (contributorId, data) => {
      logger.info('PUT /api/contributor/profile');
      try {
        const response = await testClient.put('/contributor/profile', data, {
          headers: { Authorization: `Bearer ${contributorId}` }
        });
        return response;
      } catch (error) {
        logger.error('Profile update failed:', error.response?.data || error.message);
        throw error;
      }
    },
    delete: async (contributorId) => {
      logger.info('DELETE /api/contributor/profile');
      try {
        const response = await testClient.delete('/contributor/profile', {
          headers: { Authorization: `Bearer ${contributorId}` }
        });
        return response;
      } catch (error) {
        logger.error('Profile deletion failed:', error.response?.data || error.message);
        throw error;
      }
    }
  },

  // Sponsor endpoints
  sponsor: {
    register: async (data) => {
      logger.info('POST /api/sponsor/register');
      try {
        const response = await testClient.post('/sponsor/register', {
          profile: {
            walletAddress: data.profile.walletAddress,
            name: data.profile.name,
            logo: data.profile.logo,
            description: data.profile.description,
            website: data.profile.website,
            x: data.profile.x,
            discord: data.profile.discord,
            telegram: data.profile.telegram,
            contactEmail: data.profile.contactEmail,
            categories: data.profile.categories,
            taskIds: data.profile.taskIds
          }
        });
        return response;
      } catch (error) {
        logger.error('Sponsor registration failed:', error.response?.data || error.message);
        throw error;
      }
    },
    login: async (data) => {
      logger.info('POST /api/sponsor/login');
      try {
        const response = await testClient.post('/sponsor/login', {
          wallet: data.walletAddress
        });
        return response;
      } catch (error) {
        logger.error('Sponsor login failed:', error.response?.data || error.message);
        throw error;
      }
    },
    getProfile: async (token) => {
      logger.info('GET /api/sponsor');
      try {
        const response = await testClient.get('/sponsor', {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response;
      } catch (error) {
        logger.error('Sponsor profile retrieval failed:', error.response?.data || error.message);
        throw error;
      }
    },
    updateProfile: async (token, data) => {
      logger.info('PUT /api/sponsor');
      try {
        const response = await testClient.put('/sponsor', {
          updated: data.profile
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response;
      } catch (error) {
        logger.error('Sponsor profile update failed:', error.response?.data || error.message);
        throw error;
      }
    },
    delete: async (token) => {
      logger.info('DELETE /api/sponsor');
      try {
        const response = await testClient.delete('/sponsor', {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response;
      } catch (error) {
        logger.error('Sponsor profile deletion failed:', error.response?.data || error.message);
        throw error;
      }
    }
  },

  // Task endpoints
  task: {
    create: async (data, token) => {
      logger.info('POST /api/task/create');
      try {
        const response = await testClient.post('/task/create', {
          task: data.task
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response;
      } catch (error) {
        logger.error('Task creation failed:', error.response?.data || error.message);
        throw error;
      }
    },
    get: async (taskId, token) => {
      logger.info(`GET /api/task/${taskId}`);
      try {
        const response = await testClient.post('/task/fetch', {
          ids: [taskId]
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response;
      } catch (error) {
        logger.error('Task retrieval failed:', error.response?.data || error.message);
        throw error;
      }
    },
    update: async (taskId, data, token) => {
      logger.info(`PUT /api/task/${taskId}`);
      try {
        const response = await testClient.put('/task/update', {
          task: {
            id: taskId,
            ...data.task
          }
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response;
      } catch (error) {
        logger.error('Task update failed:', error.response?.data || error.message);
        throw error;
      }
    },
    delete: async (taskId, token) => {
      logger.info(`DELETE /api/task/${taskId}`);
      try {
        const response = await testClient.delete('/task', {
          headers: { Authorization: `Bearer ${token}` },
          data: { id: taskId }
        });
        return response;
      } catch (error) {
        logger.error('Task deletion failed:', error.response?.data || error.message);
        throw error;
      }
    },
    list: (token, query = {}) => testClient.get('/task/list', {
      headers: { Authorization: `Bearer ${token}` },
      params: query
    })
  },

  // Skill endpoints
  skill: {
    create: async (data, token) => {
      logger.info('POST /api/skill/create');
      try {
        const response = await testClient.post('/skill/create', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response;
      } catch (error) {
        logger.error('Skill creation failed:', error.response?.data || error.message);
        throw error;
      }
    },
    get: async (skillId, token) => {
      logger.info(`GET /api/skill/${skillId}`);
      try {
        const response = await testClient.get(`/skill/${skillId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response;
      } catch (error) {
        logger.error('Skill retrieval failed:', error.response?.data || error.message);
        throw error;
      }
    },
    update: async (skillId, data, token) => {
      logger.info(`PUT /api/skill/${skillId}`);
      try {
        const response = await testClient.put('/skill', {
          id: skillId,
          updated: data.updated
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response;
      } catch (error) {
        logger.error('Skill update failed:', error.response?.data || error.message);
        throw error;
      }
    },
    delete: async (skillId, token) => {
      logger.info(`DELETE /api/skill/${skillId}`);
      try {
        const response = await testClient.delete('/skill', {
          headers: { Authorization: `Bearer ${token}` },
          data: { id: skillId }
        });
        return response;
      } catch (error) {
        logger.error('Skill deletion failed:', error.response?.data || error.message);
        throw error;
      }
    }
  },

  // Submission endpoints
  submission: {
    create: async (data, token) => {
      logger.info('POST /api/submission');
      try {
        const response = await testClient.post('/submission', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response;
      } catch (error) {
        logger.error('Submission creation failed:', error.response?.data || error.message);
        throw error;
      }
    },
    fetch: async (data, token) => {
      logger.info('GET /api/submission');
      try {
        const response = await testClient.post('/submission/fetch', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response;
      } catch (error) {
        logger.error('Submission retrieval failed:', error.response?.data || error.message);
        throw error;
      }
    },
    fetchSubmissions: async (token, taskId, contributorId, walletAddress) => {
      logger.info('GET /api/submission');
      try {
        const response = await testClient.get('/submission', {
          headers: { Authorization: `Bearer ${token}` },
          params: { taskId, contributorId, walletAddress }
        });
        return response;
      } catch (error) {
        logger.error('Submission retrieval failed:', error.response?.data || error.message);
        throw error;
      }
    },
    delete: async (data, token) => {
      logger.info('DELETE /api/submission');
      try {
        const response = await testClient.delete('/submission', {
          headers: { Authorization: `Bearer ${token}` },
          data
        });
        return response;
      } catch (error) {
        logger.error('Submission deletion failed:', error.response?.data || error.message);
        throw error;
      }
    }
  }
};

module.exports = api; 