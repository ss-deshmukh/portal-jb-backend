const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  createdBy: { type: String, required: true }
}, {
  timestamps: true
});

// Indexes
skillSchema.index({ name: 1 });
skillSchema.index({ id: 1 });
skillSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Skill', skillSchema); 