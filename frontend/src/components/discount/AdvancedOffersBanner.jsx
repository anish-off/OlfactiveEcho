import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, ShoppingCart, Star, Zap, Crown, Package } from 'lucide-react';

const AdvancedOffersBanner = ({ isCompact = false, showAll = true }) => {
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

  const advancedOffers = [
    {
      id: 'buy2get1',
      icon: Gift,
      title: 'Buy 2 Get 1 FREE',
      subtitle: 'Mix & Match Any Fragrances',
      description: 'Add 3 items to cart, pay for 2 only!',
      bgGradient: 'bg-gradient-to-r from-[#c69a2d] via-[#b8860b] to-[#a06800]',
      code: 'BUY2GET1',
      minItems: 3,
      highlight: 'MOST POPULAR',
      savings: 'Save up to ₹2,500'
    },
    {
      id: 'free_samples',
      icon: Package,
      title: 'FREE Sample Set',
      subtitle: 'On Orders Above ₹2,500',
      description: 'Get 3 premium samples worth ₹150 absolutely FREE!',
      bgGradient: 'bg-gradient-to-r from-[#a06800] via-[#c69a2d] to-[#b8860b]',
      code: 'FREESAMPLES',
      minAmount: 2500,
      highlight: 'NEW OFFER',
      savings: 'Worth ₹150 FREE'
    },
    {
      id: 'bulk_discount',
      icon: ShoppingCart,
      title: 'Bulk Discounts',
      subtitle: 'More You Buy, More You Save',
      description: '5+ items: 10% OFF | 8+ items: 15% OFF | 12+ items: 20% OFF',
      bgGradient: 'bg-gradient-to-r from-[#b8860b] via-[#a06800] to-[#c69a2d]',
      code: 'BULKSAVE',
      highlight: 'BEST VALUE',
      savings: 'Up to 20% OFF'
    },
    {
      id: 'vip_tier',
      icon: Crown,
      title: 'VIP Tier Rewards',
      subtitle: 'Exclusive Member Benefits',
      description: 'Spend ₹5K: Gold Status | ₹10K: Platinum | ₹25K: Diamond',
      bgGradient: 'bg-gradient-to-r from-[#c69a2d] via-[#b8860b] to-[#a06800]',
      code: 'VIPACCESS',
      highlight: 'EXCLUSIVE',
      savings: 'Luxury Perks'
    }
  ];

  // Auto-rotate offers every 5 seconds
  useEffect(() => {
    if (!showAll) {
      const timer = setInterval(() => {
        setCurrentOfferIndex((prev) => (prev + 1) % advancedOffers.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [showAll, advancedOffers.length]);

  if (isCompact) {
    return (
      <motion.div 
        className="bg-gradient-to-r from-[#c69a2d] to-[#b8860b] text-white py-2 px-4 overflow-hidden relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <motion.div
          className="relative z-10 flex items-center justify-center gap-4 text-sm font-medium"
          key={currentOfferIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            {React.createElement(advancedOffers[currentOfferIndex].icon, { className: "w-4 h-4" })}
            <span>{advancedOffers[currentOfferIndex].title}</span>
          </div>
          <span className="hidden md:block">•</span>
          <span className="hidden md:block text-yellow-200">
            {advancedOffers[currentOfferIndex].savings}
          </span>
        </motion.div>
      </motion.div>
    );
  }

  if (showAll) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#c69a2d] via-[#b8860b] to-[#a06800] bg-clip-text text-transparent mb-2">
              🎉 MEGA OFFERS ALERT! 🎉
            </h2>
            <p className="text-gray-600 text-lg">
              Don't Miss Out - Limited Time Exclusive Deals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advancedOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                className={`relative overflow-hidden rounded-2xl ${offer.bgGradient} text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Highlight Badge */}
                <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                  {offer.highlight}
                </div>

                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/20 animate-pulse"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-white/15 animate-bounce"></div>
                </div>

                <div className="relative z-10 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-full">
                      {React.createElement(offer.icon, { className: "w-6 h-6" })}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{offer.title}</h3>
                      <p className="text-white/80 text-sm">{offer.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-white/90 text-sm mb-4 leading-relaxed">
                    {offer.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                      {offer.savings}
                    </div>
                    {offer.code && (
                      <div className="bg-white text-gray-800 px-3 py-1 rounded-full text-xs font-bold">
                        {offer.code}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c69a2d] to-[#b8860b] text-white px-6 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <Zap className="w-5 h-5" />
              Shop Now & Save Big!
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Single rotating offer view
  return (
    <div className="bg-gradient-to-r from-[#c69a2d] to-[#b8860b] text-white py-8 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="max-w-4xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentOfferIndex}
            className="text-center"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-4 mb-2">
              {React.createElement(advancedOffers[currentOfferIndex].icon, { className: "w-8 h-8" })}
              <h3 className="text-2xl md:text-3xl font-bold">
                {advancedOffers[currentOfferIndex].title}
              </h3>
            </div>
            <p className="text-white/90 text-lg mb-2">
              {advancedOffers[currentOfferIndex].subtitle}
            </p>
            <p className="text-white/80 text-sm max-w-2xl mx-auto">
              {advancedOffers[currentOfferIndex].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {advancedOffers.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentOfferIndex ? 'bg-white' : 'bg-white/40'
              }`}
              onClick={() => setCurrentOfferIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedOffersBanner;