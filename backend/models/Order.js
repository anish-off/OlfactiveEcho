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
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'declined', 'returned', 'refunded'], 
    default: 'pending' 
  },
  trackingNumber: { type: String },
  carrier: { type: String }, // Shipping carrier (BlueDart, FedEx, etc.)
  trackingUrl: { type: String }, // Direct tracking URL
  
  // Status history for timeline
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    location: { type: String }, // Where the status was updated
    note: { type: String }, // Additional notes for this status
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Delivery tracking
  estimatedDeliveryDate: { type: Date },
  actualDeliveryDate: { type: Date },
  deliveryAttempts: [{
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['attempted', 'failed', 'delivered'] },
    reason: { type: String }, // Reason for failed delivery
    nextAttemptDate: { type: Date }
  }],
  
  // Cancellation and returns
  cancellationReason: { type: String },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledAt: { type: Date },
  canCancel: { type: Boolean, default: true }, // Can this order be cancelled?
  cancellationDeadline: { type: Date }, // Last date order can be cancelled
  
  returnRequest: {
    requested: { type: Boolean, default: false },
    requestedAt: { type: Date },
    reason: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'] },
    returnTrackingNumber: { type: String },
    refundAmount: { type: Number },
    refundProcessedAt: { type: Date }
  },
  
  // Reviews and ratings
  reviewable: { type: Boolean, default: false }, // Can this order be reviewed?
  reviewed: { type: Boolean, default: false },
  
  // Admin approval fields
  declineReason: { type: String },
  adminNotes: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  declinedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  declinedAt: { type: Date },
  
  // Additional metadata
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  tags: [{ type: String }], // Custom tags for organization
  internalNotes: { type: String }, // Internal admin notes not visible to customer
}, { timestamps: true });

// Middleware to update status history when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this._statusUpdatedBy // Set this in controller
    });
  }
  
  // Set reviewable flag when delivered
  if (this.status === 'delivered' && !this.reviewed) {
    this.reviewable = true;
    this.actualDeliveryDate = new Date();
  }
  
  // Set cancellation deadline (24 hours after confirmation for most orders)
  if (this.status === 'confirmed' && !this.cancellationDeadline) {
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 24);
    this.cancellationDeadline = deadline;
  }
  
  // Disable cancellation for certain statuses
  if (['shipped', 'out_for_delivery', 'delivered', 'returned', 'refunded'].includes(this.status)) {
    this.canCancel = false;
  }
  
  next();
});

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  const now = new Date();
  return this.canCancel && 
         this.status === 'pending' || this.status === 'confirmed' &&
         (!this.cancellationDeadline || now <= this.cancellationDeadline);
};

// Method to get current status info
orderSchema.methods.getCurrentStatusInfo = function() {
  const statusInfo = {
    pending: { message: 'Order placed, awaiting confirmation', color: 'yellow', icon: 'clock' },
    confirmed: { message: 'Order confirmed, being prepared', color: 'blue', icon: 'check-circle' },
    processing: { message: 'Order is being processed', color: 'purple', icon: 'cog' },
    shipped: { message: 'Order shipped, on the way', color: 'indigo', icon: 'truck' },
    out_for_delivery: { message: 'Out for delivery', color: 'orange', icon: 'location-marker' },
    delivered: { message: 'Order delivered successfully', color: 'green', icon: 'check-badge' },
    cancelled: { message: 'Order cancelled', color: 'red', icon: 'x-circle' },
    declined: { message: 'Order declined', color: 'red', icon: 'x-circle' },
    returned: { message: 'Order returned', color: 'gray', icon: 'arrow-uturn-left' },
    refunded: { message: 'Order refunded', color: 'gray', icon: 'currency-dollar' }
  };
  
  return statusInfo[this.status] || { message: 'Unknown status', color: 'gray', icon: 'question-mark' };
};

module.exports = mongoose.model('Order', orderSchema);
