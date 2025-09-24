import React from 'react';
import { motion } from 'framer-motion';
import { Percent, Tag, Star, Flame, Gift, Zap, Package, Crown } from 'lucide-react';

const DiscountBadge = ({ 
  type = "percentage", // percentage, flat, bogo, premium, seasonal, flash
  value, 
  originalPrice,
  className = "",
  size = "md", // sm, md, lg
  animated = true,
  position = "top-left" // top-left, top-right, bottom-left, bottom-right
}) => {
  
  const sizeStyles = {
    sm: {
      container: "px-2 py-1 text-xs",
      icon: "h-3 w-3",
      text: "text-xs"
    },
    md: {
      container: "px-3 py-1.5 text-sm",
      icon: "h-4 w-4",
      text: "text-sm"
    },
    lg: {
      container: "px-4 py-2 text-base",
      icon: "h-5 w-5",
      text: "text-base"
    }
  };

  const positionStyles = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2'
  };

  const getBadgeContent = () => {
    switch (type) {
      case "percentage":
        return {
          icon: Percent,
          text: `${value}% OFF`,
          bgColor: "bg-gradient-to-r from-red-500 to-red-600",
          textColor: "text-white"
        };
      case "flat":
        return {
          icon: Tag,
          text: `₹${value} OFF`,
          bgColor: "bg-gradient-to-r from-green-500 to-green-600",
          textColor: "text-white"
        };
      case "bogo":
        return {
          icon: Gift,
          text: "Buy 1 Get 1",
          bgColor: "bg-gradient-to-r from-[#c69a2d] to-[#b8860b]",
          textColor: "text-white"
        };
      case "buy2get1":
        return {
          icon: Gift,
          text: "Buy 2 Get 1 FREE",
          bgColor: "bg-gradient-to-r from-[#c69a2d] via-[#b8860b] to-[#a06800]",
          textColor: "text-white"
        };
      case "bulk_discount":
        return {
          icon: Package,
          text: "Bulk Discount",
          bgColor: "bg-gradient-to-r from-[#b8860b] to-[#a06800]",
          textColor: "text-white"
        };
      case "free_samples":
        return {
          icon: Gift,
          text: "Free Samples",
          bgColor: "bg-gradient-to-r from-[#a06800] to-[#c69a2d]",
          textColor: "text-white"
        };
      case "vip_tier":
        return {
          icon: Crown,
          text: "VIP Reward",
          bgColor: "bg-gradient-to-r from-[#c69a2d] via-[#b8860b] to-[#a06800]",
          textColor: "text-white"
        };
      case "premium":
        return {
          icon: Star,
          text: "Premium Deal",
          bgColor: "bg-gradient-to-r from-amber-500 to-amber-600",
          textColor: "text-white"
        };
      case "seasonal":
        return {
          icon: Gift,
          text: `${value}% OFF`,
          bgColor: "bg-gradient-to-r from-emerald-500 to-emerald-600",
          textColor: "text-white"
        };
      case "flash":
        return {
          icon: Zap,
          text: "Flash Sale",
          bgColor: "bg-gradient-to-r from-orange-500 to-red-500",
          textColor: "text-white"
        };
      default:
        return {
          icon: Percent,
          text: `${value}% OFF`,
          bgColor: "bg-gradient-to-r from-red-500 to-red-600",
          textColor: "text-white"
        };
    }
  };

  const { icon: Icon, text, bgColor, textColor } = getBadgeContent();
  const styles = sizeStyles[size];

  // Calculate savings
  const calculateSavings = () => {
    if (!originalPrice || !value) return null;
    
    let savings = 0;
    if (type === "percentage") {
      savings = (originalPrice * value) / 100;
    } else if (type === "flat") {
      savings = value;
    }
    
    return savings > 0 ? `Save ₹${savings.toLocaleString()}` : null;
  };

  const savingsText = calculateSavings();

  const BadgeContent = () => (
    <div className={`
      absolute ${positionStyles[position]} z-10 
      ${bgColor} ${textColor} ${styles.container} 
      rounded-full font-bold shadow-lg backdrop-blur-sm
      flex items-center gap-1 ${className}
      transform transition-transform hover:scale-110 duration-200
    `}>
      <Icon className={styles.icon} />
      <span className={styles.text}>{text}</span>
    </div>
  );

  if (!animated) {
    return <BadgeContent />;
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        delay: Math.random() * 0.2 // Stagger animation
      }}
      whileHover={{ scale: 1.05 }}
      className="relative"
    >
      <BadgeContent />
      
      {/* Pulse effect for flash sales */}
      {type === "flash" && (
        <motion.div
          className={`absolute ${positionStyles[position]} ${styles.container} rounded-full bg-[#c69a2d]/30 opacity-30`}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Savings tooltip */}
      {savingsText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className={`
            absolute ${position.includes('top') ? 'top-12' : 'bottom-12'} 
            ${position.includes('left') ? 'left-0' : 'right-0'}
            bg-black text-white text-xs px-2 py-1 rounded shadow-lg
            pointer-events-none whitespace-nowrap
          `}
        >
          {savingsText}
          <div className={`
            absolute w-0 h-0 
            ${position.includes('top') 
              ? 'border-l-2 border-r-2 border-b-2 border-l-transparent border-r-transparent border-b-black -top-2' 
              : 'border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-black -bottom-2'
            }
            ${position.includes('left') ? 'left-4' : 'right-4'}
          `} />
        </motion.div>
      )}
    </motion.div>
  );
};

// Special discount badge for product cards
export const ProductDiscountBadge = ({ 
  discount, 
  originalPrice, 
  salePrice,
  saleType = "regular" // regular, flash, seasonal, premium
}) => {
  if (!discount && !originalPrice && !salePrice) return null;

  let discountValue = discount;
  let badgeType = "percentage";

  // Calculate discount if not provided
  if (!discount && originalPrice && salePrice) {
    discountValue = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  // Determine badge type based on sale type and discount value
  if (saleType === "flash") {
    badgeType = "flash";
  } else if (saleType === "seasonal") {
    badgeType = "seasonal";
  } else if (saleType === "premium") {
    badgeType = "premium";
  } else if (discountValue >= 50) {
    badgeType = "flash";
  } else if (discountValue >= 30) {
    badgeType = "percentage";
  }

  return (
    <DiscountBadge
      type={badgeType}
      value={discountValue}
      originalPrice={originalPrice}
      size="md"
      animated={true}
      position="top-left"
    />
  );
};

export default DiscountBadge;