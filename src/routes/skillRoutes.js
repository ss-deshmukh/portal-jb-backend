const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { skillValidation, skillUpdateValidation } = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.get('/all', skillController.getAllSkills);
router.get('/:id', skillController.getSkill);

// Protected routes (admin only)
router.post('/create', auth, authorize('admin'), skillValidation, skillController.createSkill);
router.put('/:id', auth, authorize('admin'), skillUpdateValidation, skillController.updateSkill);
router.delete('/:id', auth, authorize('admin'), skillController.deleteSkill);

module.exports = router; 