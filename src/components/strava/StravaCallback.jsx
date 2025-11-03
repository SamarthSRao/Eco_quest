import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setAuthToken } from '../../services/api';

/**
 * StravaCallback
 * Handles redirects from the backend after Strava OAuth completes.
 * Expected query params:
 * - strava_token: JWT issued by backend for signin flow
 * - strava_connected: true when linking an existing user succeeded
 * - error / strava_error: error messages
 */
export default function StravaCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const stravaToken = searchParams.get('strava_token');
    const connected = searchParams.get('strava_connected');
    const error = searchParams.get('error') || searchParams.get('strava_error');

    if (stravaToken) {
      // Sign-in flow: set token and navigate to dashboard
      setAuthToken(stravaToken);
      navigate('/dashboard', { replace: true });
      return;
    }

    if (connected) {
      // Account linking success. Navigate to dashboard with a flag
      navigate('/dashboard', { state: { stravaConnected: true }, replace: true });
      return;
    }

    if (error) {
      // Send user to dashboard or login with an error param for UI to show
      // Prefer dashboard if user appears logged in; otherwise go to login
      const token = localStorage.getItem('token');
      if (token) {
        navigate(`/dashboard?strava_error=${encodeURIComponent(error)}`, { replace: true });
      } else {
        navigate(`/login?strava_error=${encodeURIComponent(error)}`, { replace: true });
      }
      return;
    }

    // Nothing meaningful in query -> go to login
    navigate('/login', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-6 bg-gray-800 text-white rounded">
        <p>Finalizing Strava sign-in... If this page does not redirect, please close this window and try again.</p>
      </div>
    </div>
  );
}
