const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');

router.post('/', chat); // Public placeholder

module.exports = router;
