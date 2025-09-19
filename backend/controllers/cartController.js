
const Perfume = require('../models/Perfume');
const Sample = require('../models/Sample');

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

    const perfumeIds = items.map(item => item.id || item.perfume);
    const perfumes = await Perfume.find({ _id: { $in: perfumeIds } });
    
    const perfumeMap = perfumes.reduce((acc, p) => {
      acc[p._id.toString()] = p;
      return acc;
    }, {});

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
    console.error('Cart validation error:', err);
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
    
    // Get actual perfumes from database for samples
    const perfumes = await Perfume.find({ isPopular: true })
      .limit(20)
      .lean();
    
    if (perfumes.length === 0) {
      // Fallback to loading from JSON if no perfumes in database
      const fs = require('fs');
      const path = require('path');
      const dataPath = path.join(__dirname, '..', 'data', 'combined_perfumes.json');
      const perfumeData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      
      // For JSON fallback, return with null IDs to indicate they can't be ordered
      const samples = perfumeData.slice(0, 20).map((perfume, index) => {
        const basePrice = 199;
        const premiumPrice = 299;
        
        const premiumAccords = ['oud', 'rose', 'saffron', 'amber', 'sandalwood', 'jasmine'];
        const isPremium = perfume.main_accords?.some(accord => 
          premiumAccords.some(premium => accord.name.toLowerCase().includes(premium))
        );
        
        return {
          _id: null, // No valid ObjectId for JSON data
          name: `${perfume.name} Sample`,
          perfumeData: perfume,
          description: `Try before you buy - ${perfume.name}`,
          price: isPremium ? premiumPrice : basePrice,
          available: false, // Not available for ordering since no real ID
          mainAccords: perfume.main_accords?.map(accord => accord.name) || [],
          brand: perfume.brand?.name || 'Unknown',
          imageUrl: `/perfume-images/${perfume.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.svg`
        };
      });
      
      const freeThreshold = 5000;
      const cartTotalAmount = parseFloat(cartTotal) || 0;

      return res.json({
        success: true,
        samples: samples.map(sample => ({
          ...sample,
          samplePrice: cartTotalAmount >= freeThreshold ? 0 : sample.price
        })),
        freeThreshold,
        isFreeEligible: cartTotalAmount >= freeThreshold,
        message: 'Sample data from JSON - ordering not available'
      });
    }
    
    // Convert database perfumes to sample format
    const samples = perfumes.map((perfume) => {
      // Generate sample pricing based on perfume characteristics
      const basePrice = 199; // Base sample price
      const premiumPrice = 299; // Premium sample price
      
      // Determine if this is a premium fragrance based on main accords
      const premiumAccords = ['oud', 'rose', 'saffron', 'amber', 'sandalwood', 'jasmine'];
      const isPremium = perfume.mainAccords?.some(accord => 
        premiumAccords.some(premium => accord.toLowerCase().includes(premium))
      );
      
      return {
        _id: perfume._id, // Use actual perfume ObjectId
        name: `${perfume.name} Sample`,
        perfumeData: perfume,
        description: `Try before you buy - ${perfume.name}`,
        price: isPremium ? premiumPrice : basePrice,
        available: true,
        mainAccords: perfume.mainAccords || [],
        brand: perfume.brand || 'Unknown',
        imageUrl: perfume.imageUrl || perfume.image_url || `/perfume-images/${perfume.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.svg`
      };
    });
    
    const freeThreshold = 5000; // Free samples if cart total >= ₹5000
    const cartTotalAmount = parseFloat(cartTotal) || 0;

    res.json({
      success: true,
      samples: samples.map(sample => ({
        ...sample,
        samplePrice: cartTotalAmount >= freeThreshold ? 0 : sample.price
      })),
      freeThreshold,
      isFreeEligible: cartTotalAmount >= freeThreshold,
      message: 'Available samples retrieved successfully'
    });
  } catch (err) {
    console.error('Get samples error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
