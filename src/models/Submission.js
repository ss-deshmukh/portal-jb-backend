const mongoose = require('mongoose');
const logger = require('../utils/logger');

const submissionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        logger.info('Validating submission ID:', v);
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Submission ID must be a non-empty string'
    }
  },
  taskId: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        logger.info('Validating task ID:', v);
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Task ID must be a non-empty string'
    }
  },
  walletAddress: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        logger.info('Validating wallet address:', v);
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Wallet address must be a non-empty string'
    }
  },
  submissionTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: 'Submission time must be a valid date'
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  isAccepted: {
    type: Boolean,
    required: true,
    default: false
  },
  feedback: {
    type: String,
    validate: {
      validator: function(v) {
        return v === undefined || typeof v === 'string';
      },
      message: 'Feedback must be a string'
    }
  },
  rating: {
    type: Number,
    min: [0, 'Rating must be between 0 and 5'],
    max: [5, 'Rating must be between 0 and 5'],
    validate: {
      validator: function(v) {
        return v === null || (Number.isInteger(v) && v >= 0 && v <= 5);
      },
      message: 'Rating must be null or an integer between 0 and 5'
    }
  },
  reviewTime: {
    type: Date,
    validate: {
      validator: function(v) {
        return v === undefined || (v instanceof Date && !isNaN(v));
      },
      message: 'Review time must be a valid date'
    }
  },
  reviewerWalletAddress: {
    type: String,
    validate: {
      validator: function(v) {
        return v === undefined || (typeof v === 'string' && v.length > 0);
      },
      message: 'Reviewer wallet address must be a non-empty string'
    }
  }
}, {
  timestamps: true
});

// Add pre-save middleware to log submission data
submissionSchema.pre('save', function(next) {
  logger.info('Saving submission:', {
    id: this.id,
    taskId: this.taskId,
    walletAddress: this.walletAddress,
    submissionTime: this.submissionTime,
    status: this.status,
    isAccepted: this.isAccepted,
    feedback: this.feedback,
    rating: this.rating,
    reviewTime: this.reviewTime,
    reviewerWalletAddress: this.reviewerWalletAddress,
    submissionObject: JSON.stringify(this.toObject())
  });
  next();
});

// Create indexes
submissionSchema.index({ taskId: 1 });
submissionSchema.index({ walletAddress: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;