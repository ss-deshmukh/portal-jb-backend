const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
  name: { type: String, required: true },
  logo: { type: String, required: true },
  description: { type: String, required: true },
  website: { type: String, default: null },
  x: { type: String, default: null },
  discord: { type: String, default: null },
  telegram: { type: String, default: null },
  contactEmail: { type: String, default: null },
  categories: [{ type: String }],
  taskIds: [{ type: String }],
  registeredAt: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: true
});

// Indexes
sponsorSchema.index({ walletAddress: 1 });
sponsorSchema.index({ name: 1 });
sponsorSchema.index({ categories: 1 });
sponsorSchema.index({ verified: 1 });

module.exports = mongoose.model('Sponsor', sponsorSchema); 