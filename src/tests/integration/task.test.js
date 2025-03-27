const logger = require('../../utils/logger');
const api = require('./testClient');

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

describe('Task Tests', () => {
  let testSponsor;
  let authToken;

  beforeEach(async () => {
    // Clear any existing session
    api.auth.clearSession();
    
    // Create a test sponsor
    const testWalletAddress = generateUniqueWalletAddress();
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
    testSponsor = sponsorResponse.data.sponsor;

    // Login sponsor to get auth token
    const loginResponse = await api.sponsor.login({
      walletAddress: testWalletAddress
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Sponsor login failed: ${loginResponse.data.message}`);
    }
    authToken = loginResponse.data.token;
  });

  afterEach(async () => {
    // Clean up test sponsor
    if (testSponsor) {
      await api.sponsor.delete(testSponsor._id);
    }
  });

  test('should create a new task', async () => {
    const taskData = {
      task: {
        title: 'Test Task',
        sponsorId: testSponsor.walletAddress,
        logo: 'https://example.com/task-logo.png',
        description: 'Test Description',
        requirements: ['Requirement 1', 'Requirement 2'],
        deliverables: ['Deliverable 1', 'Deliverable 2'],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        reward: 100,
        postedTime: new Date().toISOString(),
        status: 'open',
        priority: 'medium',
        category: ['development', 'backend'],
        skills: ['javascript', 'nodejs'],
        submissions: []
      }
    };

    const response = await api.task.create(taskData, authToken);
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('task');
    expect(response.data.task.title).toBe(taskData.task.title);
    expect(response.data.task.sponsorId).toBe(testSponsor.walletAddress);
  });

  test('should get all tasks', async () => {
    const response = await api.task.list();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.tasks)).toBe(true);
  });

  test('should get a specific task', async () => {
    // First create a task
    const taskData = {
      task: {
        title: 'Test Task for Get',
        sponsorId: testSponsor.walletAddress,
        logo: 'https://example.com/task-logo.png',
        description: 'Test Description',
        requirements: ['Requirement 1'],
        deliverables: ['Deliverable 1'],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        reward: 100,
        postedTime: new Date().toISOString(),
        status: 'open',
        priority: 'medium',
        category: ['development'],
        skills: ['javascript'],
        submissions: []
      }
    };

    const createResponse = await api.task.create(taskData, authToken);
    const taskId = createResponse.data.task.id;

    // Then get the task
    const getResponse = await api.task.get(taskId);
    expect(getResponse.status).toBe(200);
    expect(getResponse.data.tasks).toBeDefined();
    expect(getResponse.data.tasks.length).toBe(1);
    expect(getResponse.data.tasks[0].id).toBe(taskId);
  });

  test('should update a task', async () => {
    // First create a task
    const taskData = {
      task: {
        title: 'Test Task for Update',
        sponsorId: testSponsor.walletAddress,
        logo: 'https://example.com/task-logo.png',
        description: 'Test Description',
        requirements: ['Requirement 1'],
        deliverables: ['Deliverable 1'],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        reward: 100,
        postedTime: new Date().toISOString(),
        status: 'open',
        priority: 'medium',
        category: ['development'],
        skills: ['javascript'],
        submissions: []
      }
    };

    const createResponse = await api.task.create(taskData, authToken);
    const taskId = createResponse.data.task.id;

    // Then update the task
    const updateData = {
      task: {
        title: 'Updated Task Title',
        description: 'Updated Description',
        priority: 'high'
      }
    };

    const updateResponse = await api.task.update(taskId, updateData, authToken);
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.task.title).toBe(updateData.task.title);
    expect(updateResponse.data.task.description).toBe(updateData.task.description);
    expect(updateResponse.data.task.priority).toBe(updateData.task.priority);
  });

  test('should delete a task', async () => {
    // First create a task
    const taskData = {
      task: {
        title: 'Test Task for Delete',
        sponsorId: testSponsor.walletAddress,
        logo: 'https://example.com/task-logo.png',
        description: 'Test Description',
        requirements: ['Requirement 1'],
        deliverables: ['Deliverable 1'],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        reward: 100,
        postedTime: new Date().toISOString(),
        status: 'open',
        priority: 'medium',
        category: ['development'],
        skills: ['javascript'],
        submissions: []
      }
    };

    const createResponse = await api.task.create(taskData, authToken);
    const taskId = createResponse.data.task.id;

    // Then delete the task
    const deleteResponse = await api.task.delete(taskId, authToken);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.data.message).toBe('Task deleted successfully');

    // Verify task is deleted
    try {
      await api.task.get(taskId);
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });
}); 