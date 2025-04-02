const axios = require('axios');
const winston = require('winston');

// Create a test logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()]
});

// Production API configuration
const PROD_BASE_URL = 'https://portal-jb-backend-production.up.railway.app/api';
const prodClient = axios.create({
  baseURL: PROD_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable cookie handling
});

// Add response interceptor for better error logging and cookie handling
prodClient.interceptors.response.use(
  response => {
    // Extract and store session cookie if present
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      const sessionCookie = cookies.find(cookie => cookie.startsWith('next-auth.session-token='));
      if (sessionCookie) {
        const token = sessionCookie.split(';')[0].split('=')[1];
        // Set the cookie for subsequent requests
        prodClient.defaults.headers.common['Cookie'] = `next-auth.session-token=${token}`;
        logger.info('Session cookie set successfully');
      }
    }
    return response;
  },
  error => {
    if (error.response) {
      logger.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.response.config.url,
        method: error.response.config.method,
        headers: error.response.headers
      });
    } else if (error.request) {
      logger.error('No response received:', {
        method: error.request.method,
        url: error.request.url,
        headers: error.request.headers
      });
    } else {
      logger.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Sample test data (from sample-data/contributors.json)
const sampleContributor = {
  basicInfo: {
    email: "alice@example.com",
    displayName: "Alice",
    bio: "Experienced smart contract developer",
    profileImage: "https://example.com/profiles/alice.png",
    joinDate: "2024-01-01T00:00:00Z",
    walletAddress: "0x1111111111111111111111111111111111111111",
    website: "https://alice.dev",
    x: "@alice",
    discord: "alice#1234",
    telegram: "@alice"
  },
  contactPreferences: {
    emailNotifications: true,
    newsletterSubscription: {
      subscribed: true,
      interests: ["Smart Contracts", "DeFi"]
    },
    canBeContactedBySponsors: true
  },
  preferences: {
    interfaceSettings: {
      theme: "dark",
      language: "en"
    },
    opportunityPreferences: {
      preferredCategories: ["Smart Contracts", "Security"],
      minimumReward: 3000,
      preferredDifficulty: "expert",
      timeCommitment: "full-time"
    },
    privacySettings: {
      profileVisibility: "public",
      submissionVisibility: "public",
      skillsVisibility: "public",
      reputationVisibility: "public",
      contactabilityBySponsors: "public"
    }
  },
  skills: {
    primarySkills: [
      { skillId: "skill_001", level: "expert" },
      { skillId: "skill_002", level: "expert" }
    ],
    secondarySkills: [
      { skillId: "skill_003", level: "expert" },
      { skillId: "skill_004", level: "advanced" }
    ],
    skillTrajectory: {
      improvementRate: 0.95,
      consistencyScore: 0.98
    }
  }
};

async function runTests() {
  let authToken = null;
  let testContributorId = null;
  let availableSkills = [];

  // Test 1: Health Check
  logger.info('Testing health endpoint...');
  try {
    const healthResponse = await prodClient.get('/health');
    logger.info('Health check response:', healthResponse.data);
    
    // Log database connection details
    if (healthResponse.data.database) {
      logger.info('Database connection details:', {
        status: healthResponse.data.database.status,
        host: healthResponse.data.database.host,
        database: healthResponse.data.database.database
      });
    }
  } catch (error) {
    logger.error('Health check test failed:', error.message);
  }

  // Test 1.1: Fetch Available Skills
  logger.info('Fetching available skills from the database...');
  try {
    logger.info('Making request to:', `${PROD_BASE_URL}/skill/all`);
    const skillsResponse = await prodClient.get('/skill/all');
    logger.info('Skills response:', skillsResponse.data);
    availableSkills = skillsResponse.data.skills || [];
    logger.info(`Found ${availableSkills.length} skills in the database`);
    
    // Log the first few skills for verification
    if (availableSkills.length > 0) {
      logger.info('Sample skills:', availableSkills.slice(0, 5));
    }
    
    // Verify that the skills we need for testing exist
    const requiredSkillIds = ['skill_001', 'skill_002', 'skill_003', 'skill_004'];
    const missingSkillIds = requiredSkillIds.filter(id => 
      !availableSkills.some(skill => skill.id === id)
    );
    
    if (missingSkillIds.length > 0) {
      logger.warn(`Warning: The following skill IDs are missing from the database: ${missingSkillIds.join(', ')}`);
      logger.warn('The test may fail if these skills are required.');
    } else {
      logger.info('✅ All required skill IDs found in the database');
    }
  } catch (error) {
    logger.error('Failed to fetch skills:', error.message);
  }

  // Test 2: Register Contributor
  logger.info('Testing contributor registration...');
  try {
    logger.info('Attempting to register contributor:', sampleContributor.basicInfo.email);

    const registerResponse = await prodClient.post('/contributor/register', {
      profile: sampleContributor
    });
    logger.info('Registration successful:', registerResponse.data);
    testContributorId = registerResponse.data.contributor._id;
  } catch (error) {
    if (error.response?.data?.message === 'Contributor already exists') {
      logger.info('Contributor already exists, continuing with login...');
    } else {
      logger.error('Registration failed:', error.message);
      if (error.response) {
        logger.error('Registration error details:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      return; // Stop testing if registration fails
    }
  }

  // Test 3: Login Contributor
  logger.info('Testing contributor login...');
  try {
    logger.info('Attempting to login with email:', sampleContributor.basicInfo.email);
    
    const loginResponse = await prodClient.post('/contributor/login', {
      email: sampleContributor.basicInfo.email
    });
    logger.info('Login successful:', loginResponse.data);

    // Extract session cookie from response headers
    const cookies = loginResponse.headers['set-cookie'];
    if (!cookies) {
      logger.error('No session cookie received from login');
      return;
    }
  } catch (error) {
    logger.error('Login failed:', error.message);
    if (error.response) {
      logger.error('Login error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    return; // Stop testing if login fails
  }

  // Test 4: Get Contributor Profile (Frontend API Call)
  logger.info('Testing get contributor profile (simulating frontend API call)...');
  try {
    // This simulates the frontend making a request to the /contributor/profile endpoint
    // The backend should use findWithSkillNames to populate skill names
    const profileResponse = await prodClient.get('/contributor/profile');
    logger.info('Profile retrieved successfully:', profileResponse.data);
    
    // Test 4.1: Verify skill names are populated by the backend
    logger.info('Testing skill name population by backend...');
    const contributor = profileResponse.data.contributor;
    
    if (contributor && contributor.skills) {
      // Check primary skills
      if (contributor.skills.primarySkills && contributor.skills.primarySkills.length > 0) {
        logger.info('Primary skills:', contributor.skills.primarySkills);
        
        // Verify that each primary skill has both skillId and name
        const primarySkillsValid = contributor.skills.primarySkills.every(skill => 
          skill.skillId && skill.name && typeof skill.name === 'string' && skill.name.length > 0
        );
        
        if (primarySkillsValid) {
          logger.info('✅ Primary skills have both skillId and name (populated by backend)');
          
          // Verify that the skill names match the ones in the database
          const primarySkillsMatch = contributor.skills.primarySkills.every(skill => {
            const dbSkill = availableSkills.find(s => s.id === skill.skillId);
            return dbSkill && dbSkill.name === skill.name;
          });
          
          if (primarySkillsMatch) {
            logger.info('✅ Primary skill names match the database (backend populated correctly)');
          } else {
            logger.error('❌ Primary skill names do not match the database (backend population issue)');
          }
        } else {
          logger.error('❌ Primary skills are missing skillId or name (backend population issue)');
        }
      } else {
        logger.error('❌ No primary skills found in contributor profile');
      }
      
      // Check secondary skills
      if (contributor.skills.secondarySkills && contributor.skills.secondarySkills.length > 0) {
        logger.info('Secondary skills:', contributor.skills.secondarySkills);
        
        // Verify that each secondary skill has both skillId and name
        const secondarySkillsValid = contributor.skills.secondarySkills.every(skill => 
          skill.skillId && skill.name && typeof skill.name === 'string' && skill.name.length > 0
        );
        
        if (secondarySkillsValid) {
          logger.info('✅ Secondary skills have both skillId and name (populated by backend)');
          
          // Verify that the skill names match the ones in the database
          const secondarySkillsMatch = contributor.skills.secondarySkills.every(skill => {
            const dbSkill = availableSkills.find(s => s.id === skill.skillId);
            return dbSkill && dbSkill.name === skill.name;
          });
          
          if (secondarySkillsMatch) {
            logger.info('✅ Secondary skill names match the database (backend populated correctly)');
          } else {
            logger.error('❌ Secondary skill names do not match the database (backend population issue)');
          }
        } else {
          logger.error('❌ Secondary skills are missing skillId or name (backend population issue)');
        }
      } else {
        logger.error('❌ No secondary skills found in contributor profile');
      }
    } else {
      logger.error('❌ Contributor profile or skills not found');
    }
  } catch (error) {
    logger.error('Get profile failed:', error.message);
  }

  // Test 5: Update Contributor Profile
  logger.info('Testing update contributor profile...');
  try {
    const updateData = {
      email: sampleContributor.basicInfo.email,
      updated: {
        basicInfo: {
          ...sampleContributor.basicInfo,
          bio: "Updated bio: Expert smart contract developer with focus on security",
        },
        skills: {
          primarySkills: [
            { id: "skill_001", level: "expert" },
            { id: "skill_002", level: "expert" }
          ],
          secondarySkills: [
            { id: "skill_003", level: "expert" },
            { id: "skill_004", level: "advanced" }
          ],
          skillTrajectory: {
            improvementRate: 0.95,
            consistencyScore: 0.98
          }
        }
      }
    };
    const updateResponse = await prodClient.put('/contributor/profile', updateData);
    logger.info('Profile updated successfully:', updateResponse.data);
  } catch (error) {
    logger.error('Update profile failed:', error.message);
  }
  
  // Test 6: Update Skill Names and Verify Contributor Profile
  logger.info('Testing skill name update and contributor profile...');
  try {
    // First, update a skill name
    const skillToUpdate = availableSkills.find(skill => skill.id === 'skill_001');
    if (!skillToUpdate) {
      logger.error('❌ Skill with ID skill_001 not found in the database');
      return;
    }
    
    const originalSkillName = skillToUpdate.name;
    const updatedSkillName = `Updated ${originalSkillName}`;
    logger.info(`Updating skill name for skill_001 from "${originalSkillName}" to "${updatedSkillName}"...`);
    
    // This would typically be done through an admin API, but for testing we'll simulate it
    // In a real test, you would call an API endpoint to update the skill name
    
    // For now, we'll just log that we would update the skill
    logger.info('Skill name would be updated in a real test environment');
    
    // Then, fetch the contributor profile again to verify the skill name is updated
    logger.info('Fetching contributor profile to verify skill name update...');
    const profileResponse = await prodClient.get('/contributor/profile');
    const contributor = profileResponse.data.contributor;
    
    if (contributor && contributor.skills) {
      // Find the skill with ID skill_001
      const updatedSkill = contributor.skills.primarySkills.find(skill => skill.skillId === 'skill_001');
      
      if (updatedSkill) {
        logger.info(`Skill with ID skill_001: ${JSON.stringify(updatedSkill)}`);
        
        // In a real test, we would verify that the skill name is updated
        // For now, we'll just log that we would verify it
        logger.info('In a real test, we would verify that the skill name is updated');
      } else {
        logger.error('❌ Skill with ID skill_001 not found in contributor profile');
      }
    } else {
      logger.error('❌ Contributor profile or skills not found');
    }
  } catch (error) {
    logger.error('Skill name update test failed:', error.message);
  }
  
  // Test 7: Get Multiple Contributors (Frontend API Call)
  logger.info('Testing get multiple contributors (simulating frontend API call)...');
  try {
    // This simulates the frontend making a request to get multiple contributors
    // The backend should use findManyWithSkillNames to populate skill names
    const contributorsResponse = await prodClient.get('/contributors');
    const contributors = contributorsResponse.data.contributors || [];
    logger.info(`Retrieved ${contributors.length} contributors`);
    
    if (contributors.length > 0) {
      // Check if skill names are populated for the first contributor
      const firstContributor = contributors[0];
      logger.info('First contributor:', firstContributor.basicInfo.displayName);
      
      if (firstContributor.skills) {
        // Check primary skills
        if (firstContributor.skills.primarySkills && firstContributor.skills.primarySkills.length > 0) {
          logger.info('Primary skills:', firstContributor.skills.primarySkills);
          
          // Verify that each primary skill has both skillId and name
          const primarySkillsValid = firstContributor.skills.primarySkills.every(skill => 
            skill.skillId && skill.name && typeof skill.name === 'string' && skill.name.length > 0
          );
          
          if (primarySkillsValid) {
            logger.info('✅ Primary skills have both skillId and name (populated by backend)');
          } else {
            logger.error('❌ Primary skills are missing skillId or name (backend population issue)');
          }
        }
        
        // Check secondary skills
        if (firstContributor.skills.secondarySkills && firstContributor.skills.secondarySkills.length > 0) {
          logger.info('Secondary skills:', firstContributor.skills.secondarySkills);
          
          // Verify that each secondary skill has both skillId and name
          const secondarySkillsValid = firstContributor.skills.secondarySkills.every(skill => 
            skill.skillId && skill.name && typeof skill.name === 'string' && skill.name.length > 0
          );
          
          if (secondarySkillsValid) {
            logger.info('✅ Secondary skills have both skillId and name (populated by backend)');
          } else {
            logger.error('❌ Secondary skills are missing skillId or name (backend population issue)');
          }
        }
      } else {
        logger.error('❌ First contributor has no skills');
      }
    } else {
      logger.error('❌ No contributors found');
    }
  } catch (error) {
    logger.error('Get multiple contributors failed:', error.message);
  }
}

// Run the tests
runTests().then(() => {
  logger.info('All tests completed');
}); 