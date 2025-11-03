import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivitySubmissionForm, ActivityRulesDisplay } from '../components/activity';
import { authAPI } from '../services/api';

const LogActivityPage = () => {
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login', { replace: true });
  };

  const handleActivitySuccess = (response) => {
    // Show success message
    alert(`Activity logged successfully! You earned ${response?.activity?.pointsEarned ?? 0} points.`);
    // Optionally redirect to dashboard
    // navigate('/dashboard', { replace: true });
  };

  const handleActivityError = (error) => {
    console.error('Activity submission error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Log Activity</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ActivitySubmissionForm
              onSuccess={handleActivitySuccess}
              onError={handleActivityError}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Activity Rules</h2>
              <button
                onClick={() => setShowRules(!showRules)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showRules ? 'Hide Rules' : 'Show Rules'}
              </button>
            </div>
            {showRules && <ActivityRulesDisplay />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LogActivityPage;