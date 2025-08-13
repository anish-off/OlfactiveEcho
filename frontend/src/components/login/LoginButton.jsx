import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginButton = () => {
  const { isLoggedIn, logout } = useAuth();

  return isLoggedIn ? (
    <button onClick={logout} className="oe-login-btn">
      Logout
    </button>
  ) : (
    <Link to="/login" className="oe-login-btn">
      Login
    </Link>
  );
};

export default LoginButton;