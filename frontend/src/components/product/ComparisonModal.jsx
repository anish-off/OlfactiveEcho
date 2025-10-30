import React from 'react';
import { X, GitCompare, Star, DollarSign, Package, Clock, Wind, Calendar } from 'lucide-react';
import { useComparison } from '../../context/ComparisonContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import RatingStars from './RatingStars';

const ComparisonModal = ({ isOpen, onClose }) => {
  const { compareItems, removeFromComparison, clearComparison } = useComparison();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getAttributeValue = (product, attribute) => {
    switch (attribute) {
      case 'image':
        return product.imageUrl || product.image || '/perfume-images/Unknown.jpg';
      case 'name':
        return product.name || 'Unknown';
      case 'brand':
        return typeof product.brand === 'object' ? product.brand?.name : product.brand || 'Unknown';
      case 'price':
        return product.salePrice || product.price || 0;
      case 'rating':
        return product.averageRating || 0;
      case 'reviewCount':
        return product.reviewCount || 0;
      case 'category':
        return product.category || 'N/A';
      case 'gender':
        return product.gender || 'unisex';
      case 'scentFamily':
        return product.scentFamily || 'N/A';
      case 'concentration':
        return product.concentration || 'N/A';
      case 'size':
        return product.size || 'N/A';
      case 'topNotes':
        return product.notes?.top?.join(', ') || 'N/A';
      case 'middleNotes':
        return product.notes?.middle?.join(', ') || 'N/A';
      case 'baseNotes':
        return product.notes?.base?.join(', ') || 'N/A';
      case 'longevity':
        return product.longevity || 'N/A';
      case 'sillage':
        return product.sillage || 'N/A';
      case 'seasons':
        return Array.isArray(product.seasons) ? product.seasons.join(', ') : 'N/A';
      case 'occasions':
        return Array.isArray(product.occasions) ? product.occasions.join(', ') : 'N/A';
      case 'accords':
        return product.main_accords?.map(a => a.name).join(', ') || 'N/A';
      default:
        return 'N/A';
    }
  };

  const comparisonRows = [
    { label: 'Image', key: 'image', type: 'image' },
    { label: 'Name', key: 'name', type: 'text' },
    { label: 'Brand', key: 'brand', type: 'text' },
    { label: 'Price', key: 'price', type: 'price' },
    { label: 'Rating', key: 'rating', type: 'rating' },
    { label: 'Reviews', key: 'reviewCount', type: 'text' },
    { label: 'Category', key: 'category', type: 'badge' },
    { label: 'Gender', key: 'gender', type: 'badge' },
    { label: 'Scent Family', key: 'scentFamily', type: 'text' },
    { label: 'Concentration', key: 'concentration', type: 'text' },
    { label: 'Size', key: 'size', type: 'text' },
    { label: 'Top Notes', key: 'topNotes', type: 'text' },
    { label: 'Middle Notes', key: 'middleNotes', type: 'text' },
    { label: 'Base Notes', key: 'baseNotes', type: 'text' },
    { label: 'Main Accords', key: 'accords', type: 'text' },
    { label: 'Longevity', key: 'longevity', type: 'text' },
    { label: 'Sillage', key: 'sillage', type: 'text' },
    { label: 'Best Seasons', key: 'seasons', type: 'text' },
    { label: 'Occasions', key: 'occasions', type: 'text' },
  ];

  const renderValue = (type, value, product) => {
    switch (type) {
      case 'image':
        return (
          <img 
            src={value} 
            alt={product.name}
            className="w-full h-40 object-contain rounded-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              navigate(`/product/${product._id}`);
              onClose();
            }}
          />
        );
      case 'price':
        return (
          <div className="flex items-center justify-center gap-1 text-lg font-bold text-amber-600">
            <DollarSign className="w-4 h-4" />
            {value.toLocaleString()}
          </div>
        );
      case 'rating':
        return (
          <div className="flex flex-col items-center gap-1">
            <RatingStars rating={value} size="sm" />
            <span className="text-sm font-semibold text-gray-700">{value.toFixed(1)}</span>
          </div>
        );
      case 'badge':
        return (
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium capitalize">
            {value}
          </span>
        );
      case 'text':
      default:
        return <span className="text-sm text-gray-700">{value}</span>;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitCompare className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Compare Perfumes</h2>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {compareItems.length} {compareItems.length === 1 ? 'Product' : 'Products'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearComparison}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-auto max-h-[calc(90vh-100px)]">
              {compareItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <GitCompare className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No products to compare</p>
                  <p className="text-sm mt-2">Add products to start comparing</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-48">
                        Attribute
                      </th>
                      {compareItems.map((product) => (
                        <th key={product._id} className="px-4 py-4 text-center relative">
                          <button
                            onClick={() => removeFromComparison(product._id)}
                            className="absolute top-2 right-2 p-1 bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition-colors"
                            title="Remove from comparison"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {comparisonRows.map((row, index) => (
                      <tr key={row.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                          {row.label}
                        </td>
                        {compareItems.map((product) => (
                          <td key={product._id} className="px-4 py-4 text-center">
                            {renderValue(row.type, getAttributeValue(product, row.key), product)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComparisonModal;
