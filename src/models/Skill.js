const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true }
}, {
  timestamps: true
});

// Indexes
skillSchema.index({ id: 1 });
skillSchema.index({ name: 1 });

module.exports = mongoose.model('Skill', skillSchema); 