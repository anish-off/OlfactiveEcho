import React, { useState } from 'react';
import { Search, Loader, Star } from 'lucide-react';

const PerfumeFinder = () => {
  const [question, setQuestion] = useState('Find perfumes with vanilla notes');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchPerfumes = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    searchPerfumes();
  };

  const parsePerfumes = (answer) => {
    if (!answer) return [];
    
    // Extract perfume information from the answer text
    const lines = answer.split('\n');
    const perfumes = [];
    
    lines.forEach(line => {
      if (line.includes('*') && (line.toLowerCase().includes('vanilla') || line.includes(':'))) {
        const cleanLine = line.replace(/^\*\s*/, '').trim();
        if (cleanLine && !cleanLine.startsWith('These are')) {
          const [name, ...descParts] = cleanLine.split(':');
          const description = descParts.join(':').trim();
          
          if (name && description) {
            perfumes.push({
              name: name.trim(),
              description: description
            });
          }
        }
      }
    });
    
    return perfumes;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Perfume Finder</h1>
        <p className="text-gray-600">Search for perfumes based on notes, brands, or characteristics</p>
      </div>

      <div className="mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              placeholder="e.g., Find perfumes with vanilla notes, woody fragrances, summer scents..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !question.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">
            <strong>Error:</strong> {error}
          </p>
          <p className="text-sm text-red-600 mt-1">
            Make sure your API server is running on http://127.0.0.1:5000
          </p>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Search Results</h2>
          </div>

          {/* Raw Answer Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Full Response:</h3>
            <p className="text-gray-700 whitespace-pre-line">{results.answer}</p>
          </div>

          {/* Parsed Perfumes Section */}
          {parsePerfumes(results.answer).length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Found Perfumes:</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {parsePerfumes(results.answer).map((perfume, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-2">{perfume.name}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{perfume.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Search Suggestions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">Try these searches:</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Find citrus perfumes',
                'Woody fragrances for men',
                'Fresh summer scents',
                'Oriental perfumes',
                'Long-lasting fragrances'
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setQuestion(suggestion)}
                  className="px-3 py-1 bg-white text-blue-700 text-sm rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {results === null && !loading && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Enter a search query to find perfumes</p>
        </div>
      )}
    </div>
  );
};

export default PerfumeFinder;