import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Brain, Heart, Star, Sparkles } from 'lucide-react';
import { getPersonalityRecommendations, validateRecommendationQuality } from '../../api/recommendations';

const PersonalityQuiz = ({ onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleting, setIsCompleting] = useState(false);

  const questions = [
    {
      id: 'lifestyle',
      title: 'What best describes your lifestyle?',
      type: 'single',
      icon: <Brain className="w-6 h-6" />,
      options: [
        { id: 'active_social', label: 'Active & Social', value: 5, description: 'Always on the go, love meeting people' },
        { id: 'professional', label: 'Professional & Focused', value: 4, description: 'Career-driven, sophisticated' },
        { id: 'creative_artistic', label: 'Creative & Artistic', value: 3, description: 'Express yourself through art and creativity' },
        { id: 'calm_introspective', label: 'Calm & Introspective', value: 2, description: 'Enjoy quiet moments and reflection' },
        { id: 'adventurous', label: 'Adventurous & Bold', value: 5, description: 'Love trying new experiences' }
      ]
    },
    {
      id: 'mood_preference',
      title: 'Which mood do you want your fragrance to evoke?',
      type: 'single',
      icon: <Heart className="w-6 h-6" />,
      options: [
        { id: 'confident_powerful', label: 'Confident & Powerful', value: 5, notes: ['oud', 'amber', 'leather'] },
        { id: 'fresh_energetic', label: 'Fresh & Energetic', value: 4, notes: ['citrus', 'mint', 'green'] },
        { id: 'romantic_sensual', label: 'Romantic & Sensual', value: 4, notes: ['rose', 'jasmine', 'vanilla'] },
        { id: 'calm_peaceful', label: 'Calm & Peaceful', value: 3, notes: ['lavender', 'sandalwood', 'chamomile'] },
        { id: 'mysterious_alluring', label: 'Mysterious & Alluring', value: 5, notes: ['patchouli', 'incense', 'musk'] }
      ]
    },
    {
      id: 'scent_intensity',
      title: 'How strong do you prefer your fragrance?',
      type: 'scale',
      icon: <Sparkles className="w-6 h-6" />,
      options: [
        { id: 'subtle', label: 'Subtle & Light', value: 1, description: 'Close to skin, intimate' },
        { id: 'moderate', label: 'Moderate', value: 3, description: 'Noticeable but not overwhelming' },
        { id: 'strong', label: 'Strong & Bold', value: 5, description: 'Makes a statement, long-lasting' }
      ]
    },
    {
      id: 'favorite_scents',
      title: 'Which scent families appeal to you most?',
      type: 'multiple',
      icon: <Star className="w-6 h-6" />,
      options: [
        { id: 'citrus', label: 'Citrus', description: 'Fresh, zesty, energizing', notes: ['lemon', 'bergamot', 'grapefruit'] },
        { id: 'floral', label: 'Floral', description: 'Romantic, feminine, delicate', notes: ['rose', 'jasmine', 'peony'] },
        { id: 'woody', label: 'Woody', description: 'Warm, sophisticated, grounding', notes: ['sandalwood', 'cedar', 'vetiver'] },
        { id: 'oriental', label: 'Oriental', description: 'Exotic, spicy, mysterious', notes: ['amber', 'vanilla', 'cinnamon'] },
        { id: 'fresh', label: 'Fresh/Aquatic', description: 'Clean, marine, airy', notes: ['sea breeze', 'water lily', 'mint'] },
        { id: 'gourmand', label: 'Gourmand', description: 'Sweet, edible, comforting', notes: ['vanilla', 'chocolate', 'caramel'] }
      ]
    },
    {
      id: 'personality_traits',
      title: 'Which traits best describe you?',
      type: 'multiple',
      icon: <Brain className="w-6 h-6" />,
      options: [
        { id: 'outgoing', label: 'Outgoing & Social', weight: 1.2, suggests: ['citrus', 'fresh'] },
        { id: 'sophisticated', label: 'Sophisticated & Elegant', weight: 1.3, suggests: ['woody', 'oriental'] },
        { id: 'romantic', label: 'Romantic & Dreamy', weight: 1.2, suggests: ['floral', 'gourmand'] },
        { id: 'adventurous', label: 'Adventurous & Bold', weight: 1.4, suggests: ['oriental', 'woody'] },
        { id: 'creative', label: 'Creative & Unique', weight: 1.1, suggests: ['oriental', 'gourmand'] },
        { id: 'minimalist', label: 'Minimalist & Clean', weight: 1.0, suggests: ['fresh', 'citrus'] }
      ]
    },
    {
      id: 'daily_routine',
      title: 'When do you typically wear fragrance?',
      type: 'multiple',
      icon: <Heart className="w-6 h-6" />,
      options: [
        { id: 'morning', label: 'Morning/Daytime', suggests: ['citrus', 'fresh', 'floral'] },
        { id: 'evening', label: 'Evening/Night', suggests: ['oriental', 'woody', 'gourmand'] },
        { id: 'work', label: 'Professional/Work', suggests: ['woody', 'fresh'] },
        { id: 'social', label: 'Social Events', suggests: ['floral', 'oriental'] },
        { id: 'special', label: 'Special Occasions', suggests: ['oriental', 'gourmand'] },
        { id: 'everyday', label: 'Everyday Wear', suggests: ['fresh', 'citrus'] }
      ]
    }
  ];

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const completeQuiz = async () => {
    setIsCompleting(true);
    
    try {
      // Calculate personality profile first
      const localProfile = calculatePersonalityProfile(answers);
      
      console.log('Local profile calculated:', localProfile); // Debug log
      
      // Get real recommendations from API
      const apiResponse = await getPersonalityRecommendations({
        topFamilies: localProfile.topFamilies,
        intensity: localProfile.intensity,
        archetype: localProfile.archetype,
        answers: answers
      });
      
      if (apiResponse.success) {
        // Combine local analysis with API recommendations
        const enhancedProfile = {
          ...localProfile,
          recommendations: apiResponse.data.recommendations,
          confidence: apiResponse.data.confidence,
          metadata: apiResponse.data.metadata,
          source: 'api',
          // Validate recommendation quality
          recommendationQuality: apiResponse.data.recommendations.map(validateRecommendationQuality)
        };
        
        console.log('Enhanced profile with API data:', enhancedProfile); // Debug log
        
        // Call onComplete with enhanced profile
        if (onComplete && typeof onComplete === 'function') {
          onComplete(enhancedProfile);
        } else {
          console.log('API-Enhanced Personality Quiz Results:', enhancedProfile);
          setIsCompleting(false);
        }
      } else {
        // Fallback to local recommendations if API fails
        console.warn('API failed, using fallback:', apiResponse.error);
        
        // Generate local recommendations as fallback
        const fallbackRecommendations = generateRecommendations(
          localProfile.topFamilies, 
          localProfile.intensity, 
          localProfile.archetype
        );
        
        const fallbackProfile = {
          ...localProfile,
          recommendations: fallbackRecommendations,
          confidence: localProfile.confidence,
          source: 'fallback',
          apiError: apiResponse.error
        };
        
        if (onComplete && typeof onComplete === 'function') {
          onComplete(fallbackProfile);
        } else {
          console.log('Fallback Personality Quiz Results:', fallbackProfile);
          setIsCompleting(false);
        }
      }
    } catch (error) {
      console.error('Error in completeQuiz:', error);
      
      // Generate local fallback
      const localProfile = calculatePersonalityProfile(answers);
      const fallbackRecommendations = generateRecommendations(
        localProfile.topFamilies, 
        localProfile.intensity, 
        localProfile.archetype
      );
      
      const errorProfile = {
        ...localProfile,
        recommendations: fallbackRecommendations,
        confidence: localProfile.confidence,
        source: 'error-fallback',
        error: error.message
      };
      
      if (onComplete && typeof onComplete === 'function') {
        onComplete(errorProfile);
      } else {
        console.log('Error Fallback Results:', errorProfile);
        setIsCompleting(false);
      }
    }
  };

  const calculatePersonalityProfile = (answers) => {
    const scentFamilyScores = {
      citrus: 0,
      floral: 0,
      woody: 0,
      oriental: 0,
      fresh: 0,
      gourmand: 0
    };

    // Analyze mood preferences
    if (answers.mood_preference) {
      const mood = answers.mood_preference;
      if (mood.notes) {
        mood.notes.forEach(note => {
          if (note.includes('citrus') || note.includes('mint')) scentFamilyScores.citrus += 3;
          if (note.includes('rose') || note.includes('jasmine')) scentFamilyScores.floral += 3;
          if (note.includes('sandalwood') || note.includes('leather')) scentFamilyScores.woody += 3;
          if (note.includes('oud') || note.includes('amber')) scentFamilyScores.oriental += 3;
          if (note.includes('green') || note.includes('lavender')) scentFamilyScores.fresh += 3;
          if (note.includes('vanilla')) scentFamilyScores.gourmand += 3;
        });
      }
    }

    // Analyze favorite scent families
    if (answers.favorite_scents) {
      answers.favorite_scents.forEach(family => {
        scentFamilyScores[family.id] += 5;
      });
    }

    // Analyze personality traits
    if (answers.personality_traits) {
      answers.personality_traits.forEach(trait => {
        if (trait.suggests) {
          trait.suggests.forEach(family => {
            scentFamilyScores[family] += 2 * (trait.weight || 1);
          });
        }
      });
    }

    // Analyze daily routine
    if (answers.daily_routine) {
      answers.daily_routine.forEach(routine => {
        if (routine.suggests) {
          routine.suggests.forEach(family => {
            scentFamilyScores[family] += 1.5;
          });
        }
      });
    }

    // Determine intensity preference
    const intensityScore = answers.scent_intensity?.value || 3;
    
    // Get top 3 scent families
    const topFamilies = Object.entries(scentFamilyScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([family, score]) => ({ family, score }));

    // Determine personality archetype
    const archetype = determineArchetype(answers);

    return {
      topFamilies: topFamilies.map(f => f.family),
      topScentFamilies: topFamilies,
      intensityPreference: intensityScore,
      archetype: archetype,
      lifestyle: answers.lifestyle?.label,
      preferredMood: answers.mood_preference?.label,
      confidence: calculateConfidence(answers, topFamilies),
      recommendations: generateRecommendations(topFamilies, intensityScore, archetype),
      rawScores: scentFamilyScores,
      analysis: {
        totalQuestions: Object.keys(answers).length,
        moodAnalysis: answers.mood_preference,
        familyPreferences: answers.favorite_scents,
        personalityTraits: answers.personality_traits,
        dailyRoutine: answers.daily_routine
      }
    };
  };

  const calculateConfidence = (answers, topFamilies) => {
    let confidence = 0;
    const maxConfidence = 100;
    
    // Base confidence from answered questions
    const questionsAnswered = Object.keys(answers).length;
    confidence += (questionsAnswered / questions.length) * 40; // 40% for completion
    
    // Confidence from clear preferences
    if (topFamilies.length > 0) {
      const topScore = topFamilies[0].score;
      const secondScore = topFamilies[1]?.score || 0;
      
      // Higher confidence if there's a clear winner
      if (topScore > secondScore * 1.5) {
        confidence += 30; // Clear preference bonus
      } else {
        confidence += 15; // Some preference
      }
    }
    
    // Consistency bonus
    if (answers.favorite_scents && answers.personality_traits) {
      confidence += 20; // Consistency between direct and indirect preferences
    }
    
    // Intensity clarity
    if (answers.scent_intensity) {
      confidence += 10; // Clear intensity preference
    }
    
    return Math.min(confidence, maxConfidence);
  };

  const determineArchetype = (answers) => {
    const lifestyle = answers.lifestyle?.id;
    const traits = answers.personality_traits?.map(t => t.id) || [];
    
    if (traits.includes('sophisticated') && lifestyle === 'professional') {
      return { 
        type: 'The Sophisticate', 
        description: 'Elegant, refined, and confident. You appreciate luxury and quality.',
        icon: '👑'
      };
    } else if (traits.includes('adventurous') && traits.includes('outgoing')) {
      return { 
        type: 'The Explorer', 
        description: 'Bold, energetic, and always seeking new experiences.',
        icon: '🌟'
      };
    } else if (traits.includes('romantic') && traits.includes('creative')) {
      return { 
        type: 'The Romantic', 
        description: 'Dreamy, artistic, and emotionally expressive.',
        icon: '🌹'
      };
    } else if (traits.includes('minimalist')) {
      return { 
        type: 'The Minimalist', 
        description: 'Clean, simple, and appreciates understated elegance.',
        icon: '✨'
      };
    } else {
      return { 
        type: 'The Individual', 
        description: 'Unique and authentic, you follow your own path.',
        icon: '🦋'
      };
    }
  };

  const generateRecommendations = (topFamilies, intensity, archetype) => {
    const recommendations = [];
    
    // Enhanced fragrance database with specific recommendations
    const fragranceDatabase = {
      citrus: [
        { name: 'Bergamot Sunrise', brand: 'Olfactive Echo', notes: ['bergamot', 'lemon', 'white tea'], price: 2800, intensity: 'light' },
        { name: 'Mediterranean Breeze', brand: 'Olfactive Echo', notes: ['grapefruit', 'rosemary', 'sea salt'], price: 3200, intensity: 'moderate' },
        { name: 'Golden Citrus', brand: 'Olfactive Echo', notes: ['orange blossom', 'mandarin', 'neroli'], price: 2600, intensity: 'light' }
      ],
      floral: [
        { name: 'Rose Garden', brand: 'Olfactive Echo', notes: ['damascus rose', 'peony', 'lily'], price: 3500, intensity: 'moderate' },
        { name: 'Jasmine Dreams', brand: 'Olfactive Echo', notes: ['jasmine', 'magnolia', 'white musk'], price: 3200, intensity: 'strong' },
        { name: 'Spring Bouquet', brand: 'Olfactive Echo', notes: ['freesia', 'violet', 'green leaves'], price: 2900, intensity: 'light' }
      ],
      woody: [
        { name: 'Sandalwood Serenity', brand: 'Olfactive Echo', notes: ['sandalwood', 'cedar', 'amber'], price: 4200, intensity: 'strong' },
        { name: 'Forest Path', brand: 'Olfactive Echo', notes: ['vetiver', 'oakmoss', 'bergamot'], price: 3800, intensity: 'moderate' },
        { name: 'Warm Cedar', brand: 'Olfactive Echo', notes: ['cedar', 'vanilla', 'tonka'], price: 3600, intensity: 'moderate' }
      ],
      oriental: [
        { name: 'Mystic Orient', brand: 'Olfactive Echo', notes: ['oud', 'saffron', 'rose'], price: 5500, intensity: 'strong' },
        { name: 'Amber Nights', brand: 'Olfactive Echo', notes: ['amber', 'vanilla', 'patchouli'], price: 4800, intensity: 'strong' },
        { name: 'Spice Market', brand: 'Olfactive Echo', notes: ['cardamom', 'cinnamon', 'sandalwood'], price: 4200, intensity: 'moderate' }
      ],
      fresh: [
        { name: 'Ocean Breeze', brand: 'Olfactive Echo', notes: ['marine accord', 'cucumber', 'mint'], price: 2400, intensity: 'light' },
        { name: 'Morning Dew', brand: 'Olfactive Echo', notes: ['green leaves', 'water lily', 'clean musk'], price: 2600, intensity: 'light' },
        { name: 'Alpine Fresh', brand: 'Olfactive Echo', notes: ['eucalyptus', 'pine', 'crisp air'], price: 2800, intensity: 'moderate' }
      ],
      gourmand: [
        { name: 'Vanilla Dreams', brand: 'Olfactive Echo', notes: ['madagascar vanilla', 'caramel', 'tonka'], price: 3800, intensity: 'moderate' },
        { name: 'Chocolate Temptation', brand: 'Olfactive Echo', notes: ['dark chocolate', 'coffee', 'vanilla'], price: 4000, intensity: 'strong' },
        { name: 'Sweet Harmony', brand: 'Olfactive Echo', notes: ['honey', 'almond', 'white flowers'], price: 3400, intensity: 'moderate' }
      ]
    };
    
    topFamilies.forEach((family, index) => {
      const familyFragrances = fragranceDatabase[family.family] || [];
      
      // Select best match based on intensity preference
      const intensityMap = { 1: 'light', 2: 'light', 3: 'moderate', 4: 'strong', 5: 'strong' };
      const preferredIntensity = intensityMap[intensity];
      
      const bestMatch = familyFragrances.find(f => f.intensity === preferredIntensity) || familyFragrances[0];
      
      if (bestMatch) {
        recommendations.push({
          id: `rec_${index + 1}`,
          family: family.family,
          priority: index + 1,
          score: family.score,
          fragrance: bestMatch,
          description: getDescriptionForFamily(family.family, archetype),
          occasions: getOccasionsForFamily(family.family),
          intensityMatch: intensity,
          matchPercentage: Math.round(85 + (family.score / 10) + (index === 0 ? 10 : 0))
        });
      }
    });

    return recommendations;
  };

  const getDescriptionForFamily = (family, archetype) => {
    const descriptions = {
      citrus: 'Fresh, energizing scents perfect for your dynamic lifestyle',
      floral: 'Elegant, romantic fragrances that enhance your feminine side',
      woody: 'Sophisticated, grounding scents that project confidence',
      oriental: 'Mysterious, exotic fragrances for your bold personality',
      fresh: 'Clean, airy scents ideal for your minimalist aesthetic',
      gourmand: 'Sweet, comforting fragrances that express your creative nature'
    };
    return descriptions[family] || 'A perfect match for your unique personality';
  };

  const getOccasionsForFamily = (family) => {
    const occasions = {
      citrus: ['daytime', 'work', 'casual'],
      floral: ['romantic', 'social', 'special events'],
      woody: ['professional', 'evening', 'formal'],
      oriental: ['night out', 'special occasions', 'dates'],
      fresh: ['everyday', 'sport', 'summer'],
      gourmand: ['cozy evenings', 'dates', 'fall/winter']
    };
    return occasions[family] || ['versatile'];
  };

  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const hasAnswer = answers[currentQ.id];

  if (isCompleting) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-8 text-center border border-amber-200 shadow-lg">
          <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Your Personality</h3>
          <p className="text-gray-600">Creating your personalized fragrance profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-amber-200 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                {currentQ.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Personality Quiz</h2>
                <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{currentQ.title}</h3>
          
          <div className="space-y-3">
            {currentQ.type === 'single' && currentQ.options.map(option => (
              <button
                key={option.id}
                onClick={() => handleAnswer(currentQ.id, option)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                  answers[currentQ.id]?.id === option.id
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 hover:border-amber-300 text-gray-700'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                )}
              </button>
            ))}

            {currentQ.type === 'multiple' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQ.options.map(option => (
                  <button
                    key={option.id}
                    onClick={() => {
                      const currentAnswers = answers[currentQ.id] || [];
                      const isSelected = currentAnswers.some(a => a.id === option.id);
                      
                      if (isSelected) {
                        handleAnswer(currentQ.id, currentAnswers.filter(a => a.id !== option.id));
                      } else {
                        handleAnswer(currentQ.id, [...currentAnswers, option]);
                      }
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                      (answers[currentQ.id] || []).some(a => a.id === option.id)
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-amber-300 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {currentQ.type === 'scale' && (
              <div className="space-y-3">
                {currentQ.options.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(currentQ.id, option)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                      answers[currentQ.id]?.id === option.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-amber-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              i < option.value ? 'bg-blue-500' : 'bg-gray-200'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 flex justify-between">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={nextQuestion}
            disabled={!hasAnswer}
            className="flex items-center space-x-2 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <span>{isLastQuestion ? 'Complete Quiz' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalityQuiz;