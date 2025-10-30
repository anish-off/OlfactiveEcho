const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  register, 
  login, 
  me, 
  forgotPassword, 
  resetPassword,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  updatePreferences
} = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');

// ensure uploads dir
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random()*1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

// Public routes
router.post('/register', upload.single('avatar'), register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', auth, me);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.post('/addresses', auth, addAddress);
router.put('/addresses/:addressId', auth, updateAddress);
router.delete('/addresses/:addressId', auth, deleteAddress);
router.put('/preferences', auth, updatePreferences);

module.exports = router;
