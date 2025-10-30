import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, Filter, Grid, List, X, Zap } from 'lucide-react';
import { listPerfumes } from '../api/perfume';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useWishlist } from '../context/WishlistContext';
import { getImageWithFallbacks, getProxiedImageUrl } from '../utils/imageUtils';
import { addDiscountData, mockDiscountProducts } from '../utils/discountUtils';
import Footer from '../components/Footer';
import DiscountBanner from '../components/discount/DiscountBanner';
import DiscountProductSection from '../components/discount/DiscountProductSection';

const ProductsAll = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toggle: toggleWishlist, has } = useWishlist();

  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedFragranceFamily, setSelectedFragranceFamily] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]); // Default price range

  // Get filter parameters from URL
  const genderFilter = searchParams.get('gender');
  const familyFilter = searchParams.get('family');
  const brandFilter = searchParams.get('brand');
  const urlSearchTerm = searchParams.get('search');

  // Sync URL search param with local search term
  useEffect(() => {
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [urlSearchTerm]);

  // Utility function to clean perfume names by removing gender specifications
  const cleanPerfumeName = (name) => {
    if (!name) return '';
    return name
      .replace(/ for women and men$/i, '')
      .replace(/ for women$/i, '')
      .replace(/ for men$/i, '')
      .replace(/ - Women$/i, '')
      .replace(/ - Men$/i, '')
      .replace(/ \(Women\)$/i, '')
      .replace(/ \(Men\)$/i, '')
      .trim();
  };

  // Load products on component mount
  useEffect(() => {
    const fetchPerfumes = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch all products by setting a high limit
        const data = await listPerfumes({ limit: 200 });
        
        // Handle both old array format and new object format for backward compatibility
        const perfumesArray = Array.isArray(data) ? data : (data.perfumes || []);
        
        console.log('Fetched perfumes:', perfumesArray.length, 'perfumes');
        console.log('First perfume:', perfumesArray[0]);
        
        // Add discount data to perfumes
        const perfumesWithDiscounts = addDiscountData(perfumesArray);
        console.log('Perfumes with discounts:', perfumesWithDiscounts.length);
        console.log('Sample perfume with discount:', perfumesWithDiscounts.find(p => p.discountType));
        
        setPerfumes(perfumesWithDiscounts);
      } catch (err) {
        console.error('Error fetching perfumes:', err);
        setError('Failed to load perfumes');
      } finally { 
        setLoading(false); 
      }
    };

    fetchPerfumes();
  }, []);

  // Generate categories based on available perfumes
  const categories = useMemo(() => {
    const counts = perfumes.reduce((acc, p) => { 
      const c = p.category || 'uncategorized'; 
      acc[c] = (acc[c] || 0) + 1; 
      return acc; 
    }, {});
    
    const list = Object.entries(counts).map(([id, count]) => ({ 
      id, 
      name: id.charAt(0).toUpperCase() + id.slice(1), 
      count 
    }));
    
    list.sort((a, b) => b.count - a.count);
    
    return [{ id: 'all', name: 'All Perfumes', count: perfumes.length }, ...list];
  }, [perfumes]);

  // Generate genders based on available perfumes
  const genders = useMemo(() => {
    const counts = perfumes.reduce((acc, p) => { 
      const g = p.gender || 'unisex'; 
      acc[g] = (acc[g] || 0) + 1; 
      return acc; 
    }, {});
    
    const list = Object.entries(counts).map(([id, count]) => ({ 
      id, 
      name: id === 'male' ? 'Men' : id === 'female' ? 'Women' : 'Unisex', 
      count 
    }));
    
    list.sort((a, b) => b.count - a.count);
    
    return [{ id: 'all', name: 'All Genders', count: perfumes.length }, ...list];
  }, [perfumes]);

  // Generate fragrance families based on main accords
  const fragranceFamilies = useMemo(() => {
    const commonFamilies = ['citrus', 'floral', 'oriental', 'woody', 'fresh', 'vanilla', 'fruity', 'spicy', 'aromatic', 'green'];
    const counts = {};
    
    perfumes.forEach(p => {
      if (p.main_accords && Array.isArray(p.main_accords)) {
        p.main_accords.forEach(accord => {
          const name = accord.name?.toLowerCase();
          if (commonFamilies.includes(name)) {
            counts[name] = (counts[name] || 0) + 1;
          }
        });
      }
    });
    
    const list = Object.entries(counts).map(([id, count]) => ({ 
      id, 
      name: id.charAt(0).toUpperCase() + id.slice(1), 
      count 
    }));
    
    list.sort((a, b) => b.count - a.count);
    
    return [{ id: 'all', name: 'All Families', count: perfumes.length }, ...list];
  }, [perfumes]);

  // Filter perfumes based on URL parameters and local filters
  const filteredPerfumes = useMemo(() => {
    let filtered = perfumes;

    // Apply URL parameter filters first
    if (genderFilter) {
      filtered = filtered.filter(p => p.gender === genderFilter);
    }
    
    if (familyFilter) {
      filtered = filtered.filter(p => p.scentFamily?.toLowerCase() === familyFilter.toLowerCase());
    }

    if (brandFilter) {
      filtered = filtered.filter(p => {
        const brandName = typeof p.brand === 'object' ? p.brand?.name : p.brand;
        return brandName?.toLowerCase().includes(brandFilter.toLowerCase());
      });
    }

    // Then apply category filter if not 'all'
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Apply gender filter if not 'all'
    if (selectedGender !== 'all') {
      filtered = filtered.filter(p => p.gender === selectedGender);
    }

    // Apply fragrance family filter if not 'all'
    if (selectedFragranceFamily !== 'all') {
      filtered = filtered.filter(p => {
        if (!p.main_accords || !Array.isArray(p.main_accords)) return false;
        return p.main_accords.some(accord => accord.name?.toLowerCase() === selectedFragranceFamily.toLowerCase());
      });
    }

    // Apply price range filter
    if (priceRange && priceRange.length === 2) {
      filtered = filtered.filter(p => {
        const price = p.salePrice || p.price || 0;
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    // Apply search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => {
        const name = cleanPerfumeName(p.name)?.toLowerCase() || '';
        const brand = typeof p.brand === 'object' ? p.brand?.name?.toLowerCase() : p.brand?.toLowerCase() || '';
        return name.includes(term) || brand.includes(term);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name?.localeCompare(b.name) || 0;
        case '-name':
          return b.name?.localeCompare(a.name) || 0;
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case '-price':
          return (b.price || 0) - (a.price || 0);
        case '-createdAt':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'createdAt':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [perfumes, selectedCategory, selectedGender, selectedFragranceFamily, genderFilter, familyFilter, brandFilter, searchTerm, sortBy, priceRange]);

  // Prepare discount products
  const flashSaleProducts = useMemo(() => {
    const flashProducts = filteredPerfumes.filter(perfume => 
      perfume.discountType === 'flash' && perfume.discountPercentage >= 50
    ).slice(0, 8);
    console.log('Flash sale products found:', flashProducts.length);
    console.log('Sample flash product:', flashProducts[0]);
    return flashProducts;
  }, [filteredPerfumes]);

  const seasonalProducts = useMemo(() => {
    const seasonProducts = filteredPerfumes.filter(perfume => 
      perfume.discountType === 'seasonal' && perfume.discountPercentage >= 20
    ).slice(0, 6);
    console.log('Seasonal products found:', seasonProducts.length);
    console.log('Sample seasonal product:', seasonProducts[0]);
    return seasonProducts;
  }, [filteredPerfumes]);

  // Update page title based on filters
  const getPageTitle = () => {
    if (genderFilter && familyFilter) {
      return `${familyFilter.charAt(0).toUpperCase() + familyFilter.slice(1)} Fragrances for ${genderFilter.charAt(0).toUpperCase() + genderFilter.slice(1)}`;
    } else if (genderFilter) {
      return `${genderFilter.charAt(0).toUpperCase() + genderFilter.slice(1)}'s Fragrances`;
    } else if (familyFilter) {
      return `${familyFilter.charAt(0).toUpperCase() + familyFilter.slice(1)} Collection`;
    } else if (brandFilter) {
      return `${brandFilter} Fragrances`;
    }
    return 'All Fragrances';
  };

  const getPageSubtitle = () => {
    if (genderFilter || familyFilter || brandFilter) {
      return `Explore our curated selection of ${filteredPerfumes.length} premium fragrances`;
    }
    return 'Explore our complete collection of premium perfumes from the world\'s most prestigious brands';
  };

  const handleProductClick = perfume => {
    navigate(`/product/${perfume._id}`, { state: { perfume } });
  };

  const toggleFavorite = (e, perfumeId) => {
    e.stopPropagation();
    const already = has(perfumeId);
    toggleWishlist(perfumeId);
    toast.success(already ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      // Search is automatically applied via useMemo
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedGender('all');
    setSelectedFragranceFamily('all');
    setSearchTerm('');
    setPriceRange([0, 10000]);
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedGender !== 'all' || selectedFragranceFamily !== 'all' || searchTerm.trim() !== '' || (priceRange[0] !== 0 || priceRange[1] !== 10000);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
        {/* Compact Discount Banner */}
        <div className="mb-6">
          <DiscountBanner
            title="Great Fragrance Festival"
            subtitle="Up to 70% OFF + Extra 10% OFF on Premium Perfumes"
            endDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} // 7 days from now
            theme="sale"
            compact={true}
          />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {getPageTitle()}
            {!genderFilter && !familyFilter && !brandFilter && (
              <span className="bg-gradient-to-r from-[#D9A036] to-[#BF7C2A] bg-clip-text text-transparent"> Collection</span>
            )}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {getPageSubtitle()}
          </p>
          
          {/* Show filter indicator if filters are applied */}
          {(genderFilter || familyFilter || brandFilter) && (
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center px-4 py-2 bg-[#c69a2d]/10 text-[#c69a2d] rounded-full text-sm font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtered Results ({filteredPerfumes.length} products)
              </div>
            </div>
          )}
        </div>

        {/* Main Layout with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:w-80 lg:flex-shrink-0">
            <div className="sticky top-6 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
              {/* Search Section */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Search className="h-5 w-5 text-[#c69a2d]" />
                  Search
                </h3>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search fragrances..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleSearch}
                    className="pl-12 pr-4 py-3 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c69a2d] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters Section */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="h-5 w-5 text-[#c69a2d]" />
                    Filters
                  </h3>
                  {hasActiveFilters && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <X className="h-3 w-3" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Active Filters Count */}
                {hasActiveFilters && (
                  <div className="mb-4">
                    <span className="bg-[#c69a2d]/10 text-[#c69a2d] text-xs font-medium px-3 py-1 rounded-full">
                      {filteredPerfumes.length} results
                    </span>
                  </div>
                )}

                {/* Gender Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Gender</label>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto filter-scrollbar">
                    {genders.map(gender => (
                      <button
                        key={gender.id}
                        onClick={() => setSelectedGender(gender.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                          selectedGender === gender.id
                            ? 'bg-gradient-to-r from-[#c69a2d] to-[#b8860b] text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-[#c69a2d]/5 hover:shadow-sm'
                        }`}
                      >
                        <span>{gender.name}</span>
                        <span className="text-xs opacity-75">({gender.count})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fragrance Family Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Fragrance Family</label>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto filter-scrollbar">
                    {fragranceFamilies.map(family => (
                      <button
                        key={family.id}
                        onClick={() => setSelectedFragranceFamily(family.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                          selectedFragranceFamily === family.id
                            ? 'bg-gradient-to-r from-[#c69a2d] to-[#b8860b] text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-[#c69a2d]/5 hover:shadow-sm'
                        }`}
                      >
                        <span>{family.name}</span>
                        <span className="text-xs opacity-75">({family.count})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Category</label>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto filter-scrollbar">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                          selectedCategory === category.id
                            ? 'bg-gradient-to-r from-[#c69a2d] to-[#b8860b] text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-[#c69a2d]/5 hover:shadow-sm'
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className="text-xs opacity-75">({category.count})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">Price Range</label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="text-sm"
                        />
                      </div>
                      <span className="text-gray-500">-</span>
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Max"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    
                    {/* Price Range Presets */}
                    <div className="space-y-2">
                      {[
                        { label: 'Under ₹1,000', range: [0, 1000] },
                        { label: '₹1,000 - ₹3,000', range: [1000, 3000] },
                        { label: '₹3,000 - ₹5,000', range: [3000, 5000] },
                        { label: '₹5,000 - ₹10,000', range: [5000, 10000] },
                        { label: 'Above ₹10,000', range: [10000, 50000] }
                      ].map(preset => (
                        <button
                          key={preset.label}
                          onClick={() => setPriceRange(preset.range)}
                          className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            priceRange[0] === preset.range[0] && priceRange[1] === preset.range[1]
                              ? 'bg-gradient-to-r from-[#c69a2d] to-[#b8860b] text-white shadow-md'
                              : 'bg-gray-50 text-gray-700 hover:bg-[#c69a2d]/5 hover:shadow-sm'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            {/* Featured Discount Sections */}
            {(flashSaleProducts.length > 0 || seasonalProducts.length > 0) && (
              <div className="relative mb-12">
                {/* Section Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c69a2d]/10 to-[#b8860b]/10 px-6 py-3 rounded-full border border-[#c69a2d]/30">
                    <Zap className="h-5 w-5 text-[#c69a2d]" />
                    <h2 className="text-xl font-bold text-gray-900">Special Offers</h2>
                    <Zap className="h-5 w-5 text-[#c69a2d]" />
                  </div>
                </div>

                <div className="grid gap-8 lg:gap-12">
                  {/* Flash Sale Section */}
                  {flashSaleProducts.length > 0 && (
                    <DiscountProductSection
                      title="⚡ Flash Sale"
                      subtitle="Limited time - up to 70% off on selected fragrances!"
                      products={flashSaleProducts}
                      saleEndTime={new Date(Date.now() + 6 * 60 * 60 * 1000)} // 6 hours from now
                      theme="flash"
                      showTimer={true}
                      maxVisible={4}
                    />
                  )}

                  {/* Seasonal Sale Section */}
                  {seasonalProducts.length > 0 && (
                    <DiscountProductSection
                      title="🌸 Seasonal Collection"
                      subtitle="Special prices on seasonal favorites"
                      products={seasonalProducts}
                      theme="seasonal"
                      showTimer={false}
                      maxVisible={3}
                    />
                  )}
                </div>

                {/* Section Divider */}
                <div className="mt-12 relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-6 py-2 text-sm text-gray-500 rounded-full border border-gray-300">
                      Browse All Products
                    </span>
                  </div>
                </div>
              </div>
            )}

        {/* Sort and View Controls */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Showing {filteredPerfumes.length} of {perfumes.length} fragrances
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="-name">Name Z-A</SelectItem>
                  <SelectItem value="price">Price Low-High</SelectItem>
                  <SelectItem value="-price">Price High-Low</SelectItem>
                  <SelectItem value="-createdAt">Newest First</SelectItem>
                  <SelectItem value="createdAt">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-gray-200">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        {loading && <div className="text-center py-8">Loading...</div>}
        {error && !loading && <div className="text-center py-8 text-[#a06800]">{error}</div>}

        {/* Products Grid */}
        {!loading && !error && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredPerfumes.map(perfume => (
              <motion.div
                key={perfume._id}
                onClick={() => handleProductClick(perfume)}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:scale-105 ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`relative overflow-hidden bg-white ${viewMode === 'list' ? 'w-1/3' : ''}`}>
                  <img
                    src={getProxiedImageUrl(getImageWithFallbacks(perfume))}
                    alt={cleanPerfumeName(perfume.name)}
                    className={`object-contain p-6 group-hover:scale-110 transition-transform duration-300 ${
                      viewMode === 'list' ? 'w-full h-40' : 'w-full h-64'
                    }`}
                    onError={e => {
                      // Try fallback without proxy if proxy fails
                      if (!e.target.src.includes('default-perfume.svg')) {
                        e.target.src = '/perfume-images/default-perfume.svg';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => toggleFavorite(e, perfume._id)}
                    aria-label={has(perfume._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    className={`inline-flex items-center justify-center h-10 w-10 absolute top-4 right-4 z-10 rounded-full backdrop-blur-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-white/30 hover:bg-white/40 ${has(perfume._id) ? 'text-[#c69a2d]' : 'text-white'}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={has(perfume._id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </button>
                </div>

                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[#c69a2d] bg-[#c69a2d]/10 px-2 py-1 rounded-full uppercase tracking-wide">
                      {perfume.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      {perfume.samplesAvailable !== false && (
                        <span className="text-xs font-medium text-[#c69a2d] bg-[#c69a2d]/10 px-2 py-1 rounded-full">
                          Sample Available
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-[#c69a2d] transition-colors">
                    {cleanPerfumeName(perfume.name)}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{(typeof perfume.brand === 'object' ? perfume.brand?.name : perfume.brand) || 'Olfactive Echo'}</p>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {perfume.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div />
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">₹{perfume.price}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Products */}
        {!loading && !error && filteredPerfumes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Filter className="h-16 w-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No fragrances found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-[#D9A036] to-[#BF7C2A] rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Can't Find Your Perfect Scent?</h2>
          <p className="text-xl mb-8 opacity-90">
            Get personalized recommendations from our fragrance experts
          </p>
          <button 
            onClick={() => navigate('/chatbot')}
            className="bg-white text-[#BF7C2A] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Personalized Advice
          </button>
        </div>
          </div> {/* End Right Content Area */}
        </div> {/* End Main Layout with Sidebar */}
      </div>
      <Footer />
    </>
  );
};

export default ProductsAll;