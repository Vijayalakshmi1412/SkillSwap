const express = require('express');
const { getUserProfile, updateUserProfile, getUserById } = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user profile (protected)
router.get('/profile', auth, getUserProfile);

// Update user profile (protected)
router.put('/profile', auth, updateUserProfile);

// Get user by ID
router.get('/:id', getUserById);

module.exports = router;