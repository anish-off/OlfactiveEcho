import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ComparisonContext = createContext();

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
};

export const ComparisonProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState([]);
  const MAX_COMPARE = 4; // Maximum items to compare

  // Load comparison items from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('olfactiveEcho_comparison');
      if (saved) {
        setCompareItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load comparison data:', error);
    }
  }, []);

  // Save comparison items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('olfactiveEcho_comparison', JSON.stringify(compareItems));
    } catch (error) {
      console.error('Failed to save comparison data:', error);
    }
  }, [compareItems]);

  const addToComparison = (product) => {
    if (compareItems.length >= MAX_COMPARE) {
      toast.error(`You can only compare up to ${MAX_COMPARE} products at a time`);
      return false;
    }

    if (compareItems.find(item => item._id === product._id)) {
      toast.error('This product is already in comparison');
      return false;
    }

    setCompareItems(prev => [...prev, product]);
    toast.success(`${product.name} added to comparison`);
    return true;
  };

  const removeFromComparison = (productId) => {
    setCompareItems(prev => prev.filter(item => item._id !== productId));
    toast.success('Product removed from comparison');
  };

  const clearComparison = () => {
    setCompareItems([]);
    toast.success('Comparison cleared');
  };

  const isInComparison = (productId) => {
    return compareItems.some(item => item._id === productId);
  };

  const value = {
    compareItems,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    compareCount: compareItems.length,
    maxCompare: MAX_COMPARE,
    canAddMore: compareItems.length < MAX_COMPARE
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};

export default ComparisonContext;
