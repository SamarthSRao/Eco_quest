const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  points: {
    type: Number,
    default: 0
  },
  strava: {
    connected: { type: Boolean, default: false },
    accessToken: { type: String},
    refreshToken: { type: String},
    expiresAt: { type: Date},
    lastSync: {type: Date},
    athleteId: {type: String}
  },
  milestones: [{
    name: {
      type: String,
      required: true
    },
    target: {
      type: Number,
      required: true
    },
    isAchieved: {
      type: Boolean,
      default: false
    },
    dateAchieved: {
      type: Date,
      default: null
    }
  }],
  activityLog: [{
    type: {
      type: String,
      enum: ['cycling', 'running', 'walking', 'public_transport', 'recycling', 'tree_planting', 'energy_saving'],
      required: true
    },
    distance: {
      type: Number,
      default: 0
    },
    pointsEarned: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      default: ''
    },
    stravaId: String,
    stravaData: {
      name: String,
      elapsedTime: Number,
      movingTime: Number,
      totalElevationGain: Number
    }
  }],
  garden: {
    grid: [{
      id: String,
      row: Number,
      col: Number,
      plant: {
        type: {
          type: String,
          enum: ['flower', 'tree', 'bush', 'sprout']
        },
        // FIXED: Changed from 'growth' to 'growthProgress' to match backend
        growthProgress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        },
        health: {
          type: Number,
          default: 100,
          min: 0,
          max: 100
        },
        plantedAt: Date
      },
      waterLevel: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
      },
      soilMoisture: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
      },
      lastWatered: Date
    }],
    inventory: {
      flower: { type: Number, default: 5 },
      tree: { type: Number, default: 3 },
      bush: { type: Number, default: 4 },
      sprout: { type: Number, default: 8 }
    },
    stats: {
      totalPoints: { type: Number, default: 0 },
      plantsPlanted: { type: Number, default: 0 },
      plantsGrown: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      streak: { type: Number, default: 0 }
    },
    weather: {
      type: String,
      enum: ['sunny', 'rainy', 'cloudy', 'stormy', 'windy'],
      default: 'sunny'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add points and check milestones
userSchema.methods.addPoints = function(points) {
  this.points += points;
  
  // Check milestones
  this.milestones.forEach(milestone => {
    if (!milestone.isAchieved && this.points >= milestone.target) {
      milestone.isAchieved = true;
      milestone.dateAchieved = new Date();
    }
  });
  
  return this.save();
};

// Add activity to log
userSchema.methods.addActivity = function(activityData) {
  this.activityLog.push(activityData);
  return this.addPoints(activityData.pointsEarned);
};

const User = mongoose.model('User', userSchema);

module.exports = User;