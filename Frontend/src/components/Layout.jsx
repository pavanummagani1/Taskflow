import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Settings, 
  LogOut, 
  User, 
  Shield,
  Menu,
  X,
  Users
} from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  const navigation = isAdmin ? [
    { name: 'Admin Dashboard', href: '/admin', icon: Shield },
    { name: 'User Management', href: '/admin', icon: Users },
  ] : [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">
              {isAdmin ? 'Admin Portal' : 'TaskFlow'}
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg mb-2 ${
                  isActive(item.href)
                    ? isAdmin 
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col ${
        isAdmin ? 'bg-gradient-to-b from-purple-900 to-indigo-900' : 'bg-white'
      } shadow-lg`}>
        <div className={`flex h-16 items-center px-6 border-b ${
          isAdmin ? 'border-purple-700' : 'border-gray-200'
        }`}>
          <h1 className={`text-xl font-bold ${
            isAdmin ? 'text-white' : 'text-gray-900'
          }`}>
            {isAdmin ? 'Admin Portal' : 'TaskFlow'}
          </h1>
        </div>
        <nav className="flex-1 px-4 py-4">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg mb-2 transition-colors ${
                isActive(item.href)
                  ? isAdmin
                    ? 'bg-purple-700 text-white'
                    : 'bg-blue-100 text-blue-700'
                  : isAdmin
                    ? 'text-purple-200 hover:bg-purple-800 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </a>
          ))}
        </nav>
        <div className={`border-t ${
          isAdmin ? 'border-purple-700' : 'border-gray-200'
        } p-4`}>
          <div className="flex items-center">
            <div className={`h-8 w-8 ${
              isAdmin ? 'bg-purple-700' : 'bg-blue-100'
            } rounded-full flex items-center justify-center`}>
              {isAdmin ? (
                <Shield className="h-4 w-4 text-white" />
              ) : (
                <User className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                isAdmin ? 'text-white' : 'text-gray-900'
              }`}>
                {user?.name}
              </p>
              <p className={`text-xs ${
                isAdmin ? 'text-purple-200' : 'text-gray-500'
              }`}>
                {user?.email}
              </p>
              {isAdmin && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-700 text-purple-100 mt-1">
                  Administrator
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`mt-4 w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isAdmin
                ? 'text-purple-200 hover:bg-purple-800 hover:text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className={`sticky top-0 z-10 ${
          isAdmin ? 'bg-white border-b border-purple-200' : 'bg-white'
        } shadow-sm border-b border-gray-200`}>
          <div className="flex h-16 items-center px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-auto flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Welcome, {user?.name}
              </div>
              <div className={`h-8 w-8 ${
                isAdmin ? 'bg-purple-100' : 'bg-blue-100'
              } rounded-full flex items-center justify-center`}>
                {isAdmin ? (
                  <Shield className="h-4 w-4 text-purple-600" />
                ) : (
                  <User className="h-4 w-4 text-blue-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}