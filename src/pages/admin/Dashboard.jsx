import React from 'react';
import { Package, Tag, MapPin, Share2, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const Dashboard = () => {
  const { config } = useAdmin();

  const stats = [
    {
      name: 'Total Products',
      value: config.products.length,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      name: 'Categories',
      value: config.categories.length,
      icon: Tag,
      color: 'bg-green-500'
    },
    {
      name: 'Farms',
      value: config.farms.length,
      icon: MapPin,
      color: 'bg-purple-500'
    },
    {
      name: 'Social Links',
      value: config.socialMediaLinks.length,
      icon: Share2,
      color: 'bg-pink-500'
    },
    {
      name: 'Popular Products',
      value: config.products.filter(p => p.popular).length,
      icon: TrendingUp,
      color: 'bg-yellow-500'
    },
    {
      name: 'Active Pages',
      value: config.pages.length,
      icon: Users,
      color: 'bg-indigo-500'
    }
  ];

  const recentProducts = config.products.slice(0, 5);
  const popularProducts = config.products.filter(p => p.popular);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your shop.</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🌿</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{config.shopInfo.name}</p>
              <p className="text-xs text-gray-500">{config.shopInfo.description}</p>
            </div>
          </div>
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
            <p className="text-sm text-gray-500">Latest products added to your shop</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-8 w-8 rounded object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <span className="text-lg hidden">📦</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      €{Math.min(...product.variants.map(v => v.price))}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Popular Products</h3>
            <p className="text-sm text-gray-500">Products marked as popular</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {popularProducts.length > 0 ? (
                popularProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-8 w-8 rounded object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <span className="text-lg hidden">📦</span>
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
                <p className="text-gray-500 text-center py-4">No popular products yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Package className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Add Product</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Tag className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Add Category</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <MapPin className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Add Farm</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 className="h-8 w-8 text-pink-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Add Social Link</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;