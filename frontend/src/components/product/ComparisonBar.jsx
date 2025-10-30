import React, { useState } from 'react';
import { GitCompare, X } from 'lucide-react';
import { useComparison } from '../../context/ComparisonContext';
import { motion, AnimatePresence } from 'framer-motion';
import ComparisonModal from './ComparisonModal';

const ComparisonBar = () => {
  const { compareItems, removeFromComparison, clearComparison, compareCount } = useComparison();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (compareCount === 0) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-4 min-w-[320px] max-w-2xl">
            {/* Icon and Count */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <GitCompare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">Compare Products</p>
                <p className="text-xs opacity-75">{compareCount} selected</p>
              </div>
            </div>

            {/* Product Thumbnails */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {compareItems.map((product) => (
                <div key={product._id} className="relative group shrink-0">
                  <img
                    src={product.imageUrl || product.image || '/perfume-images/Unknown.jpg'}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-contain bg-white p-1"
                  />
                  <button
                    onClick={() => removeFromComparison(product._id)}
                    className="absolute -top-1 -right-1 p-0.5 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={compareCount < 2}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  compareCount < 2
                    ? 'bg-white/20 cursor-not-allowed opacity-50'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                Compare
              </button>
              <button
                onClick={clearComparison}
                className="p-2.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Clear comparison"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <ComparisonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default ComparisonBar;
