
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { activityAPI } from '../../services/api';

/**
 * ActivitySubmissionForm Component
 * A form for logging a new activity, including fetching activity rules, 
 * validation, and submission.
 *
 * @param {object} props
 * @param {function} props.onSuccess - Callback to execute upon successful submission.
 * @param {function} props.onError - Callback to execute upon failed submission.
 */
const ActivitySubmissionForm = ({ onSuccess, onError }) => {
  // State for form input data
  const [formData, setFormData] = useState({
    type: '',
    distance: '', // Stored as a string initially from the input field
    description: '',
  });

  // State for loading status during API calls
  const [loading, setLoading] = useState(false);

  // State for validation and API errors
  const [errors, setErrors] = useState({});
  
  // State to store the fetched rules for activity types (used for validation and options)
  const [activityRules, setActivityRules] = useState([]);

  // Fetch activity rules on component mount
  useEffect(() => {
    fetchActivityRules();
  }, []);

  // Async function to fetch the available activity rules/types from the API
  const fetchActivityRules = useCallback(async () => {
    try {
      const response = await activityAPI.getRules();
      setActivityRules(response.rules || []);
    } catch (t) {
      console.error('Failed to fetch activity rules:', t);
      // Optional: set a general error here if rules are critical for form operation
    }
  }, []);

  /**
   * Performs client-side validation on form data.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.type) {
      newErrors.type = 'Activity type is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Specific validation for distance-based activities
    const distanceRequiredTypes = ['cycling', 'running', 'walking'];
    if (distanceRequiredTypes.includes(formData.type)) {
      // Check if distance is present and greater than zero
      if (!formData.distance || parseFloat(formData.distance) <= 0) {
        newErrors.distance = 'Distance is required for this activity type';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Async function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      // Prepare data for API submission
      const activityData = {
        type: formData.type,
        description: formData.description.trim(),
      };
      
      // Add distance only if provided/relevant
      if (formData.distance) {
        activityData.distance = parseFloat(formData.distance);
      }

      const response = await activityAPI.submitActivity(activityData);
      
      // Reset form on success
      setFormData({
        type: '',
        distance: '',
        description: '',
      });
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (t) {
      const errorMessage = t.response?.data?.message || 'Failed to submit activity';
      setErrors({
        general: errorMessage,
      });
      if (onError) {
        onError(t);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Helper to find the rule for the currently selected activity type
  const getSelectedActivityRule = () => {
    return activityRules.find((rule) => rule.type === formData.type);
  };

  const selectedRule = getSelectedActivityRule();
  const distanceRequiredTypes = ['cycling', 'running', 'walking'];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Log New Activity</h2>

      {/* General Error Display */}
      {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Activity Type Dropdown */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Activity Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.type ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="">Select an activity type</option>
            {activityRules.map((rule) => (
              <option key={rule.type} value={rule.type}>
                {rule.type.charAt(0).toUpperCase() + rule.type.slice(1)} ({rule.points} points)
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type}</p>
          )}
        </div>

        {/* Activity Rule/Points Display */}
        {selectedRule && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Points:</strong> {selectedRule.points} points
              {selectedRule.description && (
                <Fragment>
                  <br />
                  <strong>Description:</strong> {selectedRule.description}
                </Fragment>
              )}
            </p>
          </div>
        )}

        {/* Distance Input */}
        <div>
          <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-2">
            Distance (km)
            {distanceRequiredTypes.includes(formData.type) && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <input
            type="number"
            id="distance"
            name="distance"
            value={formData.distance}
            onChange={handleChange}
            min="0"
            step="0.1"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.distance ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter distance in kilometers"
            disabled={loading}
          />
          {errors.distance && (
            <p className="text-red-500 text-sm mt-1">{errors.distance}</p>
          )}
          {!distanceRequiredTypes.includes(formData.type) && formData.type && (
            <p className="text-gray-500 text-sm mt-1">
              Distance is optional for this activity type
            </p>
          )}
        </div>

        {/* Description Textarea */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe your activity..."
            disabled={loading}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Submitting Activity...' : 'Submit Activity'}
        </button>
      </form>
    </div>
  );
};

export default ActivitySubmissionForm;