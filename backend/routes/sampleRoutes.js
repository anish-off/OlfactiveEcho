const express = require('express');
const router = express.Router();
const { createSample, getSamples } = require('../controllers/sampleController');
const { auth, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', getSamples);
router.post('/', auth, requireAdmin, createSample);

module.exports = router;
