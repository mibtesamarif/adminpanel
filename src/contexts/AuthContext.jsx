// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import apiService from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session and verify token
    const initAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        try {
          const response = await apiService.verifyToken();
          if (response.success) {
            setUser(response.user);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('admin_token');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('admin_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('admin_token', response.token);
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_token');
  };

  const updateProfile = async (updates) => {
    try {
      const response = await apiService.updateProfile(updates);
      
      if (response.success) {
        setUser(response.user || { ...user, ...updates });
        return { success: true, user: response.user || { ...user, ...updates } };
      } else {
        return { success: false, error: response.message || 'Profile update failed' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message || 'Profile update failed' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await apiService.changePassword({
        currentPassword,
        newPassword
      });
      
      if (response.success) {
        return { success: true, message: response.message || 'Password updated successfully' };
      } else {
        return { success: false, error: response.message || 'Password change failed' };
      }
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: error.message || 'Password change failed' };
    }
  };

  const value = {
    user,
    login,
    logout,
    updateProfile,
    changePassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};