const express = require('express');
const router = express.Router();
const { 
  getPersonalityRecommendations, 
  getOccasionRecommendations,
  getSeasonalRecommendations,
  getHistoryBasedRecommendations,
  getAIStatus
} = require('../controllers/recommendationController');
const { auth } = require('../middleware/authMiddleware');

// Get personality-based recommendations (AI-powered)
router.post('/personality', getPersonalityRecommendations);

// Get occasion-based recommendations (AI-powered)
router.post('/occasion', getOccasionRecommendations);

// Get seasonal recommendations (AI-powered)
router.post('/seasonal', getSeasonalRecommendations);

// Get AI service status
router.get('/ai-status', getAIStatus);

// Get recommendations based on user's purchase history (requires auth)
router.get('/history/:userId', auth, getHistoryBasedRecommendations);

// Get trending recommendations
router.get('/trending', async (req, res) => {
  try {
    const Perfume = require('../models/Perfume');
    const Order = require('../models/Order');
    
    // Get most ordered perfumes in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const trendingProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: 'delivered'
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.perfume',
          orderCount: { $sum: '$items.quantity' }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 6 }
    ]);
    
    // Populate perfume details
    const trending = await Perfume.populate(trendingProducts, {
      path: '_id',
      model: 'Perfume'
    });
    
    const recommendations = trending
      .filter(item => item._id) // Filter out null perfumes
      .map(item => ({
        perfume: item._id,
        reason: `${item.orderCount} orders this month`,
        confidence: 90,
        trending: true
      }));
    
    res.json({
      recommendations,
      message: 'Currently trending fragrances',
      algorithm: 'popularity-based'
    });
    
  } catch (error) {
    console.error('Trending recommendations error:', error);
    res.status(500).json({ message: 'Failed to get trending recommendations' });
  }
});

// Get seasonal recommendations
router.get('/seasonal', async (req, res) => {
  try {
    const Perfume = require('../models/Perfume');
    
    // Determine current season
    const month = new Date().getMonth() + 1;
    let season;
    if (month >= 3 && month <= 5) season = 'spring';
    else if (month >= 6 && month <= 8) season = 'summer';
    else if (month >= 9 && month <= 11) season = 'autumn';
    else season = 'winter';
    
    // Season-based note preferences
    const seasonalNotes = {
      spring: ['floral', 'fresh', 'green', 'light', 'citrus'],
      summer: ['citrus', 'marine', 'fresh', 'light', 'cooling'],
      autumn: ['woody', 'warm', 'spicy', 'amber', 'vanilla'],
      winter: ['oriental', 'rich', 'warm', 'heavy', 'comforting']
    };
    
    const currentNotes = seasonalNotes[season];
    
    const seasonalPerfumes = await Perfume.find({
      stock: { $gt: 0 },
      $or: [
        { notes: { $in: currentNotes.map(note => new RegExp(note, 'i')) } },
        { description: { $regex: currentNotes.join('|'), $options: 'i' } }
      ]
    }).limit(6);
    
    const recommendations = seasonalPerfumes.map(perfume => ({
      perfume: perfume.toObject(),
      reason: `Perfect for ${season} season`,
      confidence: 80,
      seasonal: true,
      season
    }));
    
    res.json({
      recommendations,
      season,
      message: `Recommended for ${season} season`,
      algorithm: 'seasonal-based'
    });
    
  } catch (error) {
    console.error('Seasonal recommendations error:', error);
    res.status(500).json({ message: 'Failed to get seasonal recommendations' });
  }
});

module.exports = router;