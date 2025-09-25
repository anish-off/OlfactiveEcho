const Order = require('../models/Order');
const Perfume = require('../models/Perfume');
const User = require('../models/User');
const mongoose = require('mongoose');
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
      // Check if samplePerfume is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(sample.samplePerfume)) {
        const samplePerfume = await Perfume.findById(sample.samplePerfume);
        if (!samplePerfume) {
          throw new Error('Sample perfume not found');
        }
        sampleData.samplePerfume = sample.samplePerfume;
        sampleData.price = isFreeEligible ? 0 : (sample.price || 5);
      } else {
        // Invalid ObjectId - skip sample for now but don't fail the order
        console.warn('Invalid sample ObjectId provided:', sample.samplePerfume);
        sampleData = {}; // Empty sample data
      }
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
    
    // Validate and clean sample data before creating order
    let cleanSampleData = {};
    if (sample && sample.samplePerfume) {
      if (mongoose.Types.ObjectId.isValid(sample.samplePerfume)) {
        // Only include sample if it has a valid ObjectId
        cleanSampleData = {
          samplePerfume: sample.samplePerfume,
          price: sample.price || 0
        };
      } else {
        console.warn('⚠️ Invalid sample ObjectId provided, skipping sample:', sample.samplePerfume);
        // Don't include invalid sample data
      }
    }
    
    // Create order
    const order = await Order.create({ 
      user: req.user._id, 
      items, 
      sample: cleanSampleData,
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    
    if (search) {
      // First, find users that match the search term
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = matchingUsers.map(user => user._id);
      
      searchQuery.$or = [
        { '_id': { $regex: search, $options: 'i' } },
        { 'user': { $in: userIds } }
      ];
      
      // If search looks like an ObjectId, search by exact ID
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        searchQuery.$or.push({ '_id': search });
      }
    }
    
    if (status) {
      searchQuery.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(searchQuery)
        .populate('user items.perfume sample.samplePerfume')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(searchQuery)
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
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
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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

// Admin approve order
exports.approveOrder = async (req, res) => {
  try {
    const { estimatedDeliveryDate, adminNotes } = req.body;
    const orderId = req.params.id;
    
    const order = await Order.findById(orderId).populate('items.perfume');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Order cannot be approved. Current status: ${order.status}` 
      });
    }
    
    // Calculate estimated delivery date (default 5 days from now)
    const deliveryDate = estimatedDeliveryDate ? 
      new Date(estimatedDeliveryDate) : 
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
    
    // Update stock for each item in the order
    for (const item of order.items) {
      const perfume = await Perfume.findById(item.perfume._id);
      if (perfume) {
        if (perfume.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${perfume.name}. Available: ${perfume.stock}, Required: ${item.quantity}`
          });
        }
        
        // Reduce stock
        perfume.stock -= item.quantity;
        await perfume.save();
      }
    }
    
    // Update order status and admin fields
    order.status = 'confirmed';
    order.estimatedDeliveryDate = deliveryDate;
    order.adminNotes = adminNotes || '';
    order.approvedBy = req.user._id;
    order.approvedAt = new Date();
    
    await order.save();
    await order.populate('user approvedBy');
    
    // Send approval email notification
    try {
      await sendOrderStatusUpdateEmail(order, order.user, 'pending', 'confirmed');
    } catch (emailError) {
      console.error('Failed to send order approval email:', emailError);
    }
    
    res.json({
      success: true,
      order,
      message: 'Order approved successfully'
    });
  } catch (err) {
    console.error('Approve order error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Admin decline order
exports.declineOrder = async (req, res) => {
  try {
    const { declineReason, adminNotes } = req.body;
    const orderId = req.params.id;
    
    if (!declineReason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Decline reason is required' 
      });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Order cannot be declined. Current status: ${order.status}` 
      });
    }
    
    // Update order status and admin fields
    order.status = 'declined';
    order.declineReason = declineReason;
    order.adminNotes = adminNotes || '';
    order.declinedBy = req.user._id;
    order.declinedAt = new Date();
    
    await order.save();
    await order.populate('user declinedBy');
    
    // Send decline email notification
    try {
      await sendOrderStatusUpdateEmail(order, order.user, 'pending', 'declined');
    } catch (emailError) {
      console.error('Failed to send order decline email:', emailError);
    }
    
    res.json({
      success: true,
      order,
      message: 'Order declined successfully'
    });
  } catch (err) {
    console.error('Decline order error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};
