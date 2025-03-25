const Submission = require('../models/Submission');
const Task = require('../models/Task');
const crypto = require('crypto');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Generate a random submission ID
const generateSubmissionId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Create a new submission
exports.createSubmission = async (req, res, next) => {
  try {
    const { submission } = req.body;

    // Log the incoming request data
    logger.info('Creating submission with data:', JSON.stringify(submission, null, 2));

    // Check if task exists
    const task = await Task.findOne({ id: submission.taskId });
    if (!task) {
      throw new NotFoundError('Task');
    }

    // Generate submission ID
    const submissionId = generateSubmissionId();

    // Create new submission
    const newSubmission = new Submission({
      id: submissionId,
      taskId: submission.taskId,
      contributorId: submission.contributorId,
      walletAddress: submission.walletAddress,
      submissions: submission.submissions,
      grading: submission.grading || 0,
      isAccepted: submission.isAccepted || false,
      submittedAt: new Date()
    });

    await newSubmission.save();

    // Add submission ID to task's submissions array
    task.submissions.push(submissionId);
    await task.save();

    logger.info('Submission created successfully:', submissionId);

    res.status(201).json({
      message: 'Submission created successfully',
      submission: newSubmission
    });
  } catch (error) {
    logger.error('Error creating submission:', error);
    next(error);
  }
};

// Delete a submission
exports.deleteSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.body;

    // Log the deletion request
    logger.info('Deleting submission:', submissionId);

    // Find submission to get task ID
    const submission = await Submission.findOne({ id: submissionId });
    if (!submission) {
      throw new NotFoundError('Submission');
    }

    // Find and update task to remove submission ID
    const task = await Task.findOne({ id: submission.taskId });
    if (task) {
      task.submissions = task.submissions.filter(subId => subId !== submissionId);
      await task.save();
    }

    // Delete submission
    await Submission.findOneAndDelete({ id: submissionId });

    logger.info('Submission deleted successfully:', submissionId);

    res.json({
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting submission:', error);
    next(error);
  }
};

// Fetch submissions
exports.fetchSubmissions = async (req, res, next) => {
  try {
    const { taskId, contributorId, walletAddress } = req.query;

    // Log the fetch request
    logger.info('Fetching submissions with query:', { taskId, contributorId, walletAddress });

    // Build query
    const query = {};
    if (taskId) query.taskId = taskId;
    if (contributorId) query.contributorId = contributorId;
    if (walletAddress) query.walletAddress = walletAddress;

    // Find submissions
    const submissions = await Submission.find(query);

    res.json({
      message: 'Submissions retrieved successfully',
      submissions
    });
  } catch (error) {
    logger.error('Error fetching submissions:', error);
    next(error);
  }
}; 