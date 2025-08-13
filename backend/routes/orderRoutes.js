const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getAllOrders } = require('../controllers/orderController');
const { auth, requireAdmin } = require('../middleware/authMiddleware');

router.post('/', auth, createOrder);
router.get('/', auth, getOrders);
router.get('/all', auth, requireAdmin, getAllOrders);

module.exports = router;
