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
      bgGradient: 'bg-gradient-to-br from-[#BF7C2A]/90 via-[#8C501B]/90 to-[#a06800]/90',
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
      bgGradient: 'bg-gradient-to-br from-[#8C501B]/90 via-[#a06800]/90 to-[#704a00]/90',
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
      bgGradient: 'bg-gradient-to-br from-[#a06800]/90 via-[#8C501B]/90 to-[#BF7C2A]/90',
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
      bgGradient: 'bg-gradient-to-br from-[#BF7C2A]/90 via-[#a06800]/90 to-[#8C501B]/90',
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
        className="bg-gradient-to-r from-[#BF7C2A] to-[#8C501B] text-white py-2 px-4 overflow-hidden relative"
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
            <h2 className="text-3xl md:text-4xl font-bold text-[#8C501B] mb-2">
              Special Offers
            </h2>
            <p className="text-gray-600 text-lg">
              Exclusive deals on premium fragrances
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advancedOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                className={`relative overflow-hidden rounded-xl ${offer.bgGradient} text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Highlight Badge */}
                <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                  {offer.highlight}
                </div>

                {/* Subtle Background Element */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/30"></div>
                </div>

                <div className="relative z-10 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/15 rounded-lg">
                      {React.createElement(offer.icon, { className: "w-6 h-6" })}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{offer.title}</h3>
                      <p className="text-white/70 text-sm">{offer.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-white/80 text-sm mb-4 leading-relaxed">
                    {offer.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold">
                      {offer.savings}
                    </div>
                    {offer.code && (
                      <div className="bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-semibold">
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
            <div className="inline-flex items-center gap-2 bg-[#BF7C2A] hover:bg-[#8C501B] text-white px-6 py-3 rounded-lg font-medium text-base shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer">
              <Zap className="w-5 h-5" />
              Explore Offers
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Single rotating offer view
  return (
    <div className="bg-gradient-to-r from-[#BF7C2A] to-[#8C501B] text-white py-8 px-4 relative overflow-hidden">
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