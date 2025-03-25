const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { taskValidation } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Create a new task
router.post('/create', taskValidation, taskController.createTask);

// Fetch tasks by IDs
router.post('/fetch', taskController.fetchTasks);

// Update a task
router.put('/update', taskValidation, taskController.updateTask);

// Delete a task
router.delete('/', taskController.deleteTask);

module.exports = router; 