const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Skill', skillSchema); 