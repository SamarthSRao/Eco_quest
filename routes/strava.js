const express = require('express');
const router = express.Router();
const User = require('../models/User');
const StravaService = require('../services/stravaService');
const { authenticateToken, generateToken } = require('../middleware/auth');

// Get Strava authorization URL
router.get('/connect', authenticateToken, (req, res) => {
  try {
    const authUrl = StravaService.getAuthorizationUrl(req.user._id.toString());
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate authorization URL', error: error.message });
  }
});

// Public endpoint to get an authorization URL for sign-in (no user required)
router.get('/auth-url', (req, res) => {
  try {
    // If frontend wants to start a sign-in (not link), we'll use a special state value 'signin'
    const authUrl = StravaService.getAuthorizationUrl('signin');
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate authorization URL', error: error.message });
  }
});

// OAuth callback
router.get('/callback', async (req, res) => {
  const { code, state: userIdOrState, error } = req.query;

  if (error) {
    // Redirect to dedicated frontend callback with error
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontend}/auth/strava/callback?error=${encodeURIComponent(error)}`);
  }

  try {
    const tokens = await StravaService.exchangeToken(code);

    // If the state is 'signin', handle sign-in flow: create/find user by athlete id and issue JWT
    if (!userIdOrState || userIdOrState === 'signin') {
      const athlete = tokens.athlete;

      // Try to find an existing user by athleteId
      let user = await User.findOne({ 'strava.athleteId': athlete.id.toString() });

      if (!user) {
        // Create a new user using athlete email if available
        const email = athlete.email || `strava_${athlete.id}@noemail.strava`;
        user = new User({
          email,
          password: Math.random().toString(36).slice(2), // random password — user can reset later
          points: 0,
          strava: {
            connected: true,
            athleteId: athlete.id.toString(),
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt,
            lastSync: null
          }
        });

        await user.save();
      } else {
        // Update existing user's Strava credentials
        user.strava = user.strava || {};
        user.strava.connected = true;
        user.strava.athleteId = athlete.id.toString();
        user.strava.accessToken = tokens.accessToken;
        user.strava.refreshToken = tokens.refreshToken;
        user.strava.expiresAt = tokens.expiresAt;
        await user.save();
      }

  // Generate JWT and redirect to dedicated frontend callback (frontend will pick it up)
  const jwt = generateToken(user._id.toString());
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  return res.redirect(`${frontend}/auth/strava/callback?strava_token=${encodeURIComponent(jwt)}`);
    }

    // Otherwise state is a userId (linking an existing logged-in user)
    const user = await User.findById(userIdOrState);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.strava = {
      connected: true,
      athleteId: tokens.athlete.id.toString(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      lastSync: null
    };

    await user.save();

    // Redirect to dedicated frontend callback with success state (frontend will navigate appropriately)
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontend}/auth/strava/callback?strava_connected=true`);
  } catch (error) {
    console.error('Strava callback error:', error);
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontend}/auth/strava/callback?strava_error=connection_failed`);
  }
});

// Disconnect Strava
router.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    req.user.strava = {
      connected: false,
      athleteId: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      lastSync: null
    };

    await req.user.save();
    res.json({ message: 'Strava disconnected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disconnect Strava', error: error.message });
  }
});

// Manual sync activities
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    if (!req.user.strava || !req.user.strava.connected) {
      return res.status(400).json({ message: 'Strava not connected' });
    }

    const accessToken = await StravaService.getValidAccessToken(req.user);

    // Fetch activities after last sync (or last 30 days if first sync)
    const after = req.user.strava.lastSync || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const stravaActivities = await StravaService.getActivities(accessToken, after);

    let syncedCount = 0;
    let totalPoints = 0;

    for (const stravaActivity of stravaActivities) {
      // Check if already synced
      const existingActivity = req.user.activityLog.find(
        act => act.stravaId === stravaActivity.id.toString()
      );

      if (existingActivity) continue;

      // Map and add activity
      const mappedActivity = StravaService.mapStravaActivity(stravaActivity);
      if (!mappedActivity) continue; // Skip unsupported activities

      const points = StravaService.calculatePoints(mappedActivity.type, mappedActivity.distance);

      req.user.activityLog.push({
        ...mappedActivity,
        pointsEarned: points
      });

      req.user.points = (req.user.points || 0) + points;
      totalPoints += points;
      syncedCount++;
    }

    req.user.strava.lastSync = new Date();
    await req.user.save();

    res.json({
      message: 'Activities synced successfully',
      data: {
        syncedCount,
        totalPoints,
        lastSync: req.user.strava.lastSync
      }
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ message: 'Failed to sync activities', error: error.message });
  }
});

// Get Strava connection status
router.get('/status', authenticateToken, (req, res) => {
  res.json({
    connected: req.user.strava?.connected || false,
    lastSync: req.user.strava?.lastSync || null,
    athleteId: req.user.strava?.athleteId || null
  });
});

// Webhook subscription (for automatic syncing)
router.get('/webhook', (req, res) => {
  const { ['hub.mode']: mode, ['hub.verify_token']: token, ['hub.challenge']: challenge } = req.query;

  if (mode === 'subscribe' && token === process.env.STRAVA_VERIFY_TOKEN) {
    console.log('Webhook verified');
    return res.json({ ['hub.challenge']: challenge });
  }

  res.status(403).json({ message: 'Verification failed' });
});

// Webhook events (automatic activity sync)
router.post('/webhook', async (req, res) => {
  const event = req.body;

  // Acknowledge receipt immediately
  res.status(200).send('EVENT_RECEIVED');

  // Process event asynchronously
  if (event.object_type === 'activity' && event.aspect_type === 'create') {
    try {
      const user = await User.findOne({ 'strava.athleteId': event.owner_id.toString() });
      if (!user) return;

      const accessToken = await StravaService.getValidAccessToken(user);
      const stravaActivity = await StravaService.getActivity(accessToken, event.object_id);

      const mappedActivity = StravaService.mapStravaActivity(stravaActivity);
      if (!mappedActivity) return;

      const points = StravaService.calculatePoints(mappedActivity.type, mappedActivity.distance);

      user.activityLog.push({
        ...mappedActivity,
        pointsEarned: points
      });

      user.points = (user.points || 0) + points;
      await user.save();

      console.log(`Auto-synced activity ${event.object_id} for user ${user.email}`);
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  }
});

module.exports = router;