const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  console.log('=== AUTH MIDDLEWARE DEBUG ===');
  console.log('Request URL:', req.originalUrl);
  console.log('Request Method:', req.method);
  
  const authHeader = req.headers.authorization;
  console.log('Auth header exists:', !!authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No valid auth header found');
    return res.status(401).json({ success: false, message: 'Unauthorized - No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('Token extracted:', token ? 'Yes' : 'No');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', { id: decoded.id, role: decoded.role, email: decoded.email });
    
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      console.log('User not found in database for ID:', decoded.id);
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    console.log('User authenticated:', { id: req.user._id, role: req.user.role, email: req.user.email });
    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    return res.status(401).json({ success: false, message: 'Token invalid' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden' });
};

module.exports = { auth, requireAdmin };
