import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      setToken(data.token);
      setUser({ username: data.username });
      setIsGuest(false);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify({ username: data.username }));
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username, password, confirmPassword, email) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, confirmPassword, email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      setToken(data.token);
      setUser({ username: data.username });
      setIsGuest(false);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify({ username: data.username }));
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    // Generate a guest username
    const guestUsername = `guest_${Date.now()}`;
    setUser({ username: guestUsername });
  };

  const value = {
    user,
    token,
    loading,
    isGuest,
    login,
    register,
    logout,
    continueAsGuest,
    isAuthenticated: !!token && !isGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
