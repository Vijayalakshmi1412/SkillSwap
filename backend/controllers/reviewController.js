const Review = require('../models/Review');
const Swap = require('../models/Swap');
const User = require('../models/User');

// Create a new review
const createReview = async (req, res) => {
  try {
    const { swapId, rating, comment } = req.body;
    const reviewerId = req.user._id;

    // Check if swap exists and is completed
    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    if (swap.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed swaps' });
    }

    // Check if user is part of the swap
    if (swap.requester.toString() !== reviewerId.toString() && swap.recipient.toString() !== reviewerId.toString()) {
      return res.status(401).json({ message: 'Not authorized to review this swap' });
    }

    // Determine who is being reviewed
    const reviewedId = swap.requester.toString() === reviewerId.toString() ? swap.recipient : swap.requester;

    // Check if review already exists
    const existingReview = await Review.findOne({
      reviewer: reviewerId,
      swap: swapId,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this swap' });
    }

    // Create new review
    const review = new Review({
      reviewer: reviewerId,
      reviewed: reviewedId,
      swap: swapId,
      rating,
      comment,
    });

    await review.save();

    // Update user's average rating
    const reviewedUser = await User.findById(reviewedId);
    const reviews = await Review.find({ reviewed: reviewedId });
    
    let totalRating = 0;
    reviews.forEach(r => {
      totalRating += r.rating;
    });
    
    reviewedUser.averageRating = totalRating / reviews.length;
    reviewedUser.totalRatings = reviews.length;
    await reviewedUser.save();

    // Populate user details
    await review.populate('reviewer', 'username');
    await review.populate('reviewed', 'username');

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get reviews for a user
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewed: userId })
      .populate('reviewer', 'username')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get reviews written by the current user
const getMyReviews = async (req, res) => {
  try {
    const userId = req.user._id;

    const reviews = await Review.find({ reviewer: userId })
      .populate('reviewed', 'username')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createReview, getUserReviews, getMyReviews };