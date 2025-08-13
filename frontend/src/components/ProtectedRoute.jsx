import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // Redirect them to the /login page, but save the current URL they tried to go to
    // so they can be redirected there after logging in.
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;