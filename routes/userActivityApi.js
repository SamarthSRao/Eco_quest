const express = require('express');
const router = express.Router();
const UserActivity = require('../models/userActivity');

// GET a user's activity data. If the user doesn't exist, create them.
router.get('/user/:userId', async (req, res, next) => {
    try {
        let user = await UserActivity.findOne({ userId: req.params.userId });

        if (!user) {
            // Create initial data for a new user
            user = await UserActivity.create({
                userId: req.params.userId,
                userPoints: 320,
                activities: [
                    { name: "Cycling", completed: true, points: 50 },
                    { name: "Public Transport", completed: false, points: 30 },
                    { name: "Recycling", completed: true, points: 40 },
                    { name: "Plant a Tree", completed: false, points: 100 },
                    { name: "Energy Saving", completed: true, points: 25 },
                ]
            });
            return res.status(201).json(user);
        }

        res.json(user);
    } catch (err) {
        next(err); // Pass error to Express's error-handling middleware
    }
});

// POST to update a user's activity status
router.post('/user/:userId/update-activity', async (req, res, next) => {
    try {
        const { activityName, completed } = req.body;
        const user = await UserActivity.findOne({ userId: req.params.userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const activity = user.activities.find(a => a.name === activityName);

        if (activity && !activity.completed && completed) {
            activity.completed = true;
            user.userPoints += activity.points;
            await user.save();
            return res.json(user);
        }
        
        res.status(400).json({ message: 'Activity not found or already completed.' });

    } catch (err) {
        next(err);
    }
});

module.exports = router;
