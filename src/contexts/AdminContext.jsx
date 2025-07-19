// Corrected AdminContext.jsx - Maintains Data Loading While Preventing Infinite Loops

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { getDefaultConfig } from '../config/defaultConfig';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  
  // Track loading states to prevent duplicate calls
  const isLoadingConfig = useRef(false);
  const isLoadingDashboard = useRef(false);
  const configLoaded = useRef(false);
  const dashboardLoaded = useRef(false);

  // Load configuration from API
  const loadConfig = useCallback(async (force = false) => {
    if (!user || authLoading) return;
    if (isLoadingConfig.current) return; // Prevent duplicate calls
    if (configLoaded.current && !force) return; // Don't reload unless forced
    
    isLoadingConfig.current = true;
    
    try {
      setLoading(true);
      console.log('🔄 Loading config...');
      const response = await apiService.getAdminConfig();
      console.log('✅ Config loaded:', response);
      setConfig(response);
      configLoaded.current = true;
    } catch (error) {
      console.error('❌ Failed to load config:', error);
      // Only set default config if we don't have any config yet
      if (!config) {
        setConfig(getDefaultConfig());
        configLoaded.current = true;
      }
    } finally {
      setLoading(false);
      isLoadingConfig.current = false;
    }
  }, [user, authLoading, config]);

  // Load dashboard data
  const loadDashboard = useCallback(async (force = false) => {
    if (!user || authLoading) return;
    if (isLoadingDashboard.current) return; // Prevent duplicate calls
    if (dashboardLoaded.current && !force) return; // Don't reload unless forced
    
    isLoadingDashboard.current = true;
    
    try {
      console.log('🔄 Loading dashboard...');
      const response = await apiService.getDashboard();
      console.log('✅ Dashboard loaded:', response);
      setDashboardData(response);
      dashboardLoaded.current = true;
    } catch (error) {
      console.error('❌ Failed to load dashboard:', error);
      // Don't set dashboardLoaded to true on error so it can retry
    } finally {
      isLoadingDashboard.current = false;
    }
  }, [user, authLoading]);

  // Initial data loading effect
  useEffect(() => {
    if (!authLoading && user && !configLoaded.current) {
      console.log('🚀 Initial config load triggered');
      loadConfig();
    } else if (!authLoading && !user) {
      // Reset everything when user logs out
      console.log('🔄 Resetting data for logout');
      setConfig(null);
      setDashboardData(null);
      configLoaded.current = false;
      dashboardLoaded.current = false;
    }
  }, [user, authLoading, loadConfig]);

  // Load dashboard after config is loaded
  useEffect(() => {
    if (config && !authLoading && user && !dashboardLoaded.current) {
      console.log('🚀 Loading dashboard after config');
      loadDashboard();
    }
  }, [config, user, authLoading, loadDashboard]);

  // Helper function to refresh config after updates
  const refreshConfig = useCallback(async () => {
    configLoaded.current = false;
    await loadConfig(true);
  }, [loadConfig]);

  // Helper function to refresh dashboard after updates
  const refreshDashboard = useCallback(async () => {
    dashboardLoaded.current = false;
    await loadDashboard(true);
  }, [loadDashboard]);

  // Products CRUD operations
  const addProduct = useCallback(async (product) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      console.log('➕ Adding product:', product);
      const response = await apiService.createProduct(product);
      console.log('✅ Product added:', response);
      
      // Refresh both config and dashboard to show updated data
      await refreshConfig();
      await refreshDashboard();
      
      return { success: true, product: response };
    } catch (error) {
      console.error('❌ Failed to add product:', error);
      return { success: false, error: error.message || 'Failed to add product' };
    } finally {
      setLoading(false);
    }
  }, [user, refreshConfig, refreshDashboard]);

  const updateProduct = useCallback(async (id, updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      console.log('✏️ Updating product:', id, updates);
      const response = await apiService.updateProduct(id, updates);
      console.log('✅ Product updated:', response);
      
      // Refresh both config and dashboard
      await refreshConfig();
      await refreshDashboard();
      
      return { success: true, product: response };
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      return { success: false, error: error.message || 'Failed to update product' };
    } finally {
      setLoading(false);
    }
  }, [user, refreshConfig, refreshDashboard]);

  const deleteProduct = useCallback(async (id) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      console.log('🗑️ Deleting product:', id);
      await apiService.deleteProduct(id);
      console.log('✅ Product deleted');
      
      // Refresh both config and dashboard
      await refreshConfig();
      await refreshDashboard();
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      return { success: false, error: error.message || 'Failed to delete product' };
    } finally {
      setLoading(false);
    }
  }, [user, refreshConfig, refreshDashboard]);

  // Categories CRUD operations
  const addCategory = useCallback(async (category) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      console.log('➕ Adding category:', category);
      const response = await apiService.createCategory(category);
      console.log('✅ Category added:', response);
      
      await refreshConfig();
      return { success: true, category: response };
    } catch (error) {
      console.error('❌ Failed to add category:', error);
      return { success: false, error: error.message || 'Failed to add category' };
    } finally {
      setLoading(false);
    }
  }, [user, refreshConfig]);

  const updateCategory = useCallback(async (id, updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      console.log('✏️ Updating category:', id, updates);
      const response = await apiService.updateCategory(id, updates);
      console.log('✅ Category updated:', response);
      
      await refreshConfig();
      return { success: true, category: response };
    } catch (error) {
      console.error('❌ Failed to update category:', error);
      return { success: false, error: error.message || 'Failed to update category' };
    } finally {
      setLoading(false);
    }
  }, [user, refreshConfig]);

  const deleteCategory = useCallback(async (id) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      console.log('🗑️ Deleting category:', id);
      await apiService.deleteCategory(id);
      console.log('✅ Category deleted');
      
      await refreshConfig();
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete category:', error);
      return { success: false, error: error.message || 'Failed to delete category' };
    } finally {
      setLoading(false);
    }
  }, [user, refreshConfig]);

  // Farms CRUD operations
  const addFarm = useCallback(async (farm) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      console.log('➕ Adding farm:', farm);
      const response = await apiService.createFarm(farm);
      console.log('✅ Farm added:', response);
      
      await refreshConfig();
      return { success: true, farm: response };
    } catch (error) {
      console.error('❌ Failed to add farm:', error);
      return { success: false, error: error.message || 'Failed to add farm' };
    } finally {
      setLoading(false);
    }
  }, [user, refreshConfig]);

  const updateFarm = useCallback(async (id, updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      console.log('✏️ Updating farm:', id, updates);
      const response = await apiService.updateFarm(id, updates);
      console.log('✅ Farm updated:', response);
      
      await refreshConfig();
      return { success: true, farm: response };
    } catch (error) {
      console.error('❌ Failed to update farm:', error);
      return { success: false, error: error.message || 'Failed to update farm' };
    } finally {
      setLoading(false);
    }
  }, [user, refreshConfig]);

  const deleteFarm = useCallback(async (id) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      console.log('🗑️ Deleting farm:', id);
      await apiService.deleteFarm(id);
      console.log('✅ Farm deleted');
      
      await refreshConfig();
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete farm:', error);
      return { success: false, error: error.message || 'Failed to delete farm' };
    } finally {
      setLoading(false);
    }
  }, [user, refreshConfig]);

  // Social Media CRUD operations
  const addSocialMedia = useCallback(async (social) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      console.log('➕ Adding social media:', social);
      const response = await apiService.createSocialMedia(social);
      console.log('✅ Social media added:', response);
      
      await refreshConfig();
      return { success: true, social: response };
    } catch (error) {
      console.error('❌ Failed to add social media:', error);
      return { success: false, error: error.message || 'Failed to add social media' };
    } finally {
      setLoading(false);
    }
  }, [user, refreshConfig]);

  const updateSocialMedia = useCallback(async (id, updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      console.log('✏️ Updating social media:', id, updates);
      const response = await apiService.updateSocialMedia(id, updates);
      console.log('✅ Social media updated:', response);
      
      await refreshConfig();
      return { success: true, social: response };
    } catch (error) {
      console.error('❌ Failed to update social media:', error);
      return { success: false, error: error.message || 'Failed to update social media' };
    } finally {
      setLoading(false);
    }
  }, [user, refreshConfig]);

  const deleteSocialMedia = useCallback(async (id) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      console.log('🗑️ Deleting social media:', id);
      await apiService.deleteSocialMedia(id);
      console.log('✅ Social media deleted');
      
      await refreshConfig();
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete social media:', error);
      return { success: false, error: error.message || 'Failed to delete social media' };
    } finally {
      setLoading(false);
    }
  }, [user, refreshConfig]);

  // Shop settings update
  const updateShopSettings = useCallback(async (settings) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setLoading(true);
      console.log('⚙️ Updating shop settings:', settings);
      const response = await apiService.updateShopSettings(settings);
      console.log('✅ Shop settings updated:', response);
      
      await refreshConfig();
      return { success: true, settings: response };
    } catch (error) {
      console.error('❌ Failed to update shop settings:', error);
      return { success: false, error: error.message || 'Failed to update shop settings' };
    } finally {
      setLoading(false);
    }
  }, [user, refreshConfig]);

  // File upload functions (no config reload needed for these)
  const uploadImage = useCallback(async (file) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      console.log('📸 Uploading image:', file.name);
      const response = await apiService.uploadImage(file);
      console.log('✅ Image uploaded:', response);
      return { success: true, imageUrl: response.imageUrl, publicId: response.publicId };
    } catch (error) {
      console.error('❌ Failed to upload image:', error);
      return { success: false, error: error.message || 'Failed to upload image' };
    }
  }, [user]);

  const uploadImages = useCallback(async (files) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      console.log('📸 Uploading images:', files.length);
      const response = await apiService.uploadImages(files);
      console.log('✅ Images uploaded:', response);
      return { success: true, images: response.images };
    } catch (error) {
      console.error('❌ Failed to upload images:', error);
      return { success: false, error: error.message || 'Failed to upload images' };
    }
  }, [user]);

  const uploadVideo = useCallback(async (file) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      console.log('🎥 Uploading video:', file.name);
      const response = await apiService.uploadVideo(file);
      console.log('✅ Video uploaded:', response);
      return { success: true, videoUrl: response.videoUrl, publicId: response.publicId };
    } catch (error) {
      console.error('❌ Failed to upload video:', error);
      return { success: false, error: error.message || 'Failed to upload video' };
    }
  }, [user]);

  const deleteMedia = useCallback(async (publicId, resourceType = 'image') => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      console.log('🗑️ Deleting media:', publicId);
      const response = await apiService.deleteMedia(publicId, resourceType);
      console.log('✅ Media deleted');
      return { success: true, ...response };
    } catch (error) {
      console.error('❌ Failed to delete media:', error);
      return { success: false, error: error.message || 'Failed to delete media' };
    }
  }, [user]);

  // Debug logging
  console.log('🔍 AdminContext State:', {
    hasUser: !!user,
    authLoading,
    hasConfig: !!config,
    configLoaded: configLoaded.current,
    hasDashboardData: !!dashboardData,
    dashboardLoaded: dashboardLoaded.current,
    loading
  });

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
    deleteMedia,
    loadConfig: refreshConfig,
    loadDashboard: refreshDashboard
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};