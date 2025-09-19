
const Order = require('../models/Order');
const fs = require('fs').promises;
const path = require('path');
const perfumesFilePath = path.join(__dirname, '..', 'combined_perfumes.json');

async function readPerfumes() {
  const data = await fs.readFile(perfumesFilePath, 'utf8');
  return JSON.parse(data);
}

// Enhanced recommendation controller with real perfume data
exports.getPersonalityRecommendations = async (req, res) => {
  try {
    const { 
      topFamilies, 
      intensity, 
      archetype, 
      answers,
      userId 
    } = req.body;

    // Get user's purchase history for personalization
    const userHistory = userId ? await Order.find({ 
      user: userId, 
      status: 'delivered' 
    }).populate('items.perfume') : null;


    // Fetch real perfumes from JSON file with scent family mapping
    const perfumes = await readPerfumes();
    const recommendations = await generateSmartRecommendations({
      topFamilies,
      intensity,
      archetype,
      answers,
      userHistory,
      perfumes
    });

    // Calculate enhanced confidence score
    const confidenceScore = calculateEnhancedConfidence({
      answers,
      topFamilies,
      availableProducts: recommendations.length,
      userHistory
    });

    res.json({
      recommendations,
      confidence: confidenceScore,
      metadata: {
        totalProducts: recommendations.length,
        userExperience: userHistory ? 'returning' : 'new',
        algorithm: 'personality-based-v2'
      }
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ message: 'Failed to generate recommendations' });
  }
};

const generateSmartRecommendations = async ({
  topFamilies,
  intensity,
  archetype,
  answers,
  userHistory,
  perfumes
}) => {
  const recommendations = [];
  const intensityMap = { 1: 'light', 2: 'light', 3: 'moderate', 4: 'strong', 5: 'strong' };
  const preferredIntensity = intensityMap[intensity];
  for (let i = 0; i < topFamilies.length && i < 3; i++) {
    const family = topFamilies[i];
    let filtered = perfumes.filter(p => p.stock > 0 && p.scentFamily === family.family);
    if (preferredIntensity) {
      filtered = filtered.filter(p => p.intensity === preferredIntensity);
    }
    if (answers.gender_preference) {
      filtered = filtered.filter(p => p.gender === 'unisex' || p.gender === answers.gender_preference.id);
    }
    if (answers.occasion_preference) {
      filtered = filtered.filter(p => Array.isArray(p.occasions) && p.occasions.includes(answers.occasion_preference));
    }
    if (userHistory && userHistory.length > 0) {
      const purchasedIds = userHistory.flatMap(order => order.items.map(item => item.perfume._id));
      filtered = filtered.filter(p => !purchasedIds.includes(p._id));
    }
    let matchingPerfumes = filtered.sort((a, b) => {
      if (b.isPopular !== a.isPopular) return b.isPopular - a.isPopular;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return new Date(b.createdAt) - new Date(a.createdAt);
    }).slice(0, 3);
    if (matchingPerfumes.length === 0) {
      let broader = perfumes.filter(p => p.stock > 0 && p.scentFamily === family.family);
      if (userHistory && userHistory.length > 0) {
        const purchasedIds = userHistory.flatMap(order => order.items.map(item => item.perfume._id));
        broader = broader.filter(p => !purchasedIds.includes(p._id));
      }
      matchingPerfumes = broader.sort((a, b) => (b.rating - a.rating) || (new Date(b.createdAt) - new Date(a.createdAt))).slice(0, 2);
    }
    matchingPerfumes.forEach((perfume, index) => {
      const score = calculatePerfumeScore(perfume, family, answers);
      recommendations.push({
        id: `rec_${family.family}_${perfume._id}`,
        perfume,
        family: family.family,
        score: score,
        matchPercentage: Math.round(score),
        priority: i + 1,
        reasons: generateMatchReasons(perfume, family, archetype),
        occasions: perfume.occasions || getOccasionsForFamily(family.family),
        confidence: family.score,
        isDirectMatch: true
      });
    });
  }
  if (recommendations.length < 4) {
    let popular = perfumes.filter(p => p.stock > 0 && p.isPopular);
    if (userHistory && userHistory.length > 0) {
      const purchasedIds = userHistory.flatMap(order => order.items.map(item => item.perfume._id));
      popular = popular.filter(p => !purchasedIds.includes(p._id));
    }
    popular.slice(0, 4 - recommendations.length).forEach(perfume => {
      recommendations.push({
        id: `rec_popular_${perfume._id}`,
        perfume,
        family: perfume.scentFamily,
        score: 75,
        matchPercentage: 75,
        priority: 4,
        reasons: ['Popular choice', 'Highly rated'],
        occasions: perfume.occasions || ['versatile'],
        confidence: 75,
        isDirectMatch: false
      });
    });
  }
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 6);
};

const calculatePerfumeScore = (perfume, family, answers) => {
  let score = 70; // Base score

  // Direct scent family match bonus
  if (perfume.scentFamily === family.family) {
    score += 20;
  }

  // Note matching bonus (check all note layers)
  const allNotes = [];
  if (perfume.notes?.top) allNotes.push(...perfume.notes.top);
  if (perfume.notes?.middle) allNotes.push(...perfume.notes.middle);
  if (perfume.notes?.base) allNotes.push(...perfume.notes.base);
  
  const familyNotes = {
    citrus: ['citrus', 'lemon', 'bergamot', 'grapefruit', 'orange', 'lime', 'mandarin'],
    floral: ['rose', 'jasmine', 'lily', 'peony', 'magnolia', 'freesia', 'tuberose', 'ylang-ylang'],
    woody: ['sandalwood', 'cedar', 'vetiver', 'oakmoss', 'amber', 'cedarwood'],
    oriental: ['oud', 'saffron', 'patchouli', 'vanilla', 'exotic', 'agarwood', 'amber'],
    fresh: ['marine', 'cucumber', 'mint', 'water', 'clean', 'crisp', 'sea salt'],
    gourmand: ['vanilla', 'chocolate', 'caramel', 'honey', 'sweet', 'coffee', 'tonka bean']
  };

  const relevantNotes = familyNotes[family.family] || [];
  const matchingNotes = allNotes.filter(note => 
    relevantNotes.some(relevant => 
      note.toLowerCase().includes(relevant.toLowerCase())
    )
  );
  score += matchingNotes.length * 3;

  // Intensity match bonus
  if (answers.scent_intensity) {
    const intensityMap = { 1: 'light', 2: 'light', 3: 'moderate', 4: 'strong', 5: 'strong' };
    const preferredIntensity = intensityMap[answers.scent_intensity.value];
    if (perfume.intensity === preferredIntensity) {
      score += 10;
    }
  }

  // Gender preference match
  if (answers.gender_preference) {
    if (perfume.gender === 'unisex' || perfume.gender === answers.gender_preference.id) {
      score += 5;
    }
  }

  // Price range preference (if specified)
  if (answers.budget) {
    const budgetRanges = {
      'under_2000': [0, 2000],
      '2000_4000': [2000, 4000],
      '4000_6000': [4000, 6000],
      'above_6000': [6000, Infinity]
    };
    
    const [min, max] = budgetRanges[answers.budget.id] || [0, Infinity];
    if (perfume.price >= min && perfume.price <= max) {
      score += 8;
    }
  }

  // Stock availability bonus
  if (perfume.stock > 10) {
    score += 3;
  }

  // Rating bonus
  if (perfume.rating > 4.0) {
    score += 5;
  }

  // Popular item bonus
  if (perfume.isPopular) {
    score += 3;
  }

  // New item bonus (slight penalty for being untested)
  if (perfume.isNew) {
    score -= 2;
  }

  return Math.min(score, 100);
};

const calculateEnhancedConfidence = ({
  answers,
  topFamilies,
  availableProducts,
  userHistory
}) => {
  let confidence = 0;
  
  // Base confidence from quiz completion (40%)
  const totalQuestions = 6; // Adjust based on your quiz
  const questionsAnswered = Object.keys(answers).length;
  confidence += (questionsAnswered / totalQuestions) * 40;
  
  // Preference clarity (25%)
  if (topFamilies.length > 0) {
    const topScore = topFamilies[0].score;
    const secondScore = topFamilies[1]?.score || 0;
    
    if (topScore > secondScore * 1.5) {
      confidence += 25; // Clear preference
    } else {
      confidence += 12;
    }
  }
  
  // Product availability (15%)
  confidence += Math.min(availableProducts / 3, 1) * 15;
  
  // User experience bonus (10%)
  if (userHistory && userHistory.length > 0) {
    confidence += 10; // Returning user with history
  }
  
  // Data completeness (10%)
  if (answers.favorite_scents && answers.personality_traits) {
    confidence += 10;
  }
  
  return Math.min(Math.round(confidence), 100);
};

const generateMatchReasons = (perfume, family, archetype) => {
  const reasons = [];
  
  reasons.push(`Matches your ${family.family} preference`);
  
  if (archetype) {
    reasons.push(`Perfect for ${archetype.type.toLowerCase()}`);
  }
  
  if (perfume.notes && perfume.notes.length > 0) {
    reasons.push(`Features ${perfume.notes.slice(0, 2).join(' and ')} notes`);
  }
  
  if (perfume.stock > 5) {
    reasons.push('Currently in stock');
  }
  
  return reasons;
};

const getOccasionsForFamily = (family) => {
  const occasions = {
    citrus: ['Daily wear', 'Office', 'Casual outings'],
    floral: ['Date nights', 'Spring events', 'Romantic occasions'],
    woody: ['Evening events', 'Professional meetings', 'Fall/Winter'],
    oriental: ['Special occasions', 'Night out', 'Formal events'],
    fresh: ['Summer days', 'Sports', 'Casual wear'],
    gourmand: ['Cozy evenings', 'Winter dates', 'Comfort moments']
  };
  
  return occasions[family] || ['Versatile occasions'];
};

// Get recommendations based on user's purchase history
exports.getHistoryBasedRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userOrders = await Order.find({ 
      user: userId, 
      status: 'delivered' 
    }).populate('items.perfume');
    
    if (userOrders.length === 0) {
      return res.json({ recommendations: [], message: 'No purchase history found' });
    }
    
    // Analyze purchase patterns
    const purchasedPerfumes = userOrders.flatMap(order => 
      order.items.map(item => item.perfume)
    );
    
    // Find similar perfumes
    const recommendations = await findSimilarPerfumes(purchasedPerfumes);
    
    res.json({
      recommendations,
      basedOn: purchasedPerfumes.length,
      confidence: 85 // High confidence for history-based
    });
    
  } catch (error) {
    console.error('History recommendation error:', error);
    res.status(500).json({ message: 'Failed to get history-based recommendations' });
  }
};

const findSimilarPerfumes = async (purchasedPerfumes) => {
  const perfumes = await readPerfumes();
  const allNotes = purchasedPerfumes.flatMap(p => Array.isArray(p.notes) ? p.notes : []);
  const commonNotes = [...new Set(allNotes)];
  const categories = [...new Set(purchasedPerfumes.map(p => p.category))];
  const purchasedIds = purchasedPerfumes.map(p => p._id);
  const similar = perfumes.filter(p =>
    !purchasedIds.includes(p._id) &&
    p.stock > 0 &&
    (
      (Array.isArray(p.notes) && p.notes.some(note => commonNotes.includes(note))) ||
      (categories.includes(p.category))
    )
  ).slice(0, 4);
  return similar.map(perfume => ({
    perfume,
    reason: 'Based on your purchase history',
    confidence: 85
  }));
};

module.exports = {
  getPersonalityRecommendations: exports.getPersonalityRecommendations,
  getHistoryBasedRecommendations: exports.getHistoryBasedRecommendations
};