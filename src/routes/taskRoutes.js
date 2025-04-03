const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { taskValidation } = require('../middleware/validation');
const { auth, authorize, hasPermission } = require('../middleware/auth');

// Apply auth middleware to all task routes
router.use(auth);

// Create a new task (sponsors only)
router.post('/create', hasPermission('create:task'), taskValidation, taskController.createTask);

// Get task by ID (both sponsors and contributors)
router.get('/:id', hasPermission('read:tasks'), taskController.getTaskById);

// Fetch tasks by various criteria (all authenticated users)
router.post('/fetch', hasPermission('read:tasks'), taskController.fetchTasks);

// Update a task (sponsors only)
router.put('/update', hasPermission('update:task'), taskValidation, taskController.updateTask);

// Delete a task (sponsors only)
router.delete('/:id', hasPermission('delete:task'), taskController.deleteTask);

module.exports = router; 