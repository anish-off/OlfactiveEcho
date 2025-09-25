const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      perfume: { type: mongoose.Schema.Types.ObjectId, ref: 'Perfume', required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true }
    }
  ],
  // Samples (new structure)
  samples: [
    {
      originalProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Perfume' },
      sampleSize: { type: String, default: '2ml' },
      quantity: { type: Number, default: 1 },
      price: { type: Number, default: 0 },
      isFree: { type: Boolean, default: false }
    }
  ],
  
  // Legacy sample support (for backward compatibility)
  sample: {
    samplePerfume: { type: mongoose.Schema.Types.ObjectId, ref: 'Perfume' },
    price: { type: Number, default: 0 }
  },
  
  // Pricing breakdown
  regularSubtotal: { type: Number, default: 0 }, // Regular products subtotal
  sampleSubtotal: { type: Number, default: 0 },  // Samples subtotal (before free discount)
  subtotal: { type: Number, required: true },     // Total before shipping/tax
  shipping: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  
  // Free sample information
  freeThreshold: { type: Number, default: 5000 },
  isFreeEligible: { type: Boolean, default: false },
  appliedSampleDiscount: { type: Number, default: 0 },
  
  // Addresses
  shippingAddress: {
    fullName: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String }
  },
  billingAddress: {
    fullName: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String }
  },
  
  // Payment information
  paymentMethod: { 
    type: String, 
    enum: ['cod', 'online'], 
    default: 'cod' 
  },
  paymentId: { type: String }, // For online payments
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  
  // Order tracking
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'declined'], 
    default: 'pending' 
  },
  trackingNumber: { type: String },
  
  // Admin approval fields
  estimatedDeliveryDate: { type: Date },
  declineReason: { type: String },
  adminNotes: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  declinedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  declinedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
