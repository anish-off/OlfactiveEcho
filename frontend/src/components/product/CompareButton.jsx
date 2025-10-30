import React from 'react';
import { GitCompare } from 'lucide-react';
import { useComparison } from '../../context/ComparisonContext';
import { motion } from 'framer-motion';

const CompareButton = ({ product, size = 'md', showLabel = false }) => {
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  const inComparison = isInComparison(product._id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (inComparison) {
      removeFromComparison(product._id);
    } else {
      addToComparison(product);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${sizeClasses[size]}
        rounded-full transition-all duration-200
        ${inComparison 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
        }
        ${showLabel ? 'flex items-center gap-2 px-4' : ''}
      `}
      title={inComparison ? 'Remove from comparison' : 'Add to comparison'}
    >
      <GitCompare className={iconSizes[size]} />
      {showLabel && (
        <span className="text-sm font-medium">
          {inComparison ? 'In Comparison' : 'Compare'}
        </span>
      )}
    </motion.button>
  );
};

export default CompareButton;
