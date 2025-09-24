import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FreeItemSelector = ({ cartItems, onFreeItemSelected, isVisible, onClose }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [availableFreeItems, setAvailableFreeItems] = useState([]);

  useEffect(() => {
    if (isVisible && cartItems.length >= 3) {
      // Calculate how many free items can be selected
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const freeItemsAllowed = Math.floor(totalItems / 3);
      
      // Sort items by price ascending to show cheapest first (most logical free items)
      const sortedItems = [...cartItems]
        .flatMap(item => Array(item.quantity).fill(item))
        .sort((a, b) => a.price - b.price);
      
      setAvailableFreeItems(sortedItems.slice(0, freeItemsAllowed));
      setSelectedItems(sortedItems.slice(0, freeItemsAllowed).map(item => item.id));
    }
  }, [isVisible, cartItems]);

  const handleConfirmSelection = () => {
    if (selectedItems.length > 0) {
      onFreeItemSelected(selectedItems);
      toast.success(`🎉 ${selectedItems.length} free item(s) added to your order!`);
      onClose();
    }
  };

  const toggleItemSelection = (itemId) => {
    const maxFreeItems = Math.floor(cartItems.reduce((sum, item) => sum + item.quantity, 0) / 3);
    
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else if (prev.length < maxFreeItems) {
        return [...prev, itemId];
      } else {
        toast.error(`You can select up to ${maxFreeItems} free items`);
        return prev;
      }
    });
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[#c69a2d] to-[#b8860b] rounded-lg">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Choose Your Free Items</h2>
                <p className="text-gray-600">Buy 2 Get 1 FREE - Select up to {Math.floor(cartItems.reduce((sum, item) => sum + item.quantity, 0) / 3)} items</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Available Items */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Available Items (cheapest items selected automatically)</h3>
            <div className="grid gap-3">
              {availableFreeItems.map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedItems.includes(item.id)
                      ? 'border-[#c69a2d] bg-gradient-to-r from-[#c69a2d]/10 to-[#b8860b]/10'
                      : 'border-gray-200 hover:border-[#c69a2d]/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleItemSelection(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.imageUrl || item.image || '/placeholder.png'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.brand}</p>
                        <p className="text-lg font-bold text-[#c69a2d]">₹{item.price.toFixed(0)} <span className="text-sm font-normal text-gray-500 line-through">Original Price</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedItems.includes(item.id) ? (
                        <div className="w-6 h-6 bg-[#c69a2d] rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                      )}
                      <span className="text-sm font-bold text-green-600">FREE</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-[#c69a2d]/10 to-[#b8860b]/10 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected Free Items</p>
                <p className="text-lg font-bold text-gray-900">{selectedItems.length} of {availableFreeItems.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Savings</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{availableFreeItems
                    .filter(item => selectedItems.includes(item.id))
                    .reduce((sum, item) => sum + item.price, 0)
                    .toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#c69a2d] to-[#b8860b] text-white rounded-xl hover:from-[#b8860b] hover:to-[#a06800] transition-all duration-300 font-medium"
              disabled={selectedItems.length === 0}
            >
              Confirm Selection ({selectedItems.length} Free)
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FreeItemSelector;