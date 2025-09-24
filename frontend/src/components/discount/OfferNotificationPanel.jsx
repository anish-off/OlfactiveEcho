import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, ShoppingCart, Crown, Package, Zap, ChevronRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import useAdvancedDiscounts from '../../hooks/useAdvancedDiscounts';

const OfferNotificationPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(0);
  const [isManuallyDismissed, setIsManuallyDismissed] = useState(false);
  const panelRef = useRef(null);
  const { items, grandTotal } = useCart();
  const { checkOfferEligibility, applicableOffers, totalSavings } = useAdvancedDiscounts(items, grandTotal);
  const [notifications, setNotifications] = useState([]);

  // Static promotional offers (always shown)
  const staticOffers = [
    {
      id: 'welcome',
      icon: Gift,
      title: '🎊 MEGA OFFERS LIVE NOW!',
      message: 'Buy 2 Get 1 FREE • Free Samples • VIP Rewards',
      bgGradient: 'from-[#c69a2d] to-[#b8860b]',
      action: 'Explore Offers',
      priority: 1
    },
    {
      id: 'bulk_promo',
      icon: ShoppingCart,
      title: '📦 Bulk Discounts Available',
      message: 'Save up to 20% on bulk orders • More items = More savings',
      bgGradient: 'from-[#b8860b] to-[#a06800]',
      action: 'Shop Now',
      priority: 2
    },
    {
      id: 'vip_promo',
      icon: Crown,
      title: '👑 Join VIP Program',
      message: 'Exclusive discounts, early access & premium perks await',
      bgGradient: 'from-[#a06800] to-[#c69a2d]',
      action: 'Learn More',
      priority: 3
    }
  ];

  useEffect(() => {
    const eligibilityOffers = checkOfferEligibility();
    const combinedOffers = [
      ...eligibilityOffers.map(offer => ({
        ...offer,
        id: offer.type,
        title: offer.message,
        bgGradient: 'from-[#c69a2d] via-[#b8860b] to-[#a06800]',
        icon: offer.type === 'buy2get1' ? Gift : 
              offer.type === 'freeSamples' ? Package : 
              offer.type === 'bulkDiscount' ? ShoppingCart : Zap,
        priority: 0
      })),
      ...staticOffers
    ];

    const sortedOffers = combinedOffers.sort((a, b) => a.priority - b.priority);
    setNotifications(sortedOffers);

    // Only show if there are significant changes and not manually dismissed
    const hasSignificantOffers = eligibilityOffers.length > 0;
    if (hasSignificantOffers && !isManuallyDismissed) {
      setIsVisible(true);
    }
  }, [items?.length, grandTotal, isManuallyDismissed]);

  useEffect(() => {
    if (notifications.length > 1 && isVisible && !isManuallyDismissed) {
      const timer = setInterval(() => {
        setCurrentOffer((prev) => (prev + 1) % notifications.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [notifications.length, isVisible, isManuallyDismissed]);

  const handleClose = () => {
    setIsVisible(false);
    setIsManuallyDismissed(true);
    
    // Stay dismissed for longer (5 minutes instead of 30 seconds)
    setTimeout(() => {
      setIsManuallyDismissed(false);
    }, 300000); // 5 minutes
  };

  if (!isVisible || notifications.length === 0 || isManuallyDismissed) {
    return null;
  }

  const activeNotification = notifications[currentOffer];

  return (
    <AnimatePresence>
      <motion.div
        ref={panelRef}
        className="fixed bottom-4 right-4 z-50 w-80 md:w-96"
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.8 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <motion.div
          className={`relative bg-gradient-to-r ${activeNotification.bgGradient} rounded-2xl shadow-2xl text-white overflow-hidden`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/10">
            <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-2 left-2 w-8 h-8 bg-white/5 rounded-full animate-bounce"></div>
          </div>

          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors z-20 shadow-lg"
            title="Close offers"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="relative z-10 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-lg mt-1">
                {React.createElement(activeNotification.icon, { className: "w-5 h-5" })}
              </div>
              
              <div className="flex-1 pr-6">
                <h3 className="font-bold text-sm leading-tight mb-1">
                  {activeNotification.title}
                </h3>
                <p className="text-white/90 text-xs leading-relaxed mb-3">
                  {activeNotification.message}
                </p>

                {totalSavings > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Current Savings:</span>
                      <span className="text-sm font-bold text-yellow-200">
                        ₹{totalSavings.toFixed(0)}
                      </span>
                    </div>
                  </div>
                )}

                <button 
                  className="w-full bg-white text-gray-800 hover:bg-gray-50 py-2 px-4 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  onClick={() => {
                    if (activeNotification.action === 'Explore Offers') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (activeNotification.action === 'Shop Now') {
                      window.location.href = '/collections';
                    }
                    handleClose();
                  }}
                >
                  {activeNotification.action || 'Shop Now'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {notifications.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {notifications.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentOffer(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentOffer ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OfferNotificationPanel;