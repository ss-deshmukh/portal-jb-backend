const logger = require('../../utils/logger');

const generateUniqueWalletAddress = () => {
  // Base58 characters (excluding 0, O, I, l)
  const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  // Generate a random string of 47 characters using base58 characters
  const randomPart = Array.from({ length: 47 }, () => 
    base58Chars[Math.floor(Math.random() * base58Chars.length)]
  ).join('');
  // Start with 5 and add the random part
  return `5${randomPart}`;
};

const runTaskTests = async (api) => {
  let taskId;
  let sponsorId;
  const testWalletAddress = generateUniqueWalletAddress();

  try {
    // Create test sponsor first
    logger.info('Creating test sponsor for task...');
    const sponsorResponse = await api.sponsor.register({
      profile: {
        walletAddress: testWalletAddress,
        name: 'Test Sponsor for Task',
        logo: 'https://example.com/sponsor-logo.png',
        description: 'Test sponsor description for task testing',
        website: 'https://company.com/test-task',
        x: 'https://twitter.com/test-sponsor',
        discord: 'https://discord.gg/test-sponsor',
        telegram: 'https://t.me/test-sponsor',
        contactEmail: 'test.sponsor@example.com',
        categories: ['development', 'design'],
        taskIds: []
      }
    });

    if (sponsorResponse.status !== 201) {
      throw new Error(`Sponsor creation failed: ${sponsorResponse.data.message}`);
    }
    sponsorId = sponsorResponse.data.sponsor._id;

    // Login sponsor to get auth token
    logger.info('Logging in sponsor...');
    const loginResponse = await api.sponsor.login({
      walletAddress: testWalletAddress
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Sponsor login failed: ${loginResponse.data.message}`);
    }
    const authToken = loginResponse.data.token;
    logger.info('Sponsor login successful');

    // Test 1: Create task
    logger.info('Testing task creation...');
    const createResponse = await api.task.create({
      task: {
        title: 'Integration Test Task',
        sponsorId: testWalletAddress,
        logo: 'https://example.com/task-logo.png',
        description: 'Test task description for integration testing',
        requirements: [
          'Must have experience with Node.js',
          'Must be familiar with MongoDB'
        ],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        reward: 1000,
        postedTime: new Date().toISOString(),
        status: 'open',
        priority: 'medium',
        category: ['development', 'backend'],
        skills: ['nodejs', 'mongodb', 'express'],
        maxAccepted: 5,
        submissions: []
      }
    }, authToken);

    if (createResponse.status !== 201) {
      throw new Error(`Task creation failed: ${createResponse.data.message}`);
    }
    taskId = createResponse.data.id;
    logger.info('Task creation successful');

    // Test 2: Get task
    logger.info('Testing task retrieval...');
    const getResponse = await api.task.get(taskId, authToken);

    if (getResponse.status !== 200) {
      throw new Error(`Task retrieval failed: ${getResponse.data.message}`);
    }
    const task = getResponse.data.tasks[0];
    logger.info('Task retrieval successful');

    // Test 3: Update task
    logger.info('Testing task update...');
    const updateResponse = await api.task.update(taskId, {
      task: {
        description: 'Updated task description for integration testing',
        priority: 'high',
        category: ['development', 'backend', 'api'],
        maxAccepted: 10
      }
    }, authToken);

    if (updateResponse.status !== 200) {
      throw new Error(`Task update failed: ${updateResponse.data.message}`);
    }
    logger.info('Task update successful');

    // Test 4: Delete task
    logger.info('Testing task deletion...');
    const deleteResponse = await api.task.delete(taskId, authToken);

    if (deleteResponse.status !== 200) {
      throw new Error(`Task deletion failed: ${deleteResponse.data.message}`);
    }
    logger.info('Task deletion successful');

    // Cleanup: Delete test sponsor
    await api.sponsor.delete(sponsorId);

    return { status: 'passed' };
  } catch (error) {
    logger.error('Task test failed:', error);
    // Attempt cleanup even if tests fail
    try {
      if (taskId) await api.task.delete(taskId);
      if (sponsorId) await api.sponsor.delete(sponsorId);
    } catch (cleanupError) {
      logger.error('Cleanup after test failure encountered an error:', cleanupError);
    }
    return { status: 'failed', error };
  }
};

module.exports = {
  runTaskTests
}; 