const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'order_created',
      'order_updated',
      'order_cancelled',
      'product_created',
      'product_updated',
      'product_deleted',
      'stock_updated',
      'customer_registered',
      'customer_updated',
      'coupon_created',
      'coupon_used',
      'payment_received',
      'refund_processed',
      'admin_login',
      'settings_changed'
    ]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  message: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Index for faster queries
activityLogSchema.index({ type: 1, createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
