import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isLoggedIn, user, loading } = useAuth();
  const location = useLocation();

  // Debug logs removed for production

  // Check if user is logged in and has admin role
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    // Redirecting to login only after auth state is known. Preserve attempted path.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user || user.role !== 'admin') {
    // Redirecting non-admin user
    return <Navigate to="/products" replace />;
  }

  // Admin access granted
  return children;
};

export default AdminRoute;
