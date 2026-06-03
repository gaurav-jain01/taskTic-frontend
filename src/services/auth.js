// Firebase Authentication Service
// Configure your Firebase credentials in your environment

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Sync Firebase user with backend
 */
export const syncUserWithBackend = async (firebaseUser, idToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        firebaseUid: firebaseUser.uid,
        idToken // Pass the Firebase ID token for the backend to verify
      }),
    });

    if (!response.ok) {
      throw new Error('Backend sync failed');
    }

    const data = await response.json();
    return {
      user: data.user,
      token: data.token // The new custom JWT from the backend
    };
  } catch (error) {
    console.error('Backend sync error:', error);
    throw error;
  }
};

/**
 * Login user with email and password
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    return data; // Should contain { token, user, role }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register new user
 */
export const registerUser = async (email, password, name) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Registration failed');
    }

    const data = await response.json();
    return data; // Should contain { token, user, role }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logoutUser = async (token) => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Don't throw, just log the error
  }
};

/**
 * Verify token validity
 */
export const verifyToken = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};
