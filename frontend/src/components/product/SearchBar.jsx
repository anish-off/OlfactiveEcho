import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const SearchBar = ({ onSearch, placeholder = "Search perfumes, brands, notes..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions(null);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get('/perfumes/search/suggestions', {
          params: { q: query }
        });
        setSuggestions(response.data.suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'perfume') {
      navigate(`/product/${suggestion.id}`);
    } else if (suggestion.type === 'brand') {
      setQuery(suggestion.name);
      onSearch(suggestion.name);
    } else if (suggestion.type === 'family') {
      setQuery(suggestion.name);
      onSearch(suggestion.name);
    }
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions(null);
    onSearch('');
  };

  const totalSuggestions = suggestions
    ? (suggestions.perfumes?.length || 0) + 
      (suggestions.brands?.length || 0) + 
      (suggestions.families?.length || 0)
    : 0;

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-full focus:border-[#BF7C2A] focus:outline-none transition-all"
        />
        {loading && (
          <Loader className="absolute right-12 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && totalSuggestions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            <div className="max-h-96 overflow-y-auto">
              {/* Perfume Suggestions */}
              {suggestions.perfumes && suggestions.perfumes.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
                    Perfumes
                  </div>
                  {suggestions.perfumes.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      {suggestion.image && (
                        <img
                          src={suggestion.image}
                          alt={suggestion.name}
                          className="w-10 h-10 object-contain rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {suggestion.name}
                        </p>
                        <p className="text-xs text-gray-500">Perfume</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Brand Suggestions */}
              {suggestions.brands && suggestions.brands.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
                    Brands
                  </div>
                  {suggestions.brands.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {suggestion.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {suggestion.count} products
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Family Suggestions */}
              {suggestions.families && suggestions.families.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
                    Scent Families
                  </div>
                  {suggestions.families.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {suggestion.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {suggestion.count} products
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search All Button */}
            <div className="p-2 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => handleSearch()}
                className="w-full px-4 py-2 text-sm font-medium text-[#8C501B] hover:bg-white rounded-lg transition-colors"
              >
                Search for "{query}"
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
