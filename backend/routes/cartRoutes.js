const express = require('express');
const router = express.Router();
const { validateCart, getAvailableSamples } = require('../controllers/cartController');
const { auth } = require('../middleware/authMiddleware');

// Validate cart items
router.post('/validate', auth, validateCart);

// Get available samples
router.get('/samples', auth, getAvailableSamples);

module.exports = router;
