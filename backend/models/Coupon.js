const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  type: { 
    type: String, 
    enum: ['percentage', 'fixed', 'buy_x_get_y', 'free_samples', 'bulk_discount', 'tier_reward'], 
    required: true 
  },
  value: { 
    type: Number, 
    required: true,
    min: 0 
  },
  // Advanced offer configurations
  offerConfig: {
    // For Buy X Get Y offers (e.g., Buy 2 Get 1 Free)
    buyQuantity: { type: Number },
    getQuantity: { type: Number },
    getFree: { type: Boolean, default: false },
    
    // For bulk discounts (quantity-based)
    bulkTiers: [{
      minQuantity: { type: Number },
      maxQuantity: { type: Number },
      discount: { type: Number }, // percentage or fixed amount
      _id: false
    }],
    
    // For free samples offer
    freeItemType: { type: String, enum: ['sample', 'product', 'gift'] },
    freeItemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Perfume' }],
    freeItemCount: { type: Number, default: 1 },
    
    // For tier rewards
    tierThreshold: { type: Number }, // minimum spend amount
    rewardType: { type: String, enum: ['discount', 'free_item', 'points'] },
    rewardValue: { type: Number }
  },
  minimumOrderAmount: { 
    type: Number, 
    default: 0 
  },
  maximumDiscountAmount: { 
    type: Number 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  usageLimit: { 
    type: Number,
    default: null // null means unlimited
  },
  usageCount: { 
    type: Number, 
    default: 0 
  },
  userUsageLimit: { 
    type: Number,
    default: 1 // How many times a single user can use this coupon
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  applicableProducts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Perfume' 
  }],
  applicableCategories: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category' 
  }],
  applicableBrands: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Brand' 
  }],
  excludeProducts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Perfume' 
  }],
  firstTimeUserOnly: { 
    type: Boolean, 
    default: false 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

// Virtual to check if coupon is currently valid
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         this.endDate >= now &&
         (this.usageLimit === null || this.usageCount < this.usageLimit);
});

// Index for better search performance
couponSchema.index({ isActive: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });
couponSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
