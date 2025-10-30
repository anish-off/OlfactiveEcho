import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../api/api';

const FilterPanel = ({ onFilterChange, initialFilters = {}, showAsModal = false, onClose }) => {
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    brands: false,
    gender: true,
    scentFamily: false,
    seasons: false,
    occasions: false,
    longevity: false,
    sillage: false,
    rating: true
  });

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/perfumes/filters/options');
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (filterType, value, isMulti = true) => {
    let newFilters = { ...activeFilters };

    if (isMulti) {
      const currentValues = newFilters[filterType] || [];
      if (currentValues.includes(value)) {
        newFilters[filterType] = currentValues.filter(v => v !== value);
        if (newFilters[filterType].length === 0) {
          delete newFilters[filterType];
        }
      } else {
        newFilters[filterType] = [...currentValues, value];
      }
    } else {
      if (newFilters[filterType] === value) {
        delete newFilters[filterType];
      } else {
        newFilters[filterType] = value;
      }
    }

    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (min, max) => {
    let newFilters = { ...activeFilters };
    if (min) newFilters.minPrice = min;
    else delete newFilters.minPrice;
    
    if (max) newFilters.maxPrice = max;
    else delete newFilters.maxPrice;

    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFilterChange({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).filter(key => 
      key !== 'sortBy' && key !== 'sortOrder' && key !== 'page'
    ).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BF7C2A]"></div>
      </div>
    );
  }

  const FilterSection = ({ title, section, children }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {expandedSections[section] ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {expandedSections[section] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const content = (
    <div className={showAsModal ? "h-full flex flex-col" : ""}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#8C501B]" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {getActiveFilterCount() > 0 && (
            <span className="bg-[#BF7C2A] text-white text-xs px-2 py-0.5 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear all
            </button>
          )}
          {showAsModal && onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      <div className={`${showAsModal ? 'flex-1 overflow-y-auto' : ''} bg-white`}>
        {/* Price Range */}
        <FilterSection title="Price Range" section="price">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={activeFilters.minPrice || ''}
                onChange={(e) => handlePriceChange(e.target.value, activeFilters.maxPrice)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BF7C2A] focus:border-transparent"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={activeFilters.maxPrice || ''}
                onChange={(e) => handlePriceChange(activeFilters.minPrice, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BF7C2A] focus:border-transparent"
              />
            </div>
            <div className="text-xs text-gray-500">
              Range: ₹{filterOptions?.priceRange?.min || 0} - ₹{filterOptions?.priceRange?.max || 10000}
            </div>
          </div>
        </FilterSection>

        {/* Rating */}
        <FilterSection title="Minimum Rating" section="rating">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => handleFilterChange('rating', rating, false)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  activeFilters.rating === rating
                    ? 'bg-amber-50 border-2 border-[#BF7C2A]'
                    : 'border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm">& up</span>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Gender */}
        <FilterSection title="Gender" section="gender">
          <div className="space-y-2">
            {filterOptions?.genders?.map((gender) => (
              <label
                key={gender.name}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={activeFilters.gender?.includes(gender.name) || false}
                  onChange={() => handleFilterChange('gender', gender.name)}
                  className="w-4 h-4 text-[#BF7C2A] border-gray-300 rounded focus:ring-[#BF7C2A]"
                />
                <span className="text-sm text-gray-700">{gender.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Brands */}
        <FilterSection title="Brands" section="brands">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filterOptions?.brands?.slice(0, 15).map((brand) => (
              <label
                key={brand.name}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={activeFilters.brand?.includes(brand.name) || false}
                  onChange={() => handleFilterChange('brand', brand.name)}
                  className="w-4 h-4 text-[#BF7C2A] border-gray-300 rounded focus:ring-[#BF7C2A]"
                />
                <span className="text-sm text-gray-700 flex-1">{brand.name}</span>
                <span className="text-xs text-gray-500">({brand.count})</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Scent Family */}
        <FilterSection title="Scent Family" section="scentFamily">
          <div className="space-y-2">
            {filterOptions?.scentFamilies?.map((family) => (
              <label
                key={family.name}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={activeFilters.scentFamily?.includes(family.name) || false}
                  onChange={() => handleFilterChange('scentFamily', family.name)}
                  className="w-4 h-4 text-[#BF7C2A] border-gray-300 rounded focus:ring-[#BF7C2A]"
                />
                <span className="text-sm text-gray-700 capitalize flex-1">
                  {family.name}
                </span>
                <span className="text-xs text-gray-500">({family.count})</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Seasons */}
        <FilterSection title="Seasons" section="seasons">
          <div className="flex flex-wrap gap-2">
            {filterOptions?.seasons?.map((season) => (
              <button
                key={season.name}
                onClick={() => handleFilterChange('seasons', season.name)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  activeFilters.seasons?.includes(season.name)
                    ? 'border-[#BF7C2A] bg-amber-50 text-[#8C501B]'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {season.label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Occasions */}
        <FilterSection title="Occasions" section="occasions">
          <div className="flex flex-wrap gap-2">
            {filterOptions?.occasions?.map((occasion) => (
              <button
                key={occasion.name}
                onClick={() => handleFilterChange('occasions', occasion.name)}
                className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-all ${
                  activeFilters.occasions?.includes(occasion.name)
                    ? 'border-[#BF7C2A] bg-amber-50 text-[#8C501B]'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {occasion.label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Longevity */}
        <FilterSection title="Longevity" section="longevity">
          <div className="space-y-2">
            {filterOptions?.longevity?.map((option) => (
              <label
                key={option.name}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="longevity"
                  checked={activeFilters.longevity === option.name}
                  onChange={() => handleFilterChange('longevity', option.name, false)}
                  className="w-4 h-4 text-[#BF7C2A] border-gray-300 focus:ring-[#BF7C2A]"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Sillage */}
        <FilterSection title="Sillage" section="sillage">
          <div className="space-y-2">
            {filterOptions?.sillage?.map((option) => (
              <label
                key={option.name}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="sillage"
                  checked={activeFilters.sillage === option.name}
                  onChange={() => handleFilterChange('sillage', option.name, false)}
                  className="w-4 h-4 text-[#BF7C2A] border-gray-300 focus:ring-[#BF7C2A]"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Stock */}
        <div className="p-4 border-b border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={activeFilters.inStock === 'true'}
              onChange={() => handleFilterChange('inStock', 'true', false)}
              className="w-4 h-4 text-[#BF7C2A] border-gray-300 rounded focus:ring-[#BF7C2A]"
            />
            <span className="text-sm font-medium text-gray-700">Show Only In Stock</span>
          </label>
        </div>
      </div>
    </div>
  );

  if (showAsModal) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {content}
    </div>
  );
};

export default FilterPanel;
