import React, { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../../services/api';

/**
 * ProfileUpdateForm Component
 * A form for updating the user's profile information (currently only email).
 * It fetches the current profile data to pre-populate the form.
 *
 * @param {object} props
 * @param {function} props.onSuccess - Callback to execute upon successful profile update.
 * @param {function} props.onCancel - Callback to execute when the form is canceled.
 */
const ProfileUpdateForm = ({ onSuccess, onCancel }) => {
  // State for form input data (e.g., email)
  const [formData, setFormData] = useState({
    email: '',
  });

  // State for loading status during API calls
  const [loading, setLoading] = useState(false);

  // State for validation and API errors
  const [errors, setErrors] = useState({});
  
  // State to hold the original profile data fetched from the API
  const [initialData, setInitialData] = useState(null);

  // Effect to fetch the current profile data when the component mounts
  useEffect(() => {
    fetchCurrentProfile();
  }, []); // Empty dependency array means it runs once on mount

  // Async function to fetch the current user profile from the API
  const fetchCurrentProfile = useCallback(async () => {
    try {
      const response = await userAPI.getProfile();
      
      // Populate form data with existing email
      setFormData({
        email: response.email,
      });
      // Store the initial data to check for changes later
      setInitialData(response); 
    } catch (t) {
      console.error('Failed to fetch current profile:', t);
      setErrors({
        general: 'Failed to load current profile',
      });
    }
  }, []);

  // Function to validate the form data
  const validateForm = () => {
    const newErrors = {};

    // Basic Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Check if the email has actually changed from the initial value
    if (initialData && formData.email === initialData.email) {
      newErrors.general = 'No changes detected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Async function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!validateForm()) {
      return; // Stop if validation fails
    }

    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      // Call the API to update the profile
      const response = await userAPI.updateProfile(formData);
      
      // Execute the success callback if provided
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (t) {
      // Handle API errors
      const errorMessage = t.response?.data?.message || 'Failed to update profile';
      setErrors({
        general: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update the corresponding field in the form data state
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when the user starts typing in it
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Determine if there are any changes to enable the submit button
  const hasChanges = initialData && formData.email !== initialData.email;

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Update Profile</h2>

      {/* General Error Display (from API or 'No changes') */}
      {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
            disabled={loading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !hasChanges}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
          
          {/* Cancel Button */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Display Current Email for reference */}
      {initialData && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            <strong>Current email:</strong> {initialData.email}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileUpdateForm;