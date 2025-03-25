const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  sponsorId: { type: String, required: true },
  logo: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  deadline: { type: String, required: true },
  reward: { type: Number, required: true },
  postedTime: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['open', 'completed', 'cancelled'],
    required: true
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: [{ type: String }],
  skills: [{ type: String }],
  maxAccepted: { type: Number, required: true },
  submissions: [{ type: String }]
}, {
  timestamps: true
});

// Indexes
taskSchema.index({ id: 1 });
taskSchema.index({ sponsorId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ skills: 1 });
taskSchema.index({ postedTime: -1 });
taskSchema.index({ reward: -1 });

module.exports = mongoose.model('Task', taskSchema); 