const axios = require('axios');

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';
const STRAVA_OAUTH_BASE = 'https://www.strava.com/oauth';

class StravaService {
  // Generate authorization URL
  static getAuthorizationUrl(userId) {
    const params = new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID,
      redirect_uri: process.env.STRAVA_CALLBACK_URL,
      response_type: 'code',
      scope: 'read,activity:read_all',
      state: userId // Pass user ID to link accounts
    });
    
    return `${STRAVA_OAUTH_BASE}/authorize?${params.toString()}`;
  }

  // Exchange authorization code for tokens
  static async exchangeToken(code) {
    try {
      // Strava expects form-encoded data for token exchange
      const params = new URLSearchParams();
      params.append('client_id', process.env.STRAVA_CLIENT_ID);
      params.append('client_secret', process.env.STRAVA_CLIENT_SECRET);
      params.append('code', code);
      params.append('grant_type', 'authorization_code');

      const response = await axios.post(`${STRAVA_OAUTH_BASE}/token`, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: new Date(response.data.expires_at * 1000),
        athlete: response.data.athlete
      };
    } catch (error) {
      // Log response details for debugging (safe during development)
      if (error.response) {
        console.error('Strava exchangeToken error response:', error.response.status, error.response.data);
      } else {
        console.error('Strava exchangeToken error:', error.message);
      }
      const details = error.response ? ` status=${error.response.status} data=${JSON.stringify(error.response.data)}` : '';
      throw new Error('Failed to exchange Strava token: ' + error.message + details);
    }
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken) {
    try {
      const params = new URLSearchParams();
      params.append('client_id', process.env.STRAVA_CLIENT_ID);
      params.append('client_secret', process.env.STRAVA_CLIENT_SECRET);
      params.append('refresh_token', refreshToken);
      params.append('grant_type', 'refresh_token');

      const response = await axios.post(`${STRAVA_OAUTH_BASE}/token`, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: new Date(response.data.expires_at * 1000)
      };
    } catch (error) {
      if (error.response) {
        console.error('Strava refreshAccessToken error response:', error.response.status, error.response.data);
      } else {
        console.error('Strava refreshAccessToken error:', error.message);
      }
      const details = error.response ? ` status=${error.response.status} data=${JSON.stringify(error.response.data)}` : '';
      throw new Error('Failed to refresh Strava token: ' + error.message + details);
    }
  }

  // Get valid access token (refresh if expired)
  static async getValidAccessToken(user) {
    if (!user.strava.connected) {
      throw new Error('Strava not connected');
    }

    const now = new Date();
    if (user.strava.expiresAt > now) {
      return user.strava.accessToken;
    }

    // Token expired, refresh it
    const tokens = await this.refreshAccessToken(user.strava.refreshToken);
    
    user.strava.accessToken = tokens.accessToken;
    user.strava.refreshToken = tokens.refreshToken;
    user.strava.expiresAt = tokens.expiresAt;
    await user.save();

    return tokens.accessToken;
  }

  // Fetch activities from Strava
  static async getActivities(accessToken, after = null, page = 1, perPage = 30) {
    try {
      const params = { page, per_page: perPage };
      if (after) params.after = Math.floor(after.getTime() / 1000);

      const response = await axios.get(`${STRAVA_API_BASE}/athlete/activities`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch Strava activities: ' + error.message);
    }
  }

  // Get single activity details
  static async getActivity(accessToken, activityId) {
    try {
      const response = await axios.get(`${STRAVA_API_BASE}/activities/${activityId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch Strava activity: ' + error.message);
    }
  }

  // Map Strava activity to our activity format
  static mapStravaActivity(stravaActivity) {
    const typeMapping = {
      'Ride': 'cycling',
      'Run': 'running',
      'Walk': 'walking',
      'VirtualRide': 'cycling',
      'VirtualRun': 'running'
    };

    const type = typeMapping[stravaActivity.type];
    if (!type) return null; // Unsupported activity type

    const distanceInKm = stravaActivity.distance / 1000;

    return {
      type,
      distance: distanceInKm,
      description: `${stravaActivity.name} (from Strava)`,
      date: new Date(stravaActivity.start_date),
      stravaId: stravaActivity.id.toString(),
      stravaData: {
        name: stravaActivity.name,
        elapsedTime: stravaActivity.elapsed_time,
        movingTime: stravaActivity.moving_time,
        totalElevationGain: stravaActivity.total_elevation_gain
      }
    };
  }

  // Calculate points based on activity type and distance
  static calculatePoints(type, distance) {
    const rules = {
      cycling: 10,
      running: 15,
      walking: 5
    };

    return Math.round((rules[type] || 0) * distance);
  }
}

module.exports = StravaService;
