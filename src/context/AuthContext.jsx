import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, logoutUser, getMe, getStoredToken } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkAuth = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await getMe();
      if (userData) {
        setUser(userData);
        setToken(storedToken);
      } else {
        localStorage.removeItem('auth_token');
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.warn('Session verification error:', err.message);
      localStorage.removeItem('auth_token');
      setUser(null);
      setToken(null);
      // Do not set persistent authError on initial background token check
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username, password) => {
    setAuthError(null);
    try {
      const data = await loginUser(username, password);
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser({
        id: data.userId,
        username: data.username,
        displayName: data.displayName,
        role: data.role,
      });
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    if (user?.username) {
      await logoutUser(user.username);
    }
    localStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
    setAuthError(null);
  };

  const value = {
    user,
    token,
    loading,
    authError,
    setAuthError,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

