// Optimized API Service with Request Deduplication and Caching

const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    // Request deduplication map
    this.pendingRequests = new Map();
    // Simple cache for GET requests
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
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

  // Generate cache key
  getCacheKey(endpoint, options = {}) {
    return `${endpoint}_${JSON.stringify(options)}`;
  }

  // Check if cache is valid
  isCacheValid(cacheEntry) {
    return cacheEntry && (Date.now() - cacheEntry.timestamp) < this.cacheTimeout;
  }

  // Generic API request method with deduplication and caching
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    // Create unique request key for deduplication
    const requestKey = `${options.method || 'GET'}_${url}_${JSON.stringify(config.body || {})}`;
    
    // For GET requests, check cache first
    if (!options.method || options.method === 'GET') {
      const cacheKey = this.getCacheKey(endpoint, options);
      const cachedData = this.cache.get(cacheKey);
      
      if (this.isCacheValid(cachedData)) {
        console.log(`Cache hit for ${endpoint}`);
        return cachedData.data;
      }
    }

    // Check if the same request is already in progress
    if (this.pendingRequests.has(requestKey)) {
      console.log(`Deduplicating request for ${endpoint}`);
      return this.pendingRequests.get(requestKey);
    }

    // Create the request promise
    const requestPromise = this.executeRequest(url, config, endpoint, options);
    
    // Store the promise to deduplicate identical requests
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Cache GET requests
      if (!options.method || options.method === 'GET') {
        const cacheKey = this.getCacheKey(endpoint, options);
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      return result;
    } finally {
      // Remove from pending requests
      this.pendingRequests.delete(requestKey);
    }
  }

  // Execute the actual request
  async executeRequest(url, config, endpoint, options) {
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        
        // Handle specific error cases
        if (response.status === 401) {
          // Unauthorized - token might be expired or invalid
          localStorage.removeItem('admin_token');
          // Clear cache on auth error
          this.clearCache();
          throw new Error('Access token required');
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Clear cache (useful for logout or auth errors)
  clearCache() {
    this.cache.clear();
    console.log('API cache cleared');
  }

  // Clear specific cache entries
  clearCacheForEndpoint(endpoint) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(endpoint)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`Cache cleared for ${endpoint}`);
  }

  // Public API request method (no auth required)
  async publicRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getPublicHeaders(),
      ...options
    };

    // Use same deduplication logic for public requests
    const requestKey = `PUBLIC_${options.method || 'GET'}_${url}_${JSON.stringify(config.body || {})}`;
    
    if (this.pendingRequests.has(requestKey)) {
      console.log(`Deduplicating public request for ${endpoint}`);
      return this.pendingRequests.get(requestKey);
    }

    const requestPromise = this.executePublicRequest(url, config, endpoint);
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  // Execute public request
  async executePublicRequest(url, config, endpoint) {
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Public API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    // Clear cache on login
    this.clearCache();
    return this.publicRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  async updateProfile(profileData) {
    const result = await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    // Clear cache after profile update
    this.clearCacheForEndpoint('/auth');
    return result;
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
    return this.publicRequest('/config');
  }

  async getAdminConfig() {
    return this.request('/admin/config');
  }

  async updateShopSettings(settings) {
    const result = await this.request('/admin/shop-settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
    // Clear config cache after update
    this.clearCacheForEndpoint('/admin/config');
    this.clearCacheForEndpoint('/config');
    return result;
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
    
    return this.publicRequest(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id) {
    return this.publicRequest(`/products/${id}`);
  }

  async createProduct(productData) {
    const result = await this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    // Clear related caches
    this.clearCacheForEndpoint('/products');
    this.clearCacheForEndpoint('/admin/config');
    this.clearCacheForEndpoint('/admin/dashboard');
    return result;
  }

  async updateProduct(id, productData) {
    const result = await this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
    // Clear related caches
    this.clearCacheForEndpoint('/products');
    this.clearCacheForEndpoint('/admin/config');
    this.clearCacheForEndpoint('/admin/dashboard');
    return result;
  }

  async deleteProduct(id) {
    const result = await this.request(`/products/${id}`, {
      method: 'DELETE'
    });
    // Clear related caches
    this.clearCacheForEndpoint('/products');
    this.clearCacheForEndpoint('/admin/config');
    this.clearCacheForEndpoint('/admin/dashboard');
    return result;
  }

  async bulkUpdateProducts(data) {
    const result = await this.request('/admin/products/bulk-update', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    // Clear related caches
    this.clearCacheForEndpoint('/products');
    this.clearCacheForEndpoint('/admin/config');
    this.clearCacheForEndpoint('/admin/dashboard');
    return result;
  }

  // Categories
  async getCategories() {
    return this.publicRequest('/categories');
  }

  async getCategory(id) {
    return this.publicRequest(`/categories/${id}`);
  }

  async createCategory(categoryData) {
    const result = await this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
    // Clear related caches
    this.clearCacheForEndpoint('/categories');
    this.clearCacheForEndpoint('/admin/config');
    return result;
  }

  async updateCategory(id, categoryData) {
    const result = await this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
    // Clear related caches
    this.clearCacheForEndpoint('/categories');
    this.clearCacheForEndpoint('/admin/config');
    return result;
  }

  async deleteCategory(id) {
    const result = await this.request(`/categories/${id}`, {
      method: 'DELETE'
    });
    // Clear related caches
    this.clearCacheForEndpoint('/categories');
    this.clearCacheForEndpoint('/admin/config');
    return result;
  }

  // Similar pattern for Farms and Social Media...
  // (Following same cache clearing pattern)

  // Farms
  async getFarms() {
    return this.publicRequest('/farms');
  }

  async getFarm(id) {
    return this.publicRequest(`/farms/${id}`);
  }

  async createFarm(farmData) {
    const result = await this.request('/farms', {
      method: 'POST',
      body: JSON.stringify(farmData)
    });
    this.clearCacheForEndpoint('/farms');
    this.clearCacheForEndpoint('/admin/config');
    return result;
  }

  async updateFarm(id, farmData) {
    const result = await this.request(`/farms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(farmData)
    });
    this.clearCacheForEndpoint('/farms');
    this.clearCacheForEndpoint('/admin/config');
    return result;
  }

  async deleteFarm(id) {
    const result = await this.request(`/farms/${id}`, {
      method: 'DELETE'
    });
    this.clearCacheForEndpoint('/farms');
    this.clearCacheForEndpoint('/admin/config');
    return result;
  }

  // Social Media
  async getSocialMedia() {
    return this.publicRequest('/social-media');
  }

  async getSocialMediaLink(id) {
    return this.publicRequest(`/social-media/${id}`);
  }

  async createSocialMedia(socialData) {
    const result = await this.request('/social-media', {
      method: 'POST',
      body: JSON.stringify(socialData)
    });
    this.clearCacheForEndpoint('/social-media');
    this.clearCacheForEndpoint('/admin/config');
    return result;
  }

  async updateSocialMedia(id, socialData) {
    const result = await this.request(`/social-media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(socialData)
    });
    this.clearCacheForEndpoint('/social-media');
    this.clearCacheForEndpoint('/admin/config');
    return result;
  }

  async deleteSocialMedia(id) {
    const result = await this.request(`/social-media/${id}`, {
      method: 'DELETE'
    });
    this.clearCacheForEndpoint('/social-media');
    this.clearCacheForEndpoint('/admin/config');
    return result;
  }

  // File Upload (no caching needed)
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
        this.clearCache();
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
        this.clearCache();
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
        this.clearCache();
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