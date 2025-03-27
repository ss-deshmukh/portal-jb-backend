#!/usr/bin/env node

const { spawn } = require('child_process');
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
    
    // Run Jest CLI
    const jest = spawn('npx', ['jest', 'src/tests/integration', '--verbose'], {
      stdio: 'inherit',
      shell: true
    });

    jest.on('close', (code) => {
      if (code === 0) {
        logger.info('Integration tests completed successfully');
      } else {
        logger.error('Integration tests failed');
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error('Integration tests failed:', error);
    process.exit(1);
  }
};

main(); 