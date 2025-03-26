const mongoose = require('mongoose');
const logger = require('../utils/logger');

const taskSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) {
        logger.info('Validating task ID:', v);
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Task ID must be a non-empty string'
    }
  },
  title: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Task title must be a non-empty string'
    }
  },
  sponsorId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Sponsor ID must be a non-empty string'
    }
  },
  logo: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Task logo must be a non-empty string'
    }
  },
  description: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Task description must be a non-empty string'
    }
  },
  requirements: [{ 
    type: String,
    validate: {
      validator: function(v) {
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Each requirement must be a non-empty string'
    }
  }],
  deliverables: [{ 
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Each deliverable must be a non-empty string'
    }
  }],
  deadline: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: 'Deadline must be a valid date'
    }
  },
  reward: { 
    type: Number, 
    required: true,
    min: [0, 'Reward must be a positive number'],
    validate: {
      validator: function(v) {
        return typeof v === 'number' && v >= 0;
      },
      message: 'Reward must be a positive number'
    }
  },
  postedTime: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: 'Posted time must be a valid date'
    }
  },
  status: { 
    type: String, 
    enum: ['open', 'completed', 'cancelled'],
    required: true,
    default: 'open'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: [{ 
    type: String,
    validate: {
      validator: function(v) {
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Each category must be a non-empty string'
    }
  }],
  skills: [{ 
    type: String,
    validate: {
      validator: function(v) {
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Each skill must be a non-empty string'
    }
  }],
  submissions: [{ 
    type: String,
    validate: {
      validator: function(v) {
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Each submission ID must be a non-empty string'
    }
  }]
}, {
  timestamps: true
});

// Add pre-save middleware to log task data
taskSchema.pre('save', function(next) {
  logger.info('Saving task:', {
    id: this.id,
    title: this.title,
    sponsorId: this.sponsorId,
    status: this.status,
    deadline: this.deadline,
    reward: this.reward,
    taskObject: JSON.stringify(this.toObject())
  });
  next();
});

// Add pre-findOne middleware to log query
taskSchema.pre('findOne', function() {
  logger.info('Finding task:', {
    query: JSON.stringify(this.getQuery())
  });
});

// Indexes
taskSchema.index({ id: 1 });
taskSchema.index({ sponsorId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ skills: 1 });
taskSchema.index({ reward: -1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ postedTime: -1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task; 