const Swap = require('../models/Swap');
const User = require('../models/User');

// Create a new swap request
const createSwapRequest = async (req, res) => {
  try {
    const { recipientId, requesterSkill, recipientSkill, message } = req.body;
    const requesterId = req.user._id;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if a similar swap request already exists
    const existingSwap = await Swap.findOne({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending'
    });

    if (existingSwap) {
      return res.status(400).json({ message: 'A pending swap request already exists' });
    }

    // Create new swap request
    const swap = new Swap({
      requester: requesterId,
      recipient: recipientId,
      requesterSkill,
      recipientSkill,
      message,
    });

    await swap.save();

    // Populate user details
    await swap.populate('requester', 'username');
    await swap.populate('recipient', 'username');

    res.status(201).json(swap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all swap requests for the current user
const getSwapRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get incoming and outgoing requests
    const incomingRequests = await Swap.find({ recipient: userId })
      .populate('requester', 'username')
      .populate('recipient', 'username')
      .sort({ createdAt: -1 });

    const outgoingRequests = await Swap.find({ requester: userId })
      .populate('requester', 'username')
      .populate('recipient', 'username')
      .sort({ createdAt: -1 });

    res.json({
      incoming: incomingRequests,
      outgoing: outgoingRequests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept a swap request
const acceptSwapRequest = async (req, res) => {
  try {
    const { swapId } = req.params;
    const userId = req.user._id;

    const swap = await Swap.findById(swapId);

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if the user is the recipient
    if (swap.recipient.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'Not authorized to accept this swap' });
    }

    // Update swap status
    swap.status = 'accepted';
    await swap.save();

    // Populate user details
    await swap.populate('requester', 'username');
    await swap.populate('recipient', 'username');

    res.json(swap);
  } catch (error) {
    console.error(error);
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
    await swap.save();

    // Populate user details
    await swap.populate('requester', 'username');
    await swap.populate('recipient', 'username');

    res.json(swap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark a swap as completed
const completeSwap = async (req, res) => {
  try {
    const { swapId } = req.params;
    const userId = req.user._id;

    const swap = await Swap.findById(swapId);

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if the user is either the requester or recipient
    if (swap.requester.toString() !== userId.toString() && swap.recipient.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'Not authorized to complete this swap' });
    }

    // Check if swap is already accepted
    if (swap.status !== 'accepted') {
      return res.status(400).json({ message: 'Swap must be accepted before it can be completed' });
    }

    // Update swap status
    swap.status = 'completed';
    swap.completedDate = Date.now();
    await swap.save();

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

    // Populate user details
    await swap.populate('requester', 'username');
    await swap.populate('recipient', 'username');

    res.json(swap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createSwapRequest,
  getSwapRequests,
  acceptSwapRequest,
  rejectSwapRequest,
  completeSwap,
};