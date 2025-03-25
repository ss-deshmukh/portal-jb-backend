const logger = require('../../utils/logger');
const crypto = require('crypto');

const generateWalletAddress = () => {
  // Generate a base58 string that starts with '5' and is 47-48 characters long
  const bytes = crypto.randomBytes(32);
  const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let address = '5';
  for (let i = 0; i < 46; i++) {
    address += base58Chars[Math.floor(Math.random() * base58Chars.length)];
  }
  return address;
};

const runSkillTests = async (api) => {
  let skillId;
  let sponsorId;
  const walletAddress = generateWalletAddress();

  try {
    // Register and login sponsor
    logger.info('Registering test sponsor...');
    const registerResponse = await api.sponsor.register({
      profile: {
        walletAddress,
        name: 'Test Sponsor',
        logo: 'https://example.com/logo.png',
        description: 'Test sponsor for integration tests',
        website: 'https://example.com',
        x: 'https://x.com/test',
        discord: 'https://discord.gg/test',
        telegram: 'https://t.me/test',
        contactEmail: 'test@example.com',
        categories: ['development', 'testing'],
        taskIds: []
      }
    });

    if (registerResponse.status !== 201) {
      throw new Error(`Sponsor registration failed: ${registerResponse.data.message}`);
    }
    sponsorId = registerResponse.data.sponsor.id;
    logger.info('Sponsor registration successful');

    // Login sponsor
    logger.info('Logging in sponsor...');
    const loginResponse = await api.sponsor.login({
      walletAddress
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Sponsor login failed: ${loginResponse.data.message}`);
    }
    const token = loginResponse.data.token;
    logger.info('Sponsor login successful');

    // Test 1: Create skill
    logger.info('Testing skill creation...');
    const createResponse = await api.skill.create({
      name: `Integration Test Skill ${Date.now()}`
    }, token);

    if (createResponse.status !== 201) {
      throw new Error(`Skill creation failed: ${createResponse.data.message}`);
    }
    skillId = createResponse.data.skill.id;
    logger.info('Skill creation successful');

    // Test 2: Get skill
    logger.info('Testing skill retrieval...');
    const getResponse = await api.skill.get(skillId, token);

    if (getResponse.status !== 200) {
      throw new Error(`Skill retrieval failed: ${getResponse.data.message}`);
    }
    logger.info('Skill retrieval successful');

    // Test 3: Update skill
    logger.info('Testing skill update...');
    const updateResponse = await api.skill.update(skillId, {
      updated: {
        name: `Updated Integration Test Skill ${Date.now()}`
      }
    }, token);

    if (updateResponse.status !== 200) {
      throw new Error(`Skill update failed: ${updateResponse.data.message}`);
    }
    logger.info('Skill update successful');

    // Test 4: Delete skill
    logger.info('Testing skill deletion...');
    const deleteResponse = await api.skill.delete(skillId, token);

    if (deleteResponse.status !== 200) {
      throw new Error(`Skill deletion failed: ${deleteResponse.data.message}`);
    }
    logger.info('Skill deletion successful');

    return { status: 'passed' };
  } catch (error) {
    logger.error('Skill test failed:', error);
    // Attempt cleanup even if tests fail
    try {
      if (skillId) await api.skill.delete(skillId);
      if (sponsorId) await api.sponsor.delete(sponsorId);
    } catch (cleanupError) {
      logger.error('Cleanup after test failure encountered an error:', cleanupError);
    }
    return { status: 'failed', error };
  }
};

module.exports = {
  runSkillTests
}; 