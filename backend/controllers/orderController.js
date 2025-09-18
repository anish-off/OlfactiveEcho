const Order = require('../models/Order');
const Perfume = require('../models/Perfume');
const User = require('../models/User');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../services/emailService');

// Calculate shipping based on order value and location
const calculateShipping = (subtotal, shippingAddress) => {
  if (subtotal >= 1000) return 0; // Free shipping over ₹1000
  return subtotal > 0 ? 50 : 0; // ₹50 standard shipping
};

// Calculate tax based on shipping address
const calculateTax = (subtotal, shippingAddress) => {
  const taxRate = shippingAddress?.state === 'Delhi' ? 0.18 : 0.12; // GST rates
  return subtotal * taxRate;
};

// Validate checkout data
const validateCheckoutData = (items, shippingAddress, billingAddress) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Cart items are required');
  }
  
  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || 
      !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
    throw new Error('Complete shipping address is required');
  }
  
  if (!billingAddress || !billingAddress.fullName || !billingAddress.address || 
      !billingAddress.city || !billingAddress.state || !billingAddress.pincode) {
    throw new Error('Complete billing address is required');
  }
  
  // Validate pincode format (6 digits)
  if (!/^\d{6}$/.test(shippingAddress.pincode) || !/^\d{6}$/.test(billingAddress.pincode)) {
    throw new Error('Invalid pincode format');
  }
};

// Checkout endpoint - validates cart, calculates totals, prepares order
exports.checkout = async (req, res) => {
  try {
    console.log('Checkout request received:', {
      body: req.body,
      user: req.user ? req.user._id : 'No user'
    });
    
    const { items, shippingAddress, billingAddress, sample, paymentMethod } = req.body;
    
    // Validate input data
    validateCheckoutData(items, shippingAddress, billingAddress);
    
    // Fetch perfumes and validate availability
    const perfumeIds = items.map(i => i.perfume || i.id);
    const perfumeDocs = await Perfume.find({ _id: { $in: perfumeIds } });
    const perfumeMap = perfumeDocs.reduce((acc, p) => { acc[p._id] = p; return acc; }, {});
    
    // Separate regular items and samples
    const regularItems = items.filter(item => !item.isSample && !item.product?.isSample);
    const sampleItems = items.filter(item => item.isSample || item.product?.isSample);
    
    let regularSubtotal = 0;
    let sampleSubtotal = 0;
    const orderItems = [];
    const orderSamples = [];
    
    // Process regular perfume items
    for (const item of regularItems) {
      const perfumeId = item.perfume || item.id;
      const perfume = perfumeMap[perfumeId];
      
      if (!perfume) {
        throw new Error(`Perfume not found: ${perfumeId}`);
      }
      
      if (item.quantity <= 0) {
        throw new Error('Invalid quantity');
      }
      
      const itemTotal = perfume.price * item.quantity;
      regularSubtotal += itemTotal;
      
      orderItems.push({
        perfume: perfume._id,
        quantity: item.quantity,
        price: perfume.price
      });
    }
    
    // Free sample threshold (₹5000)
    const freeThreshold = 5000;
    const isFreeEligible = regularSubtotal >= freeThreshold;
    
    // Process sample items with free sample logic
    for (const sampleItem of sampleItems) {
      const sampleId = sampleItem.perfume || sampleItem.id || sampleItem.originalProductId;
      
      // For samples, we might need to get the original product or use sample-specific pricing
      let samplePrice = sampleItem.price || 0;
      
      // Apply free sample logic
      if (isFreeEligible) {
        samplePrice = 0; // Free samples for orders ≥ ₹5000
      }
      
      sampleSubtotal += samplePrice * sampleItem.quantity;
      
      orderSamples.push({
        originalProductId: sampleItem.originalProductId || sampleId,
        sampleSize: sampleItem.sampleSize || '2ml',
        quantity: sampleItem.quantity,
        price: samplePrice,
        isFree: isFreeEligible
      });
    }
    
    const subtotal = regularSubtotal + sampleSubtotal;
    
    // Handle legacy sample format (for backward compatibility)
    let sampleData = {};
    if (sample && sample.samplePerfume) {
      const samplePerfume = await Perfume.findById(sample.samplePerfume);
      if (!samplePerfume) {
        throw new Error('Sample perfume not found');
      }
      sampleData.samplePerfume = sample.samplePerfume;
      sampleData.price = isFreeEligible ? 0 : (sample.price || 5);
      // Don't add to subtotal as it will be included in order summary separately
    }
    
    // Calculate shipping and tax
    const shipping = calculateShipping(subtotal, shippingAddress);
    const tax = calculateTax(subtotal, shippingAddress);
    const total = subtotal + shipping + tax;
    
    // Prepare order summary
    const orderSummary = {
      items: orderItems,
      samples: orderSamples, // New samples array
      sample: sampleData, // Keep legacy format for compatibility
      regularSubtotal,
      sampleSubtotal,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress,
      billingAddress,
      paymentMethod: paymentMethod || 'cod',
      freeThreshold,
      isFreeEligible,
      appliedSampleDiscount: isFreeEligible ? sampleSubtotal : 0
    };
    
    res.json({
      success: true,
      orderSummary,
      message: 'Checkout validation successful'
    });
    
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Create order after payment confirmation
exports.createOrder = async (req, res) => {
  try {
    console.log('📦 Creating order for user:', req.user._id);
    console.log('📋 Order data received:', JSON.stringify(req.body, null, 2));
    
    const { 
      items, 
      sample, 
      shippingAddress, 
      billingAddress, 
      paymentMethod, 
      paymentId,
      subtotal,
      shipping,
      tax,
      total 
    } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items required' });
    }
    
    // For COD, no payment validation needed
    // For online payment, validate paymentId
    if (paymentMethod === 'online' && !paymentId) {
      return res.status(400).json({ message: 'Payment ID required for online payments' });
    }
    
    // Create order
    const order = await Order.create({ 
      user: req.user._id, 
      items, 
      sample: sample || {}, 
      total,
      subtotal,
      shipping,
      tax,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentId,
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed'
    });
    
    await order.populate('items.perfume sample.samplePerfume');
    
    // Send order confirmation email
    try {
      console.log('📧 Attempting to send order confirmation email...');
      const user = await User.findById(req.user._id);
      console.log('👤 User found for email:', user.email);
      
      const emailResult = await sendOrderConfirmationEmail(order, user);
      console.log('✅ Order confirmation email sent successfully:', emailResult.messageId);
    } catch (emailError) {
      console.error('❌ Failed to send order confirmation email:', emailError.message);
      console.error('📧 Email error details:', emailError);
      // Don't fail the order creation if email fails
    }
    
    res.status(201).json({
      success: true,
      order,
      message: 'Order created successfully'
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.perfume sample.samplePerfume')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user items.perfume sample.samplePerfume')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.perfume sample.samplePerfume user');
      
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Users can only view their own orders (unless admin)
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updateData = { status };
    if (trackingNumber && status === 'shipped') {
      updateData.trackingNumber = trackingNumber;
    }
    
    const oldOrder = await Order.findById(req.params.id);
    const oldStatus = oldOrder.status;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('items.perfume sample.samplePerfume user');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Send status update email if status changed
    if (oldStatus !== status) {
      try {
        await sendOrderStatusUpdateEmail(order, order.user, oldStatus, status);
        console.log('Order status update email sent successfully');
      } catch (emailError) {
        console.error('Failed to send order status update email:', emailError);
        // Don't fail the status update if email fails
      }
    }
    
    res.json({
      success: true,
      order,
      message: 'Order status updated successfully'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel order (user can cancel their own pending orders)
exports.cancelOrder = async (req, res) => {
  try {
    console.log('Cancel order request:', {
      orderId: req.params.id,
      userId: req.user._id,
      userRole: req.user.role
    });

    const order = await Order.findById(req.params.id);
    
    console.log('Order lookup result:', order ? 'Found' : 'Not found');
    if (order) {
      console.log('Order details:', {
        id: order._id,
        user: order.user,
        status: order.status,
        userIdType: typeof order.user,
        userIdConstructor: order.user.constructor.name
      });
    }
    
    if (!order) {
      console.log('Order not found:', req.params.id);
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    console.log('Order found:', {
      orderId: order._id,
      orderUserId: order.user,
      orderStatus: order.status,
      requestUserId: req.user._id
    });
    
    // Users can only cancel their own orders
    // Handle both string and ObjectId comparisons
    const orderUserId = order.user.toString ? order.user.toString() : order.user;
    const requestUserId = req.user._id.toString ? req.user._id.toString() : req.user._id;
    
    if (orderUserId !== requestUserId && !req.user.isAdmin) {
      console.log('Access denied - user mismatch', { orderUserId, requestUserId, isAdmin: req.user.isAdmin });
      return res.status(403).json({ 
        success: false,
        message: 'Access denied - you can only cancel your own orders' 
      });
    }
    
    // Only pending orders can be cancelled
    if (order.status !== 'pending') {
      console.log('Order cannot be cancelled - status:', order.status);
      return res.status(400).json({ 
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.status}. Only pending orders can be cancelled.` 
      });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    await order.populate('items.perfume sample.samplePerfume');
    
    console.log('Order cancelled successfully:', order._id);
    
    res.json({
      success: true,
      order,
      message: 'Order cancelled successfully'
    });
  } catch (err) {
    console.error('Cancel order error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};
