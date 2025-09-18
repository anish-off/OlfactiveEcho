import React, { useState, useEffect } from 'react';
import { Cloud, Sun, Snowflake, Flower, Thermometer, Droplets, Wind } from 'lucide-react';

const SeasonalRecommender = ({ onRecommendation }) => {
  const [currentSeason, setCurrentSeason] = useState(null);
  const [weatherCondition, setWeatherCondition] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [location, setLocation] = useState(null);

  // Auto-detect current season based on date
  useEffect(() => {
    const currentDate = new Date();
    const month = currentDate.getMonth(); // 0-11
    
    let detectedSeason;
    if (month >= 2 && month <= 4) detectedSeason = 'spring';
    else if (month >= 5 && month <= 7) detectedSeason = 'summer';
    else if (month >= 8 && month <= 10) detectedSeason = 'autumn';
    else detectedSeason = 'winter';
    
    const seasonData = seasons.find(s => s.id === detectedSeason);
    setCurrentSeason(seasonData);
  }, []);

  const seasons = [
    {
      id: 'spring',
      name: 'Spring',
      icon: <Flower className="w-6 h-6" />,
      description: 'Fresh beginnings, blooming flowers, mild weather',
      months: 'March - May',
      characteristics: {
        temperature: 'mild',
        humidity: 'moderate',
        mood: 'renewal, freshness, optimism'
      },
      scentProfile: {
        families: ['fresh floral', 'green', 'light citrus', 'aquatic'],
        intensity: 'light-moderate',
        topNotes: ['green leaves', 'fresh florals', 'light citrus', 'dewdrops'],
        middleNotes: ['lily of the valley', 'freesia', 'light rose', 'jasmine'],
        baseNotes: ['white musk', 'light woods', 'soft amber'],
        avoid: ['heavy orientals', 'strong gourmands', 'winter spices'],
        idealFor: ['daytime', 'casual', 'work', 'outdoor activities']
      }
    },
    {
      id: 'summer',
      name: 'Summer',
      icon: <Sun className="w-6 h-6" />,
      description: 'Hot days, bright sunshine, vacation vibes',
      months: 'June - August',
      characteristics: {
        temperature: 'hot',
        humidity: 'high',
        mood: 'energetic, carefree, vibrant'
      },
      scentProfile: {
        families: ['citrus', 'aquatic', 'fresh', 'light floral'],
        intensity: 'light',
        topNotes: ['bergamot', 'lemon', 'marine notes', 'mint'],
        middleNotes: ['light florals', 'cucumber', 'green tea', 'ocean breeze'],
        baseNotes: ['white musk', 'driftwood', 'clean cotton'],
        avoid: ['heavy orientals', 'warm spices', 'strong projection'],
        idealFor: ['beach', 'outdoor events', 'travel', 'daytime']
      }
    },
    {
      id: 'autumn',
      name: 'Autumn',
      icon: <Wind className="w-6 h-6" />,
      description: 'Crisp air, falling leaves, cozy moments',
      months: 'September - November',
      characteristics: {
        temperature: 'cool',
        humidity: 'moderate',
        mood: 'cozy, sophisticated, contemplative'
      },
      scentProfile: {
        families: ['woody', 'oriental', 'spicy', 'warm floral'],
        intensity: 'moderate-strong',
        topNotes: ['warm spices', 'apple', 'bergamot', 'cardamom'],
        middleNotes: ['cinnamon', 'rose', 'clove', 'nutmeg'],
        baseNotes: ['sandalwood', 'amber', 'vanilla', 'cedar'],
        avoid: ['pure citrus', 'aquatic', 'too fresh'],
        idealFor: ['evening', 'cozy gatherings', 'work', 'dates']
      }
    },
    {
      id: 'winter',
      name: 'Winter',
      icon: <Snowflake className="w-6 h-6" />,
      description: 'Cold weather, holiday warmth, intimate gatherings',
      months: 'December - February',
      characteristics: {
        temperature: 'cold',
        humidity: 'low',
        mood: 'warm, comforting, luxurious'
      },
      scentProfile: {
        families: ['oriental', 'gourmand', 'rich woody', 'opulent floral'],
        intensity: 'strong',
        topNotes: ['warm spices', 'dried fruits', 'rich citrus'],
        middleNotes: ['cinnamon', 'clove', 'rich florals', 'honey'],
        baseNotes: ['oud', 'amber', 'vanilla', 'musk', 'sandalwood'],
        avoid: ['light citrus', 'aquatic', 'pure fresh'],
        idealFor: ['evening', 'special occasions', 'intimate settings', 'holidays']
      }
    }
  ];

  const weatherConditions = [
    {
      id: 'sunny',
      name: 'Sunny & Clear',
      icon: <Sun className="w-5 h-5" />,
      scentAdjustment: {
        prefer: ['bright', 'fresh', 'energizing'],
        intensity: 'moderate',
        notes: ['citrus', 'fresh florals', 'clean']
      }
    },
    {
      id: 'cloudy',
      name: 'Cloudy & Overcast',
      icon: <Cloud className="w-5 h-5" />,
      scentAdjustment: {
        prefer: ['comforting', 'warm', 'enveloping'],
        intensity: 'moderate-strong',
        notes: ['warm spices', 'woods', 'amber']
      }
    },
    {
      id: 'rainy',
      name: 'Rainy & Humid',
      icon: <Droplets className="w-5 h-5" />,
      scentAdjustment: {
        prefer: ['fresh', 'aquatic', 'clean'],
        intensity: 'light-moderate',
        notes: ['marine', 'green', 'fresh']
      }
    },
    {
      id: 'windy',
      name: 'Windy & Breezy',
      icon: <Wind className="w-5 h-5" />,
      scentAdjustment: {
        prefer: ['stronger projection', 'lasting'],
        intensity: 'strong',
        notes: 'Choose stronger formulations'
      }
    }
  ];

  const temperatures = [
    {
      id: 'hot',
      range: '> 25°C (77°F)',
      scentAdjustment: {
        families: ['citrus', 'aquatic', 'fresh'],
        intensity: 'light',
        avoid: ['heavy', 'warm spices', 'strong gourmands']
      }
    },
    {
      id: 'warm',
      range: '20-25°C (68-77°F)',
      scentAdjustment: {
        families: ['fresh floral', 'light woody', 'citrus'],
        intensity: 'light-moderate',
        notes: 'Balanced compositions work well'
      }
    },
    {
      id: 'mild',
      range: '15-20°C (59-68°F)',
      scentAdjustment: {
        families: ['versatile', 'most families work'],
        intensity: 'moderate',
        notes: 'Perfect for experimenting'
      }
    },
    {
      id: 'cool',
      range: '10-15°C (50-59°F)',
      scentAdjustment: {
        families: ['woody', 'spicy', 'warm floral'],
        intensity: 'moderate-strong',
        notes: 'Warming and comforting'
      }
    },
    {
      id: 'cold',
      range: '< 10°C (50°F)',
      scentAdjustment: {
        families: ['oriental', 'gourmand', 'rich woody'],
        intensity: 'strong',
        notes: 'Rich, warming, enveloping'
      }
    }
  ];

  const humidityLevels = [
    {
      id: 'low',
      range: '< 40%',
      scentAdjustment: {
        note: 'Fragrances last longer in low humidity',
        intensity: 'Can use stronger concentrations'
      }
    },
    {
      id: 'moderate',
      range: '40-60%',
      scentAdjustment: {
        note: 'Ideal conditions for most fragrances',
        intensity: 'Standard application'
      }
    },
    {
      id: 'high',
      range: '> 60%',
      scentAdjustment: {
        note: 'Choose lighter, fresher scents',
        prefer: ['fresh', 'aquatic', 'light'],
        avoid: ['heavy', 'thick', 'overpowering']
      }
    }
  ];

  const generateSeasonalRecommendation = () => {
    if (!currentSeason) return;

    let adjustedProfile = { ...currentSeason.scentProfile };
    let additionalConsiderations = [];

    // Adjust based on weather
    if (weatherCondition) {
      const weatherAdj = weatherCondition.scentAdjustment;
      adjustedProfile.weatherConsiderations = weatherAdj;
      additionalConsiderations.push(`Weather: ${weatherCondition.name}`);
      
      // Modify intensity based on weather
      if (weatherCondition.id === 'rainy' || weatherCondition.id === 'humid') {
        adjustedProfile.intensity = 'light-moderate';
      } else if (weatherCondition.id === 'windy') {
        adjustedProfile.intensity = 'strong';
      }
    }

    // Adjust based on temperature
    if (temperature) {
      const tempAdj = temperature.scentAdjustment;
      adjustedProfile.temperatureConsiderations = tempAdj;
      additionalConsiderations.push(`Temperature: ${temperature.range}`);
      
      // Override families based on temperature
      if (temperature.id === 'hot') {
        adjustedProfile.families = ['citrus', 'aquatic', 'fresh'];
        adjustedProfile.intensity = 'light';
      } else if (temperature.id === 'cold') {
        adjustedProfile.families = ['oriental', 'gourmand', 'rich woody'];
        adjustedProfile.intensity = 'strong';
      }
    }

    // Adjust based on humidity
    if (humidity) {
      const humidityAdj = humidity.scentAdjustment;
      adjustedProfile.humidityConsiderations = humidityAdj;
      additionalConsiderations.push(`Humidity: ${humidity.range}`);
      
      if (humidity.id === 'high') {
        adjustedProfile.families = adjustedProfile.families.filter(f => 
          !['heavy oriental', 'strong gourmand'].includes(f)
        );
      }
    }

    // Generate specific recommendations
    const recommendations = generateSeasonalPerfumes(adjustedProfile);

    onRecommendation({
      season: currentSeason,
      weather: weatherCondition,
      temperature: temperature,
      humidity: humidity,
      adjustedProfile,
      recommendations,
      additionalConsiderations,
      confidence: calculateSeasonalConfidence()
    });
  };

  const generateSeasonalPerfumes = (profile) => {
    // Generate recommendations based on seasonal profile
    const seasonalRecommendations = [
      {
        id: 1,
        name: `${currentSeason.name} Essence`,
        brand: "Olfactive Echo",
        family: profile.families[0],
        intensity: profile.intensity,
        notes: profile.topNotes.slice(0, 3),
        description: `Perfectly captures the essence of ${currentSeason.name.toLowerCase()}`,
        seasonalMatch: 98,
        weatherMatch: weatherCondition ? 95 : null,
        price: 2800
      },
      {
        id: 2,
        name: `Weather Perfect`,
        brand: "Olfactive Echo",
        family: profile.families[1] || profile.families[0],
        intensity: profile.intensity,
        notes: [...profile.topNotes.slice(1, 2), ...profile.middleNotes.slice(0, 2)],
        description: `Ideal for current weather conditions`,
        seasonalMatch: 92,
        weatherMatch: weatherCondition ? 98 : null,
        price: 3200
      },
      {
        id: 3,
        name: `Temperature Match`,
        brand: "Olfactive Echo",
        family: profile.families[2] || profile.families[0],
        intensity: profile.intensity,
        notes: [...profile.middleNotes.slice(0, 2), ...profile.baseNotes.slice(0, 1)],
        description: `Perfectly balanced for the temperature`,
        seasonalMatch: 88,
        weatherMatch: temperature ? 96 : null,
        price: 2600
      }
    ];

    return seasonalRecommendations;
  };

  const calculateSeasonalConfidence = () => {
    let confidence = 80; // Base confidence for seasonal recommendations
    
    if (weatherCondition) confidence += 10;
    if (temperature) confidence += 5;
    if (humidity) confidence += 5;
    
    return Math.min(confidence, 100);
  };

  return (
    <div className="space-y-8">
      {/* Current Season Display */}
      {currentSeason && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            {currentSeason.icon}
            <div>
              <h3 className="text-xl font-bold text-gray-900">Current Season: {currentSeason.name}</h3>
              <p className="text-gray-600">{currentSeason.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-white p-3 rounded-lg">
              <span className="text-sm font-medium text-gray-500">Temperature</span>
              <p className="font-semibold text-gray-900">{currentSeason.characteristics.temperature}</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <span className="text-sm font-medium text-gray-500">Humidity</span>
              <p className="font-semibold text-gray-900">{currentSeason.characteristics.humidity}</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <span className="text-sm font-medium text-gray-500">Mood</span>
              <p className="font-semibold text-gray-900">{currentSeason.characteristics.mood}</p>
            </div>
          </div>
        </div>
      )}

      {/* Season Selection Override */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Choose a different season (optional)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {seasons.map(season => (
            <button
              key={season.id}
              onClick={() => setCurrentSeason(season)}
              className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${
                currentSeason?.id === season.id
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 hover:border-amber-300 text-gray-700'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                {season.icon}
                <span className="font-medium">{season.name}</span>
                <span className="text-xs text-gray-500">{season.months}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Weather Conditions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Cloud className="w-5 h-5 mr-2" />
          Current Weather
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {weatherConditions.map(weather => (
            <button
              key={weather.id}
              onClick={() => setWeatherCondition(weather)}
              className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                weatherCondition?.id === weather.id
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 hover:border-amber-300 text-gray-700'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                {weather.icon}
                <span className="text-sm font-medium">{weather.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Temperature */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Thermometer className="w-5 h-5 mr-2" />
          Temperature Range
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {temperatures.map(temp => (
            <button
              key={temp.id}
              onClick={() => setTemperature(temp)}
              className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                temperature?.id === temp.id
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 hover:border-amber-300 text-gray-700'
              }`}
            >
              <div className="text-sm font-medium capitalize">{temp.id}</div>
              <div className="text-xs text-gray-500">{temp.range}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Humidity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Droplets className="w-5 h-5 mr-2" />
          Humidity Level
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {humidityLevels.map(hum => (
            <button
              key={hum.id}
              onClick={() => setHumidity(hum)}
              className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                humidity?.id === hum.id
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 hover:border-amber-300 text-gray-700'
              }`}
            >
              <div className="text-sm font-medium capitalize">{hum.id} Humidity</div>
              <div className="text-xs text-gray-500">{hum.range}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={generateSeasonalRecommendation}
          disabled={!currentSeason}
          className="px-8 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Get Season-Perfect Recommendations
        </button>
      </div>
    </div>
  );
};

export default SeasonalRecommender;
