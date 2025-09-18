import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Heart, 
  Star, 
  MapPin, 
  Clock, 
  BarChart3,
  Target,
  Lightbulb,
  ArrowRight,
  Filter
} from 'lucide-react';

const ScentJourneyMapping = ({ userId, onJourneyUpdate }) => {
  const [journeyData, setJourneyData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [analysisType, setAnalysisType] = useState('evolution');
  const [preferences, setPreferences] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [predictions, setPredictions] = useState(null);

  // Mock data - in real implementation, fetch from backend
  useEffect(() => {
    loadJourneyData();
  }, [userId, selectedTimeframe]);

  const loadJourneyData = () => {
    // Simulate loading user's scent journey data
    const mockJourneyData = {
      startDate: '2024-01-01',
      totalPurchases: 12,
      totalSamples: 28,
      favoriteRating: 4.6,
      progressStats: {
        familiesExplored: 8,
        totalFamilies: 12,
        notesExplored: 45,
        totalNotes: 80,
        occasionsExplored: 15,
        totalOccasions: 20
      },
      monthlyData: [
        { month: '2024-01', purchases: 2, samples: 5, dominantFamily: 'fresh', confidence: 3.2 },
        { month: '2024-02', purchases: 1, samples: 3, dominantFamily: 'fresh', confidence: 3.5 },
        { month: '2024-03', purchases: 2, samples: 4, dominantFamily: 'floral', confidence: 3.8 },
        { month: '2024-04', purchases: 1, samples: 2, dominantFamily: 'floral', confidence: 4.0 },
        { month: '2024-05', purchases: 2, samples: 3, dominantFamily: 'woody', confidence: 4.2 },
        { month: '2024-06', purchases: 1, samples: 4, dominantFamily: 'woody', confidence: 4.3 },
        { month: '2024-07', purchases: 2, samples: 3, dominantFamily: 'oriental', confidence: 4.5 },
        { month: '2024-08', purchases: 1, samples: 4, dominantFamily: 'oriental', confidence: 4.6 }
      ]
    };

    const mockPreferences = [
      {
        period: 'Early 2024',
        dominantFamilies: ['fresh', 'citrus'],
        intensity: 'light',
        occasions: ['daily', 'work'],
        notes: ['bergamot', 'lemon', 'green tea'],
        confidence: 3.2
      },
      {
        period: 'Mid 2024',
        dominantFamilies: ['floral', 'fresh floral'],
        intensity: 'light-moderate',
        occasions: ['daily', 'date', 'work'],
        notes: ['jasmine', 'rose', 'lily'],
        confidence: 4.0
      },
      {
        period: 'Recent',
        dominantFamilies: ['woody', 'oriental'],
        intensity: 'moderate-strong',
        occasions: ['evening', 'special', 'date'],
        notes: ['sandalwood', 'amber', 'vanilla'],
        confidence: 4.6
      }
    ];

    const mockMilestones = [
      {
        date: '2024-02-15',
        type: 'first_love',
        title: 'Found Your First Love',
        description: 'Discovered preference for floral fragrances',
        fragrance: 'Spring Blossom',
        significance: 'This marked your transition from fresh to floral scents',
        impact: 'high'
      },
      {
        date: '2024-04-10',
        type: 'confidence_boost',
        title: 'Confidence Milestone',
        description: 'Reached 4.0+ confidence in scent preferences',
        significance: 'Started exploring more complex compositions',
        impact: 'medium'
      },
      {
        date: '2024-06-20',
        type: 'family_explorer',
        title: 'Scent Family Explorer',
        description: 'Explored 5+ different fragrance families',
        significance: 'Developed sophisticated palate',
        impact: 'high'
      },
      {
        date: '2024-07-30',
        type: 'complexity_lover',
        title: 'Complexity Lover',
        description: 'Gravitated towards oriental and woody fragrances',
        significance: 'Preference evolution towards sophisticated scents',
        impact: 'high'
      }
    ];

    setJourneyData(mockJourneyData);
    setPreferences(mockPreferences);
    setMilestones(mockMilestones);
    generatePredictions(mockJourneyData);
  };

  const generatePredictions = (data) => {
    const latestTrends = data.monthlyData.slice(-3);
    const dominantFamilies = latestTrends.map(m => m.dominantFamily);
    const averageConfidence = latestTrends.reduce((acc, m) => acc + m.confidence, 0) / latestTrends.length;

    const mockPredictions = {
      nextPreferences: {
        families: ['gourmand', 'spicy oriental'],
        intensity: 'strong',
        confidence: 85,
        reasoning: 'Based on your evolution towards complex, warm scents'
      },
      seasonalAdaptation: {
        spring: 'May explore fresh orientals',
        summer: 'Likely to prefer woody aquatics',
        autumn: 'Strong preference for spicy orientals expected',
        winter: 'Will gravitate towards rich gourmands'
      },
      growth_areas: [
        'Ready to explore niche fragrances',
        'Perfect time to try oud-based scents',
        'Consider exploring unisex compositions'
      ],
      risk_tolerance: averageConfidence > 4.0 ? 'high' : 'medium'
    };

    setPredictions(mockPredictions);
  };

  const timeframes = [
    { id: '3months', label: '3 Months', description: 'Recent journey' },
    { id: '6months', label: '6 Months', description: 'Current trends' },
    { id: '1year', label: '1 Year', description: 'Full evolution' },
    { id: 'all', label: 'All Time', description: 'Complete journey' }
  ];

  const analysisTypes = [
    { id: 'evolution', name: 'Preference Evolution', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'milestones', name: 'Journey Milestones', icon: <Star className="w-5 h-5" /> },
    { id: 'predictions', name: 'Future Predictions', icon: <Target className="w-5 h-5" /> },
    { id: 'insights', name: 'Personal Insights', icon: <Lightbulb className="w-5 h-5" /> }
  ];

  const getMilestoneIcon = (type) => {
    switch (type) {
      case 'first_love': return <Heart className="w-5 h-5 text-red-500" />;
      case 'confidence_boost': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'family_explorer': return <MapPin className="w-5 h-5 text-blue-500" />;
      case 'complexity_lover': return <Star className="w-5 h-5 text-purple-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 4.5) return 'text-green-600 bg-green-50';
    if (confidence >= 4.0) return 'text-amber-600 bg-blue-50';
    if (confidence >= 3.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  const renderEvolutionAnalysis = () => (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Scent Journey Progress</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Families Explored</span>
              <span className="text-lg font-bold text-purple-600">
                {journeyData.progressStats.familiesExplored}/{journeyData.progressStats.totalFamilies}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${(journeyData.progressStats.familiesExplored / journeyData.progressStats.totalFamilies) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Notes Discovered</span>
              <span className="text-lg font-bold text-amber-600">
                {journeyData.progressStats.notesExplored}/{journeyData.progressStats.totalNotes}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full"
                style={{ width: `${(journeyData.progressStats.notesExplored / journeyData.progressStats.totalNotes) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Confidence Level</span>
              <span className="text-lg font-bold text-green-600">{journeyData.favoriteRating}/5.0</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(journeyData.favoriteRating / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Evolution Timeline */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preference Evolution</h3>
        
        <div className="space-y-4">
          {preferences.map((period, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(period.confidence)}`}>
                {period.confidence}/5.0
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{period.period}</h4>
                  <span className="text-sm text-gray-500 capitalize">{period.intensity} intensity</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Families:</span>
                    <div className="mt-1">
                      {period.dominantFamilies.map(family => (
                        <span key={family} className="inline-block bg-amber-100 text-blue-800 px-2 py-1 rounded mr-1 mb-1">
                          {family}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600">Occasions:</span>
                    <div className="mt-1">
                      {period.occasions.map(occasion => (
                        <span key={occasion} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-1 mb-1">
                          {occasion}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600">Key Notes:</span>
                    <div className="mt-1">
                      {period.notes.map(note => (
                        <span key={note} className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded mr-1 mb-1">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {index < preferences.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-400 mt-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMilestonesAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Journey Milestones</h3>
        
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-l-4 ${
                milestone.impact === 'high' ? 'border-l-red-500 bg-red-50' :
                milestone.impact === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                'border-l-gray-500 bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                {getMilestoneIcon(milestone.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(milestone.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-2">{milestone.description}</p>
                  
                  {milestone.fragrance && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Featured Fragrance:</span> {milestone.fragrance}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-600 italic">{milestone.significance}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPredictionsAnalysis = () => (
    <div className="space-y-6">
      {predictions && (
        <>
          {/* Next Preferences */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Predicted Next Preferences
            </h3>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">Likely Families</span>
                  <span className="text-sm font-medium text-green-600">
                    {predictions.nextPreferences.confidence}% confidence
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {predictions.nextPreferences.families.map(family => (
                    <span key={family} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {family}
                    </span>
                  ))}
                </div>
                
                <p className="text-sm text-gray-600 italic">{predictions.nextPreferences.reasoning}</p>
              </div>
            </div>
          </div>

          {/* Seasonal Predictions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Adaptation Forecast</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(predictions.seasonalAdaptation).map(([season, prediction]) => (
                <div key={season} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 capitalize mb-2">{season}</h4>
                  <p className="text-sm text-gray-600">{prediction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Areas */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Growth Areas</h3>
            
            <div className="space-y-3">
              {predictions.growth_areas.map((area, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                  <span className="text-gray-700">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderInsightsAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Fragrance Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Your Journey Pattern</h4>
              <p className="text-sm text-gray-600">
                You've shown a clear evolution from fresh, light fragrances to more complex, 
                sophisticated compositions. This indicates developing confidence and 
                sophisticated palate.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Risk Profile</h4>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  predictions?.risk_tolerance === 'high' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {predictions?.risk_tolerance || 'Medium'} Risk Tolerance
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {predictions?.risk_tolerance === 'high' 
                  ? 'You\'re ready to explore bold, niche, and unconventional fragrances.'
                  : 'You prefer to explore new scents gradually, building confidence step by step.'
                }
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Signature Style</h4>
              <p className="text-sm text-gray-600">
                Your recent preferences suggest you're developing a signature style around 
                warm, sophisticated fragrances with good projection and complexity.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Collection Strategy</h4>
              <p className="text-sm text-gray-600">
                Consider building a curated collection of 5-7 fragrances covering different 
                moods and occasions, focusing on quality over quantity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!journeyData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your scent journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Scent Journey</h2>
        <p className="text-gray-600">Track your fragrance evolution and discover what's next</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Timeframe Selection */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timeframes.map(timeframe => (
              <option key={timeframe.id} value={timeframe.id}>
                {timeframe.label} - {timeframe.description}
              </option>
            ))}
          </select>
        </div>

        {/* Analysis Type */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Analysis Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {analysisTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setAnalysisType(type.id)}
                className={`p-2 rounded-lg border text-center transition-all duration-200 ${
                  analysisType === type.id
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 hover:border-amber-300 text-gray-700'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  {type.icon}
                  <span className="text-xs font-medium">{type.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Content */}
      <div>
        {analysisType === 'evolution' && renderEvolutionAnalysis()}
        {analysisType === 'milestones' && renderMilestonesAnalysis()}
        {analysisType === 'predictions' && renderPredictionsAnalysis()}
        {analysisType === 'insights' && renderInsightsAnalysis()}
      </div>
    </div>
  );
};

export default ScentJourneyMapping;
