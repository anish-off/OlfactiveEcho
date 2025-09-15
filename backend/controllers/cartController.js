const Perfume = require('../models/Perfume');

// Validate cart items against database
exports.validateCart = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cart items are required' 
      });
    }
    
    // Get perfume IDs from cart items
    const perfumeIds = items.map(item => item.id || item.perfume);
    
    // Fetch perfumes from database
    const perfumes = await Perfume.find({ _id: { $in: perfumeIds } });
    const perfumeMap = perfumes.reduce((acc, p) => { 
      acc[p._id.toString()] = p; 
      return acc; 
    }, {});
    
    // Validate each cart item
    const validatedItems = [];
    const errors = [];
    let subtotal = 0;
    
    for (const item of items) {
      const perfumeId = (item.id || item.perfume).toString();
      const perfume = perfumeMap[perfumeId];
      
      if (!perfume) {
        errors.push(`Perfume not found: ${perfumeId}`);
        continue;
      }
      
      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for ${perfume.name}`);
        continue;
      }
      
      const itemTotal = perfume.price * item.quantity;
      subtotal += itemTotal;
      
      validatedItems.push({
        id: perfume._id,
        product: perfume,
        quantity: item.quantity,
        itemTotal
      });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart validation failed',
        errors
      });
    }
    
    res.json({
      success: true,
      items: validatedItems,
      subtotal,
      totalItems: validatedItems.reduce((sum, item) => sum + item.quantity, 0),
      message: 'Cart validated successfully'
    });
    
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Get available samples based on cart
exports.getAvailableSamples = async (req, res) => {
  try {
    const { cartTotal } = req.query;
    
    // Get all perfumes that can be samples
    const samples = await Perfume.find({ 
      category: { $in: ['sample', 'perfume'] } 
    }).select('name price imageUrl description');
    
    // Determine if samples are free based on cart total
    const freeThreshold = 2; // Free samples if 2+ items in cart
    const samplePrice = parseFloat(cartTotal) >= freeThreshold ? 0 : 5;
    
    res.json({
      success: true,
      samples: samples.map(sample => ({
        ...sample.toObject(),
        samplePrice
      })),
      freeThreshold,
      message: 'Available samples retrieved successfully'
    });
    
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};
