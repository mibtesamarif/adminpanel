// Updated App.jsx with Performance Monitor

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductsManager from './pages/admin/ProductsManager';
import CategoriesManager from './pages/admin/CategoriesManager';
import FarmsManager from './pages/admin/FarmsManager';
import SocialMediaManager from './pages/admin/SocialMediaManager';
import ShopSettings from './pages/admin/ShopSettings';
import ProfileSettings from './pages/admin/ProfileSettings';
import PerformanceMonitor from './components/debug/PerformanceMonitor';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<ProductsManager />} />
                <Route path="categories" element={<CategoriesManager />} />
                <Route path="farms" element={<FarmsManager />} />
                <Route path="social-media" element={<SocialMediaManager />} />
                <Route path="shop-settings" element={<ShopSettings />} />
                <Route path="profile" element={<ProfileSettings />} />
              </Route>
            </Routes>
            
            {/* Performance Monitor - only shows in development */}
            <PerformanceMonitor />
          </div>
        </Router>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;