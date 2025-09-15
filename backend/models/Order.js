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
  sample: {
    samplePerfume: { type: mongoose.Schema.Types.ObjectId, ref: 'Perfume' },
    price: { type: Number, default: 0 }
  },
  
  // Pricing breakdown
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  
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
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  trackingNumber: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
