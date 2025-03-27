const mongoose = require('mongoose');
const logger = require('../utils/logger');

const getMongoUri = () => {
  const env = process.env.NODE_ENV || 'development';
  
  // Log available environment variables for debugging
  logger.info('Available environment variables:', Object.keys(process.env).join(', '));
  logger.info('Current environment:', env);
  
  // Use MONGODB_URI if available, otherwise fall back to environment-specific URIs
  if (process.env.MONGODB_URI) {
    logger.info('Using MONGODB_URI environment variable');
    return process.env.MONGODB_URI;
  }
  
  // Fallback to environment-specific URIs
  switch (env) {
    case 'production':
      if (!process.env.MONGO_URI_PROD) {
        logger.error('Neither MONGODB_URI nor MONGO_URI_PROD is defined');
        throw new Error('Database connection string is not defined');
      }
      logger.info('Using production MongoDB URI');
      return process.env.MONGO_URI_PROD;
    case 'test':
    case 'development':
    default:
      if (!process.env.MONGO_URI_DEV) {
        logger.error('Neither MONGODB_URI nor MONGO_URI_DEV is defined');
        throw new Error('Database connection string is not defined');
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