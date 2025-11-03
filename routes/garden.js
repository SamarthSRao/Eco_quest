// routes/garden.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {authenticateToken}= require('../middleware/auth');

// Get user's garden data
router.get('/garden', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('garden');
    
    if (!user.garden) {
      // Initialize default garden if not exists
      const defaultGarden = {
        grid: initializeGrid(),
        inventory: {
          flower: 5,
          tree: 3,
          bush: 4,
          sprout: 8
        },
        stats: {
          totalPoints: 0,
          plantsPlanted: 0,
          plantsGrown: 0,
          level: 1,
          streak: 0
        },
        weather: 'sunny',
        lastUpdated: new Date()
      };
      
      user.garden = defaultGarden;
      await user.save();
      
      return res.json({
        message: 'Garden initialized',
        garden: defaultGarden
      });
    }
    
    res.json({
      message: 'Garden data retrieved',
      garden: user.garden
    });
  } catch (error) {
    console.error('Get garden error:', error);
    res.status(500).json({ message: 'Failed to retrieve garden data' });
  }
});

// Save/Update garden data
router.post('/garden/save', authenticateToken, async (req, res) => {
  try {
    const { grid, inventory, stats, weather } = req.body;
    
    if (!grid || !inventory || !stats) {
      return res.status(400).json({ message: 'Missing required garden data' });
    }
    
    const user = await User.findById(req.user._id);
    
    user.garden = {
      grid,
      inventory,
      stats,
      weather: weather || 'sunny',
      lastUpdated: new Date()
    };
    
    await user.save();
    
    res.json({
      message: 'Garden saved successfully',
      garden: user.garden
    });
  } catch (error) {
    console.error('Save garden error:', error);
    res.status(500).json({ message: 'Failed to save garden data' });
  }
});

// Update garden statistics only
router.put('/garden/stats', authenticateToken, async (req, res) => {
  try {
    const { stats } = req.body;
    
    if (!stats) {
      return res.status(400).json({ message: 'Stats data is required' });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user.garden) {
      return res.status(404).json({ message: 'Garden not initialized' });
    }
    
    user.garden.stats = {
      ...user.garden.stats,
      ...stats
    };
    
    user.garden.lastUpdated = new Date();
    await user.save();
    
    res.json({
      message: 'Garden stats updated',
      stats: user.garden.stats
    });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ message: 'Failed to update garden stats' });
  }
});

// Plant a seed (track planting action)
router.post('/garden/plant', authenticateToken, async (req, res) => {
  try {
    const { cellId, plantType } = req.body;
    
    if (!cellId || !plantType) {
      return res.status(400).json({ message: 'Cell ID and plant type are required' });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user.garden) {
      return res.status(404).json({ message: 'Garden not initialized' });
    }
    
    // Check inventory
    if (user.garden.inventory[plantType] <= 0) {
      return res.status(400).json({ message: 'Not enough plants in inventory' });
    }
    
    // Update grid
    const cellIndex = user.garden.grid.findIndex(c => c.id === cellId);
    if (cellIndex === -1) {
      return res.status(404).json({ message: 'Cell not found' });
    }
    
    const cell = user.garden.grid[cellIndex];
if (cell.plant && cell.plant.type && cell.plant.plantedAt) {
  return res.status(400).json({ message: 'Cell already occupied' });
}
    
    // Plant the seed
    user.garden.grid[cellIndex].plant = {
      type: plantType,
      plantedAt: new Date(),
      health: 100,
      growthProgress: 0
    };
    
    user.garden.grid[cellIndex].waterLevel = 100;
    user.garden.grid[cellIndex].lastWatered = new Date();
    
    // Update inventory
    user.garden.inventory[plantType] -= 1;
    
    // Update stats
    user.garden.stats.plantsPlanted += 1;
    
    user.garden.lastUpdated = new Date();
    await user.save();
    
    res.json({
      message: 'Plant added successfully',
      cell: user.garden.grid[cellIndex],
      inventory: user.garden.inventory,
      stats: user.garden.stats
    });
  } catch (error) {
    console.error('Plant error:', error);
    res.status(500).json({ message: 'Failed to plant seed' });
  }
});

// Harvest a plant
router.post('/garden/harvest', authenticateToken, async (req, res) => {
  try {
    const { cellId } = req.body;
    
    if (!cellId) {
      return res.status(400).json({ message: 'Cell ID is required' });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user.garden) {
      return res.status(404).json({ message: 'Garden not initialized' });
    }
    
    const cellIndex = user.garden.grid.findIndex(c => c.id === cellId);
    if (cellIndex === -1) {
      return res.status(404).json({ message: 'Cell not found' });
    }
    
    const cell = user.garden.grid[cellIndex];
    if (!cell.plant) {
      return res.status(400).json({ message: 'No plant to harvest' });
    }
    
    if (cell.plant.growthProgress < 100) {
      return res.status(400).json({ message: 'Plant not ready to harvest' });
    }
    
    // Calculate points based on plant type
    const pointsMap = {
      flower: 10,
      tree: 25,
      bush: 15,
      sprout: 5
    };
    
    const pointsEarned = pointsMap[cell.plant.type] || 5;
    
    // Add plant back to inventory
    user.garden.inventory[cell.plant.type] += 1;
    
    // Update stats
    user.garden.stats.totalPoints += pointsEarned;
    user.garden.stats.plantsGrown += 1;
    
    // Calculate level (every 100 points = 1 level)
    user.garden.stats.level = Math.floor(user.garden.stats.totalPoints / 100) + 1;
    
    // Clear the cell
    user.garden.grid[cellIndex].plant = null;
    user.garden.grid[cellIndex].waterLevel = 100;
    user.garden.grid[cellIndex].soilMoisture = 100;
    
    user.garden.lastUpdated = new Date();
    await user.save();
    
    res.json({
      message: 'Plant harvested successfully',
      pointsEarned,
      inventory: user.garden.inventory,
      stats: user.garden.stats
    });
  } catch (error) {
    console.error('Harvest error:', error);
    res.status(500).json({ message: 'Failed to harvest plant' });
  }
});

// Water plants
router.post('/garden/water', authenticateToken, async (req, res) => {
  try {
    const { cellId, waterAll } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user.garden) {
      return res.status(404).json({ message: 'Garden not initialized' });
    }
    
    if (waterAll) {
      // Water all plants
      user.garden.grid.forEach(cell => {
        if (cell.plant) {
          cell.waterLevel = 100;
          cell.soilMoisture = 100;
          cell.lastWatered = new Date();
        }
      });
      
      await user.save();
      
      return res.json({
        message: 'All plants watered',
        grid: user.garden.grid
      });
    }
    
    if (!cellId) {
      return res.status(400).json({ message: 'Cell ID is required' });
    }
    
    const cellIndex = user.garden.grid.findIndex(c => c.id === cellId);
    if (cellIndex === -1) {
      return res.status(404).json({ message: 'Cell not found' });
    }
    
    if (!user.garden.grid[cellIndex].plant) {
      return res.status(400).json({ message: 'No plant to water' });
    }
    
    user.garden.grid[cellIndex].waterLevel = 100;
    user.garden.grid[cellIndex].soilMoisture = 100;
    user.garden.grid[cellIndex].lastWatered = new Date();
    
    user.garden.lastUpdated = new Date();
    await user.save();
    
    res.json({
      message: 'Plant watered successfully',
      cell: user.garden.grid[cellIndex]
    });
  } catch (error) {
    console.error('Water error:', error);
    res.status(500).json({ message: 'Failed to water plant' });
  }
});

// Get garden leaderboard
router.get('/garden/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topGardens = await User.find({ 'garden.stats.totalPoints': { $gt: 0 } })
      .select('email garden.stats createdAt')
      .sort({ 'garden.stats.totalPoints': -1 })
      .limit(limit);
    
    const leaderboard = topGardens.map((user, index) => ({
      rank: index + 1,
      email: user.email,
      points: user.garden.stats.totalPoints,
      level: user.garden.stats.level,
      plantsGrown: user.garden.stats.plantsGrown,
      joinedDate: user.createdAt
    }));
    
    res.json({
      message: 'Garden leaderboard retrieved',
      leaderboard,
      totalGardens: topGardens.length
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Failed to retrieve leaderboard' });
  }
});

// Remove/delete plant
router.delete('/garden/plant/:cellId', authenticateToken, async (req, res) => {
  try {
    const { cellId } = req.params;
    
    const user = await User.findById(req.user._id);
    
    if (!user.garden) {
      return res.status(404).json({ message: 'Garden not initialized' });
    }
    
    const cellIndex = user.garden.grid.findIndex(c => c.id === cellId);
    if (cellIndex === -1) {
      return res.status(404).json({ message: 'Cell not found' });
    }
    
    const cell = user.garden.grid[cellIndex];
    if (!cell.plant) {
      return res.status(400).json({ message: 'No plant to remove' });
    }
    
    // Return plant to inventory
    user.garden.inventory[cell.plant.type] += 1;
    
    // Clear the cell
    user.garden.grid[cellIndex].plant = null;
    
    user.garden.lastUpdated = new Date();
    await user.save();
    
    res.json({
      message: 'Plant removed successfully',
      inventory: user.garden.inventory
    });
  } catch (error) {
    console.error('Remove plant error:', error);
    res.status(500).json({ message: 'Failed to remove plant' });
  }
});

// Helper function to initialize grid
function initializeGrid() {
  const grid = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      grid.push({
        id: `cell-${row}-${col}`,
        row,
        col,
        plant: null,
        waterLevel: 100,
        soilMoisture: 100,
        lastWatered: null
      });
    }
  }
  return grid;
}

module.exports = router;