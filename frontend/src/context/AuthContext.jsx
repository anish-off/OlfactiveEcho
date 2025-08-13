import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  const login = (user) => {
    setIsLoggedIn(true);
    setUsername(user.username);
    navigate('/products'); // Redirect to products page on login
    // In a real app, you'd store tokens/user data in localStorage/sessionStorage
    // and handle actual authentication with a backend.
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    // In a real app, you'd clear tokens/user data from storage.
    navigate('/login'); // Redirect to login page on logout
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);