const mongoose = require('mongoose');

const contributorSchema = new mongoose.Schema({
  basicInfo: {
    email: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    bio: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    joinDate: { type: String, default: () => new Date().toISOString() },
    walletAddress: { type: String, default: '' },
    website: { type: String, default: '' },
    x: { type: String, default: '' },
    discord: { type: String, default: '' },
    telegram: { type: String, default: '' }
  },
  contactPreferences: {
    emailNotifications: { type: Boolean, default: false },
    newsletterSubscription: {
      subscribed: { type: Boolean, default: false },
      interests: [{ type: String }]
    },
    canBeContactedBySponsors: { type: Boolean, default: false }
  },
  preferences: {
    interfaceSettings: {
      theme: { type: String, default: 'system' },
      language: { type: String, default: 'eng' }
    },
    opportunityPreferences: {
      preferredCategories: [{ type: String }],
      minimumReward: { type: Number, default: 0 },
      preferredDifficulty: { type: String, default: 'all' },
      timeCommitment: { type: String, default: 'medium' }
    },
    privacySettings: {
      profileVisibility: { type: String, default: 'private' },
      submissionVisibility: { type: String, default: 'public' },
      skillsVisibility: { type: String, default: 'private' },
      reputationVisibility: { type: String, default: 'private' },
      contactabilityBySponsors: { type: String, default: 'none' }
    }
  },
  skills: {
    primarySkills: [{
      name: { type: String },
      level: { type: String }
    }],
    secondarySkills: [{
      name: { type: String },
      level: { type: String }
    }],
    skillTrajectory: {
      improvementRate: { type: Number, default: 0 },
      consistencyScore: { type: Number, default: 0 }
    }
  },
  reputation: {
    overallScore: { type: Number, default: 0 },
    metrics: {
      taskCompletionRate: { type: Number, default: 0 },
      qualityScore: { type: Number, default: 0 },
      consistencyScore: { type: Number, default: 0 },
      communityContributions: { type: Number, default: 0 }
    },
    badges: [{
      name: { type: String },
      description: { type: String },
      category: { type: String },
      difficulty: { type: String }
    }]
  },
  contributionStats: {
    totalTasksCompleted: { type: Number, default: 0 },
    totalRewardsEarned: { type: Number, default: 0 },
    averageQualityRating: { type: Number, default: 0 }
  },
  taskIds: [{ type: String }]
}, {
  timestamps: true,
  strict: false // Allow additional fields
});

// Indexes
contributorSchema.index({ 'basicInfo.email': 1 });
contributorSchema.index({ 'basicInfo.walletAddress': 1 });
contributorSchema.index({ 'skills.primarySkills.name': 1 });
contributorSchema.index({ 'skills.secondarySkills.name': 1 });
contributorSchema.index({ 'reputation.overallScore': -1 });
contributorSchema.index({ 'contributionStats.totalTasksCompleted': -1 });

module.exports = mongoose.model('Contributor', contributorSchema); 