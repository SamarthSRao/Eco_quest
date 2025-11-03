import React, { useState, useEffect, useCallback } from 'react';
import { userAPI, getStoredUser } from '../../services/api'; 
// Assuming getStoredUser is a helper function to get the current user's info from local storage/context

/**
 * LeaderboardTable Component
 * Fetches and displays the top players based on total points.
 *
 * @param {object} props
 * @param {number} [props.limit=10] - The maximum number of players to display.
 */
const LeaderboardTable = ({ limit = 10 }) => {
  // State for the leaderboard data (array of users)
  const [leaderboard, setLeaderboard] = useState([]);
  
  // State for loading status
  const [loading, setLoading] = useState(true);
  
  // State for API errors
  const [error, setError] = useState(null);
  
  // State for the current authenticated user's data (used for highlighting)
  const [currentUser, setCurrentUser] = useState(null);

  // Effect to fetch data when the component mounts or the limit changes
  useEffect(() => {
    fetchLeaderboard();
    // Retrieve the current user's data on mount
    setCurrentUser(getStoredUser());
  }, [limit]);

  // Memoized function to fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pass the limit to the API call
      const response = await userAPI.getLeaderboard(limit); 
      setLeaderboard(response.leaderboard || []);
      setError(null);
    } catch (t) {
      setError('Failed to load leaderboard');
      console.error('Error fetching leaderboard:', t);
    } finally {
      setLoading(false);
    }
  }, [limit]); // Re-create fetchLeaderboard if limit changes

  /**
   * Returns an icon for the top ranks (1, 2, 3) or the numerical rank.
   * @param {number} rank
   * @returns {JSX.Element}
   */
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return (
          // Gold Star Icon
          <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case 2:
        return (
          // Silver Star Icon
          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case 3:
        return (
          // Bronze Star Icon (or similar orange/copper color)
          <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      default:
        // Generic Rank Display for ranks 4 and up
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  /**
   * Gets the Tailwind CSS classes for the rank badge background/text/border.
   * @param {number} rank
   * @returns {string} Tailwind CSS class string
   */
  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  /**
   * Checks if the user object corresponds to the currently logged-in user.
   * @param {object} user - A user object from the leaderboard.
   * @returns {boolean}
   */
  const isCurrentUser = (user) => {
    // Assuming the user object has an _id property
    return currentUser && user._id === currentUser._id; 
  };

  // --- Loading State UI ---
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Leaderboard</h2>
        <div className="animate-pulse space-y-3">
          {/* Render 5 skeleton loaders */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // --- Error State UI ---
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Leaderboard</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={fetchLeaderboard}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // --- Main Leaderboard UI ---
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Leaderboard</h2>
        <span className="text-sm text-gray-500">Top {limit} players</span>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboard.map((user, index) => {
          const rank = index + 1;
          const isUser = isCurrentUser(user);

          return (
            <div
              key={user._id || index}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                isUser
                  ? 'border-blue-300 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                {/* Rank Icon/Number */}
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(rank)}
                </div>
                
                <div className="flex-1">
                  {/* User Email and "You" Badge */}
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-semibold ${isUser ? 'text-blue-800' : 'text-gray-900'}`}
                    >
                      {user.email}
                    </span>
                    {isUser && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        You
                      </span>
                    )}
                  </div>
                  
                  {/* Rank Badge and Activity Count */}
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRankBadgeColor(rank)}`}
                    >
                      Rank #{rank}
                    </span>
                    <span className="text-sm text-gray-500">
                      {user.totalActivities || 0} activities
                    </span>
                  </div>
                </div>
              </div>

              {/* Points Display */}
              <div className="text-right">
                <div
                  className={`text-2xl font-bold ${isUser ? 'text-blue-600' : 'text-green-600'}`}
                >
                  {user.points || 0}
                </div>
                <div className="text-sm text-gray-500">points</div>
              </div>
            </div>
          );
        })}

        {/* Empty State Message */}
        {leaderboard.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No leaderboard data available.</p>
          </div>
        )}
      </div>

      {/* Tip Box */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
        <h3 className="text-sm font-medium text-green-800 mb-2">How to climb the leaderboard:</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Complete more activities to earn points</li>
          <li>• Try different activity types to maximize your score</li>
          <li>• Stay consistent with your activity logging</li>
          <li>• Check back regularly to see your progress</li>
        </ul>
      </div>
    </div>
  );
};

export default LeaderboardTable;