const mongoose = require('mongoose');
const logger = require('../utils/logger');

const getMongoUri = () => {
  const env = process.env.NODE_ENV || 'development';
  
  // Log available environment variables for debugging
  logger.info('Available environment variables:', Object.keys(process.env).join(', '));
  logger.info('Current environment:', env);
  
  switch (env) {
    case 'production':
      if (!process.env.MONGO_URI_PROD) {
        logger.error('MONGO_URI_PROD is not defined in environment variables');
        throw new Error('MONGO_URI_PROD is not defined in environment variables');
      }
      logger.info('Using production MongoDB URI');
      return process.env.MONGO_URI_PROD;
    case 'test':
    case 'development':
    default:
      if (!process.env.MONGO_URI_DEV) {
        logger.error('MONGO_URI_DEV is not defined in environment variables');
        throw new Error('MONGO_URI_DEV is not defined in environment variables');
      }
      logger.info('Using development MongoDB URI');
      return process.env.MONGO_URI_DEV;
  }
};

const connectDB = async () => {
  try {
    const mongoUri = getMongoUri();
    const env = process.env.NODE_ENV || 'development';
    
    logger.info(`Connecting to MongoDB (${env} environment)...`);
    logger.info('MongoDB URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')); // Log URI without credentials
    
    const conn = await mongoose.connect(mongoUri);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = { connectDB }; 