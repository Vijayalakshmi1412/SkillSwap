const User = require('../models/User');

// Get leaderboard by skill points
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .select('username skillPoints completedSwaps badges averageRating')
      .sort({ skillPoints: -1 })
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getLeaderboard };