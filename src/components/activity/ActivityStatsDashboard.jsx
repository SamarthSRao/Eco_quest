
import React, { useState, useEffect, useCallback } from 'react';
import { activityAPI } from '../../services/api';

/**
 * ActivityStatsDashboard Component
 * Fetches and displays core activity statistics, including total activities,
 * total points, total distance, a breakdown by type, and recent logs.
 */
const ActivityStatsDashboard = () => {
  // State for all fetched statistics
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalPoints: 0,
    totalDistance: 0,
    activitiesByType: {}, // { 'running': 5, 'cycling': 10, ... }
    recentActivities: [], // Array of recent activity objects
  });
  
  // State for loading status
  const [loading, setLoading] = useState(true);
  
  // State for API errors
  const [error, setError] = useState(null);

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Async function to fetch statistics from the API
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await activityAPI.getStats();
      setStats(response);
      setError(null);
    } catch (t) {
      setError('Failed to load activity statistics');
      console.error('Error fetching stats:', t);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Sub-Components for UI structure ---

  /**
   * StatCard Component: Displays a single key metric.
   */
  const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full bg-${color}-100`}>
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * ActivityTypeChart Component: Displays a breakdown of activities by type.
   */
  const ActivityTypeChart = () => {
    // Backend returns activitiesByType: { [type]: { count, totalPoints, totalDistance } }
    const totalActivities = Object.values(stats.activitiesByType).reduce((sum, value) => sum + (value?.count || 0), 0);

    if (totalActivities === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Activities by Type</h3>
          <p className="text-gray-500 text-center py-8">No activities recorded yet</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Activities by Type</h3>
        <div className="space-y-3">
          {Object.entries(stats.activitiesByType).map(([type, value]) => {
            const count = value?.count || 0;
            const percentage = totalActivities > 0 ? (count / totalActivities) * 100 : 0;
            return (
              <div key={type} className="flex items-center">
                <div className="w-20 text-sm font-medium text-gray-700 capitalize">{type}</div>
                <div className="flex-1 mx-4">
                  {/* Progress Bar */}
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">
                  {count} ({percentage.toFixed(1)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * RecentActivitiesList Component: Displays the last few logged activities.
   */
  const RecentActivitiesList = () => {
    if (stats.recentActivities.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
          <p className="text-gray-500 text-center py-8">No recent activities</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {/* Displaying only the top 5 recent activities */}
          {stats.recentActivities.slice(0, 5).map((activity, index) => (
            <div
              key={activity._id || index}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 capitalize">{activity.type}</p>
                <p className="text-xs text-gray-500 truncate">{activity.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">
                  +{activity.pointsEarned} pts
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- Main Render Logic ---

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Skeleton Loaders for Stat Cards */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
        {/* Placeholder for the charts/lists could be added here */}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
        <button onClick={fetchStats} className="ml-2 underline hover:no-underline">
          Retry
        </button>
      </div>
    );
  }

  // Success State
  return (
    <div className="space-y-6">
      {/* 1. Stat Cards (Total Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Activities"
          value={stats.totalActivities}
          subtitle="All time"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Total Points"
          value={stats.totalPoints}
          subtitle="Earned"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Total Distance"
          value={`${stats.totalDistance} km`}
          subtitle="Traveled"
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* 2. Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTypeChart />
        <RecentActivitiesList />
      </div>
    </div>
  );
};

export default ActivityStatsDashboard;