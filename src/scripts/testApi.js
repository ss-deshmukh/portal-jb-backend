const { spawn } = require('child_process');
const { runAllTests } = require('../utils/testUtils');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const Contributor = require('../models/Contributor');
const Sponsor = require('../models/Sponsor');
const Task = require('../models/Task');
const Skill = require('../models/Skill');
const Submission = require('../models/Submission');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Function to clean up test data
const cleanupTestData = async () => {
  try {
    logger.info('Cleaning up test data...');
    await Promise.all([
      Contributor.deleteMany({}),
      Sponsor.deleteMany({}),
      Task.deleteMany({}),
      Skill.deleteMany({}),
      Submission.deleteMany({})
    ]);
    logger.info('Test data cleanup completed');
  } catch (error) {
    logger.error('Error cleaning up test data:', error);
    throw error;
  }
};

// Function to wait for server to be ready
const waitForServer = (port) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const timeout = 10000; // 10 seconds timeout

    const checkServer = () => {
      const http = require('http');
      const req = http.get(`http://localhost:${port}`, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`Server returned status code ${res.statusCode}`));
        }
      });

      req.on('error', () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error('Server startup timeout'));
        } else {
          setTimeout(checkServer, 100);
        }
      });
    };

    checkServer();
  });
};

// Function to start the server
const startServer = () => {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['src/server.js'], {
      stdio: 'pipe',
      shell: true,
      env: { ...process.env } // Pass environment variables to child process
    });

    // Handle server output
    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      
      // Check if server is ready
      if (output.includes('Server is running on port')) {
        resolve(server);
      }
    });

    server.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });

    server.on('error', (err) => {
      reject(err);
    });

    // Store server process for cleanup
    global.testServer = server;
  });
};

// Function to stop the server
const stopServer = () => {
  return new Promise((resolve) => {
    if (global.testServer) {
      global.testServer.kill();
      resolve();
    } else {
      resolve();
    }
  });
};

// Main test function
const runTests = async () => {
  let server;
  
  try {
    // Validate required environment variables
    if (!process.env.MONGO_URI_DEV) {
      throw new Error('MONGO_URI_DEV environment variable is required');
    }

    // Connect to database
    logger.info('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI_DEV);
    logger.info('Connected to database');

    // Clean up test data
    await cleanupTestData();

    // Start server
    logger.info('Starting server...');
    server = await startServer();
    
    // Wait for server to be ready
    logger.info('Waiting for server to be ready...');
    await waitForServer(5001);
    
    // Run tests
    logger.info('Running API tests...');
    await runAllTests();
    
    logger.info('All tests completed successfully!');
  } catch (error) {
    logger.error('Test failed:', error);
    process.exit(1);
  } finally {
    // Stop server
    logger.info('Stopping server...');
    await stopServer();
    
    // Disconnect from database
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      logger.info('Disconnected from database');
    }
    
    process.exit(0);
  }
};

// Run the tests
runTests(); 