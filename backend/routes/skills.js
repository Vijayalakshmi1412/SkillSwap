const express = require('express');
const { getAllUsers, getUsersBySkill, getAllSkills } = require('../controllers/skillController');
const router = express.Router();

// Get all users
router.get('/users', getAllUsers);

// Get users by skill
router.get('/users/bySkill', getUsersBySkill);

// Get all unique skills
router.get('/all', getAllSkills);

module.exports = router;