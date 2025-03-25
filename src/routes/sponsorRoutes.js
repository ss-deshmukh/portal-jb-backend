const express = require('express');
const router = express.Router();
const sponsorController = require('../controllers/sponsorController');
const { sponsorValidation } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', sponsorValidation, sponsorController.register);
router.post('/login', sponsorValidation, sponsorController.login);

// Protected routes
router.get('/', auth, sponsorController.getProfile);
router.put('/', auth, sponsorValidation, sponsorController.updateProfile);
router.delete('/', auth, sponsorController.deleteProfile);

module.exports = router; 