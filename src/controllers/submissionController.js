const Submission = require('../models/Submission');
const Task = require('../models/Task');
const crypto = require('crypto');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Get the submission schema
const submissionSchema = Submission.schema;

// Generate a random submission ID
const generateSubmissionId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Validate submission data
const validateSubmissionData = (submission) => {
  const requiredFields = ['taskId', 'walletAddress', 'submissionTime', 'status'];
  const missingFields = requiredFields.filter(field => !submission[field]);
  
  if (missingFields.length > 0) {
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate submission time
  if (submission.submissionTime) {
    const date = new Date(submission.submissionTime);
    if (isNaN(date)) {
      throw new ValidationError('Invalid submission time');
    }
  }

  // Validate status
  if (submission.status && !['pending', 'accepted', 'rejected'].includes(submission.status)) {
    throw new ValidationError('Invalid status value');
  }

  // Validate rating if provided
  if (submission.rating !== undefined && submission.rating !== null) {
    if (typeof submission.rating !== 'number' || submission.rating < 0 || submission.rating > 5) {
      throw new ValidationError('Rating must be a number between 0 and 5');
    }
  }

  // Validate review time if provided
  if (submission.reviewTime) {
    const date = new Date(submission.reviewTime);
    if (isNaN(date)) {
      throw new ValidationError('Invalid review time');
    }
  }

  // Set default value for isAccepted if not provided
  if (submission.isAccepted === undefined) {
    submission.isAccepted = false;
  } else if (typeof submission.isAccepted !== 'boolean') {
    throw new ValidationError('isAccepted must be a boolean');
  }

  return submission;
};

// Create a new submission
exports.createSubmission = async (req, res, next) => {
  try {
    logger.info('Create submission controller - Request data:', {
      body: req.body,
      hasSubmission: !!req.body.submission,
      contentType: req.headers['content-type']
    });

    const submissionId = generateSubmissionId();
    const validatedSubmission = validateSubmissionData(req.body.submission);

    // Check if task exists
    const task = await Task.findOne({ id: validatedSubmission.taskId });
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check if task is open
    if (task.status !== 'open') {
      throw new ValidationError('Task is not open for submissions');
    }

    // Create submission data
    const submissionData = {
      id: submissionId,
      ...validatedSubmission,
      submissionTime: new Date(validatedSubmission.submissionTime),
      reviewTime: validatedSubmission.reviewTime ? new Date(validatedSubmission.reviewTime) : undefined
    };

    const newSubmission = new Submission(submissionData);

    // Log the submission object before saving
    logger.info('Attempting to save submission:', {
      submissionObject: JSON.stringify(newSubmission.toObject()),
      validationErrors: newSubmission.validateSync(),
      taskId: validatedSubmission.taskId,
      walletAddress: validatedSubmission.walletAddress,
      status: validatedSubmission.status,
      isAccepted: submissionData.isAccepted
    });

    try {
      // Validate the submission before saving
      const validationError = newSubmission.validateSync();
      if (validationError) {
        logger.error('Validation error before save:', {
          error: validationError.toString(),
          validationErrors: validationError.errors ? Object.entries(validationError.errors).map(([key, error]) => ({
            field: key,
            message: error.message,
            value: error.value,
            kind: error.kind,
            path: error.path,
            reason: error.reason
          })) : null,
          details: validationError.message,
          submissionData: newSubmission.toObject(),
          taskData: task.toObject(),
          stack: validationError.stack
        });

        // Log each field's validation result
        Object.keys(submissionSchema.paths).forEach(path => {
          const validationResult = newSubmission.validateSync(path);
          if (validationResult) {
            logger.error(`Validation error for ${path}:`, validationResult);
          }
        });

        throw validationError;
      }

      // Log the exact submission data being saved
      logger.info('Attempting to save submission with data:', {
        submissionData: newSubmission.toObject(),
        schema: submissionSchema.paths,
        validationState: {
          id: newSubmission.$isValid('id'),
          taskId: newSubmission.$isValid('taskId'),
          walletAddress: newSubmission.$isValid('walletAddress'),
          status: newSubmission.$isValid('status'),
          isAccepted: newSubmission.$isValid('isAccepted')
        },
        mongooseValidationState: newSubmission.$isValid(),
        mongooseValidationErrors: newSubmission.$errors
      });

      await newSubmission.save();
      logger.info('Submission saved successfully:', {
        submissionId,
        taskId: validatedSubmission.taskId,
        walletAddress: validatedSubmission.walletAddress
      });
    } catch (saveError) {
      // Enhanced error logging for save operation
      logger.error('Error saving submission:', {
        error: saveError,
        name: saveError.name,
        code: saveError.code,
        message: saveError.message,
        validationErrors: saveError.errors ? Object.entries(saveError.errors).map(([key, error]) => ({
          field: key,
          message: error.message,
          value: error.value,
          kind: error.kind,
          path: error.path,
          reason: error.reason
        })) : null,
        submissionData: newSubmission.toObject(),
        taskData: task.toObject(),
        stack: saveError.stack,
        mongooseValidationState: {
          id: newSubmission.$isValid('id'),
          taskId: newSubmission.$isValid('taskId'),
          walletAddress: newSubmission.$isValid('walletAddress'),
          status: newSubmission.$isValid('status'),
          isAccepted: newSubmission.$isValid('isAccepted')
        },
        mongooseValidationErrors: newSubmission.$errors,
        schemaValidation: Object.entries(submissionSchema.paths).map(([path, schema]) => ({
          path,
          type: schema.instance,
          required: schema.isRequired,
          validation: schema.validators
        }))
      });

      throw saveError;
    }

    // Add submission ID to task's submissions array
    task.submissions.push(submissionId);
    await task.save();
    logger.info('Task updated with new submission ID:', {
      taskId: task.id,
      submissionId
    });

    res.status(201).json({
      message: 'Submission created successfully',
      submission: newSubmission
    });
  } catch (error) {
    logger.error('Error in createSubmission:', {
      error: error,
      stack: error.stack,
      details: error.message,
      validationErrors: error.errors ? JSON.stringify(error.errors) : null,
      submissionData: error.submissionData ? JSON.stringify(error.submissionData) : null,
      taskData: error.taskData ? JSON.stringify(error.taskData) : null,
      name: error.name,
      code: error.code
    });
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
    const { taskId, walletAddress } = req.query;

    // Log the fetch request
    logger.info('Fetching submissions with query:', { taskId, walletAddress });

    // Build query
    const query = {};
    if (taskId) query.taskId = taskId;
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