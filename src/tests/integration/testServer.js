const app = require('../../server');
const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const path = require('path');
const dotenv = require('dotenv');

let server = null;

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') });

const connectWithRetry = async (uri, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await mongoose.connect(uri);
      logger.info('Successfully connected to MongoDB');
      return;
    } catch (error) {
      logger.error(`MongoDB connection attempt ${i + 1} failed:`, error.message);
      if (i === maxRetries - 1) throw error;
      // Wait for 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

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

    // Connect to database with retry
    logger.info(`Connecting to ${dbName} database...`);
    await connectWithRetry(dbUri);
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

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

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