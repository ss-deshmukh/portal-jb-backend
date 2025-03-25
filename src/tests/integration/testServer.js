const app = require('../../server');
const mongoose = require('mongoose');
const logger = require('../../utils/logger');

let server = null;

const startTestServer = async () => {
  try {
    // Disconnect from any existing connection
    if (mongoose.connection.readyState !== 0) {
      logger.info('Disconnecting from existing database connection...');
      await mongoose.disconnect();
    }

    // Determine which database to use
    const useProductionDb = process.env.USE_PRODUCTION_DB === 'true';
    const dbUri = useProductionDb ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_DEV;
    const dbName = useProductionDb ? 'production' : 'test';

    // Connect to database
    logger.info(`Connecting to ${dbName} database...`);
    await mongoose.connect(dbUri);
    logger.info(`Connected to ${dbName} database`);

    // Set test port explicitly
    process.env.PORT = '5001';
    process.env.TEST_PORT = '5001';

    // Start server
    server = app.listen(process.env.PORT, () => {
      logger.info(`Test server is running on port ${process.env.PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Database: ${dbName}`);
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
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.info('Disconnected from database');
    }
  } catch (error) {
    logger.error('Error stopping test server:', error);
    throw error;
  }
};

module.exports = {
  startTestServer,
  stopTestServer
}; 