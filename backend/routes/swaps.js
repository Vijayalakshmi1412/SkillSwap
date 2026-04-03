const express = require('express');
const {
  createSwapRequest,
  getSwapRequests,
  acceptSwapRequest,
  rejectSwapRequest,
  scheduleMeeting,
  rescheduleMeeting,
  respondToMeetingTime,
  confirmMeetingTime,
  getSwapRoom,
  addNote,
  addChatMessage,
  markSwapCompleted,
  getSwapById,
} = require('../controllers/swapController');
const auth = require('../middleware/auth');
const router = express.Router();

// Log all requests to this router for debugging
router.use((req, res, next) => {
  console.log(`🔄 Swap route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// Create a new swap request (protected)
router.post('/', auth, createSwapRequest);

// Get all swap requests for the current user (protected)
router.get('/', auth, getSwapRequests);

// Get single swap by ID (protected)
router.get('/:swapId', auth, getSwapById);

// Accept a swap request (protected)
router.put('/:swapId/accept', auth, acceptSwapRequest);

// Reject a swap request (protected)
router.put('/:swapId/reject', auth, rejectSwapRequest);

// Schedule a meeting time (protected)
router.put('/:swapId/schedule', auth, scheduleMeeting);

// Reschedule a meeting time (protected)
router.put('/:swapId/reschedule', auth, rescheduleMeeting);

// Respond to a proposed meeting time (protected)
router.put('/:swapId/respond-time', auth, respondToMeetingTime);

// Confirm meeting time (protected)
router.put('/:swapId/confirm-time', auth, confirmMeetingTime);

// Get swap room details (protected)
router.get('/:swapId/room', auth, getSwapRoom);

// Add a note to the swap (protected)
router.post('/:swapId/notes', auth, addNote);

// Add a chat message to the swap (protected)
router.post('/:swapId/chat', auth, addChatMessage);

// Mark swap as completed (protected)
router.put('/:swapId/complete', auth, markSwapCompleted);

module.exports = router;