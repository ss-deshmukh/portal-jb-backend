const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  taskId: { type: String, required: true },
  walletAddress: { type: String, required: true },
  submissions: [{ type: String, required: true }],
  grading: { 
    type: Number, 
    min: 0, 
    max: 10, 
    default: 0 
  },
  isAccepted: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes
submissionSchema.index({ id: 1 });
submissionSchema.index({ taskId: 1 });
submissionSchema.index({ walletAddress: 1 });
submissionSchema.index({ isAccepted: 1 });
submissionSchema.index({ grading: -1 });

module.exports = mongoose.model('Submission', submissionSchema); 