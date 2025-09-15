const express = require('express');
const router = express.Router();
const { 
  checkout, 
  createOrder, 
  getOrders, 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus,
  cancelOrder 
} = require('../controllers/orderController');
const { auth, requireAdmin } = require('../middleware/authMiddleware');

// Checkout validation endpoint
router.post('/checkout', auth, checkout);

// Create order after payment
router.post('/', auth, createOrder);

// Get user's orders
router.get('/', auth, getOrders);

// Cancel order (user can cancel their own pending orders) - MUST come before /:id route
router.patch('/:id/cancel', auth, cancelOrder);

// Get single order by ID
router.get('/:id', auth, getOrderById);

// Admin routes
router.get('/all/orders', auth, requireAdmin, getAllOrders);
router.patch('/:id/status', auth, requireAdmin, updateOrderStatus);

module.exports = router;
