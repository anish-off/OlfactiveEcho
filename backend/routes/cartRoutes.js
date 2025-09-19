const express = require('express');
const router = express.Router();
const { validateCart, getAvailableSamples } = require('../controllers/cartController');
const { auth } = require('../middleware/authMiddleware');

// Get available samples (public route - no auth required for browsing samples)
router.get('/samples', getAvailableSamples);

// Validate cart items
router.post('/validate', auth, validateCart);

module.exports = router;
