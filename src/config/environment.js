const dotenv = require('dotenv');

// Load environment variables
console.log('\n=== Environment Initialization ===');
console.log('Current Environment:', process.env.NODE_ENV || 'development');
console.log('Railway Environment:', process.env.RAILWAY_ENVIRONMENT || 'not set');
console.log('Running in Railway:', !!process.env.RAILWAY_ENVIRONMENT);

// Force production mode in Railway
if (process.env.RAILWAY_ENVIRONMENT) {
  process.env.NODE_ENV = 'production';
  console.log('\n=== Railway Production Environment ===');
  console.log('Service Name:', process.env.RAILWAY_SERVICE_NAME);
  console.log('Project Name:', process.env.RAILWAY_PROJECT_NAME);
  console.log('Environment:', process.env.RAILWAY_ENVIRONMENT_NAME);
  console.log('Private Domain:', process.env.RAILWAY_PRIVATE_DOMAIN);
  console.log('Public Domain:', process.env.RAILWAY_PUBLIC_DOMAIN);
  console.log('Static URL:', process.env.RAILWAY_STATIC_URL);
  
  // Debug environment variables in production
  console.log('\n=== Environment Variables Status ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  
  // Check critical environment variables
  const criticalVars = ['MONGO_URI_PROD', 'JWT_SECRET', 'AUTH_SECRET'];
  criticalVars.forEach(varName => {
    const exists = !!process.env[varName];
    const value = exists ? (varName.includes('SECRET') || varName.includes('URI') ? '****' : process.env[varName]) : 'undefined';
    console.log(`${varName}: ${exists ? 'exists' : 'missing'} (${value})`);
  });
  
  // Log all available environment variables (excluding secrets)
  console.log('\n=== Available Environment Variables ===');
  Object.keys(process.env).forEach(key => {
    if (!key.includes('SECRET') && !key.includes('URI')) {
      console.log(`${key}: ${process.env[key]}`);
    }
  });
} else {
  // Load .env file only in development
  console.log('\n=== Loading Development Environment ===');
  dotenv.config();
  console.log('Loaded .env file');
}

// Define environment variables with defaults
const env = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI_DEV: process.env.MONGO_URI_DEV,
  MONGO_URI_PROD: process.env.MONGO_URI_PROD,
  JWT_SECRET: process.env.JWT_SECRET,
  AUTH_SECRET: process.env.AUTH_SECRET,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING === 'true',
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  ENABLE_REQUEST_LOGGING: process.env.ENABLE_REQUEST_LOGGING === 'true',
  ENABLE_SWAGGER: process.env.ENABLE_SWAGGER === 'true'
};

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI_PROD', 'PORT', 'JWT_SECRET', 'AUTH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error('\n=== Missing Required Environment Variables ===');
  console.error('Missing variables:', missingEnvVars.join(', '));
  console.error('Current environment:', process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV);
  console.error('\nAvailable environment variables:', Object.keys(process.env).join(', '));
  console.error('\nEnvironment variable values:');
  requiredEnvVars.forEach(varName => {
    console.error(`${varName}: ${varName.includes('SECRET') ? '****' : process.env[varName]}`);
  });
  
  // In production, throw error. In development, use defaults
  if (process.env.NODE_ENV === 'production') {
    console.error('\n=== Deployment Error ===');
    console.error('Required environment variables are missing in production environment');
    console.error('Please verify the following variables are set in Railway:');
    missingEnvVars.forEach(varName => {
      console.error(`- ${varName}`);
    });
    console.error('\nTo set these variables in Railway:');
    console.error('1. Go to your Railway project dashboard');
    console.error('2. Click on your service (portal-jb-backend)');
    console.error('3. Go to the "Variables" tab');
    console.error('4. Add the following variables:');
    console.error('   MONGO_URI_PROD=your_mongodb_uri');
    console.error('   JWT_SECRET=your_jwt_secret');
    console.error('   AUTH_SECRET=your_auth_secret');
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  } else {
    console.warn('\n=== Using Default Values for Development ===');
    // Set default values for development
    process.env.MONGO_URI_PROD = process.env.MONGO_URI_PROD || process.env.MONGO_URI_DEV;
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'development_jwt_secret';
    process.env.AUTH_SECRET = process.env.AUTH_SECRET || 'development_auth_secret';
  }
}

// Log environment variables (safely)
console.log('\n=== Application Configuration ===');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);
console.log('Log Level:', process.env.LOG_LEVEL || 'info');
console.log('Rate Limiting:', process.env.ENABLE_RATE_LIMITING === 'true');
console.log('Request Logging:', process.env.ENABLE_REQUEST_LOGGING === 'true');
console.log('Swagger:', process.env.ENABLE_SWAGGER === 'true');

module.exports = env; 