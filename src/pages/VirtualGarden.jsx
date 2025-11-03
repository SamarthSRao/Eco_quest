import React, { useState, useEffect } from 'react';
import { Droplet, Sun, Wind, CloudRain, Leaf, Save, RefreshCw, Trophy } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

const getAuthToken = () => localStorage.getItem('token');
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
});

// Garden API Service
const gardenApi = {
  getGarden: async () => {
    const response = await fetch(`${API_BASE_URL}/garden`, { 
      headers: getHeaders() 
    });
    if (!response.ok) throw new Error('Failed to fetch garden');
    return await response.json();
  },
  
  saveGarden: async (data) => {
    const response = await fetch(`${API_BASE_URL}/garden/save`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to save garden');
    return await response.json();
  },
  
  plantSeed: async (cellId, plantType) => {
    const response = await fetch(`${API_BASE_URL}/garden/plant`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ cellId, plantType })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to plant');
    }
    return await response.json();
  },
  
  harvestPlant: async (cellId) => {
    const response = await fetch(`${API_BASE_URL}/garden/harvest`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ cellId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to harvest');
    }
    return await response.json();
  },
  
  waterPlants: async (cellId = null, waterAll = false) => {
    const response = await fetch(`${API_BASE_URL}/garden/water`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ cellId, waterAll })
    });
    if (!response.ok) throw new Error('Failed to water');
    return await response.json();
  },
  
  removePlant: async (cellId) => {
    const response = await fetch(`${API_BASE_URL}/garden/plant/${cellId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to remove');
    return await response.json();
  },

  getLeaderboard: async (limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/garden/leaderboard?limit=${limit}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return await response.json();
  }
};

// Plant Types Configuration
const PLANT_TYPES = {
  flower: { 
    icon: '🌸', name: 'Flower', growthTime: 3600000, waterNeeds: 8, points: 10, color: 'pink'
  },
  tree: { 
    icon: '🌳', name: 'Tree', growthTime: 7200000, waterNeeds: 12, points: 25, color: 'green'
  },
  bush: { 
    icon: '🌿', name: 'Bush', growthTime: 5400000, waterNeeds: 10, points: 15, color: 'emerald'
  },
  sprout: { 
    icon: '🌱', name: 'Sprout', growthTime: 1800000, waterNeeds: 5, points: 5, color: 'lime'
  }
};

// Weather Types
const WEATHER_TYPES = {
  sunny: {
    name: 'Sunny', icon: <Sun className="w-6 h-6 text-yellow-400" />,
    dehydrationRate: 8, growthBonus: 1.5, bgColor: 'from-blue-400 to-blue-200',
    description: 'Plants dry faster but grow quickly'
  },
  windy: {
    name: 'Windy', icon: <Wind className="w-6 h-6 text-gray-400" />,
    dehydrationRate: 6, growthBonus: 1.0, bgColor: 'from-gray-400 to-gray-200',
    description: 'Moderate conditions'
  },
  rainy: {
    name: 'Rainy', icon: <CloudRain className="w-6 h-6 text-blue-600" />,
    dehydrationRate: 0, growthBonus: 1.3, bgColor: 'from-gray-600 to-gray-400',
    description: 'Auto-waters all plants!'
  }
};

const VirtualGarden = () => {
  const [grid, setGrid] = useState([]);
  const [inventory, setInventory] = useState({ flower: 5, tree: 3, bush: 4, sprout: 8 });
  const [weather, setWeather] = useState('sunny');
  const [selectedTool, setSelectedTool] = useState(null);
  const [draggedPlant, setDraggedPlant] = useState(null);
  const [gardenStats, setGardenStats] = useState({
    totalPoints: 0, plantsPlanted: 0, plantsGrown: 0, level: 1, streak: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Initialize - Load from Backend
  useEffect(() => {
    loadGarden();
  }, []);

  const loadGarden = async () => {
    try {
      setLoading(true);
      const response = await gardenApi.getGarden();
      
      if (response.garden) {
        setGrid(response.garden.grid);
        setInventory(response.garden.inventory);
        setGardenStats(response.garden.stats);
        setWeather(response.garden.weather || 'sunny');
      }
      
      addNotification('Garden loaded!');
    } catch (error) {
      console.error('Load error:', error);
      addNotification('Failed to load garden', 'error');
      initializeDefaultGarden();
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultGarden = () => {
    const initGrid = [];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        initGrid.push({
          id: `cell-${row}-${col}`, row, col,
          plant: null, waterLevel: 100, soilMoisture: 100, lastWatered: null
        });
      }
    }
    setGrid(initGrid);
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    if (loading) return;
    
    const autoSaveInterval = setInterval(() => {
      saveGarden(true);
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [grid, inventory, gardenStats, weather, loading]);

  const saveGarden = async (isAutoSave = false) => {
    try {
      setSaving(true);
      await gardenApi.saveGarden({
        grid, inventory, stats: gardenStats, weather
      });
      if (!isAutoSave) {
        addNotification('Garden saved!');
      }
    } catch (error) {
      console.error('Save error:', error);
      if (!isAutoSave) {
        addNotification('Failed to save garden', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // Weather Cycle
  useEffect(() => {
    const weatherInterval = setInterval(() => {
      const weathers = ['sunny', 'windy', 'rainy'];
      const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
      setWeather(newWeather);
      addNotification(`Weather changed to ${WEATHER_TYPES[newWeather].name}!`);
      
      if (newWeather === 'rainy') {
        setGrid(prev => prev.map(cell => ({
          ...cell, waterLevel: 100, soilMoisture: 100
        })));
        addNotification('Rain is watering your plants!');
      }
    }, 120000);

    return () => clearInterval(weatherInterval);
  }, []);

  // Dehydration System - FIXED to use growthProgress
  useEffect(() => {
    const dehydrationInterval = setInterval(() => {
      const currentWeather = WEATHER_TYPES[weather];
      
      setGrid(prev => prev.map(cell => {
        if (!cell.plant) return cell;

        const newWaterLevel = Math.max(0, 
          cell.waterLevel - (currentWeather.dehydrationRate / 6)
        );
        
        const plantType = PLANT_TYPES[cell.plant.type];
        let newHealth = cell.plant.health;
        
        if (newWaterLevel < 30) {
          newHealth = Math.max(0, newHealth - 2);
        }

        const timeSincePlanted = Date.now() - new Date(cell.plant.plantedAt).getTime();
        const growthProgress = Math.min(100, 
          (timeSincePlanted / plantType.growthTime) * 100 * currentWeather.growthBonus
        );

        return {
          ...cell,
          waterLevel: newWaterLevel,
          plant: { 
            ...cell.plant, 
            health: newHealth, 
            growthProgress
          }
        };
      }));
    }, 10000);

    return () => clearInterval(dehydrationInterval);
  }, [weather]);

  // Notification System
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Plant Handling with Backend - FIXED
  const handlePlantDrop = async (cellId) => {
    if (!draggedPlant) return;

    // FIXED: Define cell before using it
    const cell = grid.find(c => c.id === cellId);
    const hasPlant = cell?.plant && cell.plant.type && cell.plant.plantedAt;

    if (hasPlant) {
      addNotification('Cell already occupied!', 'error');
      setDraggedPlant(null);
      return;
    }

    if (inventory[draggedPlant] <= 0) {
      addNotification('No more plants in inventory!', 'error');
      setDraggedPlant(null);
      return;
    }

    try {
      const response = await gardenApi.plantSeed(cellId, draggedPlant);
      
      // Update grid with the cell from backend
      setGrid(prev => prev.map(c => 
        c.id === cellId ? response.cell : c
      ));
      setInventory(response.inventory);
      setGardenStats(response.stats);
      
      addNotification(`Planted ${PLANT_TYPES[draggedPlant].name}!`);
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setDraggedPlant(null);
    }
  };

  // Water with Backend
  const waterCell = async (cellId) => {
    const cell = grid.find(c => c.id === cellId);
    if (!cell?.plant) {
      addNotification('No plant to water!', 'error');
      return;
    }

    try {
      const response = await gardenApi.waterPlants(cellId, false);
      setGrid(prev => prev.map(c => 
        c.id === cellId ? response.cell : c
      ));
      addNotification('Plant watered!');
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  const waterAllPlants = async () => {
    try {
      const response = await gardenApi.waterPlants(null, true);
      setGrid(response.grid);
      addNotification('All plants watered!');
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  // Harvest with Backend
  const harvestPlant = async (cellId) => {
    const cell = grid.find(c => c.id === cellId);
    if (!cell?.plant) {
      addNotification('No plant to harvest!', 'error');
      return;
    }
    
    if ((cell.plant.growthProgress || 0) < 100) {
      addNotification('Plant not ready to harvest!', 'error');
      return;
    }

    try {
      const response = await gardenApi.harvestPlant(cellId);
      
      setGrid(prev => prev.map(c => 
        c.id === cellId ? { ...c, plant: null, waterLevel: 100, soilMoisture: 100 } : c
      ));
      setInventory(response.inventory);
      setGardenStats(response.stats);
      
      addNotification(`Harvested! +${response.pointsEarned} points`);
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  // Remove with Backend
  const removePlant = async (cellId) => {
    const cell = grid.find(c => c.id === cellId);
    if (!cell?.plant) return;

    try {
      const response = await gardenApi.removePlant(cellId);
      
      setGrid(prev => prev.map(c => 
        c.id === cellId ? { ...c, plant: null } : c
      ));
      setInventory(response.inventory);
      
      addNotification('Plant removed');
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  const handleCellClick = (cellId) => {
    if (selectedTool === 'water') waterCell(cellId);
    else if (selectedTool === 'harvest') harvestPlant(cellId);
    else if (selectedTool === 'remove') removePlant(cellId);
  };

  const loadLeaderboard = async () => {
    try {
      const response = await gardenApi.getLeaderboard(10);
      setLeaderboard(response.leaderboard);
      setShowLeaderboard(true);
    } catch (error) {
      addNotification('Failed to load leaderboard', 'error');
    }
  };

  const getWaterColor = (waterLevel) => {
    if (waterLevel > 70) return 'bg-blue-500';
    if (waterLevel > 40) return 'bg-blue-400';
    if (waterLevel > 20) return 'bg-orange-400';
    return 'bg-red-500';
  };

  // Drag handlers for inventory items
  const handleDragStart = (e, plantType) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedPlant(plantType);
  };

  const handleDragEnd = (e) => {
    e.preventDefault();
    setDraggedPlant(null);
  };

  const handleCellDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCellDrop = (e, cellId) => {
    e.preventDefault();
    handlePlantDrop(cellId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-400 to-green-200 flex items-center justify-center">
        <div className="text-2xl font-bold text-white">Loading Garden... 🌱</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${WEATHER_TYPES[weather].bgColor} p-4`}>
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-green-700">🌱 Virtual Garden</h1>
              <p className="text-gray-600">Level {gardenStats.level} Garden</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{gardenStats.totalPoints}</div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{gardenStats.plantsPlanted}</div>
                <div className="text-sm text-gray-600">Planted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{gardenStats.plantsGrown}</div>
                <div className="text-sm text-gray-600">Harvested</div>
              </div>
            </div>
          </div>

          {/* Weather & Actions */}
          <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {WEATHER_TYPES[weather].icon}
              <span className="font-semibold">{WEATHER_TYPES[weather].name}</span>
              <span className="text-sm text-gray-600">{WEATHER_TYPES[weather].description}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => saveGarden(false)}
                disabled={saving}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={loadGarden}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload
              </button>
              <button
                onClick={loadLeaderboard}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Garden Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Garden Grid (6×6)</h2>
              <button
                onClick={waterAllPlants}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <Droplet className="w-4 h-4" />
                Water All
              </button>
            </div>

            {/* Tools */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedTool(selectedTool === 'water' ? null : 'water')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  selectedTool === 'water' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                <Droplet className="w-4 h-4" />
                Water
              </button>
              <button
                onClick={() => setSelectedTool(selectedTool === 'harvest' ? null : 'harvest')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  selectedTool === 'harvest' ? 'bg-green-500 text-white' : 'bg-gray-200'
                }`}
              >
                <Leaf className="w-4 h-4" />
                Harvest
              </button>
              <button
                onClick={() => setSelectedTool(selectedTool === 'remove' ? null : 'remove')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  selectedTool === 'remove' ? 'bg-red-500 text-white' : 'bg-gray-200'
                }`}
              >
                ✖ Remove
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-6 gap-2">
              {grid.map(cell => (
                <div
                  key={cell.id}
                  onClick={() => handleCellClick(cell.id)}
                  onDragOver={handleCellDragOver}
                  onDrop={(e) => handleCellDrop(e, cell.id)}
                  className={`
                    aspect-square border-2 rounded-lg p-2 cursor-pointer transition-all
                    ${cell.plant ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-amber-50'}
                    hover:border-green-500 hover:shadow-md
                  `}
                >
                  {cell.plant ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <div className="text-3xl mb-1">{PLANT_TYPES[cell.plant.type].icon}</div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mb-1">
                        <div
                          className="bg-green-500 h-1 rounded-full transition-all"
                          style={{ width: `${cell.plant.growthProgress || 0}%` }}
                        />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`${getWaterColor(cell.waterLevel)} h-1 rounded-full transition-all`}
                          style={{ width: `${cell.waterLevel}%` }}
                        />
                      </div>
                      {(cell.plant.growthProgress || 0) >= 100 && (
                        <div className="text-xs text-green-600 font-bold mt-1">✓ Ready!</div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <div className="text-2xl">🌱</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Plant Inventory */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Plant Inventory</h3>
            <div className="space-y-3">
              {Object.entries(PLANT_TYPES).map(([type, plant]) => (
                <div
                  key={type}
                  draggable={inventory[type] > 0}
                  onDragStart={(e) => handleDragStart(e, type)}
                  onDragEnd={handleDragEnd}
                  className={`
                    p-3 rounded-lg transition-all
                    ${inventory[type] > 0 ? 'cursor-move' : 'cursor-not-allowed opacity-50'}
                    ${draggedPlant === type ? 'bg-green-100 scale-105 shadow-lg' : 'bg-gray-50'}
                    hover:bg-green-50 border-2 border-gray-200 hover:border-green-300
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{plant.icon}</span>
                      <div>
                        <div className="font-semibold">{plant.name}</div>
                        <div className="text-xs text-gray-600">{plant.points} pts</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-green-600">{inventory[type]}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-500 text-center">
              Drag plants to grid to plant
            </div>
          </div>

          {/* Garden Health */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Garden Health</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall Health</span>
                  <span className="font-semibold">
                    {Math.round(grid.filter(c => c.plant).reduce((acc, c) => 
                      acc + (c.plant?.health || 0), 0
                    ) / Math.max(1, grid.filter(c => c.plant).length))}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ 
                      width: `${Math.round(grid.filter(c => c.plant).reduce((acc, c) => 
                        acc + (c.plant?.health || 0), 0
                      ) / Math.max(1, grid.filter(c => c.plant).length))}%` 
                    }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Plants</span>
                  <span className="font-semibold">{grid.filter(c => c.plant).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thirsty Plants</span>
                  <span className="font-semibold text-orange-600">
                    {grid.filter(c => c.plant && c.waterLevel < 30).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ready to Harvest</span>
                  <span className="font-semibold text-green-600">
                    {grid.filter(c => c.plant && (c.plant.growthProgress || 0) >= 100).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">🏆 Leaderboard</h2>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`p-4 rounded-lg ${
                    entry.rank === 1 ? 'bg-yellow-100 border-2 border-yellow-400' :
                    entry.rank === 2 ? 'bg-gray-100 border-2 border-gray-400' :
                    entry.rank === 3 ? 'bg-orange-100 border-2 border-orange-400' :
                    'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold">#{entry.rank}</div>
                      <div>
                        <div className="font-semibold">{entry.email}</div>
                        <div className="text-sm text-gray-600">
                          Level {entry.level} • {entry.plantsGrown} plants grown
                        </div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-green-600">
                      {entry.points}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`
              px-4 py-3 rounded-lg shadow-lg text-white
              ${notif.type === 'error' ? 'bg-red-500' : 
                notif.type === 'warning' ? 'bg-orange-500' : 'bg-green-500'}
            `}
          >
            {notif.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualGarden;