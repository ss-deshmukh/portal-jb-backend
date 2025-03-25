const api = require('./testClient');
const assert = require('assert');
const logger = require('../../utils/logger');

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

async function runSponsorTests() {
  let walletAddress;
  let authToken;

  try {
    // Test sponsor registration
    logger.info('Testing sponsor registration...');
    const registerData = {
      profile: {
        walletAddress: generateTestWalletAddress(),
        name: 'Test Sponsor',
        logo: 'https://example.com/logo.png',
        description: 'Test sponsor description',
        website: 'https://example.com',
        x: '@testsponsor',
        discord: 'testsponsor#1234',
        telegram: '@testsponsor',
        contactEmail: 'test@example.com',
        categories: ['test'],
        taskIds: [],
        verified: false
      }
    };
    const registerResponse = await api.sponsor.register(registerData);
    assert.strictEqual(registerResponse.status, 201);
    walletAddress = registerData.profile.walletAddress;
    logger.info('Sponsor registration successful');

    // Test sponsor login
    logger.info('Testing sponsor login...');
    const loginResponse = await api.sponsor.login({ walletAddress });
    assert.strictEqual(loginResponse.status, 200);
    authToken = loginResponse.data.token;
    logger.info('Sponsor login successful');

    // Test get sponsor profile
    logger.info('Testing get sponsor profile...');
    const profileResponse = await api.sponsor.getProfile(authToken);
    assert.strictEqual(profileResponse.status, 200);
    assert.strictEqual(profileResponse.data.profile.walletAddress, walletAddress);
    logger.info('Get sponsor profile successful');

    // Test update sponsor profile
    logger.info('Testing update sponsor profile...');
    const updateData = {
      profile: {
        name: 'Updated Test Sponsor',
        description: 'Updated test sponsor description'
      }
    };
    const updateResponse = await api.sponsor.updateProfile(authToken, updateData);
    assert.strictEqual(updateResponse.status, 200);
    assert.strictEqual(updateResponse.data.profile.name, updateData.profile.name);
    assert.strictEqual(updateResponse.data.profile.description, updateData.profile.description);
    logger.info('Update sponsor profile successful');

    // Test delete sponsor
    logger.info('Testing delete sponsor...');
    const deleteResponse = await api.sponsor.delete(authToken);
    assert.strictEqual(deleteResponse.status, 200);
    logger.info('Delete sponsor successful');

    return { status: 'success' };
  } catch (error) {
    logger.error('Sponsor test failed:', error);
    return { status: 'failed', error };
  }
}

module.exports = { runSponsorTests }; 