const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Points calculation rules
const POINTS_RULES = {
  cycling: (distance) => Math.round(distance * 10), // 10 points per km
  running: (distance) => Math.round(distance * 15), // 15 points per km
  walking: (distance) => Math.round(distance * 5), // 5 points per km
  public_transport: () => 30, // Fixed 30 points
  recycling: () => 40, // Fixed 40 points
  tree_planting: () => 100, // Fixed 100 points
  energy_saving: () => 25 // Fixed 25 points
};

// POST /api/activity - Submit activity and update points
router.post('/activity', authenticateToken, async (req, res) => {
  try {
    const { type, distance = 0, description = '' } = req.body;

    // Validate input
    if (!type) {
      return res.status(400).json({ message: 'Activity type is required' });
    }

    if (!POINTS_RULES[type]) {
      return res.status(400).json({ 
        message: 'Invalid activity type',
        validTypes: Object.keys(POINTS_RULES)
      });
    }

    // Calculate points based on activity type and distance
    const pointsEarned = POINTS_RULES[type](distance);

    // Create activity data
    const activityData = {
      type,
      distance,
      pointsEarned,
      description,
      date: new Date()
    };

    // Add activity to user's log and update points
    await req.user.addActivity(activityData);

    // Get updated user data
    const updatedUser = await User.findById(req.user._id).select('-password');

    res.json({
      message: 'Activity recorded successfully',
      activity: activityData,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        points: updatedUser.points,
        milestones: updatedUser.milestones
      }
    });

  } catch (error) {
    console.error('Activity submission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/activity/rules - Get points calculation rules
router.get('/rules', (req, res) => {
  const rules = [
    { type: 'cycling', unit: 'kilometer', pointsPerUnit: 10, description: '10 points per kilometer' },
    { type: 'running', unit: 'kilometer', pointsPerUnit: 15, description: '15 points per kilometer' },
    { type: 'walking', unit: 'kilometer', pointsPerUnit: 5, description: '5 points per kilometer' },
    { type: 'public_transport', unit: 'trip', points: 30, description: '30 points per trip' },
    { type: 'recycling', unit: 'action', points: 40, description: '40 points per action' },
    { type: 'tree_planting', unit: 'tree', points: 100, description: '100 points per tree' },
    { type: 'energy_saving', unit: 'action', points: 25, description: '25 points per action' }
  ];

  res.json({
    message: 'Points calculation rules',
    rules
  });
});

// GET /api/activity/history - Get user's activity history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;

    let query = { _id: req.user._id };
    let activityQuery = {};

    if (type) {
      activityQuery.type = type;
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter activities if type is specified
    let activities = user.activityLog;
    if (type) {
      activities = activities.filter(activity => activity.type === type);
    }

    // Sort by date (newest first) and paginate
    activities = activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(skip, skip + parseInt(limit));

    const totalActivities = user.activityLog.length;
    const totalPages = Math.ceil(totalActivities / limit);

    res.json({
      activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalActivities,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Activity history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/activity/stats - Get user's activity statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const activities = user.activityLog;
    
    // Calculate statistics
    const stats = {
      totalActivities: activities.length,
      totalPoints: user.points,
      totalDistance: activities.reduce((sum, activity) => sum + (activity.distance || 0), 0),
      activitiesByType: {},
      recentActivities: activities.slice(0, 5), // Last 5 activities
      milestones: user.milestones
    };

    // Count activities by type
    activities.forEach(activity => {
      if (!stats.activitiesByType[activity.type]) {
        stats.activitiesByType[activity.type] = {
          count: 0,
          totalPoints: 0,
          totalDistance: 0
        };
      }
      stats.activitiesByType[activity.type].count++;
      stats.activitiesByType[activity.type].totalPoints += activity.pointsEarned;
      stats.activitiesByType[activity.type].totalDistance += activity.distance || 0;
    });

    res.json(stats);

  } catch (error) {
    console.error('Activity stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
