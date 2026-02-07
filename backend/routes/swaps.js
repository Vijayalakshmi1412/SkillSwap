const express = require('express');
const {
  createSwapRequest,
  getSwapRequests,
  acceptSwapRequest,
  rejectSwapRequest,
  completeSwap,
} = require('../controllers/swapController');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a new swap request (protected)
router.post('/', auth, createSwapRequest);

// Get all swap requests for the current user (protected)
router.get('/', auth, getSwapRequests);

// Accept a swap request (protected)
router.put('/:swapId/accept', auth, acceptSwapRequest);

// Reject a swap request (protected)
router.put('/:swapId/reject', auth, rejectSwapRequest);

// Mark a swap as completed (protected)
router.put('/:swapId/complete', auth, completeSwap);

module.exports = router;