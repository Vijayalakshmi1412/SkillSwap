const User = require('../models/User');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get users by skill
const getUsersBySkill = async (req, res) => {
  try {
    const { skill } = req.query;
    
    if (!skill) {
      return res.status(400).json({ message: 'Skill parameter is required' });
    }

    const users = await User.find({
      $or: [
        { skillsOffered: { $in: [skill] } },
        { skillsWanted: { $in: [skill] } }
      ]
    }).select('-password');

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all unique skills
const getAllSkills = async (req, res) => {
  try {
    const users = await User.find().select('skillsOffered skillsWanted');
    
    const skillsSet = new Set();
    
    users.forEach(user => {
      user.skillsOffered.forEach(skill => skillsSet.add(skill));
      user.skillsWanted.forEach(skill => skillsSet.add(skill));
    });
    
    const skills = Array.from(skillsSet);
    
    res.json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers, getUsersBySkill, getAllSkills };