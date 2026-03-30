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

    // Ensure accepted swaps have meeting links (fallback for old data where missing)
    const ensureMeetingLink = async (swap) => {
      if (swap.status === 'accepted' && !swap.meetingLink) {
        swap.meetingLink = `https://meet.jit.si/skillswap-${swap._id}`;
        await swap.save();
      }
    };

    await Promise.all([...incomingRequests, ...outgoingRequests].map(ensureMeetingLink));

    res.json({
      incoming: incomingRequests,
      outgoing: outgoingRequests,
    });
  } catch (error) {
    console.error(error);
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
      .populate('recipient', 'username');

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Ensure accepted swaps always provide a meeting link by generating a Jitsi room from ID.
    if (swap.status === 'accepted' && !swap.meetingLink) {
      swap.meetingLink = `https://meet.jit.si/skillswap-${swap._id}`;
      await swap.save();
      await swap.populate('requester', 'username');
      await swap.populate('recipient', 'username');
    }

    // If requester/recipient are populated objects, compare _id; if plain ObjectId, they still have .toString()
    const requesterId = swap.requester?._id ? swap.requester._id.toString() : swap.requester.toString();
    const recipientId = swap.recipient?._id ? swap.recipient._id.toString() : swap.recipient.toString();

    if (requesterId !== userId.toString() && recipientId !== userId.toString()) {
      return res.status(401).json({ message: 'Not authorized to view this swap' });
    }

    // Keep pending information; status enforcement is for UI display only.
    // If you want block before acceptance, use frontend feedback to user instead.
    // if (swap.status !== 'accepted' && swap.status !== 'completed') {
    //   return res.status(400).json({ message: 'Swap not active yet' });
    // }

    res.json(swap);
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

    // Generate Jitsi meeting link and update swap status
    const meetingLink = `https://meet.jit.si/skillswap-${swap._id}`;
    swap.meetingLink = meetingLink;
    swap.status = 'accepted';
    swap.requesterCompleted = false;
    swap.recipientCompleted = false;
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

    // Dual completion workflow
    if (swap.requester.toString() === userId.toString()) {
      swap.requesterCompleted = true;
    } else if (swap.recipient.toString() === userId.toString()) {
      swap.recipientCompleted = true;
    }

    // Complete fully only when both users confirm
    if (swap.requesterCompleted && swap.recipientCompleted) {
      if (swap.status !== 'completed') {
        swap.status = 'completed';
        swap.completedDate = Date.now();

        const requester = await User.findById(swap.requester);
        const recipient = await User.findById(swap.recipient);

        requester.skillPoints += 10;
        requester.credits += 5;
        requester.completedSwaps += 1;

        recipient.skillPoints += 10;
        recipient.credits += 5;
        recipient.completedSwaps += 1;

        const applyBadge = (user) => {
          if (user.completedSwaps === 1) user.badges.push('First Swap');
          if (user.completedSwaps === 5) user.badges.push('Skill Swapper');
          if (user.completedSwaps === 10) user.badges.push('Master Exchanger');
        };

        applyBadge(requester);
        applyBadge(recipient);

        await requester.save();
        await recipient.save();
      }
    }

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

module.exports = {
  createSwapRequest,
  getSwapRequests,
  getSwapById,
  acceptSwapRequest,
  rejectSwapRequest,
  completeSwap,
};