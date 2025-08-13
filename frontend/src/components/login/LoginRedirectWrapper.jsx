import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


const LoginRedirectWrapper = ({ children, redirectTo = '/login' }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      e.stopPropagation();
      navigate(redirectTo, { state: { from: window.location.pathname } });
    }
  };

  return (
    <div onClickCapture={handleClick} style={{ display: 'contents' }}>
      {children}
    </div>
  );
};

export default LoginRedirectWrapper;