const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { taskValidation } = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Create a new task (sponsors only)
router.post('/create', authorize('sponsor'), taskValidation, taskController.createTask);

// Fetch tasks by IDs (all authenticated users)
router.post('/fetch', taskController.fetchTasks);

// Update a task (sponsors only)
router.put('/update', authorize('sponsor'), taskValidation, taskController.updateTask);

// Delete a task (sponsors only)
router.delete('/', authorize('sponsor'), taskController.deleteTask);

module.exports = router; 