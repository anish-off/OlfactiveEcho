import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { login as apiLogin, register as apiRegister, me as fetchMe, logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On app start, rehydrate auth state from storage and validate token
    const token = localStorage.getItem('token');
    if (!token) {
      // No token => ensure cached user is cleared
      localStorage.removeItem('user');
      setLoading(false);
      return;
    }

    // Optimistically set cached user to avoid UI flicker while validating
    const cached = localStorage.getItem('user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') setUser(parsed);
      } catch {}
    }

    (async () => {
      try {
        const { user: me } = await fetchMe();
        setUser(me);
        localStorage.setItem('user', JSON.stringify(me));
      } catch (e) {
        // Token invalid or network error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async ({ email, password }) => {
    if (!email || !password) throw new Error('Missing credentials');
    const data = await apiLogin({ email, password });
    // Ensure user data is valid before setting state
    if (!data.user || !data.user.id) {
      throw new Error('Invalid user data received from server');
    }
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
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
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);