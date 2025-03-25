/**
 * Integration Test Suite for Portal Job Board
 * 
 * WARNING: This test suite connects to the production database.
 * To run these tests, you must:
 * 1. Set NODE_ENV=production
 * 2. Set ALLOW_PRODUCTION_TESTS=true
 * 3. Have valid production database credentials in your .env file
 */

const logger = require('../../utils/logger');
const { startTestServer, stopTestServer } = require('./testServer');
const api = require('./testClient');
const { initializeTestMetrics, recordTestResult, generateReport } = require('./testUtils');

// Import test suites
const { runContributorTests } = require('./contributor.test');
const { runSponsorTests } = require('./sponsor.test');
const { runTaskTests } = require('./task.test');
const { runSkillTests } = require('./skill.test');
const { runSubmissionTests } = require('./submission.test');

// Safety check function
const checkProductionSafety = () => {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('Integration tests can only run in production environment');
  }
  if (process.env.ALLOW_PRODUCTION_TESTS !== 'true') {
    throw new Error('Production tests are not allowed. Set ALLOW_PRODUCTION_TESTS=true to proceed');
  }
  if (!process.env.MONGO_URI_PROD || !process.env.MONGO_URI_PROD.includes('portal-jb')) {
    throw new Error('Invalid or missing production database URI');
  }
};

// Main test runner
const runIntegrationTests = async (testGroups = []) => {
  try {
    // Safety checks
    checkProductionSafety();
    
    // Initialize metrics
    initializeTestMetrics();
    
    // Start test server
    logger.info('Starting test server...');
    await startTestServer();
    logger.info('Test server started successfully');

    // Run specified test groups or all tests
    if (testGroups && testGroups.length > 0) {
      for (const testGroup of testGroups) {
        logger.info(`Running ${testGroup} tests...`);
        let result;
        
        switch (testGroup) {
          case 'contributor':
            result = await runContributorTests(api);
            recordTestResult('Contributor Tests', result.status, result.error);
            break;
          case 'sponsor':
            result = await runSponsorTests(api);
            recordTestResult('Sponsor Tests', result.status, result.error);
            break;
          case 'task':
            result = await runTaskTests(api);
            recordTestResult('Task Tests', result.status, result.error);
            break;
          case 'skill':
            result = await runSkillTests(api);
            recordTestResult('Skill Tests', result.status, result.error);
            break;
          case 'submission':
            result = await runSubmissionTests(api);
            recordTestResult('Submission Tests', result.status, result.error);
            break;
          default:
            throw new Error(`Unknown test group: ${testGroup}`);
        }
      }
    } else {
      logger.info('Running all test groups...');
      // Run all test suites
      const contributorResult = await runContributorTests(api);
      recordTestResult('Contributor Tests', contributorResult.status, contributorResult.error);

      const sponsorResult = await runSponsorTests(api);
      recordTestResult('Sponsor Tests', sponsorResult.status, sponsorResult.error);

      const taskResult = await runTaskTests(api);
      recordTestResult('Task Tests', taskResult.status, taskResult.error);

      const skillResult = await runSkillTests(api);
      recordTestResult('Skill Tests', skillResult.status, skillResult.error);

      const submissionResult = await runSubmissionTests(api);
      recordTestResult('Submission Tests', submissionResult.status, submissionResult.error);
    }

    // Generate report
    generateReport();

    // Stop test server
    await stopTestServer();
    logger.info('Test server stopped');

  } catch (error) {
    logger.error('Integration test suite failed:', error);
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runIntegrationTests();
}

// Export the test runner
module.exports = {
  runIntegrationTests
}; 