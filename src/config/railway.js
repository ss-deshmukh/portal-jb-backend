// Railway environment configuration
const railwayConfig = {
  // Check if we're running in Railway
  isRailway: !!process.env.RAILWAY_ENVIRONMENT,
  
  // Get Railway-specific variables
  serviceName: process.env.RAILWAY_SERVICE_NAME,
  projectName: process.env.RAILWAY_PROJECT_NAME,
  environmentName: process.env.RAILWAY_ENVIRONMENT_NAME,
  privateDomain: process.env.RAILWAY_PRIVATE_DOMAIN,
  publicDomain: process.env.RAILWAY_PUBLIC_DOMAIN,
  staticUrl: process.env.RAILWAY_STATIC_URL,
  
  // Get deployment information
  deploymentId: process.env.RAILWAY_DEPLOYMENT_ID,
  projectId: process.env.RAILWAY_PROJECT_ID,
  environmentId: process.env.RAILWAY_ENVIRONMENT_ID,
  
  // Get Git information
  gitAuthor: process.env.RAILWAY_GIT_AUTHOR,
  gitBranch: process.env.RAILWAY_GIT_BRANCH,
  
  // Get replica information
  replicaId: process.env.RAILWAY_REPLICA_ID,
  replicaRegion: process.env.RAILWAY_REPLICA_REGION,
  
  // Get snapshot information
  snapshotId: process.env.RAILWAY_SNAPSHOT_ID,
  
  // Get beta features
  betaEnableRuntimeV2: process.env.RAILWAY_BETA_ENABLE_RUNTIME_V2 === '1'
};

// Log Railway configuration
console.log('\n=== Railway Configuration ===');
Object.entries(railwayConfig).forEach(([key, value]) => {
  console.log(`${key}: ${value || 'not set'}`);
});

module.exports = railwayConfig; 