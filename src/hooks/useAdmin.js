// src/hooks/useAdmin.js
import { useContext } from 'react';
import { AdminContext } from '../contexts/AdminContext';

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};