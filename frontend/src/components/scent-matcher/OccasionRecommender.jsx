import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Thermometer, Sparkles } from 'lucide-react';
import { getOccasionRecommendations } from '../../api/recommendations';

const OccasionRecommender = ({ onRecommendation }) => {
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const occasions = [
    {
      id: 'work',
      title: 'Professional/Work',
      icon: <Calendar className="w-6 h-6" />,
      description: 'Office meetings, presentations, networking',
      scentProfile: {
        families: ['fresh', 'woody', 'citrus'],
        intensity: 'moderate',
        notes: ['bergamot', 'sandalwood', 'white musk', 'cedar'],
        avoid: ['heavy oriental', 'strong gourmand', 'overpowering florals']
      }
    },
    {
      id: 'date',
      title: 'Romantic Date',
      icon: <Sparkles className="w-6 h-6" />,
      description: 'Dinner dates, romantic evenings',
      scentProfile: {
        families: ['floral', 'oriental', 'gourmand'],
        intensity: 'moderate-strong',
        notes: ['rose', 'jasmine', 'vanilla', 'amber'],
        avoid: ['too fresh', 'sporty scents', 'overly masculine']
      }
    },
    {
      id: 'party',
      title: 'Party/Social Event',
      icon: <Users className="w-6 h-6" />,
      description: 'Parties, clubs, social gatherings',
      scentProfile: {
        families: ['oriental', 'woody', 'gourmand'],
        intensity: 'strong',
        notes: ['oud', 'patchouli', 'vanilla', 'amber'],
        avoid: ['too subtle', 'office-appropriate only']
      }
    },
    {
      id: 'casual',
      title: 'Casual/Everyday',
      icon: <MapPin className="w-6 h-6" />,
      description: 'Shopping, casual meetings, daily wear',
      scentProfile: {
        families: ['fresh', 'citrus', 'light floral'],
        intensity: 'light-moderate',
        notes: ['lemon', 'mint', 'light florals', 'clean musk'],
        avoid: ['too heavy', 'evening scents', 'formal fragrances']
      }
    },
    {
      id: 'sport',
      title: 'Sports/Active',
      icon: <Thermometer className="w-6 h-6" />,
      description: 'Gym, outdoor activities, sports',
      scentProfile: {
        families: ['fresh', 'aquatic', 'citrus'],
        intensity: 'light',
        notes: ['marine', 'citrus', 'mint', 'green'],
        avoid: ['heavy', 'sweet', 'strong projection']
      }
    },
    {
      id: 'formal',
      title: 'Formal Event',
      icon: <Calendar className="w-6 h-6" />,
      description: 'Weddings, galas, formal dinners',
      scentProfile: {
        families: ['oriental', 'woody', 'sophisticated floral'],
        intensity: 'moderate-strong',
        notes: ['oud', 'rose', 'sandalwood', 'amber'],
        avoid: ['too casual', 'sporty', 'overly sweet']
      }
    },
    {
      id: 'travel',
      title: 'Travel',
      icon: <MapPin className="w-6 h-6" />,
      description: 'Flights, vacations, exploring',
      scentProfile: {
        families: ['fresh', 'citrus', 'light woody'],
        intensity: 'light-moderate',
        notes: ['citrus', 'light woods', 'clean notes'],
        avoid: ['too strong', 'polarizing', 'heavy projection']
      }
    },
    {
      id: 'intimate',
      title: 'Intimate Gathering',
      icon: <Users className="w-6 h-6" />,
      description: 'Close friends, family dinner, cozy settings',
      scentProfile: {
        families: ['warm floral', 'soft oriental', 'comforting gourmand'],
        intensity: 'moderate',
        notes: ['soft vanilla', 'warm spices', 'comforting notes'],
        avoid: ['too bold', 'overpowering', 'aggressive']
      }
    }
  ];

  const timeOfDay = [
    {
      id: 'morning',
      title: 'Morning (6 AM - 12 PM)',
      scentAdjustment: {
        prefer: ['fresh', 'citrus', 'energizing'],
        intensity: 'light-moderate',
        notes: ['citrus', 'mint', 'green']
      }
    },
    {
      id: 'afternoon',
      title: 'Afternoon (12 PM - 6 PM)',
      scentAdjustment: {
        prefer: ['balanced', 'versatile'],
        intensity: 'moderate',
        notes: ['balanced compositions']
      }
    },
    {
      id: 'evening',
      title: 'Evening (6 PM - 12 AM)',
      scentAdjustment: {
        prefer: ['oriental', 'woody', 'sophisticated'],
        intensity: 'moderate-strong',
        notes: ['warm', 'rich', 'complex']
      }
    },
    {
      id: 'night',
      title: 'Late Night (12 AM - 6 AM)',
      scentAdjustment: {
        prefer: ['intimate', 'sensual', 'mysterious'],
        intensity: 'strong',
        notes: ['oud', 'musk', 'deep notes']
      }
    }
  ];

  const seasons = [
    {
      id: 'spring',
      title: 'Spring',
      scentAdjustment: {
        prefer: ['fresh florals', 'green', 'light'],
        notes: ['fresh florals', 'green leaves', 'light fruits'],
        avoid: ['too heavy', 'winter scents']
      }
    },
    {
      id: 'summer',
      title: 'Summer',
      scentAdjustment: {
        prefer: ['citrus', 'aquatic', 'fresh'],
        notes: ['citrus', 'marine', 'light florals'],
        avoid: ['heavy orientals', 'warm spices']
      }
    },
    {
      id: 'autumn',
      title: 'Autumn',
      scentAdjustment: {
        prefer: ['woody', 'spicy', 'warm'],
        notes: ['warm spices', 'woods', 'amber'],
        avoid: ['too fresh', 'pure citrus']
      }
    },
    {
      id: 'winter',
      title: 'Winter',
      scentAdjustment: {
        prefer: ['oriental', 'gourmand', 'rich'],
        notes: ['oud', 'vanilla', 'warm spices'],
        avoid: ['too light', 'pure fresh']
      }
    }
  ];

  const company = [
    {
      id: 'alone',
      title: 'Solo',
      scentAdjustment: {
        notes: 'Personal preference priority'
      }
    },
    {
      id: 'partner',
      title: 'With Partner',
      scentAdjustment: {
        prefer: ['romantic', 'sensual', 'appealing'],
        avoid: ['too masculine/feminine for preference']
      }
    },
    {
      id: 'colleagues',
      title: 'With Colleagues',
      scentAdjustment: {
        prefer: ['professional', 'inoffensive', 'sophisticated'],
        avoid: ['too personal', 'polarizing']
      }
    },
    {
      id: 'friends',
      title: 'With Friends',
      scentAdjustment: {
        prefer: ['fun', 'expressive', 'memorable'],
        notes: 'Can be more bold and expressive'
      }
    },
    {
      id: 'family',
      title: 'With Family',
      scentAdjustment: {
        prefer: ['comforting', 'appropriate', 'pleasant'],
        avoid: ['too bold', 'inappropriate for age groups']
      }
    }
  ];

  const generateRecommendation = async () => {
    if (!selectedOccasion) return;

    try {
      // Prepare data for API call
      const occasionData = {
        occasion: selectedOccasion.title,
        occasionId: selectedOccasion.id,
        description: selectedOccasion.description,
        timeOfDay: selectedTime?.title || 'any',
        season: selectedSeason?.title || 'any',
        company: selectedCompany?.title || 'solo',
        scentProfile: selectedOccasion.scentProfile
      };

      // Call the AI-powered occasion recommendations API
      const apiResponse = await getOccasionRecommendations(occasionData);

      if (apiResponse.success) {
        const result = {
          occasion: selectedOccasion,
          timeOfDay: selectedTime,
          season: selectedSeason,
          company: selectedCompany,
          recommendations: apiResponse.data.recommendations,
          confidence: apiResponse.data.confidence || calculateConfidence(),
          source: 'api',
          metadata: apiResponse.data.metadata
        };

        onRecommendation(result);
      } else {
        // Fallback to local recommendations if API fails
        const result = {
          occasion: selectedOccasion,
          timeOfDay: selectedTime,
          season: selectedSeason,
          company: selectedCompany,
          recommendations: generateFallbackRecommendations(),
          confidence: calculateConfidence(),
          source: 'local'
        };

        onRecommendation(result);
      }
    } catch (error) {
      console.error('Failed to get occasion recommendations:', error);
      
      // Fallback to local recommendations
      const result = {
        occasion: selectedOccasion,
        timeOfDay: selectedTime,
        season: selectedSeason,
        company: selectedCompany,
        recommendations: generateFallbackRecommendations(),
        confidence: calculateConfidence(),
        source: 'local'
      };

      onRecommendation(result);
    }
  };

  const generateFallbackRecommendations = () => {
    // Fallback static recommendations if API fails
    const baseProfile = selectedOccasion.scentProfile;
    
    const exampleRecommendations = [
      {
        id: 'fallback_1',
        name: "Azure Breeze",
        brand: "Olfactive Echo",
        family: baseProfile.families[0],
        intensity: baseProfile.intensity,
        notes: baseProfile.notes.slice(0, 3),
        description: `Perfect for ${selectedOccasion.title.toLowerCase()}`,
        matchScore: 95,
        score: 95,
        matchPercentage: 95,
        price: 2500,
        source: 'fallback'
      },
      {
        id: 'fallback_2',
        name: "Golden Hour",
        brand: "Olfactive Echo", 
        family: baseProfile.families[1] || baseProfile.families[0],
        intensity: baseProfile.intensity,
        notes: baseProfile.notes.slice(1, 4),
        description: `Ideal for your selected occasion and time`,
        matchScore: 88,
        score: 88,
        matchPercentage: 88,
        price: 3200,
        source: 'fallback'
      },
      {
        id: 'fallback_3',
        name: "Mystic Bloom",
        brand: "Olfactive Echo",
        family: baseProfile.families[2] || baseProfile.families[0],
        intensity: baseProfile.intensity,
        notes: baseProfile.notes.slice(2, 5),
        description: `A sophisticated choice for the setting`,
        matchScore: 82,
        score: 82,
        matchPercentage: 82,
        price: 2800,
        source: 'fallback'
      }
    ];

    return exampleRecommendations;
  };

  const calculateConfidence = () => {
    let confidence = 70; // Base confidence
    
    if (selectedOccasion) confidence += 15;
    if (selectedTime) confidence += 5;
    if (selectedSeason) confidence += 5;
    if (selectedCompany) confidence += 5;
    
    return Math.min(confidence, 100);
  };

  const canGenerateRecommendation = selectedOccasion;

  return (
    <div className="space-y-8">
      {/* Occasion Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          What's the occasion?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {occasions.map(occasion => (
            <button
              key={occasion.id}
              onClick={() => setSelectedOccasion(occasion)}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                selectedOccasion?.id === occasion.id
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 hover:border-amber-300 text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                {occasion.icon}
                <span className="font-medium">{occasion.title}</span>
              </div>
              <p className="text-sm text-gray-500">{occasion.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Time Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          What time of day?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {timeOfDay.map(time => (
            <button
              key={time.id}
              onClick={() => setSelectedTime(time)}
              className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                selectedTime?.id === time.id
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 hover:border-amber-300 text-gray-700'
              }`}
            >
              <span className="font-medium">{time.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Season Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Thermometer className="w-5 h-5 mr-2" />
          What season?
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {seasons.map(season => (
            <button
              key={season.id}
              onClick={() => setSelectedSeason(season)}
              className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                selectedSeason?.id === season.id
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 hover:border-amber-300 text-gray-700'
              }`}
            >
              <span className="font-medium">{season.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Company Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Who will you be with?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {company.map(comp => (
            <button
              key={comp.id}
              onClick={() => setSelectedCompany(comp)}
              className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                selectedCompany?.id === comp.id
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 hover:border-amber-300 text-gray-700'
              }`}
            >
              <span className="font-medium">{comp.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={generateRecommendation}
          disabled={!canGenerateRecommendation}
          className="px-8 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          Get Occasion-Perfect Recommendations
        </button>
      </div>
    </div>
  );
};

export default OccasionRecommender;