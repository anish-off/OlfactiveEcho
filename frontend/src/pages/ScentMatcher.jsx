import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PersonalityQuiz from '../components/scent-matcher/PersonalityQuiz';
import OccasionRecommender from '../components/scent-matcher/OccasionRecommender';
import SeasonalRecommender from '../components/scent-matcher/SeasonalRecommender';
import ScentJourneyMapping from '../components/scent-matcher/ScentJourneyMapping';
import { 
  Brain, 
  Calendar, 
  CloudSun, 
  Map, 
  Sparkles, 
  Target,
  ChevronRight,
  Star,
  Heart,
  TrendingUp
} from 'lucide-react';

const ScentMatcher = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personality');
  const [recommendations, setRecommendations] = useState({});
  const [userProfile, setUserProfile] = useState(null);

  const tabs = [
    {
      id: 'personality',
      name: 'Personality Match',
      icon: <Brain className="w-5 h-5" />,
      description: 'Find fragrances that match your personality',
      component: PersonalityQuiz,
      color: 'blue'
    },
    {
      id: 'occasion',
      name: 'Occasion Finder',
      icon: <Calendar className="w-5 h-5" />,
      description: 'Perfect scents for every moment',
      component: OccasionRecommender,
      color: 'green'
    },
    {
      id: 'seasonal',
      name: 'Seasonal Guide',
      icon: <CloudSun className="w-5 h-5" />,
      description: 'Weather-perfect recommendations',
      component: SeasonalRecommender,
      color: 'orange'
    },
    {
      id: 'journey',
      name: 'Scent Journey',
      icon: <Map className="w-5 h-5" />,
      description: 'Track your fragrance evolution',
      component: ScentJourneyMapping,
      color: 'purple'
    }
  ];

  const handleRecommendation = (type, data) => {
    setRecommendations(prev => ({
      ...prev,
      [type]: data
    }));
  };

  const getTabColor = (color, isActive) => {
    const colors = {
      blue: isActive ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 hover:border-amber-300',
      green: isActive ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 hover:border-amber-300',
      orange: isActive ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 hover:border-amber-300',
      purple: isActive ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 hover:border-amber-300'
    };
    return colors[color];
  };

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full">
                <Sparkles className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              AI Scent Matching
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Discover your perfect fragrance with intelligent recommendations
            </p>
            <div className="flex justify-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Personality Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Occasion Matching</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Journey Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                getTabColor(tab.color, activeTab === tab.id)
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  activeTab === tab.id 
                    ? `bg-${tab.color}-100` 
                    : 'bg-gray-100'
                }`}>
                  {tab.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{tab.name}</h3>
                  <p className="text-sm text-gray-600">{tab.description}</p>
                  {activeTab === tab.id && (
                    <div className="flex items-center mt-2 text-sm font-medium">
                      <span>Active</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Recommendations Summary */}
        {Object.keys(recommendations).length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-amber-200 mb-8 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-amber-500" />
              Your Personalized Recommendations
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.personality && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-900 mb-2 flex items-center">
                    Personality Match
                    {recommendations.personality.source === 'api' && (
                      <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">Real Data</span>
                    )}
                  </h4>
                  <p className="text-sm text-amber-700">
                    {recommendations.personality.archetype?.type}: {recommendations.personality.confidence}% confidence
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    {recommendations.personality.topFamilies && Array.isArray(recommendations.personality.topFamilies) ? 
                      `Top families: ${recommendations.personality.topFamilies.slice(0, 2).map(f => f.family || f).join(', ')}` :
                      'Analyzing preferences...'}
                  </p>
                  {recommendations.personality.recommendations && recommendations.personality.recommendations.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-amber-800">Recommended:</p>
                      <p className="text-xs text-amber-700">
                        {recommendations.personality.recommendations[0]?.perfume?.name || 
                         recommendations.personality.recommendations[0]?.fragrance?.name}
                      </p>
                      {recommendations.personality.recommendations[0]?.perfume?.price && (
                        <p className="text-xs text-amber-600">
                          ₹{recommendations.personality.recommendations[0].perfume.price}
                        </p>
                      )}
                      {recommendations.personality.metadata && (
                        <p className="text-xs text-amber-500 mt-1">
                          {recommendations.personality.metadata.totalProducts} products analyzed
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {recommendations.occasion && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-900 mb-2">Occasion Perfect</h4>
                  <p className="text-sm text-amber-700">
                    Best for: {recommendations.occasion.occasion?.title || recommendations.occasion.occasion?.name}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    {recommendations.occasion.recommendations?.length || 0} matches found
                  </p>
                  {recommendations.occasion.confidence && (
                    <p className="text-xs text-amber-600 mt-1">
                      Confidence: {recommendations.occasion.confidence}%
                    </p>
                  )}
                </div>
              )}
              
              {recommendations.seasonal && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-900 mb-2">Season Match</h4>
                  <p className="text-sm text-amber-700">
                    Perfect for {recommendations.seasonal.season?.name}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Confidence: {recommendations.seasonal.confidence}%
                  </p>
                  {recommendations.seasonal.recommendations && recommendations.seasonal.recommendations.length > 0 && (
                    <p className="text-xs text-amber-700 mt-1">
                      Try: {recommendations.seasonal.recommendations[0]?.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Detailed Results Section */}
            {(() => {
              const currentRecommendations = recommendations[activeTab];
              if (!currentRecommendations?.recommendations || !Array.isArray(currentRecommendations.recommendations)) {
                return null;
              }

              const tabNames = {
                personality: 'Personality-Based',
                occasion: 'Occasion-Perfect',
                seasonal: 'Season-Matched',
                journey: 'Journey'
              };

              return (
                <div className="mt-6 border-t border-amber-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">
                      Your Top {tabNames[activeTab] || 'Fragrance'} Matches
                    </h4>
                    <div className="flex items-center text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {currentRecommendations.source === 'api' ? 'AI-Powered Recommendations' : 'Curated Selection'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentRecommendations.recommendations.slice(0, 6).map((rec, index) => (
                    <div key={rec.id || index} className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-gray-900 text-sm">
                          {rec.perfume?.name || rec.fragrance?.name}
                        </h5>
                        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full whitespace-nowrap">
                          {rec.matchPercentage || Math.round(rec.score)}% match
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {rec.perfume?.brand?.name || rec.perfume?.brand || rec.fragrance?.brand?.name || rec.fragrance?.brand || 'Unknown Brand'}
                      </p>
                      
                      {/* Display main accords or notes */}
                      {(() => {
                        const notes = rec.perfume?.notes || rec.fragrance?.notes;
                        const mainAccords = rec.perfume?.main_accords || rec.fragrance?.main_accords;
                        
                        // Handle notes array
                        if (notes && Array.isArray(notes)) {
                          return (
                            <div className="mb-2">
                              <p className="text-xs text-gray-500">
                                {notes.slice(0, 3).join(' • ')}
                              </p>
                            </div>
                          );
                        }
                        
                        // Handle main_accords array
                        if (mainAccords && Array.isArray(mainAccords)) {
                          return (
                            <div className="mb-2">
                              <p className="text-xs text-gray-500">
                                {mainAccords.slice(0, 3).map(accord => accord.name || accord).join(' • ')}
                              </p>
                            </div>
                          );
                        }
                        
                        return null;
                      })()}
                      
                      {rec.reasons && Array.isArray(rec.reasons) && (
                        <div className="mb-2">
                          <p className="text-xs text-amber-700 italic">
                            {rec.reasons.slice(0, 2).join(', ')}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-amber-600">
                          ₹{rec.perfume?.price || rec.fragrance?.price}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          {rec.perfume?.stock > 0 ? (
                            <span className="text-green-600">In Stock</span>
                          ) : (
                            <span className="text-red-500">Out of Stock</span>
                          )}
                        </div>
                      </div>
                      
                      {rec.occasions && Array.isArray(rec.occasions) && (
                        <div className="mt-2 pt-2 border-t border-amber-100">
                          <p className="text-xs text-gray-500">
                            Perfect for: {rec.occasions.slice(0, 2).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* AI Confidence Explanation */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="text-sm font-medium text-blue-900 mb-1">
                    How we calculate confidence ({currentRecommendations.confidence}%)
                  </h5>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>• Selection criteria and preference analysis</p>
                    <p>• Real product availability in our database</p>
                    <p>• Match with current stock and pricing</p>
                    {currentRecommendations.metadata?.userExperience === 'returning' && (
                      <p>• Your previous purchase history</p>
                    )}
                  </div>
                </div>
              </div>
              );
            })()}
            
            {/* Fallback/Error Display */}
            {recommendations.personality && recommendations.personality.source !== 'api' && (
              <div className="mt-6 border-t border-amber-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Sample Recommendations</h4>
                  <div className="flex items-center text-sm text-amber-600">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                    {recommendations.personality.source === 'fallback' ? 'API unavailable - showing samples' : 'Local analysis'}
                  </div>
                </div>
                
                {recommendations.personality.apiError && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      API Error: {recommendations.personality.apiError}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.personality.recommendations?.slice(0, 3).map((rec, index) => (
                    <div key={rec.id || index} className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-100">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-gray-900">{rec.fragrance?.name}</h5>
                        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                          {rec.matchPercentage}% match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.fragrance?.brand?.name || rec.fragrance?.brand || 'Unknown Brand'}</p>
                      {/* Handle notes/main_accords for fallback recommendations */}
                      {(() => {
                        const notes = rec.fragrance?.notes;
                        const mainAccords = rec.fragrance?.main_accords;
                        
                        if (notes && Array.isArray(notes)) {
                          return (
                            <p className="text-xs text-gray-500 mb-2">
                              {notes.join(' • ')}
                            </p>
                          );
                        }
                        
                        if (mainAccords && Array.isArray(mainAccords)) {
                          return (
                            <p className="text-xs text-gray-500 mb-2">
                              {mainAccords.slice(0, 3).map(accord => accord.name || accord).join(' • ')}
                            </p>
                          );
                        }
                        
                        return null;
                      })()}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-amber-600">₹{rec.fragrance?.price}</span>
                        <span className="text-xs text-gray-500 capitalize">{rec.fragrance?.intensity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Component */}
        <div className="bg-white rounded-xl shadow-lg border border-amber-200 overflow-hidden">
          <div className="p-8">
            {ActiveComponent && (
              <ActiveComponent 
                onRecommendation={(data) => handleRecommendation(activeTab, data)}
                onComplete={(data) => handleRecommendation(activeTab, data)}
                userId={user?.id}
                userProfile={userProfile}
              />
            )}
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-600">
              Advanced personality profiling and scent preference analysis using machine learning algorithms.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Precision Matching</h3>
            <p className="text-gray-600">
              Multi-factor recommendations considering personality, occasion, weather, and personal journey.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Evolving Intelligence</h3>
            <p className="text-gray-600">
              Your recommendations improve over time as we learn more about your preferences and journey.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl p-8 text-center text-white shadow-lg">
          <Heart className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Found Your Perfect Scent?</h3>
          <p className="text-lg mb-6 text-white/90">
            Explore our curated collection and bring your recommendations to life
          </p>
          <button className="bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md">
            Shop Recommended Fragrances
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScentMatcher;