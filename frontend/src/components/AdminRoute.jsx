import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isLoggedIn, user } = useAuth();

  // Debug logs removed for production

  // Check if user is logged in and has admin role
  if (!isLoggedIn) {
    // Redirecting to login
    return <Navigate to="/login" replace />;
  }

  if (!user || user.role !== 'admin') {
    // Redirecting non-admin user
    return <Navigate to="/products" replace />;
  }

  // Admin access granted
  return children;
};

export default AdminRoute;
