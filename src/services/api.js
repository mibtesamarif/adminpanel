// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('admin_token');
  }

  // Get auth headers
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get public headers (no auth)
  getPublicHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }

  // Get multipart headers for file uploads
  getMultipartHeaders() {
    const token = this.getAuthToken();
    return {
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        
        // Handle specific error cases
        if (response.status === 401) {
          // Unauthorized - token might be expired or invalid
          localStorage.removeItem('admin_token');
          throw new Error('Access token required');
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Public API request method (no auth required)
  async publicRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getPublicHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    // Login should not require auth headers
    return this.publicRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  }

  // Dashboard
  async getDashboard() {
    return this.request('/admin/dashboard');
  }

  // Configuration
  async getConfig() {
    // This is a public endpoint
    return this.publicRequest('/config');
  }

  async getAdminConfig() {
    return this.request('/admin/config');
  }

  async updateShopSettings(settings) {
    return this.request('/admin/shop-settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // Products
  async getProducts(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    const queryString = searchParams.toString();
    
    // This is a public endpoint
    return this.publicRequest(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id) {
    // This is a public endpoint
    return this.publicRequest(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  async bulkUpdateProducts(data) {
    return this.request('/admin/products/bulk-update', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Categories
  async getCategories() {
    // This is a public endpoint
    return this.publicRequest('/categories');
  }

  async getCategory(id) {
    // This is a public endpoint
    return this.publicRequest(`/categories/${id}`);
  }

  async createCategory(categoryData) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateCategory(id, categoryData) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteCategory(id) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Farms
  async getFarms() {
    // This is a public endpoint
    return this.publicRequest('/farms');
  }

  async getFarm(id) {
    // This is a public endpoint
    return this.publicRequest(`/farms/${id}`);
  }

  async createFarm(farmData) {
    return this.request('/farms', {
      method: 'POST',
      body: JSON.stringify(farmData)
    });
  }

  async updateFarm(id, farmData) {
    return this.request(`/farms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(farmData)
    });
  }

  async deleteFarm(id) {
    return this.request(`/farms/${id}`, {
      method: 'DELETE'
    });
  }

  // Social Media
  async getSocialMedia() {
    // This is a public endpoint
    return this.publicRequest('/social-media');
  }

  async getSocialMediaLink(id) {
    // This is a public endpoint
    return this.publicRequest(`/social-media/${id}`);
  }

  async createSocialMedia(socialData) {
    return this.request('/social-media', {
      method: 'POST',
      body: JSON.stringify(socialData)
    });
  }

  async updateSocialMedia(id, socialData) {
    return this.request(`/social-media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(socialData)
    });
  }

  async deleteSocialMedia(id) {
    return this.request(`/social-media/${id}`, {
      method: 'DELETE'
    });
  }

  // File Upload
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseURL}/upload/image`, {
      method: 'POST',
      headers: this.getMultipartHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        throw new Error('Access token required');
      }
      
      throw new Error(errorData.message || 'Image upload failed');
    }

    return response.json();
  }

  async uploadImages(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await fetch(`${this.baseURL}/upload/images`, {
      method: 'POST',
      headers: this.getMultipartHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        throw new Error('Access token required');
      }
      
      throw new Error(errorData.message || 'Images upload failed');
    }

    return response.json();
  }

  async uploadVideo(file) {
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch(`${this.baseURL}/upload/video`, {
      method: 'POST',
      headers: this.getMultipartHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        throw new Error('Access token required');
      }
      
      throw new Error(errorData.message || 'Video upload failed');
    }

    return response.json();
  }

  async deleteMedia(publicId, resourceType = 'image') {
    return this.request('/upload/media', {
      method: 'DELETE',
      body: JSON.stringify({ publicId, resourceType })
    });
  }
}

export default new ApiService();