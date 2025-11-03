
import React, { useState, useEffect, useCallback } from 'react';
import { activityAPI } from '../../services/api';

/**
 * ActivityRulesDisplay Component
 * Fetches and displays the point rules for various activity types in a clear table format.
 */
const ActivityRulesDisplay = () => {
  // State for the fetched activity rules
  const [rules, setRules] = useState([]);
  
  // State for loading status
  const [loading, setLoading] = useState(true);
  
  // State for API errors
  const [error, setError] = useState(null);

  // Fetch rules when the component mounts
  useEffect(() => {
    fetchRules();
  }, []);

  // Async function to fetch the activity rules from the API
  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming activityAPI.getRules() returns an object like { rules: [...] }
      const response = await activityAPI.getRules();
      setRules(response.rules || []);
      setError(null);
    } catch (t) {
      setError('Failed to load activity rules');
      console.error('Error fetching rules:', t);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Loading State UI ---
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Activity Rules</h2>
        <div className="animate-pulse space-y-3">
          {/* Render 5 skeleton loaders for table rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // --- Error State UI ---
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Activity Rules</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={fetchRules}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // --- Main Rules Table UI ---
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Activity Rules & Points</h2>
      <p className="text-gray-600 mb-4">
        Earn points by completing different activities. Here's how many points each activity is worth:
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {rules.map((rule, index) => (
              <tr 
                key={rule.type || index} 
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {/* Activity Type (Capitalized) */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {rule.type}
                  </div>
                </td>
                
                {/* Points */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {rule.points} points
                  </span>
                </td>
                
                {/* Description */}
                <td className="px-6 py-4 text-sm text-gray-500">
                  {rule.description || 'No description available'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State Message */}
      {rules.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No activity rules found.</p>
        </div>
      )}

      {/* Explanation Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Submit an activity with a description to earn points</li>
          <li>• Some activities (cycling, running, walking) can include distance for additional context</li>
          <li>• Points are awarded based on the activity type</li>
          <li>• Track your progress and compete with others on the leaderboard</li>
        </ul>
      </div>
    </div>
  );
};

export default ActivityRulesDisplay;