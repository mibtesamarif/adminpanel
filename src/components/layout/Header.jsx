import React from 'react';
import { Menu, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="ml-2 text-xl font-semibold text-gray-900">
            CBD Shop Admin
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.username?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;