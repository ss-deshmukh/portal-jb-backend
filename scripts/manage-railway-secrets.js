const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Read the .env.example file
const envExample = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');

// Parse environment variables from .env.example
const envVars = envExample
  .split('\n')
  .filter(line => line.trim() && !line.startsWith('#'))
  .map(line => {
    const [key] = line.split('=');
    return key.trim();
  });

// Railway API configuration
const RAILWAY_API_URL = 'https://api.railway.app/graphql/v2';
const RAILWAY_API_KEY = process.env.RAILWAY_API_KEY;

if (!RAILWAY_API_KEY) {
  console.error('❌ RAILWAY_API_KEY environment variable is required');
  process.exit(1);
}

// Function to set a variable in Railway
async function setRailwayVariable(key, value) {
  try {
    const response = await axios.post(
      RAILWAY_API_URL,
      {
        query: `
          mutation SetVariable($key: String!, $value: String!, $projectId: String!) {
            variableSet(key: $key, value: $value, projectId: $projectId) {
              key
              value
            }
          }
        `,
        variables: {
          key,
          value,
          projectId: process.env.RAILWAY_PROJECT_ID
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${RAILWAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    console.log(`✅ Set ${key} in Railway`);
  } catch (error) {
    console.error(`❌ Failed to set ${key} in Railway:`, error.message);
  }
}

// Function to get all variables from Railway
async function getRailwayVariables() {
  try {
    const response = await axios.post(
      RAILWAY_API_URL,
      {
        query: `
          query GetVariables($projectId: String!) {
            variables(projectId: $projectId) {
              key
              value
            }
          }
        `,
        variables: {
          projectId: process.env.RAILWAY_PROJECT_ID
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${RAILWAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.variables.map(v => v.key);
  } catch (error) {
    console.error('❌ Failed to get Railway variables:', error.message);
    return [];
  }
}

// Function to sync variables from .env to Railway
async function syncVariablesToRailway() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envValues = envContent
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {});

  // Set each variable in Railway
  for (const [key, value] of Object.entries(envValues)) {
    await setRailwayVariable(key, value);
  }

  console.log('✅ Synced all variables to Railway');
}

// Function to verify Railway variables
async function verifyRailwayVariables() {
  const railwayVariables = await getRailwayVariables();
  const missingVariables = envVars.filter(key => !railwayVariables.includes(key));

  if (missingVariables.length > 0) {
    console.error('❌ Missing variables in Railway:');
    missingVariables.forEach(variable => console.error(`  - ${variable}`));
    process.exit(1);
  }

  console.log('✅ All required variables are set in Railway');
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'sync':
    syncVariablesToRailway();
    break;
  case 'verify':
    verifyRailwayVariables();
    break;
  default:
    console.log(`
Usage:
  node manage-railway-secrets.js <command>

Commands:
  sync    - Sync variables from .env to Railway
  verify  - Verify all required variables are set in Railway

Required environment variables:
  RAILWAY_API_KEY     - Your Railway API key
  RAILWAY_PROJECT_ID  - Your Railway project ID
    `);
    process.exit(1);
} 