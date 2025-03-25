#!/usr/bin/env node

const { runIntegrationTests } = require('../tests/integration/main.test');
const logger = require('../utils/logger');

// Parse command line arguments
const args = process.argv.slice(2);
const testGroups = args
  .filter(arg => arg.startsWith('--test-group='))
  .map(arg => arg.split('=')[1]);

// Run the integration tests
const main = async () => {
  try {
    logger.info('Starting integration tests...');
    logger.info('Environment:', process.env.NODE_ENV);
    logger.info('Test groups:', testGroups.length ? testGroups.join(', ') : 'all');
    
    await runIntegrationTests(testGroups);
    
    logger.info('Integration tests completed successfully');
  } catch (error) {
    logger.error('Integration tests failed:', error);
    process.exit(1);
  }
};

main(); 