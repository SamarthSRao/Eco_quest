import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { setNavigateFunction } from './utils/navigation';

// Import Page Components
import LoginPage from './pages/LoginPage';
import ActivityDashboard from './pages/ActivityDashboard';
import LogActivityPage from './pages/LogActivityPage';
import ActivityHistoryPage from './pages/ActivityHistoryPage';
import VirtualGarden from './pages/VirtualGarden';
import StravaCallback from './components/strava/StravaCallback';

/**
 * Main application component with React Router routing.
 */
function App() {
  const navigate = useNavigate();

  // Set up navigation function for use in non-React contexts
  useEffect(() => {
    setNavigateFunction(navigate);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/strava/callback" element={<StravaCallback />} />
      <Route path="/dashboard" element={<ActivityDashboard />} />
      <Route path="/log-activity" element={<LogActivityPage />} />
      <Route path="/history" element={<ActivityHistoryPage />} />
      <Route path="/garden" element={<VirtualGarden />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;