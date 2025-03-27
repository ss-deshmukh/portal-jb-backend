const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

// Load environment variables
if (process.env.NODE_ENV === 'production') {
  // In production, we don't need to load .env file as Railway provides environment variables
  console.log('Running in production mode, using Railway environment variables');
} else {
  dotenv.config();
}

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI_DEV', 'MONGO_URI_PROD', 'PORT', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Current environment:', process.env.NODE_ENV);
  console.error('Available environment variables:', Object.keys(process.env).join(', '));
  process.exit(1);
}

// Import custom modules
const { connectDB } = require('./config/database');
const { auth, authorize, hasPermission } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import routes
const contributorRoutes = require('./routes/contributorRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const taskRoutes = require('./routes/taskRoutes');
const skillRoutes = require('./routes/skillRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

// Create Express app
const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log startup information
logger.info('Starting Portal JB Backend...');
logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`Port: ${process.env.PORT || 5000}`);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false, // Disable COEP for development
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
  crossOriginOpenerPolicy: { policy: "unsafe-none" } // Allow cross-origin window opening
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? true // Allow all origins in development
    : process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
})); // Enable CORS
app.use(express.json({ limit: '10kb' })); // Body parser with size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Enable cookie parsing
app.use(cookieParser());

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: 'error',
      message: message
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: true, // Don't count successful requests against the limit
    keyGenerator: (req) => {
      // Use IP + user agent as the key to better identify unique users
      return `${req.ip}-${req.headers['user-agent']}`;
    }
  });
};

// Different rate limits for different endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many login attempts. Please try again later.'
);

const apiLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  100, // 100 requests per minute
  'Too many requests. Please try again later.'
);

// Apply rate limiting to specific routes
app.use('/api/contributor/login', authLimiter);
app.use('/api/sponsor/login', authLimiter);

// Apply auth middleware to protected API routes only
app.use('/api/contributor/profile', auth);
app.use('/api/contributor/update', auth);
app.use('/api/contributor/delete', auth);
app.use('/api/sponsor/profile', auth);
app.use('/api/sponsor/update', auth);
app.use('/api/sponsor/delete', auth);
app.use('/api/task', auth);
app.use('/api/submission', auth);

// Compression middleware
app.use(compression());

// HTTP request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Connect to MongoDB
connectDB().catch(err => {
  logger.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Public routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Portal JB API' });
});

// Health check endpoint (public)
app.get('/api/health', (req, res) => {
  const health = {
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host,
      database: mongoose.connection.name
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };

  res.json(health);
});

// API routes
app.use('/api/contributor', contributorRoutes);
app.use('/api/sponsor', sponsorRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/skill', skillRoutes);
app.use('/api/submission', submissionRoutes);

// Protected routes example
app.get('/api/protected', auth, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

// Role-based route example
app.get('/api/admin', auth, authorize('admin'), (req, res) => {
  res.json({ message: 'This is an admin-only route' });
});

// Permission-based route example
app.get('/api/tasks', auth, hasPermission('read:tasks'), (req, res) => {
  res.json({ message: 'This is a tasks route requiring read permission' });
});

// 404 handler
app.use((req, res, next) => {
  logger.warn(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Not Found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });
  errorHandler(err, req, res, next);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Close server & exit process
  process.exit(1);
});

// Start server only if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Handle server shutdown gracefully
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      logger.info('Process terminated!');
    });
  });
}

module.exports = app; 