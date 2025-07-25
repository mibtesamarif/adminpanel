// Complete Dashboard.jsx - Clean and Functional

import React, { useEffect } from 'react';
import { Package, Tag, MapPin, Share2, TrendingUp, Users } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';

const Dashboard = () => {
  const { config, dashboardData, loading, loadDashboard } = useAdmin();

  // Only trigger manual dashboard load if we have config but no dashboard data
  useEffect(() => {
    if (config && !dashboardData && !loading && loadDashboard) {
      console.log('🚀 Dashboard: Loading dashboard data');
      loadDashboard();
    }
  }, [config, dashboardData, loading]); // Removed loadDashboard from deps to prevent loops

  // Manual refresh function
  const handleRefresh = () => {
    if (loadDashboard) {
      console.log('🔄 Dashboard: Manual refresh triggered');
      loadDashboard();
    }
  };

  // Debug logging
  console.log('🔍 Dashboard State:', {
    hasConfig: !!config,
    hasDashboardData: !!dashboardData,
    loading,
    configProducts: config?.products?.length || 0,
    configCategories: config?.categories?.length || 0
  });

  if (loading || !config) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate stats from config data (fallback if API doesn't provide stats)
  const calculateStats = () => {
    const products = config.products || [];
    const categories = config.categories || [];
    const farms = config.farms || [];
    const socialLinks = config.socialMediaLinks || [];
    const popularProducts = products.filter(p => p.popular || p.is_popular) || [];
    
    console.log('📊 Calculating stats from config:', {
      products: products.length,
      categories: categories.length,
      farms: farms.length,
      socialLinks: socialLinks.length,
      popularProducts: popularProducts.length
    });

    return [
      {
        name: 'Total Products',
        value: products.length,
        icon: Package,
        color: 'bg-blue-500'
      },
      {
        name: 'Categories',
        value: categories.length,
        icon: Tag,
        color: 'bg-green-500'
      },
      {
        name: 'Farms',
        value: farms.length,
        icon: MapPin,
        color: 'bg-purple-500'
      },
      {
        name: 'Social Links',
        value: socialLinks.length,
        icon: Share2,
        color: 'bg-pink-500'
      },
      {
        name: 'Popular Products',
        value: popularProducts.length,
        icon: TrendingUp,
        color: 'bg-yellow-500'
      },
      {
        name: 'Active Pages',
        value: config.pages?.length || 5, // Default to 5 if no pages defined
        icon: Users,
        color: 'bg-indigo-500'
      }
    ];
  };

  // Use dashboard data from API if available, otherwise calculate from config
  const stats = dashboardData?.stats ? 
    // If API provides stats object, convert to array format
    (Array.isArray(dashboardData.stats) ? 
      dashboardData.stats : 
      [
        {
          name: 'Total Products',
          value: dashboardData.stats.totalProducts || 0,
          icon: Package,
          color: 'bg-blue-500'
        },
        {
          name: 'Categories',
          value: dashboardData.stats.totalCategories || 0,
          icon: Tag,
          color: 'bg-green-500'
        },
        {
          name: 'Farms',
          value: dashboardData.stats.totalFarms || 0,
          icon: MapPin,
          color: 'bg-purple-500'
        },
        {
          name: 'Social Links',
          value: dashboardData.stats.totalSocialLinks || 0,
          icon: Share2,
          color: 'bg-pink-500'
        },
        {
          name: 'Popular Products',
          value: dashboardData.stats.popularProducts || 0,
          icon: TrendingUp,
          color: 'bg-yellow-500'
        },
        {
          name: 'Active Pages',
          value: dashboardData.stats.totalPages || 0,
          icon: Users,
          color: 'bg-indigo-500'
        }
      ]
    ) : 
    calculateStats();

  // Use data from dashboard API or fallback to config
  const recentProducts = dashboardData?.recentProducts || config.products?.slice(-5).reverse() || [];
  const popularProducts = dashboardData?.popularProducts || 
                         config.products?.filter(p => p.popular || p.is_popular) || [];

  console.log('📈 Dashboard data:', {
    stats: stats.map(s => `${s.name}: ${s.value}`),
    recentProducts: recentProducts.length,
    popularProducts: popularProducts.length
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your shop.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded"
            >
              Refresh Data
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">{config.shopInfo?.logo || '🌿'}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {config.shopInfo?.name || 'Your Shop'}
                </p>
                <p className="text-xs text-gray-500">
                  {config.shopInfo?.description || 'Shop description'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${dashboardData ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-blue-800">
              Data source: {dashboardData ? 'Dashboard API' : 'Configuration fallback'}
            </span>
          </div>
          <span className="text-blue-600">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Products & Popular Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Products</h3>
            <p className="text-sm text-gray-500">
              Latest products ({recentProducts.length} found)
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentProducts.length > 0 ? (
                recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {product.image || product.image_url ? (
                        <img
                          src={product.image || product.image_url}
                          alt={product.name}
                          className="h-8 w-8 rounded object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <span className={`text-lg ${product.image || product.image_url ? 'hidden' : ''}`}>
                        📦
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        €{product.variants && product.variants.length > 0 
                          ? Math.min(...product.variants.map(v => parseFloat(v.price) || 0)) 
                          : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.variants?.length || 0} variant{(product.variants?.length || 0) > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No products found. Add some products to see them here.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Popular Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Popular Products</h3>
            <p className="text-sm text-gray-500">
              Products marked as popular ({popularProducts.length} found)
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {popularProducts.length > 0 ? (
                popularProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {product.image || product.image_url ? (
                        <img
                          src={product.image || product.image_url}
                          alt={product.name}
                          className="h-8 w-8 rounded object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <span className={`text-lg ${product.image || product.image_url ? 'hidden' : ''}`}>
                        ⭐
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⭐ Popular
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No popular products yet. Mark some products as popular to see them here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/products'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Add Product</p>
          </button>
          <button 
            onClick={() => window.location.href = '/categories'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Tag className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Add Category</p>
          </button>
          <button 
            onClick={() => window.location.href = '/farms'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MapPin className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Add Farm</p>
          </button>
          <button 
            onClick={() => window.location.href = '/social-media'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share2 className="h-8 w-8 text-pink-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Add Social Link</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;