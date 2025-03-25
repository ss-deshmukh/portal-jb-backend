const app = require('../../server');
const mongoose = require('mongoose');
const logger = require('../../utils/logger');

let server = null;

const startTestServer = async () => {
  try {
    // Connect to database
    logger.info('Connecting to production database...');
    await mongoose.connect(process.env.MONGO_URI_PROD);
    logger.info('Connected to production database');

    // Set test port explicitly
    process.env.PORT = '5001';
    process.env.TEST_PORT = '5001';

    // Start server
    server = app.listen(process.env.PORT, () => {
      logger.info(`Test server is running on port ${process.env.PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start test server:', error);
    throw error;
  }
};

const stopTestServer = async () => {
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      logger.info('Test server stopped');
    }
    await mongoose.disconnect();
    logger.info('Disconnected from database');
  } catch (error) {
    logger.error('Error stopping test server:', error);
    throw error;
  }
};

module.exports = {
  startTestServer,
  stopTestServer
}; 