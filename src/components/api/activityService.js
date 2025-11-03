import api from '../../services/api';

// Activity Service: thin wrapper around the shared axios instance
// Endpoints mirror backend routes defined under `/api/activity`

/**
 * Submit a new activity
 * @param {{
 *   type: string,
 *   distance?: number,
 *   description: string
 * }} activityData
 * @returns {Promise<any>}
 */
export const submitActivity = async (activityData) => {
  const response = await api.post('/api/activity/activity', activityData);
  return response.data;
};

/**
 * Fetch activity history for the authenticated user
 * @param {{ page?: number, limit?: number, type?: string }} params
 * @returns {Promise<any>}
 */
export const getHistory = async (params = {}) => {
  const response = await api.get('/api/activity/history', { params });
  return response.data;
};

/**
 * Fetch computed activity statistics for the authenticated user
 * @returns {Promise<any>}
 */
export const getStats = async () => {
  const response = await api.get('/api/activity/stats');
  return response.data;
};

/**
 * Fetch activity points/rules catalog
 * @returns {Promise<any>}
 */
export const getRules = async () => {
  const response = await api.get('/api/activity/rules');
  return response.data;
};

const activityService = {
  submitActivity,
  getHistory,
  getStats,
  getRules,
};

export default activityService;


