const Swap = require('../models/Swap');
const User = require('../models/User');

// Create a new swap request
const createSwapRequest = async (req, res) => {
  try {
    console.log('=== CREATE SWAP REQUEST START ===');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    
    // Use the correct field names from the frontend
    const { recipientId, requesterSkill, recipientSkill, message } = req.body;
    const requesterId = req.user._id;

    console.log('Creating swap request with data:', { recipientId, requesterSkill, recipientSkill, message });

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      console.log('❌ Recipient not found:', recipientId);
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if a similar swap request already exists
    const existingSwap = await Swap.findOne({
      requester: requesterId,
      recipient: recipientId,
      status: { $in: ['pending', 'accepted', 'scheduled'] }
    });

    if (existingSwap) {
      console.log('❌ Active swap request already exists');
      return res.status(400).json({ message: 'An active swap request already exists' });
    }

    // Create new swap request
    const swap = new Swap({
      requester: requesterId,
      recipient: recipientId,
      requesterSkill, // Directly use the field from the request
      recipientSkill, // Directly use the field from the request
      message,
    });

    await swap.save();
    console.log('✅ Swap request created successfully:', swap._id);

    // Populate user details
    await swap.populate('requester', 'username');
    await swap.populate('recipient', 'username');

    console.log('=== CREATE SWAP REQUEST END ===');
    res.status(201).json(swap);
  } catch (error) {
    console.error('=== CREATE SWAP REQUEST ERROR ===');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    console.log('=== END ERROR ===');
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get all swap requests for the current user
const getSwapRequests = async (req, res) => {
  try {
    console.log('=== GET SWAP REQUESTS START ===');
    console.log('Request user:', req.user);
    
    const userId = req.user._id;

    // Get incoming and outgoing requests
    const incomingRequests = await Swap.find({ recipient: userId })
      .populate('requester', 'username')
      .populate('recipient', 'username')
      .populate('proposedBy', 'username')
      .sort({ createdAt: -1 });

    const outgoingRequests = await Swap.find({ requester: userId })
      .populate('requester', 'username')
      .populate('recipient', 'username')
      .populate('proposedBy', 'username')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${incomingRequests.length} incoming and ${outgoingRequests.length} outgoing requests`);
    console.log('=== GET SWAP REQUESTS END ===');

    res.json({
      incoming: incomingRequests,
      outgoing: outgoingRequests,
    });
  } catch (error) {
    console.error('=== GET SWAP REQUESTS ERROR ===');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    console.log('=== END ERROR ===');
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept a swap request
const acceptSwapRequest = async (req, res) => {
  try {
    console.log('=== ACCEPT SWAP REQUEST START ===');
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);
    
    const { swapId } = req.params;
    const userId = req.user._id;

    console.log('Accepting swap request:', swapId);

    const swap = await Swap.findById(swapId);

    if (!swap) {
      console.log('❌ Swap request not found:', swapId);
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if the user is the recipient
    if (swap.recipient.toString() !== userId.toString()) {
      console.log('❌ User not authorized to accept this swap');
      return res.status(401).json({ message: 'Not authorized to accept this swap' });
    }

    // Check if swap is in pending status
    if (swap.status !== 'pending') {
      console.log('❌ Swap request is not in pending status:', swap.status);
      return res.status(400).json({ message: 'Swap request is not in pending status' });
    }

    // Update swap status
    swap.status = 'accepted';
    swap.detailedStatus = 'accepted-not-scheduled'; // Set detailed status
    await swap.save();
    console.log('✅ Swap request accepted successfully');

    // Populate user details
    await swap.populate('requester', 'username');
    await swap.populate('recipient', 'username');

    console.log('=== ACCEPT SWAP REQUEST END ===');
    res.json(swap);
  } catch (error) {
    console.error('=== ACCEPT SWAP REQUEST ERROR ===');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    console.log('=== END ERROR ===');
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject a swap request
const rejectSwapRequest = async (req, res) => {
  try {
    const { swapId } = req.params;
    const userId = req.user._id;

    const swap = await Swap.findById(swapId);

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if the user is the recipient
    if (swap.recipient.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'Not authorized to reject this swap' });
    }

    // Update swap status
    swap.status = 'rejected';
    swap.detailedStatus = 'rejected'; // Set detailed status
    await swap.save();

    // Populate user details
    await swap.populate('requester', 'username');
    await swap.populate('recipient', 'username');

    res.json(swap);
  } catch (error) {
    console.error('Error rejecting swap request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Schedule a meeting time
const scheduleMeeting = async (req, res) => {
  try {
    console.log('=== SCHEDULE MEETING START ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    
    const { swapId } = req.params;
    const { proposedTime } = req.body;
    const userId = req.user._id;

    console.log('Scheduling meeting for swap:', swapId, 'with time:', proposedTime);
    console.log('Request body:', req.body);
    console.log('User ID:', userId);

    if (!proposedTime) {
      console.log('❌ No proposed time provided');
      return res.status(400).json({ message: 'Proposed time is required' });
    }

    // Validate and parse the proposedTime
    let meetingTime;
    try {
      meetingTime = new Date(proposedTime);
      console.log('Meeting time (Date object):', meetingTime);
      
      // Check if the date is valid
      if (isNaN(meetingTime.getTime())) {
        console.log('❌ Invalid date format');
        return res.status(400).json({ message: 'Invalid date format. Please use a valid date and time.' });
      }
      
      // Check if the date is in the future
      const now = new Date();
      if (meetingTime <= now) {
        console.log('❌ Date is in the past');
        return res.status(400).json({ message: 'Meeting time must be in the future.' });
      }
    } catch (error) {
      console.log('❌ Error parsing date:', error);
      return res.status(400).json({ message: 'Invalid date format. Please use a valid date and time.' });
    }

    const swap = await Swap.findById(swapId);
    console.log('Found swap:', swap);

    if (!swap) {
      console.log('❌ Swap request not found:', swapId);
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if the user is the recipient (who accepted the swap)
    if (swap.recipient.toString() !== userId.toString()) {
      console.log('❌ User not authorized to schedule this swap. User ID:', userId, 'Recipient ID:', swap.recipient);
      return res.status(401).json({ message: 'Not authorized to schedule this swap' });
    }

    // Check if swap is in accepted status
    if (swap.status !== 'accepted') {
      console.log('❌ Swap request is not in accepted status:', swap.status);
      return res.status(400).json({ message: 'Swap request is not in accepted status' });
    }

    console.log('✅ All validations passed, scheduling meeting...');

    // Update swap with proposed time
    console.log('Meeting time (ISO string):', meetingTime.toISOString());
    
    swap.proposedTime = meetingTime;
    swap.proposedBy = userId;
    swap.status = 'scheduled';
    swap.detailedStatus = 'accepted-scheduled'; // Set detailed status
    
    // Reset confirmation flags when rescheduling
    swap.requesterConfirmed = false;
    swap.recipientConfirmed = false;
    
    console.log('Before save:', swap.toObject());
    await swap.save();
    console.log('After save:', swap.toObject());

    // Do NOT generate meeting link yet - wait for both parties to confirm
    console.log('✅ Meeting time proposed successfully');

    // Populate user details
    await swap.populate('requester', 'username');
    await swap.populate('recipient', 'username');
    await swap.populate('proposedBy', 'username');

    console.log('=== SCHEDULE MEETING END ===');
    res.json(swap);
  } catch (error) {
    console.error('=== SCHEDULE MEETING ERROR ===');
    console.error('Error scheduling meeting:', error);
    console.error('Error stack:', error.stack);
    console.error('=== END ERROR ===');
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Reschedule a meeting time (new endpoint)
const rescheduleMeeting = async (req, res) => {
  try {
    const { swapId } = req.params;
    const { proposedTime } = req.body;
    const userId = req.user._id;

    console.log('Rescheduling meeting for swap:', swapId, 'with new time:', proposedTime);

    if (!proposedTime) {
      console.log('❌ No proposed time provided');
      return res.status(400).json({ message: 'Proposed time is required' });
    }

    // Validate and parse the proposedTime
    let meetingTime;
    try {
      meetingTime = new Date(proposedTime);
      console.log('Meeting time (Date object):', meetingTime);
      
      // Check if the date is valid
      if (isNaN(meetingTime.getTime())) {
        console.log('❌ Invalid date format');
        return res.status(400).json({ message: 'Invalid date format. Please use a valid date and time.' });
      }
      
      // Check if the date is in the future
      const now = new Date();
      if (meetingTime <= now) {
        console.log('❌ Date is in the past');
        return res.status(400).json({ message: 'Meeting time must be in the future.' });
      }
    } catch (error) {
      console.log('❌ Error parsing date:', error);
      return res.status(400).json({ message: 'Invalid date format. Please use a valid date and time.' });
    }

    const swap = await Swap.findById(swapId);

    if (!swap) {
      console.log('Swap request not found:', swapId);
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if the user is part of the swap
    if (swap.requester.toString() !== userId.toString() && swap.recipient.toString() !== userId.toString()) {
      console.log('User not authorized to reschedule this swap');
      return res.status(401).json({ message: 'Not authorized to reschedule this swap' });
    }

    // Check if swap is in scheduled status
    if (swap.status !== 'scheduled') {
      console.log('Swap cannot be rescheduled. Current status:', swap.status);
      return res.status(400).json({ message: 'Swap cannot be rescheduled. Current status: ' + swap.status });
    }

    // Check if swap is already completed
    if (swap.status === 'completed') {
      console.log('Swap is already completed');
      return res.status(400).json({ message: 'Swap is already completed and cannot be rescheduled' });
    }

    // Update swap with new proposed time
    swap.proposedTime = meetingTime;
    swap.proposedBy = userId;
    swap.confirmedTime = undefined; // Reset confirmed time
    
    // Reset confirmation flags when rescheduling
    swap.requesterConfirmed = false;
    swap.recipientConfirmed = false;
    
    swap.status = 'scheduled'; // Keep status as scheduled
    swap.detailedStatus = 'accepted-scheduled'; // Update detailed status
    await swap.save();
    console.log('Meeting rescheduled successfully');

    // Populate user details
    await swap.populate('requester', 'username');
    await swap.populate('recipient', 'username');
    await swap.populate('proposedBy', 'username');

    res.json(swap);
  } catch (error) {
    console.error('Error rescheduling meeting:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Confirm meeting time (new endpoint)
const confirmMeetingTime = async (req, res) => {
  try {
    const { swapId } = req.params;
    const userId = req.user._id;

    const swap = await Swap.findById(swapId);

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if the user is part of the swap
    if (swap.requester.toString() !== userId.toString() && swap.recipient.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'Not authorized to confirm this meeting time' });
    }

    // Check if swap is in scheduled status
    if (swap.status !== 'scheduled') {
      return res.status(400).json({ message: 'Meeting time has not been proposed yet' });
    }

    // Update confirmation flag based on user
    if (swap.requester.toString() === userId.toString()) {
      swap.requesterConfirmed = true;
    } else {
      swap.recipientConfirmed = true;
    }

    // If both parties have confirmed, set confirmed time and generate meeting link
    if (swap.requesterConfirmed && swap.recipientConfirmed) {
      swap.confirmedTime = swap.proposedTime;
      swap.meetingLink = `https://meet.jit.si/teacheach-${swap._id}`;
      swap.detailedStatus = 'accepted-confirmed';
    }

    await swap.save();

    // Populate user details
    await swap.populate('requester', 'username');
    await swap.populate('recipient', 'username');
    await swap.populate('proposedBy', 'username');

    res.json(swap);
  } catch (error) {
    console.error('Error confirming meeting time:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Respond to a proposed meeting time (for negotiation)
const respondToMeetingTime = async (req, res) => {
  try {
    const { swapId, accept, alternativeTime } = req.body;
    const userId = req.user._id;

    const swap = await Swap.findById(swapId);

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if the user is the requester
    if (swap.requester.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'Not authorized to respond to this meeting time' });
    }

    // Check if swap is in scheduled status
    if (swap.status !== 'scheduled') {
      return res.status(400).json({ message: 'Meeting time has not been proposed yet' });
    }

    if (accept) {
      // Accept the proposed time
      swap.requesterConfirmed = true;
      
      // If both parties have confirmed, set confirmed time and generate meeting link
      if (swap.recipientConfirmed) {
        swap.confirmedTime = swap.proposedTime;
        swap.meetingLink = `https://meet.jit.si/teacheach-${swap._id}`;
        swap.detailedStatus = 'accepted-confirmed';
      }
    } else {
      // Reject and propose alternative time
      if (!alternativeTime) {
        return res.status(400).json({ message: 'Alternative time is required when rejecting a proposal' });
      }
      
      // Validate the alternative time
      let meetingTime;
      try {
        meetingTime = new Date(alternativeTime);
        
        // Check if the date is valid
        if (isNaN(meetingTime.getTime())) {
          return res.status(400).json({ message: 'Invalid date format. Please use a valid date and time.' });
        }
        
        // Check if the date is in the future
        const now = new Date();
        if (meetingTime <= now) {
          return res.status(400).json({ message: 'Meeting time must be in the future.' });
        }
      } catch (error) {
        return res.status(400).json({ message: 'Invalid date format. Please use a valid date and time.' });
      }
      
      swap.proposedTime = meetingTime;
      swap.proposedBy = userId;
      swap.requesterConfirmed = false;
      swap.recipientConfirmed = false;
      swap.detailedStatus = 'accepted-scheduled';
    }

    await swap.save();

    // Populate user details
    await swap.populate('requester', 'username');
    await swap.populate('recipient', 'username');
    await swap.populate('proposedBy', 'username');

    res.json(swap);
  } catch (error) {
    console.error('Error responding to meeting time:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get swap details for the swap room
const getSwapRoom = async (req, res) => {
  try {
    const { swapId } = req.params;
    const userId = req.user._id;

    const swap = await Swap.findById(swapId)
      .populate('requester', 'username')
      .populate('recipient', 'username')
      .populate('notes.user', 'username')
      .populate('chat.user', 'username');

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if the user is part of the swap
    if (swap.requester._id.toString() !== userId.toString() && swap.recipient._id.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'Not authorized to access this swap room' });
    }

    res.json(swap);
  } catch (error) {
    console.error('Error getting swap room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a note to the swap
const addNote = async (req, res) => {
  try {
    const { swapId, content } = req.body;
    const userId = req.user._id;

    const swap = await Swap.findById(swapId);

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if the user is part of the swap
    if (swap.requester.toString() !== userId.toString() && swap.recipient.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'Not authorized to add notes to this swap' });
    }

    // Add note
    swap.notes.push({
      user: userId,
      content,
      timestamp: new Date(),
    });

    await swap.save();

    // Populate user details
    await swap.populate('notes.user', 'username');

    res.json(swap.notes);
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a chat message to the swap
const addChatMessage = async (req, res) => {
  try {
    const { swapId, message } = req.body;
    const userId = req.user._id;

    const swap = await Swap.findById(swapId);

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if the user is part of the swap
    if (swap.requester.toString() !== userId.toString() && swap.recipient.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'Not authorized to chat in this swap' });
    }

    // Add chat message
    swap.chat.push({
      user: userId,
      message,
      timestamp: new Date(),
    });

    await swap.save();

    // Populate user details
    await swap.populate('chat.user', 'username');

    res.json(swap.chat);
  } catch (error) {
    console.error('Error adding chat message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark swap as completed by a user
const markSwapCompleted = async (req, res) => {
  try {
    const { swapId } = req.params;
    const userId = req.user._id;

    const swap = await Swap.findById(swapId);

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if the user is part of the swap
    if (swap.requester.toString() !== userId.toString() && swap.recipient.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'Not authorized to complete this swap' });
    }

    // Check if swap is in scheduled status
    if (swap.status !== 'scheduled') {
      return res.status(400).json({ message: 'Swap is not scheduled yet' });
    }

    // Check if user has already marked as completed
    if (swap.requester.toString() === userId.toString() && swap.requesterCompleted) {
      return res.status(400).json({ message: 'You have already marked this swap as completed' });
    }
    
    if (swap.recipient.toString() === userId.toString() && swap.recipientCompleted) {
      return res.status(400).json({ message: 'You have already marked this swap as completed' });
    }

    // Mark user as completed
    if (swap.requester.toString() === userId.toString()) {
      swap.requesterCompleted = true;
    } else {
      swap.recipientCompleted = true;
    }

    // Check if both users have marked as completed
    if (swap.requesterCompleted && swap.recipientCompleted) {
      swap.status = 'completed';
      swap.detailedStatus = 'accepted-completed'; // Update detailed status
      swap.completedDate = Date.now();
      
      // Update user stats
      const requester = await User.findById(swap.requester);
      const recipient = await User.findById(swap.recipient);

      requester.skillPoints += 10;
      requester.credits += 5;
      requester.completedSwaps += 1;
      
      // Check for new badges
      if (requester.completedSwaps === 1) {
        requester.badges.push('First Swap');
      }
      if (requester.completedSwaps === 5) {
        requester.badges.push('Skill Swapper');
      }
      if (requester.completedSwaps === 10) {
        requester.badges.push('Master Exchanger');
      }

      recipient.skillPoints += 10;
      recipient.credits += 5;
      recipient.completedSwaps += 1;
      
      // Check for new badges
      if (recipient.completedSwaps === 1) {
        recipient.badges.push('First Swap');
      }
      if (recipient.completedSwaps === 5) {
        recipient.badges.push('Skill Swapper');
      }
      if (recipient.completedSwaps === 10) {
        recipient.badges.push('Master Exchanger');
      }

      await requester.save();
      await recipient.save();
    }

    await swap.save();

    // Populate user details
    await swap.populate('requester', 'username');
    await swap.populate('recipient', 'username');

    res.json(swap);
  } catch (error) {
    console.error('Error marking swap as completed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single swap by ID
const getSwapById = async (req, res) => {
  try {
    const { id, swapId } = req.params;
    const lookupId = id || swapId;
    const userId = req.user._id;

    if (!lookupId) {
      return res.status(400).json({ message: 'Swap ID missing in request path' });
    }

    const swap = await Swap.findById(lookupId)
      .populate('requester', 'username')
      .populate('recipient', 'username')
      .populate('proposedBy', 'username');

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // If requester/recipient are populated objects, compare _id; if plain ObjectId, they still have .toString()
    const requesterId = swap.requester?._id ? swap.requester._id.toString() : swap.requester.toString();
    const recipientId = swap.recipient?._id ? swap.recipient._id.toString() : swap.recipient.toString();

    if (requesterId !== userId.toString() && recipientId !== userId.toString()) {
      return res.status(401).json({ message: 'Not authorized to view this swap' });
    }

    res.json(swap);
  } catch (error) {
    console.error('Error getting swap by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};