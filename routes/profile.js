const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// GET /api/user/profile - Get user's current profile and status
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate additional profile data
    const totalActivities = user.activityLog.length;
    const achievedMilestones = user.milestones.filter(m => m.isAchieved).length;
    const totalMilestones = user.milestones.length;
    
    // Get next milestone
    const nextMilestone = user.milestones
      .filter(m => !m.isAchieved)
      .sort((a, b) => a.target - b.target)[0];

    const profile = {
      id: user._id,
      email: user.email,
      points: user.points,
      milestones: user.milestones,
      totalActivities,
      achievedMilestones,
      totalMilestones,
      nextMilestone: nextMilestone ? {
        name: nextMilestone.name,
        target: nextMilestone.target,
        pointsNeeded: nextMilestone.target - user.points,
        progress: Math.round((user.points / nextMilestone.target) * 100)
      } : null,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.json(profile);

  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/user/activitylog - Get user's complete activity history
router.get('/activitylog', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, sortBy = 'date', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let activities = user.activityLog;

    // Filter by type if specified
    if (type) {
      activities = activities.filter(activity => activity.type === type);
    }

    // Sort activities
    activities.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'points':
          aValue = a.pointsEarned;
          bValue = b.pointsEarned;
          break;
        case 'distance':
          aValue = a.distance || 0;
          bValue = b.distance || 0;
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    // Paginate
    const totalActivities = activities.length;
    const paginatedActivities = activities.slice(skip, skip + parseInt(limit));
    const totalPages = Math.ceil(totalActivities / limit);

    res.json({
      activities: paginatedActivities,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalActivities,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: {
        type: type || 'all',
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Activity log retrieval error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/user/milestones - Get user's milestone progress
router.get('/milestones', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const milestones = user.milestones.map(milestone => ({
      ...milestone.toObject(),
      progress: Math.round((user.points / milestone.target) * 100),
      pointsNeeded: Math.max(0, milestone.target - user.points)
    }));

    const achievedCount = milestones.filter(m => m.isAchieved).length;
    const totalCount = milestones.length;

    res.json({
      milestones,
      summary: {
        achieved: achievedCount,
        total: totalCount,
        progress: Math.round((achievedCount / totalCount) * 100)
      }
    });

  } catch (error) {
    console.error('Milestones retrieval error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/user/profile - Update user profile (email only for now)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: email.toLowerCase().trim(),
      _id: { $ne: req.user._id }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already taken' });
    }

    // Update user email
    const user = await User.findById(req.user._id);
    user.email = email.toLowerCase().trim();
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        points: user.points
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/user/leaderboard - Get leaderboard (top users by points)
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const users = await User.find({})
      .select('email points createdAt')
      .sort({ points: -1 })
      .limit(parseInt(limit));

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      email: user.email,
      points: user.points,
      joinedDate: user.createdAt
    }));

    res.json({
      leaderboard,
      totalUsers: users.length
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
