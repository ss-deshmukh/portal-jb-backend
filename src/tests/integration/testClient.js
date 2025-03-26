const axios = require('axios');
const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');

const BASE_URL = `http://localhost:${process.env.TEST_PORT || 5001}/api`;
const AUTH_SECRET = process.env.AUTH_SECRET;

const testClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies
});

// Add response interceptor to handle cookies
testClient.interceptors.response.use(
  response => {
    // Store cookies from response
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      cookies.forEach(cookie => {
        if (cookie.startsWith('next-auth.session-token=')) {
          testClient.defaults.headers.Cookie = cookie.split(';')[0];
        }
      });
    }
    return response;
  },
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

// Helper to create a mock Auth.js session cookie
const createMockSessionCookie = (userData) => {
  const session = {
    user: {
      id: userData.id || 'test-user-id',
      email: userData.email || 'test@example.com',
      role: userData.role || 'user',
      permissions: userData.permissions || []
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
  };

  return jwt.sign(session, AUTH_SECRET);
};

// Helper to set auth cookie for requests
const setAuthCookie = (cookie) => {
  testClient.defaults.headers.Cookie = `next-auth.session-token=${cookie}`;
};

// Helper to clear auth cookie
const clearAuthCookie = () => {
  delete testClient.defaults.headers.Cookie;
};

// Auth endpoints
const auth = {
  setSession: async (session) => {
    logger.info('Setting session:', session);
    try {
      // Create a signed JWT token
      const token = jwt.sign(
        { 
          user: {
            id: session.id,
            email: session.email,
            role: session.role,
            permissions: session.permissions
          }
        },
        process.env.AUTH_SECRET,
        { expiresIn: '1h' }
      );

      // Set the session cookie
      testClient.defaults.headers.Cookie = `next-auth.session-token=${token}`;
      return { status: 200, message: 'Session set successfully' };
    } catch (error) {
      logger.error('Failed to set session:', error);
      throw error;
    }
  },

  clearSession: async () => {
    logger.info('Clearing session');
    try {
      delete testClient.defaults.headers.Cookie;
      return { status: 200, message: 'Session cleared successfully' };
    } catch (error) {
      logger.error('Failed to clear session:', error);
      throw error;
    }
  }
};

// Helper methods for common API operations
const api = {
  // Auth helpers
  auth: {
    setSession: auth.setSession,
    clearSession: auth.clearSession,
    // Test protected routes
    testProtectedRoute: async () => {
      logger.info('GET /api/protected');
      try {
        const response = await testClient.get('/protected');
        return response;
      } catch (error) {
        logger.error('Protected route test failed:', error.response?.data || error.message);
        throw error;
      }
    },
    // Test admin route
    testAdminRoute: async () => {
      logger.info('GET /api/admin');
      try {
        const response = await testClient.get('/admin');
        return response;
      } catch (error) {
        logger.error('Admin route test failed:', error.response?.data || error.message);
        throw error;
      }
    },
    // Test permission-based route
    testPermissionRoute: async () => {
      logger.info('GET /api/tasks');
      try {
        const response = await testClient.get('/tasks');
        return response;
      } catch (error) {
        logger.error('Permission route test failed:', error.response?.data || error.message);
        throw error;
      }
    }
  },

  // Contributor endpoints
  contributor: {
    register: async (data) => {
      logger.info('POST /api/contributor/register');
      try {
        const response = await testClient.post('/contributor/register', {
          profile: data
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
    getProfile: async () => {
      logger.info('GET /api/contributor/profile');
      try {
        const response = await testClient.get('/contributor/profile');
        return response;
      } catch (error) {
        logger.error('Profile retrieval failed:', error.response?.data || error.message);
        throw error;
      }
    },
    updateProfile: async (data) => {
      logger.info('PUT /api/contributor/profile');
      try {
        const response = await testClient.put('/contributor/profile', data);
        return response;
      } catch (error) {
        logger.error('Profile update failed:', error.response?.data || error.message);
        throw error;
      }
    },
    delete: async () => {
      logger.info('DELETE /api/contributor/profile');
      try {
        const response = await testClient.delete('/contributor/profile');
        return response;
      } catch (error) {
        logger.error('Profile deletion failed:', error.response?.data || error.message);
        throw error;
      }
    },
    getAll: async () => {
      logger.info('GET /api/contributor');
      try {
        const response = await testClient.get('/contributor');
        return response;
      } catch (error) {
        logger.error('Failed to get all contributors:', error.response?.data || error.message);
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
            taskIds: data.profile.taskIds,
            registeredAt: data.profile.registeredAt
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
    getProfile: async () => {
      logger.info('GET /api/sponsor/profile');
      try {
        const response = await testClient.get('/sponsor');
        return response;
      } catch (error) {
        logger.error('Sponsor profile retrieval failed:', error.response?.data || error.message);
        throw error;
      }
    },
    updateProfile: async (data) => {
      logger.info('PUT /api/sponsor/profile');
      try {
        const response = await testClient.put('/sponsor', {
          updated: data.profile
        });
        return response;
      } catch (error) {
        logger.error('Sponsor profile update failed:', error.response?.data || error.message);
        throw error;
      }
    },
    delete: async () => {
      logger.info('DELETE /api/sponsor/profile');
      try {
        const response = await testClient.delete('/sponsor');
        return response;
      } catch (error) {
        logger.error('Sponsor profile deletion failed:', error.response?.data || error.message);
        throw error;
      }
    },
    getAll: async () => {
      logger.info('GET /api/sponsor');
      try {
        const response = await testClient.get('/sponsor/all');
        return response;
      } catch (error) {
        logger.error('Failed to get all sponsors:', error.response?.data || error.message);
        throw error;
      }
    }
  },

  // Task endpoints
  task: {
    create: async (data, token) => {
      logger.info('POST /api/task/create');
      try {
        const response = await testClient.post('/task/create', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response;
      } catch (error) {
        logger.error('Task creation failed:', error.response?.data || error.message);
        throw error;
      }
    },
    list: async () => {
      logger.info('GET /api/task/fetch');
      try {
        // First get all tasks by fetching with an empty array
        const response = await testClient.post('/task/fetch', {
          ids: ['*'] // Use '*' to fetch all tasks
        });
        return response;
      } catch (error) {
        logger.error('Failed to get tasks:', error.response?.data || error.message);
        throw error;
      }
    },
    get: async (id) => {
      logger.info(`GET /api/task/fetch`);
      try {
        const response = await testClient.post('/task/fetch', {
          ids: [id]
        });
        return response;
      } catch (error) {
        logger.error('Failed to get task:', error.response?.data || error.message);
        throw error;
      }
    },
    update: async (id, data, token) => {
      logger.info(`PUT /api/task/update`);
      try {
        const response = await testClient.put('/task/update', {
          task: {
            id,
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
    delete: async (id, token) => {
      logger.info(`DELETE /api/task`);
      try {
        const response = await testClient.delete('/task', {
          headers: { Authorization: `Bearer ${token}` },
          data: { id }
        });
        return response;
      } catch (error) {
        logger.error('Task deletion failed:', error.response?.data || error.message);
        throw error;
      }
    }
  },

  // Skill endpoints
  skill: {
    getAll: async () => {
      logger.info('GET /api/skill/all');
      try {
        const response = await testClient.get('/skill/all');
        return response;
      } catch (error) {
        logger.error('Failed to get all skills:', error.response?.data || error.message);
        throw error;
      }
    },

    getById: async (id) => {
      logger.info('GET /api/skill/:id');
      try {
        const response = await testClient.get(`/skill/${id}`);
        return response;
      } catch (error) {
        logger.error('Failed to get skill:', error.response?.data || error.message);
        throw error;
      }
    },

    create: async (data) => {
      logger.info('POST /api/skill/create');
      try {
        const response = await testClient.post('/skill/create', {
          name: data.name
        });
        return response;
      } catch (error) {
        logger.error('Failed to create skill:', error.response?.data || error.message);
        throw error;
      }
    },

    update: async (id, data) => {
      logger.info('PUT /api/skill/:id');
      try {
        const response = await testClient.put(`/skill/${id}`, {
          name: data.name
        });
        return response;
      } catch (error) {
        logger.error('Failed to update skill:', error.response?.data || error.message);
        throw error;
      }
    },

    delete: async (id) => {
      logger.info('DELETE /api/skill/:id');
      try {
        const response = await testClient.delete(`/skill/${id}`);
        return response;
      } catch (error) {
        logger.error('Failed to delete skill:', error.response?.data || error.message);
        throw error;
      }
    }
  },

  // Submission endpoints
  submission: {
    create: async (data, token) => {
      logger.info('POST /api/submission');
      logger.info('Submission data:', {
        rawData: data,
        hasIsAccepted: data.isAccepted !== undefined,
        isAcceptedType: typeof data.isAccepted,
        isAcceptedValue: data.isAccepted,
        serializedData: JSON.stringify(data)
      });
      logger.info('Auth token:', token ? 'Present' : 'Missing');
      try {
        const response = await testClient.post('/submission', { submission: data }, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        logger.info('Submission created successfully');
        return response;
      } catch (error) {
        logger.error('Error creating submission:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
          requestData: data,
          requestHeaders: {
            Authorization: token ? 'Present' : 'Missing',
            'Content-Type': 'application/json'
          }
        });
        throw error;
      }
    },
    list: async (query = {}) => {
      logger.info('GET /api/submission');
      try {
        const response = await testClient.get('/submission', {
          params: query
        });
        return response;
      } catch (error) {
        logger.error('Failed to get submissions:', error.response?.data || error.message);
        throw error;
      }
    },
    delete: async (submissionId, token) => {
      logger.info(`DELETE /api/submission`);
      try {
        const response = await testClient.delete('/submission', {
          headers: { Authorization: `Bearer ${token}` },
          data: { submissionId }
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