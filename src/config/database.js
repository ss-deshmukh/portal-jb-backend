const mongoose = require('mongoose');
const logger = require('../utils/logger');

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// Connection state
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000; // 5 seconds

// Handle connection events
mongoose.connection.on('connected', () => {
  isConnected = true;
  reconnectAttempts = 0;
  logger.info('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.info('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  reconnectAttempts = 0;
  logger.info('MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    logger.error('Error during MongoDB connection closure:', err);
    process.exit(1);
  }
});

// Reconnection logic
const reconnect = async () => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    logger.error('Max reconnection attempts reached. Please check your MongoDB connection.');
    return;
  }

  reconnectAttempts++;
  logger.info(`Attempting to reconnect to MongoDB (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);

  try {
    await mongoose.connect(process.env.MONGODB_URI, options);
  } catch (err) {
    logger.error('Reconnection attempt failed:', err);
    setTimeout(reconnect, RECONNECT_INTERVAL);
  }
};

// Main connection function
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    logger.info('Attempting to connect to MongoDB...');
    logger.debug('MongoDB URI:', uri.replace(/:([^@]+)@/, ':****@')); // Log URI with password hidden
    
    const conn = await mongoose.connect(uri, options);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    await reconnect();
    throw error;
  }
};

// Export the connection function and connection state
module.exports = {
  connectDB,
  isConnected: () => isConnected,
  getConnection: () => mongoose.connection
}; 