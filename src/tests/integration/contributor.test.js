const api = require('./testClient');
const assert = require('assert');
const logger = require('../../utils/logger');

function generateUniqueEmail() {
  const timestamp = Date.now();
  return `test.integration.${timestamp}@example.com`;
}

function generateTestWalletAddress() {
  return '5' + 'A'.repeat(47); // Simple valid Polkadot address for testing
}

async function runContributorTests() {
  const testEmail = generateUniqueEmail();
  const walletAddress = generateTestWalletAddress();
  let contributorId;

  try {
    // Test contributor registration
    logger.info('Testing contributor registration...');
    const registerData = {
      basicInfo: {
        email: testEmail,
        displayName: 'Integration Test Contributor',
        joinDate: new Date().toISOString(),
        walletAddress: walletAddress
      }
    };
    const registerResponse = await api.contributor.register(registerData);
    assert.strictEqual(registerResponse.status, 201);
    contributorId = registerResponse.data.contributor._id;
    logger.info('Contributor registration successful');

    // Test contributor login
    logger.info('Testing contributor login...');
    const loginResponse = await api.contributor.login({ email: testEmail });
    assert.strictEqual(loginResponse.status, 200);
    contributorId = loginResponse.data.contributor._id;
    logger.info('Contributor login successful');

    // Test get contributor profile
    logger.info('Testing get contributor profile...');
    const profileResponse = await api.contributor.getProfile(contributorId);
    assert.strictEqual(profileResponse.status, 200);
    assert.strictEqual(profileResponse.data.contributor.basicInfo.email, testEmail);
    logger.info('Get contributor profile successful');

    // Test update contributor profile
    logger.info('Testing update contributor profile...');
    const updateData = {
      email: testEmail,
      updated: {
        basicInfo: {
          displayName: 'Updated Integration Test Contributor',
          bio: 'Updated test bio',
          email: testEmail,
          joinDate: new Date().toISOString(),
          walletAddress: walletAddress
        }
      }
    };
    const updateResponse = await api.contributor.updateProfile(contributorId, updateData);
    assert.strictEqual(updateResponse.status, 200);
    assert.strictEqual(updateResponse.data.contributor.basicInfo.displayName, updateData.updated.basicInfo.displayName);
    assert.strictEqual(updateResponse.data.contributor.basicInfo.bio, updateData.updated.basicInfo.bio);
    logger.info('Update contributor profile successful');

    return { status: 'success' };
  } catch (error) {
    logger.error('Contributor test failed:', error);
    return { status: 'failed', error };
  }
}

module.exports = { runContributorTests }; 