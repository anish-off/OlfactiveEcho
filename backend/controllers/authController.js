const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailService');

const signToken = (user) => {
  const payload = { 
    id: user._id, 
    role: user.role,
    email: user.email,
    name: user.name
  };
  console.log('=== JWT TOKEN CREATION ===');
  console.log('Token payload:', payload);
  
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  console.log('Token created successfully');
  
  return token;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const strengthRules = [/.{8,}/, /[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z0-9]/];
    const passed = strengthRules.filter(r => r.test(password)).length;
    if (passed < 4) return res.status(400).json({ message: 'Weak password' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;
    const user = await User.create({ name, email, password, avatar });
    const token = signToken(user);
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('=== LOGIN DEBUG ===');
    console.log('Login attempt for email:', email);
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found:', { id: user._id, email: user.email, role: user.role });
    
    const match = await user.comparePassword(password);
    if (!match) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = signToken(user);
    const responseData = { 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        avatar: user.avatar, 
        role: user.role 
      }, 
      token 
    };
    
    console.log('Login successful, sending response:', responseData);
    res.json(responseData);
  } catch (err) {
    console.log('Login error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  let user;

  try {
    user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent' });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user, resetUrl);
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw emailError;
    }

    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to send password reset email' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  try {
    const passwordCriteria = [/.{8,}/, /[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z0-9]/];
    const passed = passwordCriteria.filter((rule) => rule.test(password)).length;
    if (passed < 4) {
      return res.status(400).json({ message: 'Password does not meet complexity requirements' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const newToken = signToken(user);

    res.json({
      message: 'Password reset successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      },
      token: newToken
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};
