import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?._id || user?.id || user?.email || 'guest';
  const storageKey = `wishlist_${userId}`;
  const [ids, setIds] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Load wishlist for user (merge if user interacted before hydration)
  useEffect(() => {
    try {
      const storedRaw = localStorage.getItem(storageKey);
      const stored = storedRaw ? JSON.parse(storedRaw) : [];
      setIds(prev => {
        if (!prev.length) return stored;
        const merged = Array.from(new Set([...prev, ...stored]));
        return merged;
      });
    } catch { /* ignore */ } finally { setHydrated(true); }
  }, [storageKey]);

  // Persist wishlist
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(ids)); }, [ids, storageKey]);

  // Clear when user logs out (user becomes null)
  useEffect(() => { if (!user) setIds([]); }, [user]);

  const toggle = (id) => setIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const remove = (id) => setIds(prev => prev.filter(x=>x!==id));
  const clear = () => setIds([]);
  const has = (id) => ids.includes(id);

  return (
  <WishlistContext.Provider value={{ ids, toggle, remove, clear, has, hydrated }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
