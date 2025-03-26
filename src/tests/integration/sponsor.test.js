const api = require('./testClient');
const logger = require('../../utils/logger');
const { startTestServer, stopTestServer } = require('./testServer');

function generateTestWalletAddress() {
  // Generate a valid Polkadot address format
  // Starting with '1' or '5' followed by 46-47 base58 characters
  const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let address = Math.random() < 0.5 ? '1' : '5';
  for (let i = 0; i < 47; i++) {
    address += base58Chars[Math.floor(Math.random() * base58Chars.length)];
  }
  return address;
}

describe('Sponsor Tests', () => {
  let testSponsor;

  beforeAll(async () => {
    // Setup before all tests
    logger.info('Starting sponsor tests...');
    await startTestServer();
  });

  afterAll(async () => {
    // Cleanup after all tests
    await stopTestServer();
    logger.info('Completed sponsor tests');
  });

  beforeEach(async () => {
    // Clear any existing sessions before each test
    await api.auth.clearSession();
  });

  it('should register a new sponsor', async () => {
    try {
      const sponsorData = {
        profile: {
          walletAddress: generateTestWalletAddress(),
          verified: false,
          name: 'Test Sponsor',
          logo: 'https://example.com/logo.png',
          description: 'Test sponsor description',
          website: 'https://example.com',
          x: '@testsponsor',
          discord: 'testsponsor#1234',
          telegram: '@testsponsor',
          contactEmail: 'test@example.com',
          categories: ['development', 'design'],
          taskIds: [],
          registeredAt: new Date()
        }
      };

      const response = await api.sponsor.register(sponsorData);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('message', 'Sponsor registered successfully');
      expect(response.data).toHaveProperty('sponsor');
      expect(response.data.sponsor).toHaveProperty('_id');
      expect(response.data.sponsor.name).toBe(sponsorData.profile.name);
      expect(response.data.sponsor.walletAddress).toBe(sponsorData.profile.walletAddress);
      
      // Store sponsor data for other tests
      testSponsor = {
        profile: response.data.sponsor
      };
    } catch (error) {
      if (error.response) {
        console.error('Sponsor registration error:', error.response.data);
        throw new Error(`Sponsor registration failed: ${error.response.data.message}`);
      }
      throw error;
    }
  });

  it('should login a sponsor', async () => {
    try {
      const response = await api.sponsor.login({ walletAddress: testSponsor.profile.walletAddress });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message', 'Login successful');
      expect(response.data).toHaveProperty('sponsor');
      expect(response.data.sponsor.walletAddress).toBe(testSponsor.profile.walletAddress);
    } catch (error) {
      if (error.response) {
        console.error('Sponsor login error:', error.response.data);
        throw new Error(`Sponsor login failed: ${error.response.data.message}`);
      }
      throw error;
    }
  });

  it('should get sponsor profile', async () => {
    try {
      // Set up session for the test sponsor
      await api.sponsor.login({ walletAddress: testSponsor.profile.walletAddress });

      const response = await api.sponsor.getProfile();
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('sponsor');
      expect(response.data.sponsor.walletAddress).toBe(testSponsor.profile.walletAddress);
      expect(response.data.sponsor.name).toBe(testSponsor.profile.name);
    } catch (error) {
      if (error.response) {
        console.error('Get profile error:', error.response.data);
        throw new Error(`Get profile failed: ${error.response.data.message}`);
      }
      throw error;
    }
  });

  it('should update sponsor profile', async () => {
    try {
      // Set up session for the test sponsor
      await api.sponsor.login({ walletAddress: testSponsor.profile.walletAddress });

      const updateData = {
        profile: {
          name: 'Updated Test Sponsor',
          description: 'Updated test sponsor description',
          website: 'https://updated.example.com',
          x: '@updatedsponsor',
          discord: 'updatedsponsor#1234',
          telegram: '@updatedsponsor',
          contactEmail: 'updated@example.com',
          categories: ['development', 'design', 'blockchain']
        }
      };

      const response = await api.sponsor.updateProfile(updateData);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message', 'Profile updated successfully');
      expect(response.data).toHaveProperty('sponsor');
      expect(response.data.sponsor.name).toBe(updateData.profile.name);
      expect(response.data.sponsor.description).toBe(updateData.profile.description);
      expect(response.data.sponsor.website).toBe(updateData.profile.website);
    } catch (error) {
      if (error.response) {
        console.error('Update profile error:', error.response.data);
        throw new Error(`Update profile failed: ${error.response.data.message}`);
      }
      throw error;
    }
  });

  it('should get all sponsors', async () => {
    try {
      // Set up session for admin user
      await api.auth.setSession({
        id: 'admin-id',
        email: 'admin@example.com',
        role: 'admin'
      });

      const response = await api.sponsor.getAll();
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('sponsors');
      expect(Array.isArray(response.data.sponsors)).toBe(true);
      expect(response.data.sponsors.length).toBeGreaterThan(0);
      expect(response.data.sponsors[0]).toHaveProperty('name');
    } catch (error) {
      if (error.response) {
        console.error('Get all sponsors error:', error.response.data);
        throw new Error(`Get all sponsors failed: ${error.response.data.message}`);
      }
      throw error;
    }
  });

  it('should delete sponsor profile', async () => {
    try {
      // Set up session for the test sponsor
      await api.sponsor.login({ walletAddress: testSponsor.profile.walletAddress });

      const response = await api.sponsor.delete();
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message', 'Sponsor deleted successfully');
    } catch (error) {
      if (error.response) {
        console.error('Delete sponsor error:', error.response.data);
        throw new Error(`Delete sponsor failed: ${error.response.data.message}`);
      }
      throw error;
    }
  });
}); 