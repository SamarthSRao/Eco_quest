
import axios from 'axios';
import { navigateToLogin } from '../utils/navigation';

const API_BASE_URL = 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigateToLogin();
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: async (email, password) => {
    const response = await api.post('/api/auth/register', { email, password });
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Activity API
export const activityAPI = {
  submitActivity: async (activityData) => {
    const response = await api.post('/api/activity/activity', activityData);
    return response.data;
  },
  getHistory: async (params = {}) => {
    const response = await api.get('/api/activity/history', { params });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/api/activity/stats');
    return response.data;
  },
  getRules: async () => {
    const response = await api.get('/api/activity/rules');
    return response.data;
  }
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/api/user/profile');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/api/user/profile', profileData);
    return response.data;
  },
  getMilestones: async () => {
    const response = await api.get('/api/user/milestones');
    return response.data;
  },
  getLeaderboard: async (limit = 10) => {
    const response = await api.get('/api/user/leaderboard', { params: { limit } });
    return response.data;
  },
  getActivityLog: async (params = {}) => {
    const response = await api.get('/api/user/activitylog', { params });
    return response.data;
  }
};

// Garden API - persist per-user garden state
export const gardenAPI = {
  getGarden: async () => {
    const response = await api.get('/api/garden');
    return response.data;
  },
  updateGarden: async (gardenData) => {
    const response = await api.post('/api/garden', gardenData);
    return response.data;
  }
};

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  if (!user || user === 'undefined') {
    return null;
  }
  try {
    return JSON.parse(user);
  } catch (e) {
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export default api;