import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default admin user (for static version)
  const defaultAdmin = {
    id: 1,
    username: 'admin',
    email: 'admin@cbdshop.com',
    password: 'admin123', // In production, this should be hashed
    role: 'admin',
    createdAt: new Date().toISOString(),
    lastLogin: null
  };

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('admin_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { username, password } = credentials;
      
      // Simple validation against default admin
      if (username === defaultAdmin.username && password === defaultAdmin.password) {
        const userSession = {
          ...defaultAdmin,
          lastLogin: new Date().toISOString()
        };
        
        // Remove password from session data
        const { password: _, ...userWithoutPassword } = userSession;
        
        setUser(userWithoutPassword);
        localStorage.setItem('admin_user', JSON.stringify(userWithoutPassword));
        
        return { success: true, user: userWithoutPassword };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_user');
  };

  const updateProfile = async (updates) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('admin_user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: 'Profile update failed' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In static version, just simulate success
      // In production, this would validate current password and update
      if (currentPassword === defaultAdmin.password) {
        return { success: true, message: 'Password updated successfully' };
      } else {
        return { success: false, error: 'Current password is incorrect' };
      }
    } catch (error) {
      return { success: false, error: 'Password change failed' };
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