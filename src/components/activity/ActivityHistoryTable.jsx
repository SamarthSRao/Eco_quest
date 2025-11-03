
import React, { useState, useEffect, useCallback } from 'react';
import { activityAPI } from '../../services/api';

/**
 * ActivityHistoryTable Component
 * Displays the user's historical activity logs in a paginated table,
 * complete with filtering and sorting controls.
 */
const ActivityHistoryTable = () => {
  // State for the list of activities displayed in the current view
  const [activities, setActivities] = useState([]);
  
  // State for pagination details (fetched from the API response)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalActivities: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  
  // State for filtering and sorting parameters
  const [filters, setFilters] = useState({
    type: 'all', // Filter by activity type
    sortBy: 'date',
    sortOrder: 'desc', // 'desc' for newest first, 'asc' for oldest first
  });

  // State for loading status
  const [loading, setLoading] = useState(true);
  
  // State for API errors
  const [error, setError] = useState(null);

  // Effect to re-fetch activities whenever the current page or filters change
  useEffect(() => {
    fetchActivities();
  }, [pagination.currentPage, filters]); // Dependencies: page and filters

  // Async function to fetch activities based on current pagination/filters
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Construct API parameters
    const params = {
      page: pagination.currentPage,
      limit: 10, // Assuming a fixed limit of 10 per page
      ...(filters.type !== 'all' && { type: filters.type }), // Only include type if not 'all'
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
    
    try {
      const response = await activityAPI.getHistory(params);
      
      setActivities(response.activities || []);
      // Update pagination state with new values from the API response
      setPagination(response.pagination || pagination); 
      setError(null);
    } catch (t) {
      setError('Failed to load activity history');
      console.error('Error fetching activities:', t);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters]); // Recalculate if page or filters change

  /**
   * Handles changes to filter or sort controls, resets page to 1.
   * @param {object} newFilters - New filter/sort properties to merge into state.
   */
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Crucial: Reset to page 1 when filters/sort change
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  /**
   * Handles navigation between pages.
   * @param {number} newPage - The target page number.
   */
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  /**
   * Formats a date string into a readable format.
   * @param {string} dateString
   * @returns {string} Formatted date and time string.
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Dynamically generates options for the type filter based on currently loaded activities.
   * NOTE: In a complete application, these options should ideally come from a separate API call 
   * of available activity types, not just the currently loaded page data.
   * @returns {Array<{value: string, label: string}>}
   */
  const getActivityTypeOptions = () => {
    const types = [...new Set(activities.map((activity) => activity.type))];
    return types.map((type) => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    }));
  };

  // --- Loading State (before first fetch) ---
  if (loading && activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Activity History</h2>
        <div className="animate-pulse space-y-3">
          {/* Skeleton Loaders for table rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // --- Main Render Logic ---
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Activity History</h2>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={fetchActivities} className="ml-2 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Filters and Sorting Controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* Type Filter */}
        <div>
          <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Activity Type
          </label>
          <select
            id="typeFilter"
            value={filters.type}
            onChange={(e) => handleFilterChange({ type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {getActivityTypeOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Sort By */}
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Date</option>
            <option value="points">Points</option>
            <option value="distance">Distance</option>
          </select>
        </div>
        
        {/* Sort Order */}
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <select
            id="sortOrder"
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange({ sortOrder: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity, index) => (
              <tr key={activity._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(activity.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {activity.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {activity.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {activity.distance ? `${activity.distance} km` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {activity.pointsEarned} pts
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State Message */}
      {activities.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No activities found.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalActivities} total activities)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityHistoryTable;