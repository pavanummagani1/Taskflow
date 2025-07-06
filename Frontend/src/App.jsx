import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import Layout from './components/Layout';
import Loading from './components/Loading';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  
  if (loading) return <Loading />;
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  
  if (loading) return <Loading />;
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />} />
      <Route path="/admin/login" element={!user ? <AdminLogin /> : user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to={user?.role === 'admin' ? "/admin" : "/dashboard"} replace />} />
      
      {/* Protected User Routes - only accessible to users */}
      {user?.role !== 'admin' && (
        <>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/tasks" element={
            <ProtectedRoute>
              <Layout>
                <Tasks />
              </Layout>
            </ProtectedRoute>
          } />
        </>
      )}
      
      {/* Admin-only Routes */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly={true}>
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute adminOnly={true}>
          <Layout>
            <UserManagement />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Catch-all for admins trying to access user routes */}
      {user?.role === 'admin' && (
        <Route path="*" element={<Navigate to="/admin" replace />} />
      )}
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;