const logger = require('../../utils/logger');
const assert = require('assert');

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

const cleanupTestData = async (api) => {
  try {
    // Find contributor by email
    const contributorResponse = await api.contributor.login({
      email: 'test.contributor@example.com'
    });
    if (contributorResponse.status === 200) {
      const contributorId = contributorResponse.data.contributor._id;
      await api.contributor.delete(contributorId);
    }
  } catch (error) {
    // Ignore errors if contributor doesn't exist
  }
};

const runSubmissionTests = async (api) => {
  let submissionId;
  let taskId;
  let contributorId;
  const testSponsorWallet = generateUniqueWalletAddress();
  const testContributorWallet = generateUniqueWalletAddress();

  try {
    // Clean up test data before running tests
    await cleanupTestData(api);

    // Create test sponsor first
    logger.info('Creating test sponsor for submission...');
    const sponsorResponse = await api.sponsor.register({
      profile: {
        walletAddress: testSponsorWallet,
        name: 'Test Sponsor for Submission',
        logo: 'https://example.com/sponsor-logo.png',
        description: 'Test sponsor description for submission testing',
        website: 'https://company.com/test-submission',
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

    // Login sponsor to get auth token
    logger.info('Logging in sponsor...');
    const sponsorLoginResponse = await api.sponsor.login({
      walletAddress: testSponsorWallet
    });

    if (sponsorLoginResponse.status !== 200) {
      throw new Error(`Sponsor login failed: ${sponsorLoginResponse.data.message}`);
    }
    const sponsorAuthToken = sponsorLoginResponse.data.token;
    logger.info('Sponsor login successful');

    // Create test task
    logger.info('Creating test task...');
    const taskResponse = await api.task.create({
      task: {
        title: 'Integration Test Task for Submission',
        sponsorId: testSponsorWallet,
        logo: 'https://example.com/task-logo.png',
        description: 'Test task description for submission testing',
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
    }, sponsorAuthToken);

    if (taskResponse.status !== 201) {
      throw new Error(`Task creation failed: ${taskResponse.data.message}`);
    }
    taskId = taskResponse.data.id;
    logger.info('Task creation successful');

    // Create test contributor
    logger.info('Creating test contributor...');
    const contributorResponse = await api.contributor.register({
      basicInfo: {
        email: 'test.contributor@example.com',
        displayName: 'Test Contributor',
        walletAddress: testContributorWallet,
        joinDate: new Date().toISOString()
      },
      contactPreferences: {
        emailNotifications: false,
        newsletterSubscription: {
          subscribed: false,
          interests: []
        },
        canBeContactedBySponsors: false
      },
      preferences: {
        interfaceSettings: {
          theme: 'system',
          language: 'eng'
        },
        opportunityPreferences: {
          preferredCategories: [],
          minimumReward: 0,
          preferredDifficulty: 'all',
          timeCommitment: 'medium'
        },
        privacySettings: {
          profileVisibility: 'private',
          submissionVisibility: 'public',
          skillsVisibility: 'private',
          reputationVisibility: 'private',
          contactabilityBySponsors: 'none'
        }
      },
      skills: {
        primarySkills: [
          { name: 'Node.js', level: 'expert' },
          { name: 'MongoDB', level: 'advanced' }
        ],
        secondarySkills: [],
        skillTrajectory: {
          improvementRate: 0,
          consistencyScore: 0
        }
      },
      reputation: {
        overallScore: 0,
        metrics: {
          taskCompletionRate: 0,
          qualityScore: 0,
          consistencyScore: 0,
          communityContributions: 0
        },
        badges: []
      },
      contributionStats: {
        totalTasksCompleted: 0,
        totalRewardsEarned: 0,
        averageQualityRating: 0
      },
      taskIds: []
    });

    if (contributorResponse.status !== 201) {
      throw new Error(`Contributor creation failed: ${contributorResponse.data.message}`);
    }
    contributorId = contributorResponse.data.contributor._id;

    // Login contributor to get auth token
    logger.info('Logging in contributor...');
    const contributorLoginResponse = await api.contributor.login({
      email: 'test.contributor@example.com'
    });

    if (contributorLoginResponse.status !== 200) {
      throw new Error(`Contributor login failed: ${contributorLoginResponse.data.message}`);
    }
    const contributorAuthToken = contributorLoginResponse.data.token;
    logger.info('Contributor login successful');

    // Test 1: Create submission
    logger.info('Testing submission creation...');
    const createResponse = await api.submission.create({
      submission: {
        taskId: taskId,
        contributorId: contributorId,
        walletAddress: testContributorWallet,
        submissions: ['https://github.com/test-submission/repo'],
        grading: null,
        isAccepted: false
      }
    }, contributorAuthToken);

    if (createResponse.status !== 201) {
      throw new Error(`Submission creation failed: ${createResponse.data.message}`);
    }
    submissionId = createResponse.data.submission.id;
    logger.info('Submission creation successful');

    // Test 2: Fetch submission
    logger.info('Testing submission retrieval...');
    const submissionsResponse = await api.submission.fetchSubmissions(contributorAuthToken, taskId, contributorId, testContributorWallet);
    assert.strictEqual(submissionsResponse.status, 200);
    assert(Array.isArray(submissionsResponse.data.submissions));
    assert(submissionsResponse.data.submissions.length > 0);
    assert(submissionsResponse.data.submissions[0].taskId === taskId);
    assert(submissionsResponse.data.submissions[0].walletAddress === testContributorWallet);
    logger.info('Submission retrieval successful');

    // Test 3: Delete submission
    logger.info('Testing submission deletion...');
    const deleteResponse = await api.submission.delete({
      submissionId: submissionId
    }, contributorAuthToken);

    if (deleteResponse.status !== 200) {
      throw new Error(`Submission deletion failed: ${deleteResponse.data.message}`);
    }
    logger.info('Submission deletion successful');

    // Cleanup: Delete test task and contributor
    await api.task.delete(taskId, sponsorAuthToken);
    await api.contributor.delete(contributorId, contributorAuthToken);

    return { status: 'passed' };
  } catch (error) {
    logger.error('Submission test failed:', error);
    // Attempt cleanup even if tests fail
    try {
      if (submissionId) await api.submission.delete({ submissionId }, contributorAuthToken);
      if (taskId) await api.task.delete(taskId, sponsorAuthToken);
      if (contributorId) await api.contributor.delete(contributorId, contributorAuthToken);
    } catch (cleanupError) {
      logger.error('Cleanup after test failure encountered an error:', cleanupError);
    }
    return { status: 'failed', error };
  }
};

async function cleanup(api) {
  try {
    // Clean up test contributor
    if (contributorId) {
      logger.info('Cleaning up test contributor...');
      await api.contributor.delete(contributorId);
      logger.info('Test contributor cleaned up successfully');
    }

    // Clean up test sponsor
    if (sponsorId) {
      logger.info('Cleaning up test sponsor...');
      await api.sponsor.delete(sponsorId);
      logger.info('Test sponsor cleaned up successfully');
    }

    // Clean up test task
    if (taskId) {
      logger.info('Cleaning up test task...');
      await api.task.delete(taskId);
      logger.info('Test task cleaned up successfully');
    }
  } catch (error) {
    logger.error('Cleanup failed:', error.message);
  }
}

module.exports = {
  runSubmissionTests
}; 