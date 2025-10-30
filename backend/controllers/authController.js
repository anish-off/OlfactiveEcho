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
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        addresses: user.addresses,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        addresses: user.addresses,
        preferences: user.preferences
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Password strength check
    const passwordCriteria = [/.{8,}/, /[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z0-9]/];
    const passed = passwordCriteria.filter((rule) => rule.test(newPassword)).length;
    if (passed < 4) {
      return res.status(400).json({ message: 'Password does not meet complexity requirements' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

// Add address
exports.addAddress = async (req, res) => {
  try {
    const { type, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;
    const userId = req.user.id;

    if (!addressLine1 || !city || !state || !postalCode) {
      return res.status(400).json({ message: 'Required address fields are missing' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // If this is the first address, make it default
    const makeDefault = user.addresses.length === 0 || isDefault;

    user.addresses.push({
      type: type || 'home',
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country: country || 'India',
      isDefault: makeDefault
    });

    await user.save();

    res.json({
      message: 'Address added successfully',
      addresses: user.addresses
    });
  } catch (err) {
    console.error('Add address error:', err);
    res.status(500).json({ message: 'Failed to add address' });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { type, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If setting as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Update address fields
    if (type) address.type = type;
    if (fullName !== undefined) address.fullName = fullName;
    if (phone !== undefined) address.phone = phone;
    if (addressLine1) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (country) address.country = country;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();

    res.json({
      message: 'Address updated successfully',
      addresses: user.addresses
    });
  } catch (err) {
    console.error('Update address error:', err);
    res.status(500).json({ message: 'Failed to update address' });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const wasDefault = address.isDefault;
    address.remove();

    // If we deleted the default address, make the first remaining address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (err) {
    console.error('Delete address error:', err);
    res.status(500).json({ message: 'Failed to delete address' });
  }
};

// Update preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { emailNotifications, smsNotifications, orderUpdates, promotions, newsletter } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (emailNotifications !== undefined) user.preferences.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) user.preferences.smsNotifications = smsNotifications;
    if (orderUpdates !== undefined) user.preferences.orderUpdates = orderUpdates;
    if (promotions !== undefined) user.preferences.promotions = promotions;
    if (newsletter !== undefined) user.preferences.newsletter = newsletter;

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (err) {
    console.error('Update preferences error:', err);
    res.status(500).json({ message: 'Failed to update preferences' });
  }
};
