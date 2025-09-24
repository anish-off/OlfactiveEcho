import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';

// Advanced discount calculation hook
export const useAdvancedDiscounts = (cartItems = [], cartTotal = 0) => {
  const [applicableOffers, setApplicableOffers] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [freeItems, setFreeItems] = useState([]);

  // Create a stable reference for cartItems by stringifying and memoizing
  const cartItemsString = useMemo(() => JSON.stringify(cartItems), [cartItems]);
  const memoizedCartItems = useMemo(() => JSON.parse(cartItemsString), [cartItemsString]);

  const discountRules = {
    // Buy 2 Get 1 Free
    buy2get1: {
      id: 'buy2get1',
      name: 'Buy 2 Get 1 Free',
      type: 'buy_x_get_y',
      buyQuantity: 2,
      getQuantity: 1,
      minItems: 3,
      maxApplications: null, // unlimited
      calculate: (items) => {
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems < 3) return { discount: 0, freeItems: 0 };
        
        // Sort by price descending to give the cheapest items free
        const sortedItems = items.sort((a, b) => b.price - a.price);
        const setsOf3 = Math.floor(totalItems / 3);
        let freeItemsCount = setsOf3;
        let discount = 0;
        
        // Calculate discount by giving cheapest items free
        const itemsForDiscount = [];
        sortedItems.forEach(item => {
          for (let i = 0; i < item.quantity; i++) {
            itemsForDiscount.push({ ...item, quantity: 1 });
          }
        });
        
        // Sort again and take cheapest items as free
        itemsForDiscount.sort((a, b) => a.price - b.price);
        for (let i = 0; i < freeItemsCount && i < itemsForDiscount.length; i++) {
          discount += itemsForDiscount[i].price;
        }
        
        return { discount, freeItems: freeItemsCount, description: `${freeItemsCount} item(s) FREE` };
      }
    },

    // Free samples on orders above threshold
    freeSamples: {
      id: 'freeSamples',
      name: 'Free Sample Set',
      type: 'free_samples',
      minOrderAmount: 2500,
      freeItemsCount: 3,
      freeItemValue: 150,
      calculate: (items, total) => {
        if (total < 2500) return { discount: 0, freeItems: [] };
        return {
          discount: 0, // No monetary discount
          freeItems: [
            { name: 'Premium Sample 1', value: 50 },
            { name: 'Premium Sample 2', value: 50 },
            { name: 'Premium Sample 3', value: 50 }
          ],
          description: 'Free premium sample set (₹150 value)'
        };
      }
    },

    // Bulk quantity discounts
    bulkDiscount: {
      id: 'bulkDiscount',
      name: 'Bulk Quantity Discount',
      type: 'bulk_discount',
      tiers: [
        { minQuantity: 5, maxQuantity: 7, discount: 10, type: 'percentage' },
        { minQuantity: 8, maxQuantity: 11, discount: 15, type: 'percentage' },
        { minQuantity: 12, maxQuantity: null, discount: 20, type: 'percentage' }
      ],
      calculate: (items, total) => {
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        
        let applicableTier = null;
        for (const tier of discountRules.bulkDiscount.tiers) {
          if (totalQuantity >= tier.minQuantity && 
              (tier.maxQuantity === null || totalQuantity <= tier.maxQuantity)) {
            applicableTier = tier;
          }
        }
        
        if (!applicableTier) return { discount: 0 };
        
        const discount = applicableTier.type === 'percentage' 
          ? (total * applicableTier.discount) / 100 
          : applicableTier.discount;
        
        return {
          discount,
          description: `${applicableTier.discount}% bulk discount on ${totalQuantity} items`
        };
      }
    },

    // VIP tier rewards
    vipTier: {
      id: 'vipTier',
      name: 'VIP Tier Rewards',
      type: 'tier_reward',
      tiers: [
        { 
          name: 'Gold', 
          threshold: 5000, 
          discount: 5, 
          type: 'percentage',
          perks: ['Free express shipping', 'Early access to sales']
        },
        { 
          name: 'Platinum', 
          threshold: 10000, 
          discount: 8, 
          type: 'percentage',
          perks: ['Free express shipping', 'Exclusive products', 'Birthday surprise']
        },
        { 
          name: 'Diamond', 
          threshold: 25000, 
          discount: 12, 
          type: 'percentage',
          perks: ['VIP customer service', 'Free premium samples', 'Invitation-only events']
        }
      ],
      calculate: (items, total, userLifetimeSpend = 0) => {
        const currentOrderTotal = total;
        const projectedSpend = userLifetimeSpend + currentOrderTotal;
        
        let applicableTier = null;
        for (const tier of discountRules.vipTier.tiers) {
          if (projectedSpend >= tier.threshold) {
            applicableTier = tier;
          }
        }
        
        if (!applicableTier) return { discount: 0 };
        
        const discount = applicableTier.type === 'percentage' 
          ? (total * applicableTier.discount) / 100 
          : applicableTier.discount;
        
        return {
          discount,
          tier: applicableTier.name,
          description: `${applicableTier.name} VIP ${applicableTier.discount}% discount`,
          perks: applicableTier.perks
        };
      }
    }
  };

  // Calculate all applicable discounts
  const [lastNotificationAmount, setLastNotificationAmount] = useState(0);
  
  useEffect(() => {
    if (!memoizedCartItems.length) {
      setApplicableOffers([]);
      setTotalSavings(0);
      setFreeItems([]);
      return;
    }

    const offers = [];
    let maxDiscount = 0;
    let bestOffer = null;
    let allFreeItems = [];

    // Calculate each discount type
    Object.values(discountRules).forEach(rule => {
      let result = { discount: 0 };
      
      switch (rule.type) {
        case 'buy_x_get_y':
          result = rule.calculate(memoizedCartItems);
          break;
        case 'free_samples':
          result = rule.calculate(memoizedCartItems, cartTotal);
          if (result.freeItems) allFreeItems.push(...result.freeItems);
          break;
        case 'bulk_discount':
          result = discountRules.bulkDiscount.tiers.reduce((best, tier) => {
            const totalQuantity = memoizedCartItems.reduce((sum, item) => sum + item.quantity, 0);
            if (totalQuantity >= tier.minQuantity && 
                (tier.maxQuantity === null || totalQuantity <= tier.maxQuantity)) {
              const discount = tier.type === 'percentage' 
                ? (cartTotal * tier.discount) / 100 
                : tier.discount;
              return discount > best.discount 
                ? { discount, description: `${tier.discount}% bulk discount` }
                : best;
            }
            return best;
          }, { discount: 0 });
          break;
        case 'tier_reward':
          // This would typically use user's lifetime spend from backend
          result = discountRules.vipTier.calculate(memoizedCartItems, cartTotal, 0);
          break;
      }

      if (result.discount > 0 || result.freeItems) {
        offers.push({
          ...rule,
          ...result,
          savings: result.discount || 0
        });

        // Track the best monetary discount (excluding free items)
        if (result.discount > maxDiscount) {
          maxDiscount = result.discount;
          bestOffer = { ...rule, ...result };
        }
      }
    });

    setApplicableOffers(offers);
    setTotalSavings(maxDiscount);
    setFreeItems(allFreeItems);

    // Show toast notification for significant savings (only when amount changes)
    if (maxDiscount > 100 && maxDiscount !== lastNotificationAmount) {
      toast.success(`🎉 You're saving ₹${maxDiscount.toFixed(0)} with current offers!`, {
        duration: 3000,
        id: `discount-${maxDiscount}` // Prevent duplicate toasts
      });
      setLastNotificationAmount(maxDiscount);
    }

  }, [memoizedCartItems, cartTotal, lastNotificationAmount]);

  // Helper functions
  const getOfferSummary = () => {
    return {
      totalDiscount: totalSavings,
      freeItemsCount: freeItems.length,
      applicableOffersCount: applicableOffers.length,
      bestOffer: applicableOffers.find(offer => offer.savings === totalSavings)
    };
  };

  const checkOfferEligibility = (cartItems, cartTotal) => {
    const suggestions = [];
    
    // Check Buy 2 Get 1 eligibility
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems === 2) {
      suggestions.push({
        type: 'buy2get1',
        message: 'Add 1 more item to get 1 FREE!',
        action: 'Add to cart',
        savings: 'Save up to ₹2,500'
      });
    }

    // Check free samples eligibility
    if (cartTotal > 2000 && cartTotal < 2500) {
      const remaining = 2500 - cartTotal;
      suggestions.push({
        type: 'freeSamples',
        message: `Add ₹${remaining.toFixed(0)} more for FREE premium samples!`,
        action: 'Continue shopping',
        savings: 'Worth ₹150'
      });
    }

    // Check bulk discount eligibility
    if (totalItems === 4) {
      suggestions.push({
        type: 'bulkDiscount',
        message: 'Add 1 more item for 10% bulk discount!',
        action: 'Add to cart',
        savings: '10% OFF entire order'
      });
    }

    return suggestions;
  };

  return {
    applicableOffers,
    totalSavings,
    freeItems,
    getOfferSummary,
    checkOfferEligibility: () => checkOfferEligibility(memoizedCartItems, cartTotal),
    discountRules
  };
};

export default useAdvancedDiscounts;