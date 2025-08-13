import React, { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wishlist')||'[]'); } catch { return []; }
  });
  useEffect(()=>{ localStorage.setItem('wishlist', JSON.stringify(ids)); }, [ids]);

  const toggle = (id) => setIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const remove = (id) => setIds(prev => prev.filter(x=>x!==id));
  const clear = () => setIds([]);
  const has = (id) => ids.includes(id);

  return (
    <WishlistContext.Provider value={{ ids, toggle, remove, clear, has }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
