const express = require('express');
const { createReview, getUserReviews, getMyReviews } = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a new review (protected)
router.post('/', auth, createReview);

// Get reviews for a user
router.get('/user/:userId', getUserReviews);

// Get reviews written by the current user (protected)
router.get('/my', auth, getMyReviews);

module.exports = router;