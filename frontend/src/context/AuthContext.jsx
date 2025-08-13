import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { login as apiLogin, register as apiRegister, me as fetchMe, logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch current user if token exists
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    (async () => {
      try {
        const { user: me } = await fetchMe();
        setUser(me);
      } catch (e) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async ({ email, password }) => {
    if (!email || !password) throw new Error('Missing credentials');
    const data = await apiLogin({ email, password });
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    let data;
    if (payload instanceof FormData) {
      data = await apiRegister(payload);
    } else {
      const { name, email, password } = payload;
      if (!name || !email || !password) throw new Error('Missing fields');
      data = await apiRegister({ name, email, password });
    }
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);