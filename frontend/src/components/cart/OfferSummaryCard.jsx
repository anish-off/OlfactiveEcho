import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Package, Crown, ShoppingCart, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import useAdvancedDiscounts from '../../hooks/useAdvancedDiscounts';
import FreeItemSelector from './FreeItemSelector';

const OfferSummaryCard = ({ cartItems, cartTotal }) => {
  const { applicableOffers, totalSavings, freeItems, checkOfferEligibility } = useAdvancedDiscounts(cartItems, cartTotal);
  const [showDetails, setShowDetails] = useState(false);
  const [showFreeItemSelector, setShowFreeItemSelector] = useState(false);
  const eligibleOffers = checkOfferEligibility();

  const getOfferIcon = (type) => {
    switch (type) {
      case 'buy2get1': return Gift;
      case 'freeSamples': return Package;
      case 'bulkDiscount': return ShoppingCart;
      case 'vipTier': return Crown;
      default: return Zap;
    }
  };

  const getOfferColor = (type) => {
    switch (type) {
      case 'buy2get1': return 'from-[#c69a2d] to-[#b8860b]';
      case 'freeSamples': return 'from-[#b8860b] to-[#a06800]';
      case 'bulkDiscount': return 'from-[#a06800] to-[#c69a2d]';
      case 'vipTier': return 'from-[#c69a2d] via-[#b8860b] to-[#a06800]';
      default: return 'from-[#b8860b] to-[#a06800]';
    }
  };

  const handleFreeItemSelection = (selectedItemIds) => {
    // This would typically update the cart with free items
    console.log('Selected free items:', selectedItemIds);
    // In a real implementation, you'd update the cart context here
  };

  if (applicableOffers.length === 0 && eligibleOffers.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-50 to-white border border-[#c69a2d]/20 rounded-xl overflow-hidden shadow-sm mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-[#c69a2d] to-[#b8860b] text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            <div>
              <h3 className="font-semibold text-sm">Active Offers</h3>
              {totalSavings > 0 && (
                <p className="text-white/80 text-xs">Saving ₹{totalSavings.toFixed(0)}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-white/80 hover:text-white transition-colors text-xs bg-white/20 px-2 py-1 rounded"
          >
            {showDetails ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>

      {/* Active Offers - Compact */}
      {applicableOffers.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <div className="space-y-1">
            {applicableOffers.slice(0, showDetails ? applicableOffers.length : 2).map((offer) => {
              const IconComponent = getOfferIcon(offer.id);
              return (
                <motion.div
                  key={offer.id}
                  className={`bg-gradient-to-r ${getOfferColor(offer.id)} p-2 rounded text-white text-xs flex items-center justify-between`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-3 h-3" />
                    <span className="font-medium">{offer.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">
                      {offer.savings > 0 ? `₹${offer.savings.toFixed(0)}` : 'FREE'}
                    </span>
                    {offer.id === 'buy2get1' && (
                      <button
                        onClick={() => setShowFreeItemSelector(true)}
                        className="text-xs bg-white/20 text-white px-1 py-0.5 rounded hover:bg-white/30 transition-colors"
                      >
                        Choose
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
            {applicableOffers.length > 2 && !showDetails && (
              <button
                onClick={() => setShowDetails(true)}
                className="text-xs text-[#c69a2d] hover:text-[#b8860b] w-full text-center py-1"
              >
                +{applicableOffers.length - 2} more offers
              </button>
            )}
          </div>
        </div>
      )}

      {/* Eligible Offers (Not Yet Applied) - Compact */}
      {eligibleOffers.length > 0 && (
        <div className="p-3">
          <div className="flex items-center gap-1 mb-2">
            <AlertTriangle className="w-3 h-3 text-orange-500" />
            <span className="text-xs font-medium text-orange-700">Almost There!</span>
          </div>
          
          <div className="space-y-1">
            {eligibleOffers.map((offer) => {
              const IconComponent = getOfferIcon(offer.type);
              return (
                <motion.div
                  key={offer.type}
                  className="bg-orange-50 border border-orange-200 p-2 rounded text-xs"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-3 h-3 text-orange-600" />
                      <div>
                        <p className="font-medium text-orange-800">{offer.message}</p>
                        <p className="text-orange-600">{offer.savings}</p>
                      </div>
                    </div>
                    <button className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 transition-colors">
                      {offer.action}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Details Section - Only show when expanded */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="border-t border-gray-100 p-3 bg-gray-50"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2 text-xs text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-800 mb-1 text-xs">How Offers Work:</h4>
                <ul className="space-y-0.5 text-xs">
                  <li>• <strong>Buy 2 Get 1:</strong> Add 3+ items, cheapest free</li>
                  <li>• <strong>Free Samples:</strong> Orders ₹2,500+ get sample set</li>
                  <li>• <strong>Bulk Discounts:</strong> 5+: 10% • 8+: 15% • 12+: 20%</li>
                </ul>
              </div>
              <div className="pt-1 border-t border-gray-200">
                <p className="text-xs text-gray-500">* Best offer automatically applied</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Free Item Selector Modal */}
      <FreeItemSelector
        cartItems={cartItems}
        isVisible={showFreeItemSelector}
        onClose={() => setShowFreeItemSelector(false)}
        onFreeItemSelected={handleFreeItemSelection}
      />
    </motion.div>
  );
};

export default OfferSummaryCard;