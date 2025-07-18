// Enhanced AdminContext.jsx with deleteMedia functionality

import React, { createContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { getDefaultConfig } from '../config/defaultConfig';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Load configuration from API
  const loadConfig = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await apiService.getAdminConfig();
      setConfig(response);
    } catch (error) {
      console.error('Failed to load config:', error);
      setConfig(getDefaultConfig());
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data
  const loadDashboard = async () => {
    if (!user) return;
    
    try {
      const response = await apiService.getDashboard();
      setDashboardData(response);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadConfig();
      loadDashboard();
    } else if (!authLoading && !user) {
      setConfig(null);
      setDashboardData(null);
    }
  }, [user, authLoading]);

  // Products CRUD operations
  const addProduct = async (product) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      const response = await apiService.createProduct(product);
      await loadConfig();
      await loadDashboard();
      return { success: true, product: response };
    } catch (error) {
      console.error('Failed to add product:', error);
      return { success: false, error: error.message || 'Failed to add product' };
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id, updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      const response = await apiService.updateProduct(id, updates);
      await loadConfig();
      await loadDashboard();
      return { success: true, product: response };
    } catch (error) {
      console.error('Failed to update product:', error);
      return { success: false, error: error.message || 'Failed to update product' };
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      await apiService.deleteProduct(id);
      await loadConfig();
      await loadDashboard();
      return { success: true };
    } catch (error) {
      console.error('Failed to delete product:', error);
      return { success: false, error: error.message || 'Failed to delete product' };
    } finally {
      setLoading(false);
    }
  };

  // Categories CRUD operations
  const addCategory = async (category) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      const response = await apiService.createCategory(category);
      await loadConfig();
      return { success: true, category: response };
    } catch (error) {
      console.error('Failed to add category:', error);
      return { success: false, error: error.message || 'Failed to add category' };
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id, updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      const response = await apiService.updateCategory(id, updates);
      await loadConfig();
      return { success: true, category: response };
    } catch (error) {
      console.error('Failed to update category:', error);
      return { success: false, error: error.message || 'Failed to update category' };
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      await apiService.deleteCategory(id);
      await loadConfig();
      return { success: true };
    } catch (error) {
      console.error('Failed to delete category:', error);
      return { success: false, error: error.message || 'Failed to delete category' };
    } finally {
      setLoading(false);
    }
  };

  // Farms CRUD operations
  const addFarm = async (farm) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      const response = await apiService.createFarm(farm);
      await loadConfig();
      return { success: true, farm: response };
    } catch (error) {
      console.error('Failed to add farm:', error);
      return { success: false, error: error.message || 'Failed to add farm' };
    } finally {
      setLoading(false);
    }
  };

  const updateFarm = async (id, updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      const response = await apiService.updateFarm(id, updates);
      await loadConfig();
      return { success: true, farm: response };
    } catch (error) {
      console.error('Failed to update farm:', error);
      return { success: false, error: error.message || 'Failed to update farm' };
    } finally {
      setLoading(false);
    }
  };

  const deleteFarm = async (id) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      await apiService.deleteFarm(id);
      await loadConfig();
      return { success: true };
    } catch (error) {
      console.error('Failed to delete farm:', error);
      return { success: false, error: error.message || 'Failed to delete farm' };
    } finally {
      setLoading(false);
    }
  };

  // Social Media CRUD operations
  const addSocialMedia = async (social) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      const response = await apiService.createSocialMedia(social);
      await loadConfig();
      return { success: true, social: response };
    } catch (error) {
      console.error('Failed to add social media:', error);
      return { success: false, error: error.message || 'Failed to add social media' };
    } finally {
      setLoading(false);
    }
  };

  const updateSocialMedia = async (id, updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      const response = await apiService.updateSocialMedia(id, updates);
      await loadConfig();
      return { success: true, social: response };
    } catch (error) {
      console.error('Failed to update social media:', error);
      return { success: false, error: error.message || 'Failed to update social media' };
    } finally {
      setLoading(false);
    }
  };

  const deleteSocialMedia = async (id) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      await apiService.deleteSocialMedia(id);
      await loadConfig();
      return { success: true };
    } catch (error) {
      console.error('Failed to delete social media:', error);
      return { success: false, error: error.message || 'Failed to delete social media' };
    } finally {
      setLoading(false);
    }
  };

  // Shop settings update
  const updateShopSettings = async (settings) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      const response = await apiService.updateShopSettings(settings);
      await loadConfig();
      return { success: true, settings: response };
    } catch (error) {
      console.error('Failed to update shop settings:', error);
      return { success: false, error: error.message || 'Failed to update shop settings' };
    } finally {
      setLoading(false);
    }
  };

  // File upload functions
  const uploadImage = async (file) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await apiService.uploadImage(file);
      return { success: true, imageUrl: response.imageUrl, publicId: response.publicId };
    } catch (error) {
      console.error('Failed to upload image:', error);
      return { success: false, error: error.message || 'Failed to upload image' };
    }
  };

  const uploadImages = async (files) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await apiService.uploadImages(files);
      return { success: true, images: response.images };
    } catch (error) {
      console.error('Failed to upload images:', error);
      return { success: false, error: error.message || 'Failed to upload images' };
    }
  };

  const uploadVideo = async (file) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await apiService.uploadVideo(file);
      return { success: true, videoUrl: response.videoUrl, publicId: response.publicId };
    } catch (error) {
      console.error('Failed to upload video:', error);
      return { success: false, error: error.message || 'Failed to upload video' };
    }
  };

  // Enhanced: Media deletion function
  const deleteMedia = async (publicId, resourceType = 'image') => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await apiService.deleteMedia(publicId, resourceType);
      return { success: true, ...response };
    } catch (error) {
      console.error('Failed to delete media:', error);
      return { success: false, error: error.message || 'Failed to delete media' };
    }
  };

  const value = {
    config: config || getDefaultConfig(),
    loading: loading || authLoading,
    dashboardData,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addFarm,
    updateFarm,
    deleteFarm,
    addSocialMedia,
    updateSocialMedia,
    deleteSocialMedia,
    updateShopSettings,
    uploadImage,
    uploadImages,
    uploadVideo,
    deleteMedia, // New function added
    loadConfig,
    loadDashboard
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};