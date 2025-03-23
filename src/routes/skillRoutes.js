const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { skillValidation, skillUpdateValidation } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Create a new skill
router.post('/create', skillValidation, skillController.createSkill);

// Update a skill
router.put('/', skillUpdateValidation, skillController.updateSkill);

// Delete a skill
router.delete('/', skillController.deleteSkill);

module.exports = router; 