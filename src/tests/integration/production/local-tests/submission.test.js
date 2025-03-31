const logger = require('../../../../utils/logger');
const api = require('../../testClient');
const mongoose = require('mongoose');

function generateUniqueEmail() {
  const timestamp = Date.now();
  return `test.integration.${timestamp}@example.com`;
}

function generateTestWalletAddress() {
  return '5' + 'A'.repeat(47); // Simple valid Polkadot address for testing
}

function generateTestTaskId() {
  return `task_${Date.now()}`;
}

describe('Submission Tests', () => {
  let authToken;
  let testContributor;
  let testTask;

  beforeEach(async () => {
    // Clear any existing session
    api.auth.clearSession();
    
    // Clear test collections
    try {
      await mongoose.connection.collection('contributors').deleteMany({});
      await mongoose.connection.collection('tasks').deleteMany({});
      await mongoose.connection.collection('submissions').deleteMany({});
      logger.info('Cleared test collections');
    } catch (error) {
      logger.error('Error clearing collections:', error);
    }

    // Create a test contributor
    const contributorData = {
      basicInfo: {
        email: generateUniqueEmail(),
        displayName: 'Test Contributor',
        bio: '',
        profileImage: '',
        joinDate: new Date(),
        walletAddress: generateTestWalletAddress(),
        website: '',
        x: '',
        discord: '',
        telegram: ''
      }
    };
    const contributorResponse = await api.contributor.register(contributorData);
    testContributor = contributorResponse.data.contributor;

    // Login as contributor
    const loginResponse = await api.contributor.login({
      email: testContributor.basicInfo.email
    });
    authToken = loginResponse.data.token;

    // Create a test task
    const taskData = {
      task: {
        id: generateTestTaskId(),
        title: 'Test Task',
        description: 'Test task description',
        status: 'open',
        reward: 100,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        requirements: ['requirement1', 'requirement2'],
        deliverables: ['deliverable1', 'deliverable2'],
        skills: ['skill1', 'skill2'],
        category: ['development'],
        submissions: [],
        sponsorId: testContributor.basicInfo.walletAddress, // Use the test contributor's wallet address
        logo: 'https://example.com/logo.png',
        postedTime: new Date(),
        priority: 'medium',
        timeCommitment: 'medium'
      }
    };
    const taskResponse = await api.task.create(taskData, authToken);
    testTask = taskResponse.data.task;
  });

  test('should create a new submission', async () => {
    const submissionData = {
      taskId: testTask.id,
      walletAddress: testContributor.basicInfo.walletAddress,
      submissionTime: new Date().toISOString(),
      status: 'pending',
      isAccepted: false
    };

    const response = await api.submission.create(submissionData, authToken);
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('submission');
    expect(response.data.submission.taskId).toBe(testTask.id);
    expect(response.data.submission.walletAddress).toBe(testContributor.basicInfo.walletAddress);
  });

  test('should get submissions by task ID', async () => {
    const response = await api.submission.list({ taskId: testTask.id });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.submissions)).toBe(true);
  });

  test('should get submissions by wallet address', async () => {
    const response = await api.submission.list({ walletAddress: testContributor.basicInfo.walletAddress });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.submissions)).toBe(true);
  });

  test('should delete a submission', async () => {
    // First create a submission to delete
    const submissionData = {
      taskId: testTask.id,
      walletAddress: testContributor.basicInfo.walletAddress,
      submissionTime: new Date().toISOString(),
      status: 'pending',
      isAccepted: false
    };

    const createResponse = await api.submission.create(submissionData, authToken);
    expect(createResponse.status).toBe(201);
    const submissionId = createResponse.data.submission.id;

    // Then delete the submission
    const deleteResponse = await api.submission.delete(submissionId, authToken);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.data.message).toBe('Submission deleted successfully');

    // Verify submission is deleted
    const listResponse = await api.submission.list({ taskId: testTask.id });
    expect(listResponse.data.submissions.find(s => s.id === submissionId)).toBeUndefined();
  });

  test('should not create submission for non-existent task', async () => {
    const submissionData = {
      taskId: 'non-existent-task-id',
      walletAddress: testContributor.basicInfo.walletAddress,
      submissionTime: new Date().toISOString(),
      status: 'pending',
      isAccepted: false
    };

    try {
      await api.submission.create(submissionData, authToken);
      fail('Expected an error but got success');
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe('Task not found not found');
    }
  });

  test('should not create submission for closed task', async () => {
    // Update task status to closed
    const updateTaskData = {
      task: {
        ...testTask,
        status: 'completed'
      }
    };
    await api.task.update(testTask.id, updateTaskData, authToken);

    const submissionData = {
      taskId: testTask.id,
      walletAddress: testContributor.basicInfo.walletAddress,
      submissionTime: new Date().toISOString(),
      status: 'pending',
      isAccepted: false
    };

    try {
      await api.submission.create(submissionData, authToken);
      fail('Expected an error but got success');
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe('Task is not open for submissions');
    }
  });
}); 