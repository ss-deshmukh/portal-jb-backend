const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { submissionValidation } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Create a new submission
router.post('/', submissionValidation, submissionController.createSubmission);

// Delete a submission
router.delete('/', submissionController.deleteSubmission);

// Fetch submissions
router.get('/', submissionController.fetchSubmissions);

module.exports = router; 