
const Order = require('../models/Order');
const fs = require('fs').promises;
const path = require('path');
const geminiService = require('../services/geminiService');
const perfumesFilePath = path.join(__dirname, '..', 'data', 'combined_perfumes.json');

async function readPerfumes() {
  const data = await fs.readFile(perfumesFilePath, 'utf8');
  return JSON.parse(data);
}

// Enhanced recommendation controller with real perfume data and AI integration
exports.getPersonalityRecommendations = async (req, res) => {
  try {
    const { 
      topFamilies, 
      intensity, 
      archetype, 
      answers,
      userId 
    } = req.body;

    // Validate required fields
    if (!topFamilies || !Array.isArray(topFamilies) || topFamilies.length === 0) {
      return res.status(400).json({ 
        message: 'topFamilies is required and must be a non-empty array' 
      });
    }

    // Get user's purchase history for personalization
    const userHistory = userId ? await Order.find({ 
      user: userId, 
      status: 'delivered' 
    }).populate('items.perfume') : null;

    // Fetch real perfumes from JSON file
    const perfumes = await readPerfumes();
    
    let recommendations = [];
    let confidence = 0;
    let metadata = {};
    
    // Try Gemini AI first for enhanced recommendations
    if (geminiService.isAvailable()) {
      try {
        const aiResult = await geminiService.generatePerfumeRecommendations({
          topFamilies,
          intensity,
          archetype,
          answers,
          userHistory
        }, perfumes);
        
        recommendations = aiResult.recommendations;
        confidence = aiResult.confidence;
        metadata = {
          ...aiResult.metadata,
          userExperience: userHistory ? 'returning' : 'new',
          algorithm: 'gemini-ai-enhanced',
          fallback: false
        };
        
      } catch (aiError) {
        // Fallback to traditional algorithm
        recommendations = await generateSmartRecommendations({
          topFamilies,
          intensity,
          archetype,
          answers,
          userHistory,
          perfumes
        });
        
        confidence = calculateEnhancedConfidence({
          answers,
          topFamilies,
          availableProducts: recommendations.length,
          userHistory
        });
        
        metadata = {
          totalProducts: recommendations.length,
          userExperience: userHistory ? 'returning' : 'new',
          algorithm: 'personality-based-v2',
          fallback: true,
          aiError: aiError.message
        };
      }
    } else {
      // Use traditional algorithm
      recommendations = await generateSmartRecommendations({
        topFamilies,
        intensity,
        archetype,
        answers,
        userHistory,
        perfumes
      });
      
      confidence = calculateEnhancedConfidence({
        answers,
        topFamilies,
        availableProducts: recommendations.length,
        userHistory
      });
      
      metadata = {
        totalProducts: recommendations.length,
        userExperience: userHistory ? 'returning' : 'new',
        algorithm: 'personality-based-v2',
        aiAvailable: false
      };
    }

    const response = {
      recommendations,
      confidence,
      metadata
    };

    res.json(response);

  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to generate recommendations',
      error: error.message 
    });
  }
};

// AI-powered occasion recommendations
exports.getOccasionRecommendations = async (req, res) => {
  try {
    const { occasion, timeOfDay, season, formality, duration } = req.body;

    if (!occasion) {
      return res.status(400).json({ 
        message: 'Occasion is required' 
      });
    }

    const perfumes = await readPerfumes();
    
    let recommendations = [];
    let confidence = 0;
    let metadata = {};
    
    if (geminiService.isAvailable()) {
      try {
        const aiResult = await geminiService.generateOccasionRecommendations({
          occasion,
          timeOfDay: timeOfDay || 'any',
          season: season || 'current',
          formality: formality || 'casual',
          duration: duration || 'medium'
        }, perfumes);
        
        recommendations = aiResult.recommendations;
        confidence = aiResult.confidence;
        metadata = {
          ...aiResult.metadata,
          algorithm: 'gemini-ai-occasion',
          fallback: false
        };
        
      } catch (aiError) {
        // Simple fallback for occasions
        recommendations = await generateOccasionFallback(occasion, perfumes);
        confidence = 70;
        metadata = {
          algorithm: 'occasion-fallback',
          fallback: true,
          aiError: aiError.message
        };
      }
    } else {
      recommendations = await generateOccasionFallback(occasion, perfumes);
      confidence = 70;
      metadata = {
        algorithm: 'occasion-fallback',
        aiAvailable: false
      };
    }

    res.json({
      recommendations,
      confidence,
      metadata,
      occasion
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to generate occasion recommendations',
      error: error.message 
    });
  }
};

// AI-powered seasonal recommendations
exports.getSeasonalRecommendations = async (req, res) => {
  try {
    const { season, weather, temperature, humidity, location } = req.body;

    const currentSeason = season || getCurrentSeason();
    const perfumes = await readPerfumes();
    
    let recommendations = [];
    let confidence = 0;
    let metadata = {};
    
    if (geminiService.isAvailable()) {
      try {
        const aiResult = await geminiService.generateSeasonalRecommendations({
          season: currentSeason,
          weather: weather || 'typical',
          temperature: temperature || 'moderate',
          humidity: humidity || 'normal',
          location
        }, perfumes);
        
        recommendations = aiResult.recommendations;
        confidence = aiResult.confidence;
        metadata = {
          ...aiResult.metadata,
          algorithm: 'gemini-ai-seasonal',
          fallback: false
        };
        
      } catch (aiError) {
        // Simple fallback for seasons
        recommendations = await generateSeasonalFallback(currentSeason, perfumes);
        confidence = 65;
        metadata = {
          algorithm: 'seasonal-fallback',
          fallback: true,
          aiError: aiError.message
        };
      }
    } else {
      recommendations = await generateSeasonalFallback(currentSeason, perfumes);
      confidence = 65;
      metadata = {
        algorithm: 'seasonal-fallback',
        aiAvailable: false
      };
    }

    res.json({
      recommendations,
      confidence,
      metadata,
      season: currentSeason
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to generate seasonal recommendations',
      error: error.message 
    });
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
  
  // Create a mapping from scent families to main accord names
  const familyToAccordMap = {
    'citrus': ['citrus', 'lemon', 'bergamot', 'grapefruit', 'orange'],
    'floral': ['floral', 'rose', 'jasmine', 'lily', 'violet'],
    'woody': ['woody', 'sandalwood', 'cedar', 'vetiver'],
    'oriental': ['oriental', 'amber', 'vanilla', 'spicy'],
    'fresh': ['fresh', 'marine', 'aquatic', 'mint'],
    'gourmand': ['vanilla', 'sweet', 'chocolate', 'caramel']
  };
  
  for (let i = 0; i < topFamilies.length && i < 3; i++) {
    const family = topFamilies[i];
    // Handle both string format and object format
    const familyName = typeof family === 'string' ? family : (family.family || family.name || family);
    const familyAccords = familyToAccordMap[familyName] || [familyName];
    
    // Filter perfumes based on main_accords instead of scentFamily
    let filtered = perfumes.filter(p => {
      // Check if perfume has stock (assuming all have stock for now)
      const hasStock = !p.stock || p.stock > 0;
      
      // Check if any main accord matches the family
      const hasMatchingAccord = p.main_accords && Array.isArray(p.main_accords) && 
        p.main_accords.some(accord => 
          familyAccords.some(famAccord => 
            accord.name && accord.name.toLowerCase().includes(famAccord.toLowerCase())
          )
        );
      
      return hasStock && hasMatchingAccord;
    });
    
    // Gender filtering if specified
    if (answers.gender_preference) {
      filtered = filtered.filter(p => {
        if (!p.name) return true; // Skip filtering if no name
        const name = p.name.toLowerCase();
        const genderPref = typeof answers.gender_preference === 'string' ? 
          answers.gender_preference : answers.gender_preference.id;
        
        if (genderPref === 'men' || genderPref === 'male') {
          return name.includes('men') || name.includes('male') || 
                 (!name.includes('women') && !name.includes('female'));
        } else if (genderPref === 'women' || genderPref === 'female') {
          return name.includes('women') || name.includes('female') || 
                 (!name.includes('men') && !name.includes('male'));
        }
        return true; // unisex or no preference
      });
    }
    
    // Sort by relevance and rating
    let matchingPerfumes = filtered.sort((a, b) => {
      // Calculate relevance score for sorting
      const scoreA = calculateAccordMatch(a, familyAccords);
      const scoreB = calculateAccordMatch(b, familyAccords);
      
      if (scoreA !== scoreB) return scoreB - scoreA;
      
      // Secondary sort by brand popularity (if brand exists)
      const brandA = a.brand && a.brand.name ? a.brand.name : '';
      const brandB = b.brand && b.brand.name ? b.brand.name : '';
      
      return brandB.localeCompare(brandA);
    }).slice(0, 3);
    
    // If no direct matches, get broader results
    if (matchingPerfumes.length === 0) {
      let broader = perfumes.filter(p => {
        const hasStock = !p.stock || p.stock > 0;
        // Broader match - just check if any accord name contains family name
        const hasBroaderMatch = p.main_accords && Array.isArray(p.main_accords) && 
          p.main_accords.some(accord => 
            accord.name && accord.name.toLowerCase().includes(familyName.toLowerCase())
          );
        return hasStock && hasBroaderMatch;
      });
      
      matchingPerfumes = broader.slice(0, 2);
    }
    
    matchingPerfumes.forEach((perfume, index) => {
      const score = calculatePerfumeScore(perfume, {family: familyName}, answers, familyAccords);
      recommendations.push({
        id: `rec_${familyName}_${perfume._id || index}`,
        perfume,
        family: family.family,
        score: score,
        matchPercentage: Math.round(score),
        priority: i + 1,
        reasons: generateMatchReasons(perfume, family, archetype),
        occasions: getOccasionsForFamily(family.family),
        confidence: family.score,
        isDirectMatch: true
      });
    });
  }
  
  // Fill with popular perfumes if needed
  if (recommendations.length < 4) {
    const popular = perfumes
      .filter(p => p.brand && p.brand.name) // Has brand info
      .slice(0, 4 - recommendations.length);
    
    popular.forEach((perfume, index) => {
      recommendations.push({
        id: `rec_popular_${perfume._id || index}`,
        perfume,
        family: getPrimaryFamily(perfume),
        score: 75,
        matchPercentage: 75,
        priority: 4,
        reasons: ['Popular choice', 'Well-regarded brand'],
        occasions: ['versatile'],
        confidence: 75,
        isDirectMatch: false
      });
    });
  }
  
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 6);
};

// Helper function to calculate accord match score
const calculateAccordMatch = (perfume, familyAccords) => {
  if (!perfume.main_accords || !Array.isArray(perfume.main_accords)) return 0;
  
  let score = 0;
  perfume.main_accords.forEach(accord => {
    if (accord.name && accord.intensity) {
      familyAccords.forEach(famAccord => {
        if (accord.name.toLowerCase().includes(famAccord.toLowerCase())) {
          score += accord.intensity || 50; // Use intensity as score
        }
      });
    }
  });
  
  return score;
};

// Helper function to get primary family from perfume
const getPrimaryFamily = (perfume) => {
  if (!perfume.main_accords || !Array.isArray(perfume.main_accords)) return 'unknown';
  
  if (perfume.main_accords.length === 0) return 'unknown';
  
  // Return the highest intensity accord as primary family
  const primaryAccord = perfume.main_accords.reduce((prev, current) => 
    (current.intensity > prev.intensity) ? current : prev
  );
  
  return primaryAccord.name || 'unknown';
};

const calculatePerfumeScore = (perfume, family, answers, familyAccords) => {
  let score = 70; // Base score

  // Direct accord match bonus
  if (perfume.main_accords && Array.isArray(perfume.main_accords)) {
    const matchingAccords = perfume.main_accords.filter(accord => 
      familyAccords.some(famAccord => 
        accord.name && accord.name.toLowerCase().includes(famAccord.toLowerCase())
      )
    );
    
    if (matchingAccords.length > 0) {
      score += 20;
      // Bonus for high intensity matching accords
      const avgIntensity = matchingAccords.reduce((sum, accord) => sum + (accord.intensity || 50), 0) / matchingAccords.length;
      score += Math.round(avgIntensity / 10); // Convert intensity to score bonus
    }
  }

  // Brand quality bonus
  if (perfume.brand && perfume.brand.name) {
    score += 5;
    
    // Bonus for well-known brands
    const premiumBrands = ['Tom Ford', 'Creed', 'Chanel', 'Dior', 'Guerlain', 'Hermès'];
    if (premiumBrands.some(brand => 
      perfume.brand.name.toLowerCase().includes(brand.toLowerCase())
    )) {
      score += 10;
    }
  }

  // Intensity match bonus
  if (answers.scent_intensity) {
    const intensityMap = { 1: 'light', 2: 'light', 3: 'moderate', 4: 'strong', 5: 'strong' };
    const preferredIntensity = intensityMap[answers.scent_intensity.value];
    
    // Estimate intensity from main accords
    if (perfume.main_accords && Array.isArray(perfume.main_accords)) {
      const avgIntensity = perfume.main_accords.reduce((sum, accord) => 
        sum + (accord.intensity || 50), 0) / perfume.main_accords.length;
      
      const perfumeIntensity = avgIntensity > 80 ? 'strong' : avgIntensity > 50 ? 'moderate' : 'light';
      
      if (perfumeIntensity === preferredIntensity) {
        score += 10;
      }
    }
  }

  // Gender preference match (based on name)
  if (answers.gender_preference && perfume.name) {
    const name = perfume.name.toLowerCase();
    const genderPref = answers.gender_preference.id;
    
    if (genderPref === 'men' || genderPref === 'male') {
      if (name.includes('men') || name.includes('male')) {
        score += 8;
      } else if (name.includes('women') || name.includes('female')) {
        score -= 5; // Penalty for opposite gender
      }
    } else if (genderPref === 'women' || genderPref === 'female') {
      if (name.includes('women') || name.includes('female')) {
        score += 8;
      } else if (name.includes('men') || name.includes('male')) {
        score -= 5; // Penalty for opposite gender
      }
    }
    
    // Bonus for unisex fragrances
    if (name.includes('unisex') || (name.includes('women') && name.includes('men'))) {
      score += 5;
    }
  }

  // Image availability bonus
  if (perfume.image_url) {
    score += 3;
  }

  // Price reasonableness (assume most perfumes under ₹10000 are reasonable)
  if (perfume.price && perfume.price <= 10000) {
    score += 5;
  }

  // Penalize if no essential data
  if (!perfume.name) score -= 10;
  if (!perfume.brand || !perfume.brand.name) score -= 5;
  if (!perfume.main_accords || perfume.main_accords.length === 0) score -= 15;

  return Math.min(Math.max(score, 0), 100); // Ensure score is between 0-100
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
  
  if (archetype && archetype.type) {
    reasons.push(`Perfect for ${archetype.type.toLowerCase()} personality`);
  }
  
  // Generate reasons based on main accords
  if (perfume.main_accords && Array.isArray(perfume.main_accords)) {
    const topAccords = perfume.main_accords
      .sort((a, b) => (b.intensity || 0) - (a.intensity || 0))
      .slice(0, 2)
      .map(accord => accord.name)
      .filter(name => name);
    
    if (topAccords.length > 0) {
      reasons.push(`Features ${topAccords.join(' and ')} notes`);
    }
  }
  
  // Add brand reputation reason
  if (perfume.brand && perfume.brand.name) {
    const premiumBrands = ['Tom Ford', 'Creed', 'Chanel', 'Dior', 'Guerlain'];
    if (premiumBrands.some(brand => 
      perfume.brand.name.toLowerCase().includes(brand.toLowerCase())
    )) {
      reasons.push(`From prestigious ${perfume.brand.name} collection`);
    } else {
      reasons.push(`Quality fragrance from ${perfume.brand.name}`);
    }
  }
  
  return reasons.slice(0, 3); // Limit to 3 reasons
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

// Helper function to get current season
const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

// Fallback occasion recommendations
const generateOccasionFallback = async (occasion, perfumes) => {
  const occasionMapping = {
    'work': ['woody', 'fresh', 'citrus'],
    'date': ['floral', 'oriental', 'sweet'],
    'party': ['oriental', 'spicy', 'sweet'],
    'formal': ['woody', 'elegant', 'sophisticated'],
    'casual': ['fresh', 'light', 'citrus'],
    'gym': ['fresh', 'light', 'clean'],
    'travel': ['fresh', 'versatile', 'moderate']
  };

  const relevantAccords = occasionMapping[occasion.toLowerCase()] || ['fresh', 'versatile'];
  
  const filtered = perfumes.filter(p => 
    p.main_accords && p.main_accords.some(accord => 
      relevantAccords.some(relevant => 
        accord.name.toLowerCase().includes(relevant.toLowerCase())
      )
    )
  ).slice(0, 5);

  return filtered.map(perfume => ({
    id: `occasion_${perfume.name.replace(/\s+/g, '_')}`,
    perfume,
    name: perfume.name,
    brand: perfume.brand?.name || 'Unknown',
    confidence: 75,
    reason: `Suitable for ${occasion}`,
    source: 'occasion-fallback'
  }));
};

// Fallback seasonal recommendations
const generateSeasonalFallback = async (season, perfumes) => {
  const seasonalMapping = {
    'spring': ['floral', 'fresh', 'green', 'light'],
    'summer': ['citrus', 'marine', 'fresh', 'light'],
    'autumn': ['woody', 'warm', 'spicy', 'amber'],
    'winter': ['oriental', 'rich', 'warm', 'vanilla']
  };

  const relevantAccords = seasonalMapping[season.toLowerCase()] || ['fresh', 'versatile'];
  
  const filtered = perfumes.filter(p => 
    p.main_accords && p.main_accords.some(accord => 
      relevantAccords.some(relevant => 
        accord.name.toLowerCase().includes(relevant.toLowerCase())
      )
    )
  ).slice(0, 5);

  return filtered.map(perfume => ({
    id: `seasonal_${perfume.name.replace(/\s+/g, '_')}`,
    perfume,
    name: perfume.name,
    brand: perfume.brand?.name || 'Unknown',
    confidence: 70,
    reason: `Perfect for ${season} season`,
    source: 'seasonal-fallback'
  }));
};

// Get AI service status
exports.getAIStatus = async (req, res) => {
  try {
    const status = geminiService.getStatus();
    res.json({
      success: true,
      aiService: 'Google Gemini',
      ...status,
      message: status.available 
        ? 'AI-powered recommendations are available' 
        : 'AI service unavailable, using traditional algorithm'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking AI service status',
      error: error.message
    });
  }
};

module.exports = {
  getPersonalityRecommendations: exports.getPersonalityRecommendations,
  getOccasionRecommendations: exports.getOccasionRecommendations,
  getSeasonalRecommendations: exports.getSeasonalRecommendations,
  getHistoryBasedRecommendations: exports.getHistoryBasedRecommendations,
  getAIStatus: exports.getAIStatus
};