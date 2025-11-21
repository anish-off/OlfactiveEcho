const Order = require('../models/Order');
const Perfume = require('../models/Perfume');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail, sendReturnRequestEmail, sendDeliveryFailedEmail } = require('../services/emailService');
const notificationService = require('../services/notificationService');

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
    const perfumeIds = items.map(i => {
      let id = i.perfume || i.id;
      // Extract the original ObjectId from sample ID (remove _sample_2ml suffix)
      if (typeof id === 'string' && id.includes('_sample_')) {
        id = id.split('_sample_')[0];
      }
      return id;
    }).filter(id => mongoose.Types.ObjectId.isValid(id)); // Only keep valid ObjectIds
    
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
      let perfumeId = item.perfume || item.id;
      
      // Extract the original ObjectId from sample ID (remove _sample_2ml suffix)
      if (typeof perfumeId === 'string' && perfumeId.includes('_sample_')) {
        perfumeId = perfumeId.split('_sample_')[0];
      }
      
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
      let sampleId = sampleItem.perfume || sampleItem.id || sampleItem.originalProductId;
      
      // Extract the original ObjectId from sample ID (remove _sample_2ml suffix)
      if (typeof sampleId === 'string' && sampleId.includes('_sample_')) {
        sampleId = sampleId.split('_sample_')[0];
      }
      
      // Validate that it's a proper ObjectId
      if (!mongoose.Types.ObjectId.isValid(sampleId)) {
        console.warn('Invalid sample ObjectId, skipping:', sampleId);
        continue;
      }
      
      // For samples, we might need to get the original product or use sample-specific pricing
      let samplePrice = sampleItem.price || 0;
      
      // Apply free sample logic
      if (isFreeEligible) {
        samplePrice = 0; // Free samples for orders ≥ ₹5000
      }
      
      sampleSubtotal += samplePrice * (sampleItem.quantity || 1);
      
      orderSamples.push({
        originalProductId: sampleId, // Use cleaned ObjectId
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
    
    // Process items to handle samples with invalid ObjectIds
    const processedItems = [];
    const processedSamples = [];
    
    for (const item of items) {
      if (item.isSample || item.product?.isSample) {
        // This is a sample item
        let sampleId = item.perfume || item.id || item.originalProductId;
        
        // Extract the original ObjectId from sample ID (remove _sample_2ml suffix)
        if (typeof sampleId === 'string' && sampleId.includes('_sample_')) {
          sampleId = sampleId.split('_sample_')[0];
        }
        
        // Validate that it's a proper ObjectId
        if (mongoose.Types.ObjectId.isValid(sampleId)) {
          processedSamples.push({
            originalProductId: sampleId,
            sampleSize: item.sampleSize || '2ml',
            quantity: item.quantity || 1,
            price: item.price || 0,
            isFree: item.isFree || false
          });
        } else {
          console.warn('Invalid sample ObjectId, skipping:', sampleId);
        }
      } else {
        // This is a regular item
        let perfumeId = item.perfume || item.id;
        
        // Clean perfume ID if it has sample suffix (shouldn't happen for regular items, but just in case)
        if (typeof perfumeId === 'string' && perfumeId.includes('_sample_')) {
          perfumeId = perfumeId.split('_sample_')[0];
        }
        
        if (mongoose.Types.ObjectId.isValid(perfumeId)) {
          processedItems.push({
            perfume: perfumeId,
            quantity: item.quantity,
            price: item.price
          });
        } else {
          console.warn('Invalid perfume ObjectId, skipping:', perfumeId);
        }
      }
    }
    
    console.log('📋 Processed items:', processedItems);
    console.log('📋 Processed samples:', processedSamples);
    
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
      items: processedItems, // Use processed items instead of raw items
      samples: processedSamples, // Use processed samples
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
    
    // Send order confirmation notifications (Email + SMS + WhatsApp)
    try {
      console.log('📧 Sending order confirmation notifications...');
      const user = await User.findById(req.user._id);
      console.log('👤 User found:', user.email);
      
      // Auto-enable SMS/WhatsApp if phone number is provided
      let phoneNumber = user.phone || shippingAddress.phone;
      if (phoneNumber && !user.phone) {
        // Update user phone if not already set
        user.phone = phoneNumber;
        await user.save();
        console.log('📱 User phone number added:', phoneNumber);
      }
      
      // Auto-enable SMS/WhatsApp notifications if phone is available and not already enabled
      if (phoneNumber && (!user.preferences.smsNotifications || !user.preferences.whatsappNotifications)) {
        user.preferences = user.preferences || {};
        user.preferences.smsNotifications = true;
        user.preferences.whatsappNotifications = true;
        await user.save();
        console.log('🔔 SMS and WhatsApp notifications auto-enabled for user');
      }
      
      // Use unified notification service
      const notificationResult = await notificationService.sendOrderConfirmation(order, user);
      console.log('✅ Order confirmation notifications sent:', {
        email: !!notificationResult.email,
        sms: !!notificationResult.sms,
        whatsapp: !!notificationResult.whatsapp
      });
    } catch (notificationError) {
      console.error('❌ Failed to send order confirmation notifications:', notificationError.message);
      // Don't fail the order creation if notifications fail
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
    const { status, trackingNumber, carrier, location, note } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'declined', 'returned', 'refunded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const oldStatus = order.status;
    
    // Set the user who updated the status
    order._statusUpdatedBy = req.user._id;
    order.status = status;
    
    // Update tracking info if provided
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    if (carrier) {
      order.carrier = carrier;
      // Generate tracking URL based on carrier
      order.trackingUrl = generateTrackingUrl(carrier, trackingNumber);
    }
    
    // Add location and note to status history
    if (order.statusHistory.length > 0) {
      const lastEntry = order.statusHistory[order.statusHistory.length - 1];
      if (location) lastEntry.location = location;
      if (note) lastEntry.note = note;
    }
    
    await order.save();
    await order.populate('items.perfume sample.samplePerfume user');
    
    // Send status update notifications (Email + SMS) if status changed
    if (oldStatus !== status) {
      try {
        await notificationService.sendOrderStatusUpdate(order, order.user, oldStatus, status);
        console.log('✅ Order status update notifications sent successfully');
      } catch (notificationError) {
        console.error('❌ Failed to send order status update notifications:', notificationError.message);
        // Don't fail the status update if notifications fail
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

// Generate tracking URL based on carrier
const generateTrackingUrl = (carrier, trackingNumber) => {
  const trackingUrls = {
    'BlueDart': `https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo=${trackingNumber}`,
    'FedEx': `https://www.fedex.com/fedextrack/?action=track&trackingnumber=${trackingNumber}`,
    'DHL': `https://www.dhl.com/in-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`,
    'India Post': `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/TrackConsignment.aspx?ConsignmentNo=${trackingNumber}`,
    'DTDC': `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCnno=${trackingNumber}`,
    'Ecom Express': `https://ecomexpress.in/tracking/?awb_field=${trackingNumber}`,
    'Delhivery': `https://www.delhivery.com/track/package/${trackingNumber}`
  };
  
  return trackingUrls[carrier] || null;
};

// Cancel order (user can cancel their own pending orders)
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    console.log('Cancel order request:', {
      orderId: req.params.id,
      userId: req.user._id,
      userRole: req.user.role,
      reason
    });

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      console.log('Order not found:', req.params.id);
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    // Users can only cancel their own orders
    const orderUserId = order.user.toString ? order.user.toString() : order.user;
    const requestUserId = req.user._id.toString ? req.user._id.toString() : req.user._id;
    
    if (orderUserId !== requestUserId && !req.user.isAdmin) {
      console.log('Access denied - user mismatch', { orderUserId, requestUserId, isAdmin: req.user.isAdmin });
      return res.status(403).json({ 
        success: false,
        message: 'Access denied - you can only cancel your own orders' 
      });
    }
    
    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
      return res.status(400).json({ 
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.status}. ${
          order.cancellationDeadline && new Date() > order.cancellationDeadline 
            ? 'Cancellation deadline has passed.' 
            : 'Only pending or confirmed orders can be cancelled.'
        }` 
      });
    }
    
    // Set cancellation details
    order._statusUpdatedBy = req.user._id;
    order.status = 'cancelled';
    order.cancellationReason = reason || 'No reason provided';
    order.cancelledBy = req.user._id;
    order.cancelledAt = new Date();
    order.canCancel = false;
    
    await order.save();
    await order.populate('items.perfume sample.samplePerfume');
    
    // Send cancellation notifications (Email + SMS)
    try {
      const user = await User.findById(req.user._id);
      await notificationService.sendOrderStatusUpdate(
        order, 
        user, 
        order.statusHistory[order.statusHistory.length - 2]?.status || 'confirmed', 
        'cancelled'
      );
      console.log('✅ Cancellation notifications sent successfully');
    } catch (notificationError) {
      console.error('❌ Failed to send cancellation notifications:', notificationError.message);
    }
    
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
    
    // Send approval notifications (Email + SMS)
    try {
      await notificationService.sendOrderStatusUpdate(order, order.user, 'pending', 'confirmed');
      console.log('✅ Order approval notifications sent successfully');
    } catch (notificationError) {
      console.error('❌ Failed to send order approval notifications:', notificationError.message);
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
    
    // Send decline notifications (Email + SMS)
    try {
      await notificationService.sendOrderStatusUpdate(order, order.user, 'pending', 'declined');
      console.log('✅ Order decline notifications sent successfully');
    } catch (notificationError) {
      console.error('❌ Failed to send order decline notifications:', notificationError.message);
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

// Request return for delivered order
exports.requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Users can only request returns for their own orders
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Only delivered orders can be returned
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }
    
    // Check if return period is still valid (7 days)
    const deliveryDate = order.actualDeliveryDate || order.updatedAt;
    const returnDeadline = new Date(deliveryDate);
    returnDeadline.setDate(returnDeadline.getDate() + 7);
    
    if (new Date() > returnDeadline) {
      return res.status(400).json({ message: 'Return period has expired (7 days from delivery)' });
    }
    
    // Update return request
    order.returnRequest = {
      requested: true,
      requestedAt: new Date(),
      reason: reason || 'No reason provided',
      status: 'pending'
    };
    
    await order.save();
    await order.populate('items.perfume user');
    
    // Send return request notifications (Email + SMS)
    try {
      await notificationService.sendReturnRequest(order, order.user);
      console.log('✅ Return request notifications sent successfully');
    } catch (notificationError) {
      console.error('❌ Failed to send return request notifications:', notificationError.message);
    }
    
    res.json({
      success: true,
      order,
      message: 'Return request submitted successfully'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get order tracking timeline
exports.getOrderTimeline = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('statusHistory.updatedBy', 'name email')
      .populate('user', 'name email');
      
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Users can only view their own order timeline
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Create comprehensive timeline including creation
    const timeline = [
      {
        status: 'pending',
        timestamp: order.createdAt,
        location: 'Order Management System',
        note: 'Order placed successfully',
        updatedBy: order.user
      },
      ...order.statusHistory
    ];
    
    res.json({
      success: true,
      timeline,
      currentStatus: order.getCurrentStatusInfo(),
      trackingInfo: {
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        trackingUrl: order.trackingUrl,
        estimatedDelivery: order.estimatedDeliveryDate,
        actualDelivery: order.actualDeliveryDate
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reorder - create new order based on existing order
exports.reorder = async (req, res) => {
  try {
    const originalOrder = await Order.findById(req.params.id).populate('items.perfume');
    
    if (!originalOrder) {
      return res.status(404).json({ message: 'Original order not found' });
    }
    
    // Users can only reorder their own orders
    if (originalOrder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check availability of items
    const availableItems = [];
    const unavailableItems = [];
    
    for (const item of originalOrder.items) {
      const perfume = await Perfume.findById(item.perfume._id);
      if (perfume && perfume.stock >= item.quantity) {
        availableItems.push({
          perfume: perfume._id,
          quantity: item.quantity,
          price: perfume.price // Use current price
        });
      } else {
        unavailableItems.push({
          name: item.perfume.name,
          requestedQuantity: item.quantity,
          availableStock: perfume ? perfume.stock : 0
        });
      }
    }
    
    if (unavailableItems.length > 0) {
      return res.json({
        success: false,
        message: 'Some items are not available for reorder',
        availableItems,
        unavailableItems,
        canProceed: availableItems.length > 0
      });
    }
    
    // Calculate new totals
    const subtotal = availableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = calculateShipping(subtotal, originalOrder.shippingAddress);
    const tax = calculateTax(subtotal, originalOrder.shippingAddress);
    const total = subtotal + shipping + tax;
    
    // Create new order
    const newOrder = await Order.create({
      user: req.user._id,
      items: availableItems,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress: originalOrder.shippingAddress,
      billingAddress: originalOrder.billingAddress,
      paymentMethod: originalOrder.paymentMethod,
      status: 'pending',
      tags: ['reorder'],
      internalNotes: `Reordered from #${originalOrder._id.toString().slice(-8)}`
    });
    
    await newOrder.populate('items.perfume');
    
    res.json({
      success: true,
      order: newOrder,
      message: 'Order recreated successfully',
      originalOrderId: originalOrder._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add delivery attempt (for logistics partners)
exports.addDeliveryAttempt = async (req, res) => {
  try {
    const { status, reason, nextAttemptDate } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.deliveryAttempts.push({
      date: new Date(),
      status: status || 'attempted',
      reason,
      nextAttemptDate: nextAttemptDate ? new Date(nextAttemptDate) : null
    });
    
    // Update order status based on attempt
    if (status === 'delivered') {
      order._statusUpdatedBy = req.user._id;
      order.status = 'delivered';
      order.actualDeliveryDate = new Date();
    } else if (status === 'failed') {
      order._statusUpdatedBy = req.user._id;
      order.status = 'out_for_delivery'; // Keep as out for delivery for retry
    }
    
    await order.save();
    await order.populate('user');
    
    // Send notification for failed delivery
    if (status === 'failed') {
      try {
        await sendDeliveryFailedEmail(order, order.user, reason, nextAttemptDate);
      } catch (emailError) {
        console.error('Failed to send delivery failed email:', emailError);
      }
    }
    
    res.json({
      success: true,
      order,
      message: 'Delivery attempt recorded successfully'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
