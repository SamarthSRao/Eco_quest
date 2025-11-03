const API_BASE_URL = 'http://localhost:3000';

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{token: string, user: object}>}
 */

export const login = async ( email,password) => {
  try
  {
    const response = await fetch('${API_BASE_URL}/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type:': 'application/json',

      },
      body: JSON.stringify({ email, password}),

    });

    if(!response.ok)
    {
      const error = await response.json();
      throw new Error(error.messaege || 'Login failed');
    }
    const data = await response.json();
    return data;
  }
  catch(error)
  {
    throw new Error(error.message || 'Network error');
  }
};

export const register = async (name, email, password) => {
  try {
    const response = await fetch('${API_BASE_URL}/auth/register', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',

      },
      body: JSON.stringify({ name,email, password}),
    });

    if(!response.ok) {
      const error =  await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    const data = await response.json();
    return data;
  }
  catch(error) {
    throw new Error(error.message || 'Network error');
  }
};

export const logout =  () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};


export const getStoredUser = () => {
  try{
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;

  }
  catch(error) {
    console.error('Failed to parse stored user:', error);
return null;
}
};


export const getStoredToken = () => {
  return localStorage.getItem('jwt_token');
};


export const isAuthenticated = () => {
  const token = getStoredToken();
  const user = getStoredUser();
  return !!(token && user);
};

export const verifyToken = async () => {
  try{
    const token = getStoredToken();
    if(!token) return false;

    const response = await fetch('${API_BASE_URL}/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ${token}',
      },
    });

    return response.ok;
  }
  catch(error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

