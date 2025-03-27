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

  beforeAll(async () => {
    // Register a test sponsor
    const sponsorData = {
      profile: {
        walletAddress: generateUniqueWalletAddress(),
        name: 'Test Sponsor',
        logo: 'https://example.com/sponsor-logo.png',
        description: 'Test Sponsor Description',
        website: 'https://example.com',
        x: 'https://x.com/testsponsor',
        discord: 'https://discord.gg/testsponsor',
        telegram: 'https://t.me/testsponsor',
        contactEmail: 'sponsor@example.com',
        categories: ['development'],
        taskIds: [],
        registeredAt: new Date().toISOString()
      }
    };

    const registerResponse = await api.sponsor.register(sponsorData);
    testSponsor = registerResponse.data.sponsor;

    // Login as the test sponsor
    const loginResponse = await api.sponsor.login({
      walletAddress: testSponsor.walletAddress
    });

    // Set the auth token for subsequent requests
    await api.auth.setSession({
      id: testSponsor._id,
      walletAddress: testSponsor.walletAddress,
      role: 'sponsor'
    });
  });

  afterAll(async () => {
    // Clear auth session
    await api.auth.clearSession();
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

    const response = await api.task.create(taskData);
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

    const createResponse = await api.task.create(taskData);
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

    const createResponse = await api.task.create(taskData);
    const taskId = createResponse.data.task.id;

    // Update the task
    const updateData = {
      task: {
        title: 'Updated Test Task',
        description: 'Updated Test Description'
      }
    };

    const updateResponse = await api.task.update(taskId, updateData);
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.task.title).toBe(updateData.task.title);
    expect(updateResponse.data.task.description).toBe(updateData.task.description);

    // Verify the update
    const getResponse = await api.task.get(taskId);
    expect(getResponse.data.tasks[0].title).toBe(updateData.task.title);
    expect(getResponse.data.tasks[0].description).toBe(updateData.task.description);
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

    const createResponse = await api.task.create(taskData);
    const taskId = createResponse.data.task.id;

    // Then delete the task
    const deleteResponse = await api.task.delete(taskId);
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