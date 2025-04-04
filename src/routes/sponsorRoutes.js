const express = require('express');
const router = express.Router();
const sponsorController = require('../controllers/sponsorController');
const { sponsorValidation } = require('../middleware/validation');
const { auth, hasPermission } = require('../middleware/auth');

// Public routes
router.post('/register', sponsorValidation, sponsorController.register);
router.post('/login', sponsorValidation, sponsorController.login);

// Protected routes
router.get('/profile', auth, hasPermission('read:profile'), sponsorController.getProfile);
router.put('/profile', auth, hasPermission('update:profile'), sponsorValidation, sponsorController.updateProfile);
router.delete('/profile', auth, hasPermission('delete:profile'), sponsorController.deleteProfile);

// Admin routes
router.get('/all', auth, hasPermission('admin:users'), sponsorController.getAll);

module.exports = router; 