import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { stravaService } from '../../services/stravaService';

const StravaConnect = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState({ connected: false, lastSync: null });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStatus();
    
    // Check for connection callback
    if (searchParams.get('strava_connected') === 'true') {
      setMessage('Strava connected successfully!');
      fetchStatus();
      // Remove query params from URL
      setSearchParams({});
    }
    
    // Check for connection errors
    if (searchParams.get('strava_error')) {
      setMessage(`Connection failed: ${searchParams.get('strava_error')}`);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const fetchStatus = async () => {
    try {
      const data = await stravaService.getConnectionStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch Strava status:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const authUrl = await stravaService.connectStrava();
      // For external OAuth redirects, window.location.href is necessary
      window.location.href = authUrl;
    } catch (error) {
      setMessage('Failed to connect to Strava');
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Strava?')) return;

    try {
      setLoading(true);
      await stravaService.disconnectStrava();
      setStatus({ connected: false, lastSync: null });
      setMessage('Strava disconnected');
    } catch (error) {
      setMessage('Failed to disconnect Strava');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const result = await stravaService.syncActivities();
      setMessage(
        `Synced ${result.data.syncedCount} activities, earned ${result.data.totalPoints} points!`
      );
      await fetchStatus();
    } catch (error) {
      setMessage('Failed to sync activities');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="strava-connect">
      <h2>Strava Integration</h2>
      
      <div className="status">
        {status.connected ? 'Connected' : 'Not connected'}
      </div>

      <div className="actions">
        {status.connected ? (
          <>
            <button onClick={handleSync} disabled={syncing}>
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <button onClick={handleDisconnect} disabled={loading}>
              Disconnect
            </button>
          </>
        ) : (
          <button onClick={handleConnect} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect Strava'}
          </button>
        )}
      </div>

      {status.connected && status.lastSync && (
        <p className="last-sync">
          Last synced: {new Date(status.lastSync).toLocaleString()}
        </p>
      )}

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      <div className="info">
        <h3>How it works:</h3>
        <ul>
          <li>Connect your Strava account securely</li>
          <li>Your cycling, running, and walking activities will be synced</li>
          <li>Earn points automatically for each activity</li>
          <li>Sync manually or wait for automatic updates</li>
        </ul>
      </div>
    </div>
  );
};

export default StravaConnect;