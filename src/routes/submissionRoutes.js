const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { submissionValidation } = require('../middleware/validation');
const { auth, hasPermission } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Create a new submission
router.post('/', hasPermission('create:submission'), submissionValidation, submissionController.createSubmission);

// Delete a submission
router.delete('/', hasPermission('delete:submission'), submissionController.deleteSubmission);

// Fetch submissions
router.get('/', hasPermission('read:submissions'), submissionController.fetchSubmissions);

// Grade a submission
router.post('/grade', hasPermission('grade:submission'), submissionController.gradeSubmission);

module.exports = router; 