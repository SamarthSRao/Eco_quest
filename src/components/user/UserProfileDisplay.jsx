import React, { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../../services/api';

/**
 * UserProfileDisplay Component
 * Displays the current user's profile information, including points,
 * milestone progress, and a progress bar to the next milestone.
 * @param {object} props - Component props
 * @param {function} props.onEdit - Callback function to handle the "Edit Profile" action
 */
const UserProfileDisplay = ({ onEdit }) => {
  // State for storing the user's profile data
  const [profile, setProfile] = useState({
    email: '',
    points: 0,
    achievedMilestones: 0,
    totalMilestones: 0,
    nextMilestone: null, // Should contain { name, target, previousTarget }
  });
  
  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch the user's profile data from the API
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userAPI.getProfile();
      setProfile(response);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch profile data when the component mounts
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Calculates the percentage progress toward the *next* milestone
  const calculateProgressToNextMilestone = () => {
    if (!profile.nextMilestone) return 0;

    const currentPoints = profile.points;
    const nextMilestonePoints = profile.nextMilestone.target;
    // Base the progress off the points since the *previous* milestone
    const previousMilestonePoints = profile.nextMilestone.previousTarget || 0; 
    
    const progress = 
      ((currentPoints - previousMilestonePoints) / (nextMilestonePoints - previousMilestonePoints)) * 100;
      
    // Clamp the value between 0 and 100
    return Math.min(Math.max(progress, 0), 100);
  };
  
  // --- Loading State UI ---
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Profile</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  // --- Error State UI ---
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Profile</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={fetchProfile}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // --- Display Profile UI ---
  const progressToNext = calculateProgressToNextMilestone();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header and Edit Button */}
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold text-gray-800">Profile</h2>
        {onEdit && (
          <button
            onClick={onEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Email Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <p className="text-lg text-gray-900">{profile.email}</p>
        </div>

        {/* Total Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Points</label>
          <div className="flex items-center">
            <span className="text-3xl font-bold text-green-600">{profile.points}</span>
            <span className="ml-2 text-sm text-gray-500">points earned</span>
          </div>
        </div>

        {/* Overall Milestones Progress */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Milestones Progress</label>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {profile.achievedMilestones} of {profile.totalMilestones} milestones achieved
            </span>
            <span className="text-sm font-medium text-gray-900">
              {Math.round((profile.achievedMilestones / profile.totalMilestones) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(profile.achievedMilestones / profile.totalMilestones) * 100}%` }}
            />
          </div>
        </div>

        {/* Next Milestone Progress */}
        {profile.nextMilestone && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Milestone: {profile.nextMilestone.name}
            </label>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                {profile.points} / {profile.nextMilestone.target} points
              </span>
              <span className="text-sm font-medium text-gray-900">
                {Math.round(progressToNext)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {profile.nextMilestone.target - profile.points} more points needed
            </p>
          </div>
        )}

        {/* Milestone Achievement Badge/Message */}
        {profile.achievedMilestones > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {/* SVG for checkmark/congrats icon */}
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">
                  Congratulations! You've achieved {profile.achievedMilestones} milestone{profile.achievedMilestones !== 1 ? 's' : ''}!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileDisplay;