const Contributor = require('../models/Contributor');
const { validateEmail } = require('../middleware/validation');

// Register a new contributor
exports.register = async (req, res) => {
  try {
    const { basicInfo } = req.body;
    console.log('Registration request body:', JSON.stringify(req.body, null, 2));

    // Validate required fields
    if (!basicInfo) {
      return res.status(400).json({
        message: 'Basic info is required'
      });
    }

    // Validate email
    if (!basicInfo.email || !validateEmail(basicInfo.email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    // Validate display name
    if (!basicInfo.displayName) {
      return res.status(400).json({
        message: 'Display name is required'
      });
    }

    // Validate join date
    if (!basicInfo.joinDate) {
      return res.status(400).json({
        message: 'Join date is required'
      });
    }

    // Check if contributor already exists
    const existingContributor = await Contributor.findOne({ 'basicInfo.email': basicInfo.email });
    if (existingContributor) {
      return res.status(400).json({
        message: 'Contributor already exists'
      });
    }

    // Create new contributor with default values
    const contributor = new Contributor({
      basicInfo: {
        ...basicInfo,
        profileImage: basicInfo.profileImage || '',
        discord: basicInfo.discord || '',
        walletAddress: basicInfo.walletAddress || '',
        website: basicInfo.website || '',
        x: basicInfo.x || '',
        telegram: basicInfo.telegram || ''
      },
      contactPreferences: {
        emailNotifications: false,
        newsletterSubscription: {
          subscribed: false,
          interests: []
        },
        canBeContactedBySponsors: false
      },
      preferences: {
        interfaceSettings: {
          theme: 'system',
          language: 'eng'
        },
        opportunityPreferences: {
          preferredCategories: [],
          minimumReward: 0,
          preferredDifficulty: 'all',
          timeCommitment: 'medium'
        },
        privacySettings: {
          profileVisibility: 'private',
          submissionVisibility: 'public',
          skillsVisibility: 'private',
          reputationVisibility: 'private',
          contactabilityBySponsors: 'none'
        }
      },
      skills: req.body.skills || {
        primarySkills: [],
        secondarySkills: [],
        skillTrajectory: {
          improvementRate: 0,
          consistencyScore: 0
        }
      },
      reputation: {
        overallScore: 0,
        metrics: {
          taskCompletionRate: 0,
          qualityScore: 0,
          consistencyScore: 0,
          communityContributions: 0
        },
        badges: []
      },
      contributionStats: {
        totalTasksCompleted: 0,
        totalRewardsEarned: 0,
        averageQualityRating: 0
      },
      taskIds: []
    });

    console.log('Attempting to save contributor:', JSON.stringify(contributor, null, 2));
    
    try {
      await contributor.save();
      console.log('Contributor saved successfully');
    } catch (saveError) {
      console.error('Save error:', saveError);
      if (saveError.name === 'ValidationError') {
        return res.status(400).json({
          message: 'Validation failed',
          errors: Object.values(saveError.errors).map(err => err.message)
        });
      }
      throw saveError;
    }

    res.status(201).json({
      message: 'Contributor registered successfully',
      contributor
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      errors: error.errors
    });
    res.status(500).json({
      message: 'Error registering contributor',
      error: error.message
    });
  }
};

// Login contributor
exports.login = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    // Find contributor
    const contributor = await Contributor.findOne({ 'basicInfo.email': email });
    if (!contributor) {
      return res.status(404).json({
        message: 'Contributor not found'
      });
    }

    // For testing purposes, use MongoDB _id as token
    res.json({
      message: 'Login successful',
      contributor
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Get contributor profile
exports.getProfile = async (req, res) => {
  try {
    const contributorId = req.user;
    if (!contributorId) {
      return res.status(401).json({
        message: 'No token provided'
      });
    }

    // Find contributor by ID
    const contributor = await Contributor.findById(contributorId);
    if (!contributor) {
      return res.status(404).json({
        message: 'Contributor not found'
      });
    }

    res.json({
      message: 'Profile retrieved successfully',
      contributor
    });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      message: 'Error retrieving profile',
      error: error.message
    });
  }
};

// Update contributor profile
exports.updateProfile = async (req, res) => {
  try {
    const contributorId = req.user;
    const { updated } = req.body;

    if (!contributorId) {
      return res.status(401).json({
        message: 'No token provided'
      });
    }

    // Find contributor by ID
    const contributor = await Contributor.findById(contributorId);
    if (!contributor) {
      return res.status(404).json({
        message: 'Contributor not found'
      });
    }

    // Update fields while preserving existing data
    if (updated.basicInfo) {
      // Ensure all required fields are present
      const updatedBasicInfo = {
        ...contributor.basicInfo, // Keep all existing fields
        ...updated.basicInfo,     // Apply updates
        profileImage: updated.basicInfo.profileImage || contributor.basicInfo.profileImage || '',
        walletAddress: updated.basicInfo.walletAddress || contributor.basicInfo.walletAddress || '',
        website: updated.basicInfo.website || contributor.basicInfo.website || '',
        x: updated.basicInfo.x || contributor.basicInfo.x || '',
        discord: updated.basicInfo.discord || contributor.basicInfo.discord || '',
        telegram: updated.basicInfo.telegram || contributor.basicInfo.telegram || ''
      };

      contributor.basicInfo = updatedBasicInfo;
    }

    // Update other fields if present
    if (updated.contactPreferences) {
      contributor.contactPreferences = {
        ...contributor.contactPreferences,
        ...updated.contactPreferences
      };
    }
    if (updated.preferences) {
      contributor.preferences = {
        ...contributor.preferences,
        ...updated.preferences
      };
    }
    if (updated.skills) {
      contributor.skills = {
        ...contributor.skills,
        ...updated.skills
      };
    }

    console.log('Attempting to save updated contributor:', JSON.stringify(contributor, null, 2));
    
    try {
      await contributor.save();
      console.log('Contributor updated successfully');
    } catch (saveError) {
      console.error('Save error:', saveError);
      if (saveError.name === 'ValidationError') {
        return res.status(400).json({
          message: 'Validation failed',
          errors: Object.values(saveError.errors).map(err => err.message)
        });
      }
      throw saveError;
    }

    res.json({
      message: 'Profile updated successfully',
      contributor
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Delete contributor
exports.deleteProfile = async (req, res) => {
  try {
    const contributorId = req.user;
    if (!contributorId) {
      return res.status(401).json({
        message: 'No token provided'
      });
    }

    // Find and delete contributor
    const contributor = await Contributor.findByIdAndDelete(contributorId);
    if (!contributor) {
      return res.status(404).json({
        message: 'Contributor not found'
      });
    }

    res.json({
      message: 'Contributor deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      message: 'Error deleting contributor',
      error: error.message
    });
  }
}; 