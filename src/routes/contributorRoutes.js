const express = require('express');
const router = express.Router();
const contributorController = require('../controllers/contributorController');
const { contributorValidation } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', contributorValidation, contributorController.register);
router.post('/login', contributorController.login);

// Protected routes
router.get('/profile', auth, contributorController.getProfile);
router.put('/profile', auth, contributorValidation, contributorController.updateProfile);
router.delete('/profile', auth, contributorController.deleteProfile);

module.exports = router; 