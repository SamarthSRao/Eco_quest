const API_BASE_URL = 'http://localhost:3000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create headers with auth token
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
});

// Garden API Service
const gardenApi = {
  // Get user's garden data
  getGarden: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/garden`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch garden data');
      }

      return await response.json();
    } catch (error) {
      console.error('Get garden error:', error);
      throw error;
    }
  },

  // Save complete garden state
  saveGarden: async (gardenData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/garden/save`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(gardenData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save garden');
      }

      return await response.json();
    } catch (error) {
      console.error('Save garden error:', error);
      throw error;
    }
  },

  // Update only statistics
  updateStats: async (stats) => {
    try {
      const response = await fetch(`${API_BASE_URL}/garden/stats`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ stats })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Update stats error:', error);
      throw error;
    }
  },

  // Plant a seed
  plantSeed: async (cellId, plantType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/garden/plant`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ cellId, plantType })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to plant seed');
      }

      return await response.json();
    } catch (error) {
      console.error('Plant seed error:', error);
      throw error;
    }
  },

  // Harvest a plant
  harvestPlant: async (cellId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/garden/harvest`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ cellId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to harvest plant');
      }

      return await response.json();
    } catch (error) {
      console.error('Harvest error:', error);
      throw error;
    }
  },

  // Water plants
  waterPlants: async (cellId = null, waterAll = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/garden/water`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ cellId, waterAll })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to water plants');
      }

      return await response.json();
    } catch (error) {
      console.error('Water error:', error);
      throw error;
    }
  },

  // Remove a plant
  removePlant: async (cellId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/garden/plant/${cellId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove plant');
      }

      return await response.json();
    } catch (error) {
      console.error('Remove plant error:', error);
      throw error;
    }
  },

  // Get garden leaderboard
  getLeaderboard: async (limit = 10) => {
    try {
      const response = await fetch(`${API_BASE_URL}/garden/leaderboard?limit=${limit}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch leaderboard');
      }

      return await response.json();
    } catch (error) {
      console.error('Leaderboard error:', error);
      throw error;
    }
  }
};

export default gardenApi;