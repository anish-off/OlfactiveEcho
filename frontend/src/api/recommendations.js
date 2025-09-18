import { apiClient } from './http';

// Get personality-based recommendations using real perfume data
export const getPersonalityRecommendations = async (quizResults) => {
  try {
    const response = await apiClient.post('/recommendations/personality', {
      topFamilies: quizResults.topFamilies,
      intensity: quizResults.intensity,
      archetype: quizResults.archetype,
      answers: quizResults.answers,
      userId: localStorage.getItem('userId') // Optional for personalization
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Personality recommendations API error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to get recommendations'
    };
  }
};

// Get recommendations based on user's purchase history
export const getHistoryBasedRecommendations = async (userId) => {
  try {
    const response = await apiClient.get(`/recommendations/history/${userId}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('History recommendations API error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to get history-based recommendations'
    };
  }
};

// Get currently trending fragrances
export const getTrendingRecommendations = async () => {
  try {
    const response = await apiClient.get('/recommendations/trending');
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Trending recommendations API error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to get trending recommendations'
    };
  }
};

// Get seasonal recommendations
export const getSeasonalRecommendations = async () => {
  try {
    const response = await apiClient.get('/recommendations/seasonal');
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Seasonal recommendations API error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to get seasonal recommendations'
    };
  }
};

// Enhanced recommendation with confidence explanation
export const getDetailedRecommendations = async (quizResults) => {
  try {
    // Get multiple recommendation types
    const [personalityResult, trendingResult, seasonalResult] = await Promise.all([
      getPersonalityRecommendations(quizResults),
      getTrendingRecommendations(),
      getSeasonalRecommendations()
    ]);

    // Combine results with confidence explanations
    const recommendations = {
      personality: personalityResult.success ? personalityResult.data : null,
      trending: trendingResult.success ? trendingResult.data : null,
      seasonal: seasonalResult.success ? seasonalResult.data : null
    };

    // Calculate overall system confidence
    const systemConfidence = calculateSystemConfidence(recommendations);

    return {
      success: true,
      data: {
        ...recommendations,
        systemConfidence,
        confidenceExplanation: generateConfidenceExplanation(recommendations)
      }
    };
  } catch (error) {
    console.error('Detailed recommendations error:', error);
    return {
      success: false,
      error: 'Failed to get comprehensive recommendations'
    };
  }
};

const calculateSystemConfidence = (recommendations) => {
  let totalConfidence = 0;
  let validSources = 0;

  if (recommendations.personality?.confidence) {
    totalConfidence += recommendations.personality.confidence;
    validSources++;
  }

  if (recommendations.trending?.recommendations?.length > 0) {
    totalConfidence += 85; // High confidence for trending
    validSources++;
  }

  if (recommendations.seasonal?.recommendations?.length > 0) {
    totalConfidence += 80; // Good confidence for seasonal
    validSources++;
  }

  return validSources > 0 ? Math.round(totalConfidence / validSources) : 0;
};

const generateConfidenceExplanation = (recommendations) => {
  const explanations = [];

  if (recommendations.personality) {
    const conf = recommendations.personality.confidence;
    if (conf >= 80) {
      explanations.push(`High personality match confidence (${conf}%) based on your detailed quiz responses`);
    } else if (conf >= 60) {
      explanations.push(`Good personality match confidence (${conf}%) - consider completing more quiz questions for better accuracy`);
    } else {
      explanations.push(`Moderate confidence (${conf}%) - recommendations based on partial quiz data`);
    }
  }

  if (recommendations.trending?.recommendations?.length > 0) {
    explanations.push(`Trending recommendations based on recent popular purchases`);
  }

  if (recommendations.seasonal) {
    explanations.push(`Seasonal recommendations optimized for ${recommendations.seasonal.season}`);
  }

  return explanations;
};

// Validate recommendation quality
export const validateRecommendationQuality = (recommendation) => {
  const quality = {
    score: 0,
    issues: [],
    strengths: []
  };

  // Check perfume data completeness
  if (recommendation.perfume) {
    if (recommendation.perfume.name) quality.score += 20;
    if (recommendation.perfume.brand) quality.score += 15;
    if (recommendation.perfume.notes && recommendation.perfume.notes.length > 0) {
      quality.score += 25;
      quality.strengths.push('Detailed fragrance notes available');
    }
    if (recommendation.perfume.price) quality.score += 15;
    if (recommendation.perfume.stock > 0) {
      quality.score += 15;
      quality.strengths.push('Currently in stock');
    } else {
      quality.issues.push('Product currently out of stock');
    }
    if (recommendation.perfume.imageUrl) quality.score += 10;
  }

  // Check recommendation metadata
  if (recommendation.matchPercentage >= 80) {
    quality.strengths.push('High compatibility match');
  } else if (recommendation.matchPercentage < 60) {
    quality.issues.push('Lower compatibility score');
  }

  if (recommendation.reasons && recommendation.reasons.length > 0) {
    quality.strengths.push('Clear matching reasons provided');
  }

  return quality;
};

export default {
  getPersonalityRecommendations,
  getHistoryBasedRecommendations,
  getTrendingRecommendations,
  getSeasonalRecommendations,
  getDetailedRecommendations,
  validateRecommendationQuality
};