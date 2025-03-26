const express = require('express');
const router = express.Router();
const contributorController = require('../controllers/contributorController');
const { contributorValidation } = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

// Public routes (no auth required)
router.post('/register', contributorValidation, contributorController.register);
router.post('/login', contributorController.login);

// Protected routes (auth required)
router.get('/profile', auth, contributorController.getProfile);
router.put('/profile', auth, contributorValidation, contributorController.updateProfile);
router.delete('/profile', auth, contributorController.deleteProfile);

// Admin routes (auth + admin role required)
router.get('/', auth, authorize('admin'), contributorController.getAll);

module.exports = router; 