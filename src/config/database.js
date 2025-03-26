const mongoose = require('mongoose');
const logger = require('../utils/logger');

const getMongoUri = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      if (!process.env.MONGO_URI_PROD) {
        throw new Error('MONGO_URI_PROD is not defined in environment variables');
      }
      return process.env.MONGO_URI_PROD;
    case 'test':
    case 'development':
    default:
      if (!process.env.MONGO_URI_DEV) {
        throw new Error('MONGO_URI_DEV is not defined in environment variables');
      }
      return process.env.MONGO_URI_DEV;
  }
};

const connectDB = async () => {
  try {
    const mongoUri = getMongoUri();
    const env = process.env.NODE_ENV || 'development';
    
    logger.info(`Connecting to MongoDB (${env} environment)...`);
    
    const conn = await mongoose.connect(mongoUri);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = { connectDB }; 