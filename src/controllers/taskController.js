const Task = require('../models/Task');
const Sponsor = require('../models/Sponsor');
const crypto = require('crypto');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Generate a random task ID
const generateTaskId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Create a new task
exports.createTask = async (req, res, next) => {
  try {
    const { task } = req.body;

    // Log the incoming request data
    logger.info('Creating task with data:', JSON.stringify(task, null, 2));

    // Generate task ID
    const taskId = generateTaskId();

    // Create new task
    const newTask = new Task({
      ...task,
      id: taskId,
      postedTime: new Date(),
      status: 'open',
      submissions: []
    });

    await newTask.save();

    // Update sponsor's taskIds array
    await Sponsor.findOneAndUpdate(
      { walletAddress: task.sponsorId },
      { $push: { taskIds: taskId } }
    );

    logger.info('Task created successfully:', taskId);

    res.status(201).json({
      message: 'Task created successfully',
      id: taskId
    });
  } catch (error) {
    logger.error('Error creating task:', error);
    next(error);
  }
};

// Fetch tasks by IDs
exports.fetchTasks = async (req, res, next) => {
  try {
    const { ids } = req.body;

    // Log the fetch request
    logger.info('Fetching tasks with IDs:', ids);

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError('Valid task IDs array is required');
    }

    const tasks = await Task.find({ id: { $in: ids } });

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

// Delete a task
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.body;

    // Log the deletion request
    logger.info('Deleting task:', id);

    // Find task to get sponsor ID
    const task = await Task.findOne({ id });
    if (!task) {
      throw new NotFoundError('Task');
    }

    // Update sponsor's taskIds array
    await Sponsor.findOneAndUpdate(
      { walletAddress: task.sponsorId },
      { $pull: { taskIds: id } }
    );

    // Delete task
    await Task.findOneAndDelete({ id });

    logger.info('Task deleted successfully:', id);

    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting task:', error);
    next(error);
  }
};

// Update a task
exports.updateTask = async (req, res, next) => {
  try {
    const { task } = req.body;

    // Log the update request
    logger.info('Updating task:', task.id);

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