// Navigation utility for handling programmatic navigation
// This allows navigation from non-React contexts like API interceptors

let navigateFunction = null;

export const setNavigateFunction = (navigate) => {
  navigateFunction = navigate;
};

export const navigateTo = (path, options = {}) => {
  if (navigateFunction) {
    navigateFunction(path, options);
  } else {
    // Fallback to window.location for non-React contexts
    window.location.href = path;
  }
};

export const navigateToLogin = () => {
  navigateTo('/login', { replace: true });
};
