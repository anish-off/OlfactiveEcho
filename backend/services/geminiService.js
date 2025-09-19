const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables. AI recommendations will be disabled.');
      this.genAI = null;
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Check if Gemini AI is available and properly initialized
   */
  isAvailable() {
    return this.genAI !== null && this.apiKey !== null;
  }

  /**
   * Generate AI-powered perfume recommendations based on user preferences
   */
  async generatePerfumeRecommendations(userPreferences, availablePerfumes) {
    if (!this.genAI) {
      throw new Error('Gemini AI not initialized. Please check GEMINI_API_KEY.');
    }

    try {
      // Ensure availablePerfumes is provided
      if (!availablePerfumes || !Array.isArray(availablePerfumes)) {
        throw new Error('Available perfumes data is required for AI recommendations');
      }

      // Use more perfumes for better AI analysis
      const limitedPerfumes = availablePerfumes.slice(0, 30);
      
      const prompt = this.buildRecommendationPrompt(userPreferences, limitedPerfumes);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the AI response
      return this.parseAIResponse(text, availablePerfumes);
      
    } catch (error) {
      console.error('Gemini AI Error:', error);
      throw new Error(`AI recommendation failed: ${error.message}`);
    }
  }

  /**
   * Generate occasion-based recommendations using AI
   */
  async generateOccasionRecommendations(occasionData, availablePerfumes) {
    if (!this.genAI) {
      throw new Error('Gemini AI not initialized. Please check GEMINI_API_KEY.');
    }

    try {
      const limitedPerfumes = availablePerfumes.slice(0, 25);
      const prompt = this.buildOccasionPrompt(occasionData, limitedPerfumes);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseAIResponse(text, availablePerfumes, 'occasion');
      
    } catch (error) {
      console.error('Gemini AI Occasion Error:', error);
      throw new Error(`AI occasion recommendation failed: ${error.message}`);
    }
  }

  /**
   * Generate seasonal recommendations using AI
   */
  async generateSeasonalRecommendations(seasonalData, availablePerfumes) {
    if (!this.genAI) {
      throw new Error('Gemini AI not initialized. Please check GEMINI_API_KEY.');
    }

    try {
      const limitedPerfumes = availablePerfumes.slice(0, 25);
      const prompt = this.buildSeasonalPrompt(seasonalData, limitedPerfumes);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseAIResponse(text, availablePerfumes, 'seasonal');
      
    } catch (error) {
      console.error('Gemini AI Seasonal Error:', error);
      throw new Error(`AI seasonal recommendation failed: ${error.message}`);
    }
  }

  /**
   * Build a comprehensive prompt for perfume recommendations
   */
  buildRecommendationPrompt(userPreferences, perfumes) {
    const { answers, topFamilies, intensity, archetype } = userPreferences;
    
    const perfumeContext = perfumes.map(p => ({
      name: p.name,
      brand: p.brand?.name || 'Unknown',
      mainAccords: p.main_accords?.slice(0, 5).map(a => `${a.name}(${a.intensity}%)`) || []
    }));

    return `You are an expert perfumer and fragrance consultant. Analyze the user's personality and preferences to recommend the best perfumes from the available collection.

USER PROFILE:
- Personality Archetype: ${archetype?.type || 'Unknown'}
- Preferred Scent Families: ${topFamilies?.map(f => typeof f === 'string' ? f : f.family).join(', ') || 'Not specified'}
- Intensity Preference: ${intensity || 'Not specified'}
- Lifestyle: ${answers?.lifestyle || 'Not specified'}
- Occasions: ${answers?.occasions?.join(', ') || 'Not specified'}
- Personality Traits: ${JSON.stringify(answers?.personality_traits || {})}
- Scent Experience Level: ${answers?.scent_experience || 'Not specified'}
- Budget Preference: ${answers?.budget_preference || 'Not specified'}

AVAILABLE PERFUMES:
${perfumeContext.map((p, i) => 
  `${i + 1}. ${p.name} by ${p.brand}
     Main Accords: ${p.mainAccords.join(', ')}
  `).join('\n')}

TASK: Recommend TOP 6 perfumes that perfectly match this user's personality and preferences.

Respond in this exact JSON format:
{
  "recommendations": [
    {
      "perfumeName": "exact name from list",
      "matchPercentage": 95,
      "reasoning": "detailed explanation why this suits the user",
      "personalityMatch": ["sophisticated", "confident"],
      "bestOccasions": ["work", "evening"],
      "uniqueFactors": ["long-lasting", "distinctive"],
      "confidenceScore": 90
    }
  ],
  "overallAnalysis": "summary of user's scent personality",
  "aiConfidence": 88
}`;
  }

  /**
   * Build prompt for occasion-based recommendations
   */
  buildOccasionPrompt(occasionData, perfumes) {
    const { occasion, timeOfDay, season, formality, duration } = occasionData;
    
    const perfumeContext = perfumes.map(p => ({
      name: p.name,
      brand: p.brand?.name || 'Unknown',
      mainAccords: p.main_accords?.slice(0, 5).map(a => `${a.name}(${a.intensity}%)`) || []
    }));

    return `You are an expert perfumer specializing in occasion-based fragrance selection. Find the perfect perfumes for this specific occasion.

OCCASION DETAILS:
- Event Type: ${occasion}
- Time of Day: ${timeOfDay}
- Season: ${season}
- Formality Level: ${formality}
- Duration: ${duration}

AVAILABLE PERFUMES:
${perfumeContext.map((p, i) => 
  `${i + 1}. ${p.name} by ${p.brand}
     Main Accords: ${p.mainAccords.join(', ')}
  `).join('\n')}

TASK: Recommend TOP 5 perfumes perfect for this specific occasion.

Respond in this exact JSON format:
{
  "recommendations": [
    {
      "perfumeName": "exact name from list",
      "matchPercentage": 92,
      "reasoning": "why this perfume is perfect for this occasion",
      "occasionFit": ["appropriate projection", "suitable longevity"],
      "bestTimeToWear": "specific timing advice",
      "socialImpact": "how others will perceive this choice",
      "confidenceScore": 88
    }
  ],
  "overallAnalysis": "analysis of this occasion's fragrance requirements",
  "aiConfidence": 85
}`;
  }

  /**
   * Build prompt for seasonal recommendations
   */
  buildSeasonalPrompt(seasonalData, perfumes) {
    const { season, weather, temperature, humidity, location } = seasonalData;
    
    const perfumeContext = perfumes.map(p => ({
      name: p.name,
      brand: p.brand?.name || 'Unknown',
      mainAccords: p.main_accords?.slice(0, 5).map(a => `${a.name}(${a.intensity}%)`) || []
    }));

    return `You are an expert perfumer specializing in seasonal and weather-appropriate fragrance selection.

SEASONAL CONDITIONS:
- Season: ${season}
- Weather: ${weather}
- Temperature: ${temperature}
- Humidity: ${humidity}
- Location: ${location || 'Not specified'}

AVAILABLE PERFUMES:
${perfumeContext.map((p, i) => 
  `${i + 1}. ${p.name} by ${p.brand}
     Main Accords: ${p.mainAccords.join(', ')}
  `).join('\n')}

TASK: Recommend TOP 5 perfumes perfect for these seasonal conditions.

Respond in this exact JSON format:
{
  "recommendations": [
    {
      "perfumeName": "exact name from list",
      "matchPercentage": 90,
      "reasoning": "why this perfume works in these conditions",
      "seasonalBenefits": ["refreshing in heat", "comforting in cold"],
      "weatherCompatibility": "how it performs in this weather",
      "projectionAdvice": "projection expectations in these conditions",
      "confidenceScore": 85
    }
  ],
  "overallAnalysis": "analysis of seasonal fragrance requirements",
  "aiConfidence": 82
}`;
  }

  /**
   * Parse AI response and match with actual perfume data
   */
  parseAIResponse(aiText, availablePerfumes, type = 'personality') {
    try {
      // Extract JSON from the response
      let jsonText = aiText;
      const jsonMatch = aiText.match(/```json\n([\s\S]*?)\n```/) || aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[1] || jsonMatch[0];
      }

      const aiResponse = JSON.parse(jsonText);
      
      // Match AI recommendations with actual perfume objects
      const enhancedRecommendations = aiResponse.recommendations.map(aiRec => {
        const matchedPerfume = availablePerfumes.find(p => 
          p.name.toLowerCase().includes(aiRec.perfumeName.toLowerCase()) ||
          aiRec.perfumeName.toLowerCase().includes(p.name.toLowerCase())
        );

        if (!matchedPerfume) {
          return null;
        }

        const baseRec = {
          id: `ai_rec_${matchedPerfume.name.replace(/\s+/g, '_')}`,
          perfume: matchedPerfume,
          name: matchedPerfume.name,
          brand: matchedPerfume.brand?.name || 'Unknown',
          confidence: aiRec.matchPercentage || aiRec.confidenceScore || 85,
          score: aiRec.matchPercentage || 85,
          matchPercentage: aiRec.matchPercentage || 85,
          reason: aiRec.reasoning,
          source: 'gemini-ai',
          imageUrl: matchedPerfume.image_url || `/perfume-images/${matchedPerfume.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.svg`
        };

        // Add type-specific data
        if (type === 'personality') {
          baseRec.reasons = aiRec.personalityMatch || [];
          baseRec.occasions = aiRec.bestOccasions || [];
          baseRec.uniqueFactors = aiRec.uniqueFactors || [];
          baseRec.aiAnalysis = {
            personalityMatch: aiRec.personalityMatch,
            bestOccasions: aiRec.bestOccasions,
            uniqueFactors: aiRec.uniqueFactors,
            reasoning: aiRec.reasoning
          };
        } else if (type === 'occasion') {
          baseRec.occasionFit = aiRec.occasionFit || [];
          baseRec.bestTimeToWear = aiRec.bestTimeToWear;
          baseRec.socialImpact = aiRec.socialImpact;
        } else if (type === 'seasonal') {
          baseRec.seasonalBenefits = aiRec.seasonalBenefits || [];
          baseRec.weatherCompatibility = aiRec.weatherCompatibility;
          baseRec.projectionAdvice = aiRec.projectionAdvice;
        }

        return baseRec;
      }).filter(Boolean);

      return {
        recommendations: enhancedRecommendations,
        analysis: aiResponse.overallAnalysis,
        confidence: aiResponse.aiConfidence || 80,
        source: 'gemini-ai',
        metadata: {
          totalRecommendations: enhancedRecommendations.length,
          aiModel: 'gemini-1.5-flash',
          analysisType: type,
          analysisDepth: `${type}-based-ai`
        }
      };

    } catch (error) {
      throw new Error('Failed to parse AI recommendations');
    }
  }

  /**
   * Check if Gemini AI is available
   */
  isAvailable() {
    return this.genAI !== null;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      available: this.isAvailable(),
      model: this.isAvailable() ? 'gemini-1.5-flash' : null,
      apiKeyConfigured: !!this.apiKey
    };
  }
}

module.exports = new GeminiService();