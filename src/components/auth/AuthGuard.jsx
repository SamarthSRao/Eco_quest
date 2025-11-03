
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Assuming getStoredUser is a function exported from the API service layer
import { getStoredUser } from '../../services/api'; 

/**
 * AuthGuard Component
 * Protects routes by checking if a user is authenticated. 
 * Renders children if authenticated, a loading spinner while checking, 
 * or a fallback/access denied message if not authenticated.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The content to render if the user is authenticated.
 * @param {React.ReactNode} [props.fallback=null] - Optional content to render if the user is not authenticated.
 */
const AuthGuard = ({ children, fallback = null }) => {
  const navigate = useNavigate();
  // State to track authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // State to track if the initial authentication check is complete
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Check for authentication token in local storage
      const token = localStorage.getItem('token');
      // Check for stored user data (assuming getStoredUser reads from local storage)
      const user = getStoredUser(); 

      if (token && user) {
        // Both token and user data exist
        setIsAuthenticated(true);
      } else {
        // Authentication failed
        setIsAuthenticated(false);
        // Clear any potentially invalid or partial data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      // Authentication check is complete
      setIsLoading(false);
    };

    checkAuth();
  }, []); // Run only once on component mount

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* Simple loading spinner */}
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
      </div>
    );
  }

  // --- Unauthenticated State ---
  if (!isAuthenticated) {
    // Return the custom fallback if provided, otherwise render the default "Access Denied" screen
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to access this page.</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // --- Authenticated State ---
  return children;
};

export default AuthGuard;