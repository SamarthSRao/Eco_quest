import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Assuming named imports based on usage
import ActivityStatsDashboard from '../components/activity/ActivityStatsDashboard'; 
import { UserProfileDisplay, MilestonesList, LeaderboardTable } from '../components/user'; 
import VirtualGarden from './VirtualGarden';
import { authAPI } from '../services/api';
import StravaConnect from '../components/activity/StravaConnect';
/**
 * ActivityDashboard component.
 * Displays the main dashboard with tabbed navigation for stats, profile, milestones, and leaderboard.
 */
const ActivityDashboard = () => {
  const navigate = useNavigate();
  // State to manage the currently active tab, defaults to 'dashboard'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Handler for logging out the user
  const handleLogout = () => {
    authAPI.logout();
    navigate('/login', { replace: true }); // Navigate to login page using React Router
  };

  // Array defining the navigation tabs
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'garden', label: 'Garden', icon: '🌱' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'milestones', label: 'Milestones', icon: '🏆' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🥇' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Header --- */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Activity Tracker</h1>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Log Activity Button */}
              <button
                onClick={() => navigate('/log-activity')}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {/* SVG for plus icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Log Activity</span>
              </button>
              
              {/* History Button */}
              <button
                onClick={() => navigate('/history')}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {/* SVG for history icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>History</span>
              </button>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {/* SVG for logout icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- Tab Navigation --- */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                // Dynamic class for active vs. inactive tab styling
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* --- Main Content Area (Conditional Rendering) --- */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <ActivityStatsDashboard />
          </div>
        )}

        {activeTab === 'garden' && (
          <div className="space-y-6">
            <VirtualGarden />
          </div>
        )}
        
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <UserProfileDisplay />
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="max-w-4xl mx-auto">
            <MilestonesList />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="max-w-4xl mx-auto">
            <LeaderboardTable limit={20} />
          </div>
        )}
      </main>
    </div>
  );
};

export default ActivityDashboard;