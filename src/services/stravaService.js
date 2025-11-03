
import api from './api';

export const stravaService = {
  async getConnectionStatus() {
    const response = await api.get('/strava/status');
    return response.data;
  },

  async connectStrava() {
    const response = await api.get('/strava/connect');
    return response.data.authUrl;
  },

  async disconnectStrava() {
    const response = await api.post('/strava/disconnect');
    return response.data;
  },

  async syncActivities() {
    const response = await api.post('/strava/sync');
    return response.data;
  }
};