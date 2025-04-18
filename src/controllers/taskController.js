const Task = require('../models/Task');
const Sponsor = require('../models/Sponsor');
const Submission = require('../models/Submission');
const Contributor = require('../models/Contributor');
const crypto = require('crypto');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// Get the task schema
const taskSchema = Task.schema;

// Generate a random task ID
const generateTaskId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Validate task data
const validateTaskData = (task) => {
  const requiredFields = ['title', 'sponsorId', 'logo', 'description', 'deadline', 'reward', 'postedTime', 'status'];
  const missingFields = requiredFields.filter(field => !task[field]);
  
  if (missingFields.length > 0) {
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate date fields
  if (task.deadline) {
    const date = new Date(task.deadline);
    if (isNaN(date)) {
      throw new ValidationError('Invalid deadline date');
    }
  }
  if (task.postedTime) {
    const date = new Date(task.postedTime);
    if (isNaN(date)) {
      throw new ValidationError('Invalid posted time');
    }
  }

  // Validate arrays
  if (task.requirements && !Array.isArray(task.requirements)) {
    throw new ValidationError('Requirements must be an array');
  }
  if (task.deliverables && !Array.isArray(task.deliverables)) {
    throw new ValidationError('Deliverables must be an array');
  } else if (task.deliverables && task.deliverables.length === 0) {
    throw new ValidationError('Deliverables array cannot be empty');
  }
  if (task.category && !Array.isArray(task.category)) {
    throw new ValidationError('Category must be an array');
  }
  if (task.skills && !Array.isArray(task.skills)) {
    throw new ValidationError('Skills must be an array');
  }
  if (task.submissions && !Array.isArray(task.submissions)) {
    throw new ValidationError('Submissions must be an array');
  }

  // Validate status
  if (task.status && !['open', 'completed', 'cancelled'].includes(task.status)) {
    throw new ValidationError('Invalid status value');
  }

  // Validate priority
  if (task.priority && !['low', 'medium', 'high', 'urgent'].includes(task.priority)) {
    throw new ValidationError('Invalid priority value');
  }

  // Validate reward
  if (task.reward && (typeof task.reward !== 'number' || task.reward < 0)) {
    throw new ValidationError('Reward must be a positive number');
  }

  return task;
};

// Create a new task
exports.createTask = async (req, res, next) => {
  try {
    const taskId = generateTaskId();
    const validatedTask = validateTaskData(req.body.task);

    // Create task data
    const taskData = {
      id: taskId,
      ...validatedTask,
      deadline: new Date(validatedTask.deadline),
      postedTime: new Date(validatedTask.postedTime)
    };

    const newTask = new Task(taskData);

    // Log the task object before saving
    logger.info('Attempting to save task:', {
      taskObject: JSON.stringify(newTask.toObject()),
      validationErrors: newTask.validateSync(),
      taskId,
      sponsorId: validatedTask.sponsorId,
      status: validatedTask.status
    });

    try {
      // Validate the task before saving
      const validationError = newTask.validateSync();
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
          taskData: newTask.toObject(),
          stack: validationError.stack
        });

        // Log each field's validation result
        Object.keys(taskSchema.paths).forEach(path => {
          const validationResult = newTask.validateSync(path);
          if (validationResult) {
            logger.error(`Validation error for ${path}:`, validationResult);
          }
        });

        throw validationError;
      }

      // Log the exact task data being saved
      logger.info('Attempting to save task with data:', {
        taskData: newTask.toObject(),
        schema: taskSchema.paths,
        validationState: {
          id: newTask.$isValid('id'),
          sponsorId: newTask.$isValid('sponsorId'),
          status: newTask.$isValid('status')
        },
        mongooseValidationState: newTask.$isValid(),
        mongooseValidationErrors: newTask.$errors
      });

      await newTask.save();
      logger.info('Task saved successfully:', {
        taskId,
        sponsorId: validatedTask.sponsorId
      });

      // Update sponsor's taskIds array
      const updatedSponsor = await Sponsor.findOneAndUpdate(
        { walletAddress: validatedTask.sponsorId },
        { $addToSet: { taskIds: taskId } },
        { new: true }
      );

      if (!updatedSponsor) {
        logger.error(`Sponsor ${validatedTask.sponsorId} not found`);
        throw new NotFoundError('Sponsor');
      }

      logger.info(`Updated sponsor ${validatedTask.sponsorId} taskIds:`, updatedSponsor.taskIds);
    } catch (saveError) {
      // Enhanced error logging for save operation
      logger.error('Error saving task:', {
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
        taskData: newTask.toObject(),
        stack: saveError.stack,
        mongooseValidationState: {
          id: newTask.$isValid('id'),
          sponsorId: newTask.$isValid('sponsorId'),
          status: newTask.$isValid('status')
        },
        mongooseValidationErrors: newTask.$errors,
        schemaValidation: Object.entries(taskSchema.paths).map(([path, schema]) => ({
          path,
          type: schema.instance,
          required: schema.isRequired,
          validation: schema.validators
        }))
      });

      throw saveError;
    }

    res.status(201).json({
      message: 'Task created successfully',
      task: newTask
    });
  } catch (error) {
    next(error);
  }
};

// Fetch tasks by IDs
exports.fetchTasks = async (req, res, next) => {
  try {
    const { ids } = req.body;

    // Log the fetch request
    logger.info('Fetching tasks with IDs:', ids);

    if (!Array.isArray(ids)) {
      throw new ValidationError('Task IDs must be an array');
    }

    let tasks;
    if (ids.length === 1 && ids[0] === '*') {
      // Fetch all tasks
      tasks = await Task.find({});
    } else if (ids.length > 0) {
      // Fetch specific tasks
      tasks = await Task.find({ id: { $in: ids } });
    } else {
      throw new ValidationError('Valid task IDs array is required');
    }

    if (tasks.length === 0) {
      throw new NotFoundError('Task');
    }

    logger.info(`Found ${tasks.length} tasks`);

    res.json({
      tasks
    });
  } catch (error) {
    logger.error('Error fetching tasks:', error);
    next(error);
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    if (!taskId) {
      return res.status(400).json({
        message: 'Task ID is required'
      });
    }

    const task = await Task.findOne({ id: taskId });
    
    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json({
      message: 'Task retrieved successfully',
      task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      message: 'Error retrieving task',
      error: error.message
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const sponsorId = req.user.id;
    
    if (!taskId) {
      return res.status(400).json({
        message: 'Task ID is required'
      });
    }
    
    logger.info('Attempting to delete task:', { taskId, sponsorId });
    
    // Find task by custom ID
    const task = await Task.findOne({ id: taskId });
    
    if (!task) {
      logger.warn('Task not found for deletion:', { taskId });
      return res.status(404).json({
        message: 'Task not found'
      });
    }
    
    // Verify task belongs to the sponsor
    if (task.sponsorId !== sponsorId) {
      logger.warn('Unauthorized deletion attempt:', { taskId, sponsorId, taskSponsorId: task.sponsorId });
      return res.status(403).json({
        message: 'Unauthorized - This task belongs to another sponsor'
      });
    }

    // Check if task has any submissions
    const submissionCount = await Submission.countDocuments({ taskId });
    if (submissionCount > 0) {
      logger.warn('Cannot delete task with submissions:', { taskId, submissionCount });
      return res.status(400).json({
        message: 'Cannot delete task with existing submissions',
        details: {
          taskId,
          submissionCount
        }
      });
    }

    // Start a transaction to ensure all operations succeed or none do
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete task using custom ID field
      const result = await Task.findOneAndDelete({ id: taskId }).session(session);
      
      if (!result) {
        logger.error('Failed to delete task:', { taskId });
        throw new NotFoundError('Task');
      }
      
      // Update sponsor's taskIds array
      await Sponsor.findOneAndUpdate(
        { walletAddress: sponsorId },
        { $pull: { taskIds: taskId } }
      ).session(session);
      
      // Commit the transaction
      await session.commitTransaction();
      
      logger.info('Task deleted successfully:', { taskId });
      
      res.json({
        message: 'Task deleted successfully',
        details: {
          taskId
        }
      });
    } catch (error) {
      // If an error occurred, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
    }
  } catch (error) {
    logger.error('Delete task error:', { error: error.message, stack: error.stack });
    res.status(500).json({
      message: 'Error deleting task',
      error: error.message
    });
  }
};

// Update a task
exports.updateTask = async (req, res, next) => {
  try {
    const { task } = req.body;

    // Log the update request
    logger.info('Updating task:', task.id);

    // Validate update data
    if (task.deadline) {
      task.deadline = new Date(task.deadline);
      if (isNaN(task.deadline)) {
        throw new ValidationError('Invalid deadline date');
      }
    }

    // Find and update task
    const updatedTask = await Task.findOneAndUpdate(
      { id: task.id },
      { $set: task },
      { new: true }
    );

    if (!updatedTask) {
      throw new NotFoundError('Task');
    }

    logger.info('Task updated successfully:', task.id);

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    logger.error('Error updating task:', error);
    next(error);
  }
}; 