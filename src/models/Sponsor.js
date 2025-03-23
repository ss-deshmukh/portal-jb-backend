const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
  name: { type: String, required: true },
  logo: { type: String, required: true },
  description: { type: String, required: true },
  website: { type: String },
  x: { type: String },
  discord: { type: String },
  telegram: { type: String },
  contactEmail: { type: String },
  categories: [{ type: String }],
  taskIds: [{ type: String }],
  registeredAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
sponsorSchema.index({ walletAddress: 1 });
sponsorSchema.index({ name: 1 });
sponsorSchema.index({ categories: 1 });
sponsorSchema.index({ verified: 1 });

module.exports = mongoose.model('Sponsor', sponsorSchema); 