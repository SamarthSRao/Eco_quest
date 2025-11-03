import React, { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../../services/api';

/**
 * MilestonesList Component
 * Fetches and displays the user's list of milestones, showing progress and status.
 */
const MilestonesList = () => {
  // State for the array of milestones
  const [milestones, setMilestones] = useState([]);
  
  // State for loading status
  const [loading, setLoading] = useState(true);
  
  // State for API errors
  const [error, setError] = useState(null);

  // Memoized function to fetch milestones from the API
  const fetchMilestones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming userAPI.getMilestones() returns an object like { milestones: [...] }
      const response = await userAPI.getMilestones(); 
      setMilestones(response.milestones || []);
      setError(null);
    } catch (t) {
      setError('Failed to load milestones');
      console.error('Error fetching milestones:', t);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch milestones when the component mounts
  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  /**
   * Determines the status, color, and icon for a given milestone.
   * @param {object} milestone
   * @returns {{status: string, color: string, icon: JSX.Element}}
   */
  const getMilestoneStatus = (milestone) => {
    if (milestone.achieved) {
      return {
        status: 'achieved',
        color: 'green',
        icon: (
          // Checkmark / Achieved Icon
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    } else if (milestone.isNext) {
      return {
        status: 'next',
        color: 'blue',
        icon: (
          // Clock / Next Goal Icon
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    } else {
      return {
        status: 'locked',
        color: 'gray',
        icon: (
          // Lock / Locked Icon
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    }
  };

  /**
   * Calculates the percentage progress for a milestone.
   * @param {object} milestone
   * @returns {number} Progress percentage (0-100)
   */
  const calculateProgress = (milestone) => {
    if (milestone.achieved) return 100;
    if (!milestone.currentProgress || !milestone.target) return 0;
    // Calculate and clamp between 0 and 100
    return Math.min((milestone.currentProgress / milestone.target) * 100, 100);
  };

  // --- Loading State UI ---
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Milestones</h2>
        <div className="animate-pulse space-y-4">
          {/* Render 5 skeleton loaders */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-2 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Error State UI ---
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Milestones</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={fetchMilestones}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // --- Main Milestone List UI ---
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Milestones</h2>
      <p className="text-gray-600 mb-6">
        Track your progress and unlock achievements as you earn points through activities.
      </p>

      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          const status = getMilestoneStatus(milestone);
          const progress = calculateProgress(milestone);
          
          return (
            <div
              key={milestone._id || index}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                milestone.achieved
                  ? 'border-green-200 bg-green-50'
                  : milestone.isNext
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Status Icon */}
                  <div
                    className={`p-2 rounded-full ${
                      status.color === 'green'
                        ? 'bg-green-100 text-green-600'
                        : status.color === 'blue'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {status.icon}
                  </div>
                  
                  {/* Milestone Details and Progress Bar */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          milestone.achieved
                            ? 'text-green-800'
                            : milestone.isNext
                            ? 'text-blue-800'
                            : 'text-gray-600'
                        }`}
                      >
                        {milestone.name}
                      </h3>
                      {milestone.achieved && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Achieved
                        </span>
                      )}
                      {milestone.isNext && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Next Goal
                        </span>
                      )}
                    </div>
                    
                    <p
                      className={`text-sm mb-2 ${
                        milestone.achieved
                          ? 'text-green-700'
                          : milestone.isNext
                          ? 'text-blue-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {milestone.description}
                    </p>

                    {/* Progress Text */}
                    <div className="flex items-center justify-between text-sm">
                      <span
                        className={`font-medium ${
                          milestone.achieved
                            ? 'text-green-800'
                            : milestone.isNext
                            ? 'text-blue-800'
                            : 'text-gray-600'
                        }`}
                      >
                        {milestone.currentProgress || 0} / {milestone.target} points
                      </span>
                      <span
                        className={`font-medium ${
                          milestone.achieved
                            ? 'text-green-600'
                            : milestone.isNext
                            ? 'text-blue-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {Math.round(progress)}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {!milestone.achieved && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            milestone.isNext ? 'bg-blue-600' : 'bg-gray-400'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                    
                    {/* Points needed for next milestone */}
                    {milestone.isNext && milestone.currentProgress < milestone.target && (
                      <p className="text-xs text-blue-600 mt-1">
                        {milestone.target - milestone.currentProgress} more points needed
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State Message */}
        {milestones.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No milestones available.</p>
          </div>
        )}
      </div>

      {/* Explanation Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">How milestones work:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Complete activities to earn points and progress toward milestones</li>
          <li>• Each milestone has a specific point target to achieve</li>
          <li>• Achieved milestones are permanently unlocked</li>
          <li>• Focus on the "Next Goal" to see your immediate target</li>
        </ul>
      </div>
    </div>
  );
};

export default MilestonesList;