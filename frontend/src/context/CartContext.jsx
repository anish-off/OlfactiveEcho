import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?._id || user?.id || user?.email || 'guest';
  const storageKey = `cart_${userId}`;
  const [items, setItems] = useState([]);

  // Load cart for current user on mount or user change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setItems(stored ? JSON.parse(stored) : []);
    } catch { setItems([]); }
  }, [storageKey]);

  // Save cart for current user
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  // Clear cart when user logs out (user becomes null)
  useEffect(() => {
    if (!user) setItems([]);
  }, [user]);

  const addItem = (product, quantity = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === product._id || i.id === product.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx].quantity += quantity;
        return copy;
      }
      return [...prev, { id: product._id || product.id, product, quantity }];
    });
  };

  const addSample = (sampleProduct, quantity = 1) => {
    // Samples are treated as separate items even if same product
    setItems(prev => [...prev, { 
      id: sampleProduct._id, 
      product: sampleProduct, 
      quantity,
      isSample: true 
    }]);
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const updateQuantity = (id, quantity) => setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i));
  const clearCart = () => setItems([]);

  // Separate regular items and samples for calculations
  const regularItems = items.filter(item => !item.isSample && !item.product?.isSample);
  const sampleItems = items.filter(item => item.isSample || item.product?.isSample);

  const totalItems = items.reduce((s,i)=>s+i.quantity,0);
  const subtotal = regularItems.reduce((s,i)=>s + (i.product?.price||0)*i.quantity,0);
  const sampleTotal = sampleItems.reduce((s,i)=>s + (i.product?.price||0)*i.quantity,0);
  const grandTotal = subtotal + sampleTotal;

  // Check if eligible for free samples (₹5000 threshold)
  const freeThreshold = 5000;
  const isFreeEligible = subtotal >= freeThreshold;

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      addSample, 
      removeItem, 
      updateQuantity, 
      clearCart, 
      totalItems, 
      subtotal, 
      sampleTotal, 
      grandTotal,
      regularItems,
      sampleItems,
      isFreeEligible,
      freeThreshold
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
