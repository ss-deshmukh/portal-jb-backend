const express = require('express');
const router = express.Router();
const contributorController = require('../controllers/contributorController');
const { contributorValidation } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', contributorValidation, contributorController.register);
router.post('/login', contributorController.login);

// Protected routes
router.put('/', auth, contributorValidation, contributorController.updateProfile);
router.delete('/', auth, contributorController.deleteProfile);

module.exports = router; 