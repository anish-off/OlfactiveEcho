import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const RatingStars = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'md',
  editable = false,
  onChange = null,
  showCount = false,
  reviewCount = 0
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  const [selectedRating, setSelectedRating] = React.useState(rating);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleClick = (value) => {
    if (editable) {
      setSelectedRating(value);
      if (onChange) {
        onChange(value);
      }
    }
  };

  const displayRating = editable ? (hoverRating || selectedRating) : rating;

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;
        const isPartial = !editable && starValue > displayRating && starValue - displayRating < 1;
        const fillPercentage = isPartial ? ((displayRating % 1) * 100) : 100;

        return (
          <motion.div
            key={index}
            className={`relative ${editable ? 'cursor-pointer' : ''}`}
            onMouseEnter={() => editable && setHoverRating(starValue)}
            onMouseLeave={() => editable && setHoverRating(0)}
            onClick={() => handleClick(starValue)}
            whileHover={editable ? { scale: 1.1 } : {}}
            whileTap={editable ? { scale: 0.95 } : {}}
          >
            {/* Background star (gray) */}
            <Star 
              className={`${sizeClasses[size]} text-gray-300`}
              fill="currentColor"
            />
            
            {/* Foreground star (yellow) */}
            {(isFilled || isPartial) && (
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ width: isFilled ? '100%' : `${fillPercentage}%` }}
              >
                <Star 
                  className={`${sizeClasses[size]} text-yellow-400`}
                  fill="currentColor"
                />
              </div>
            )}
          </motion.div>
        );
      })}
      
      {showCount && reviewCount > 0 && (
        <span className="ml-2 text-sm text-gray-600">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
