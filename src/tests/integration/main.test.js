/**
 * Integration Test Suite for Portal Job Board
 * 
 * By default, this test suite connects to the test database.
 * To run these tests against production, you must:
 * 1. Set NODE_ENV=production
 * 2. Set ALLOW_PRODUCTION_TESTS=true
 * 3. Set USE_PRODUCTION_DB=true
 * 4. Have valid production database credentials in your .env file
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
const checkEnvironmentSafety = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const useProductionDb = process.env.USE_PRODUCTION_DB === 'true';
  
  if (isProduction && !process.env.ALLOW_PRODUCTION_TESTS) {
    throw new Error('Production tests are not allowed. Set ALLOW_PRODUCTION_TESTS=true to proceed');
  }

  if (useProductionDb) {
    if (!process.env.MONGO_URI_PROD || !process.env.MONGO_URI_PROD.includes('portal-jb')) {
      throw new Error('Invalid or missing production database URI');
    }
    logger.warn('Running tests against production database. This is not recommended for regular testing.');
  } else {
    if (!process.env.MONGO_URI_DEV || !process.env.MONGO_URI_DEV.includes('test')) {
      throw new Error('Invalid or missing test database URI');
    }
    logger.info('Running tests against test database');
  }
};

// Main test runner
const runIntegrationTests = async (testGroups = []) => {
  try {
    // Safety checks
    checkEnvironmentSafety();
    
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
            recordTestResult('Contributor Tests', result.status === 'success' ? 'passed' : result.status, result.error);
            break;
          case 'sponsor':
            result = await runSponsorTests(api);
            recordTestResult('Sponsor Tests', result.status === 'success' ? 'passed' : result.status, result.error);
            break;
          case 'task':
            result = await runTaskTests(api);
            recordTestResult('Task Tests', result.status === 'success' ? 'passed' : result.status, result.error);
            break;
          case 'skill':
            result = await runSkillTests(api);
            recordTestResult('Skill Tests', result.status === 'success' ? 'passed' : result.status, result.error);
            break;
          case 'submission':
            result = await runSubmissionTests(api);
            recordTestResult('Submission Tests', result.status === 'success' ? 'passed' : result.status, result.error);
            break;
          default:
            throw new Error(`Unknown test group: ${testGroup}`);
        }
      }
    } else {
      logger.info('Running all test groups...');
      // Run all test suites
      const contributorResult = await runContributorTests(api);
      recordTestResult('Contributor Tests', contributorResult.status === 'success' ? 'passed' : contributorResult.status, contributorResult.error);

      const sponsorResult = await runSponsorTests(api);
      recordTestResult('Sponsor Tests', sponsorResult.status === 'success' ? 'passed' : sponsorResult.status, sponsorResult.error);

      const taskResult = await runTaskTests(api);
      recordTestResult('Task Tests', taskResult.status === 'success' ? 'passed' : taskResult.status, taskResult.error);

      const skillResult = await runSkillTests(api);
      recordTestResult('Skill Tests', skillResult.status === 'success' ? 'passed' : skillResult.status, skillResult.error);

      const submissionResult = await runSubmissionTests(api);
      recordTestResult('Submission Tests', submissionResult.status === 'success' ? 'passed' : submissionResult.status, submissionResult.error);
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