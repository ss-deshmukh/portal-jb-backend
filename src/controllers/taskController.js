const Task = require('../models/Task');
const Sponsor = require('../models/Sponsor');
const crypto = require('crypto');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const axios = require('axios');
const mongoose = require('mongoose');

// Configure axios client for internal API calls
const internalApi = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get the task schema
const taskSchema = Task.schema;

// Generate a random task ID
const generateRandomTaskId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Generate a random task ID
const generateTaskId = async (walletAddress) => {
  try {
    // Get the current task count and increment it
    const sponsor = await Sponsor.findOne({ walletAddress });
    const taskCount = (sponsor?.taskIds?.length || 0) + 1;
    return `task_${String(taskCount).padStart(3, '0')}`;
  } catch (error) {
    logger.error('Error generating task ID:', error);
    throw error;
  }
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
exports.createTask = async (req, res) => {
  try {
    const taskData = req.body.task;
    if (!taskData) {
      return res.status(400).json({ message: 'Task data is required' });
    }

    // Verify sponsor's ID matches authenticated user
    if (taskData.sponsorId !== req.user.walletAddress) {
      return res.status(403).json({ message: 'Unauthorized: Sponsor ID mismatch' });
    }

    // Get the sponsor first to ensure they exist
    const sponsor = await Sponsor.findOne({ walletAddress: taskData.sponsorId });
    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    // Create task data with validated information
    const task = new Task({
      id: generateRandomTaskId(),
      title: taskData.title,
      sponsorId: taskData.sponsorId,
      logo: taskData.logo,
      description: taskData.description,
      requirements: taskData.requirements,
      deliverables: taskData.deliverables,
      deadline: taskData.deadline,
      reward: taskData.reward,
      postedTime: taskData.postedTime,
      status: taskData.status,
      priority: taskData.priority,
      category: taskData.category,
      skills: taskData.skills,
      submissions: taskData.submissions || []
    });

    // Log task object and validation errors before saving
    console.log('Task object before save:', task);
    const validationError = task.validateSync();
    if (validationError) {
      console.error('Validation errors:', validationError);
      return res.status(400).json({ message: 'Invalid task data', errors: validationError });
    }

    try {
      // Save the task
      const savedTask = await task.save();
      console.log('Task saved successfully:', savedTask);

      // Update sponsor's taskIds array using findByIdAndUpdate
      const updatedSponsor = await Sponsor.findByIdAndUpdate(
        sponsor._id,
        { $addToSet: { taskIds: savedTask.id } },
        { new: true }
      );

      if (!updatedSponsor) {
        // If sponsor update fails, delete the task
        await Task.findOneAndDelete({ id: savedTask.id });
        return res.status(404).json({ message: 'Failed to update sponsor profile' });
      }

      // Log the successful update
      console.log('Sponsor updated successfully:', {
        taskId: savedTask.id,
        sponsorId: updatedSponsor._id,
        taskIds: updatedSponsor.taskIds,
        sponsorWallet: updatedSponsor.walletAddress
      });

      // Return the created task
      res.status(201).json({ 
        message: 'Task created successfully',
        task: savedTask
      });
    } catch (error) {
      // If any error occurs during sponsor update, delete the task
      if (task._id) {
        await Task.findOneAndDelete({ id: task.id });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

// Update sponsor with new task ID
exports.updateSponsorWithTaskId = async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    // Get current sponsor profile
    const sponsor = await Sponsor.findOne({ _id: req.user.id });
    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    // Update sponsor's taskIds array
    const updatedSponsor = await Sponsor.findOneAndUpdate(
      { _id: req.user.id },
      { $addToSet: { taskIds: taskId } },
      { new: true }
    );

    if (!updatedSponsor) {
      return res.status(404).json({ message: 'Failed to update sponsor profile' });
    }

    res.status(200).json({ 
      message: 'Sponsor updated successfully',
      sponsor: updatedSponsor
    });
  } catch (error) {
    console.error('Error updating sponsor with task ID:', error);
    res.status(500).json({ message: 'Error updating sponsor profile', error: error.message });
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