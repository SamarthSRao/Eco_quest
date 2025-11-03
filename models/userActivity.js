
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for user activities
const userActivitySchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    userPoints: {
        type: Number,
        default: 0
    },
    activities: [{
        name: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        points: {
            type: Number,
            required: true
        }
    }]
});

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;
