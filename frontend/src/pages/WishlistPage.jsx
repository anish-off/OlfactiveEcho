import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { ShoppingBag, X, Filter, SortAsc, Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { getPerfume } from '@/api/perfume';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import FilterPanel from '@/components/product/FilterPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const WishlistPage = () => {
  const { ids, remove, clear } = useWishlist();
  const { addItem } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [filters, setFilters] = useState({
    brands: [],
    categories: [],
    scentFamilies: [],
    genders: [],
    priceRange: [0, 50000],
    seasons: [],
    occasions: []
  });

  useEffect(()=>{
    (async ()=>{
      try{
        setLoading(true);
        const results = [];
        for (const id of ids) {
          try { 
            const product = await getPerfume(id);
            results.push({ ...product, addedToWishlist: Date.now() }); // Add timestamp for sorting
          } catch {}
        }
        setItems(results);
      } finally { setLoading(false); }
    })();
  },[ids]);

  // Apply filters and sorting
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    // Apply filters
    if (filters.brands.length > 0) {
      filtered = filtered.filter(item => {
        const brandName = typeof item.brand === 'object' ? item.brand?.name : item.brand;
        return filters.brands.includes(brandName);
      });
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(item => filters.categories.includes(item.category));
    }

    if (filters.scentFamilies.length > 0) {
      filtered = filtered.filter(item => filters.scentFamilies.includes(item.scentFamily));
    }

    if (filters.genders.length > 0) {
      filtered = filtered.filter(item => filters.genders.includes(item.gender));
    }

    if (filters.priceRange) {
      filtered = filtered.filter(item => {
        const price = item.salePrice || item.price || 0;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    if (filters.seasons.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.seasons || !Array.isArray(item.seasons)) return false;
        return item.seasons.some(season => filters.seasons.includes(season));
      });
    }

    if (filters.occasions.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.occasions || !Array.isArray(item.occasions)) return false;
        return item.occasions.some(occasion => filters.occasions.includes(occasion));
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'priceLowToHigh':
        filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'priceHighToLow':
        filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'dateAdded':
      default:
        filtered.sort((a, b) => (b.addedToWishlist || 0) - (a.addedToWishlist || 0));
        break;
    }

    return filtered;
  }, [items, filters, sortBy]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setFilters({
      brands: [],
      categories: [],
      scentFamilies: [],
      genders: [],
      priceRange: [0, 50000],
      seasons: [],
      occasions: []
    });
  };

  const activeFilterCount = 
    filters.brands.length + 
    filters.categories.length + 
    filters.scentFamilies.length + 
    filters.genders.length + 
    filters.seasons.length + 
    filters.occasions.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000 ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-amber-600" />
            Your Wishlist
          </h1>
          <p className="text-gray-600 mt-2">
            {filteredAndSortedItems.length} {filteredAndSortedItems.length === 1 ? 'item' : 'items'} 
            {items.length !== filteredAndSortedItems.length && ` (${items.length} total)`}
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateAdded">Date Added</SelectItem>
                <SelectItem value="priceLowToHigh">Price: Low to High</SelectItem>
                <SelectItem value="priceHighToLow">Price: High to Low</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors relative"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Clear Wishlist */}
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
                  clear();
                  toast.success('Wishlist cleared');
                }
              }}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <FilterPanel
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
              initialFilters={filters}
              isModal={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {loading && (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading your wishlist...</p>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="py-20 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-medium text-gray-600">Your wishlist is empty</p>
          <p className="text-gray-500 mt-2">Start adding products to your wishlist!</p>
        </div>
      )}

      {!loading && items.length > 0 && filteredAndSortedItems.length === 0 && (
        <div className="py-20 text-center">
          <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-medium text-gray-600">No items match your filters</p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedItems.map(item => {
          const pid = item._id || item.id;
          const brandName = typeof item.brand === 'object' ? item.brand?.name : item.brand;
          const finalPrice = item.salePrice || item.price;

          return (
            <motion.div
              key={pid}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="relative mb-4">
                <img 
                  src={item.imageUrl || '/fragrance_images/Unknown.jpg'} 
                  alt={item.name} 
                  className="w-full h-48 object-contain rounded-lg"
                />
                <button
                  onClick={() => { 
                    remove(pid); 
                    toast.success('Removed from wishlist'); 
                  }}
                  className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-600 hover:bg-red-50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
                  {item.name}
                </h3>
                {brandName && (
                  <p className="text-sm text-gray-600">{brandName}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-amber-600">₹{finalPrice}</span>
                  {item.originalPrice && item.originalPrice > finalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{item.originalPrice}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => { 
                    addItem(item, 1); 
                    toast.success('Added to cart'); 
                  }}
                  className="w-full bg-amber-600 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors"
                >
                  <ShoppingBag size={18} />
                  Add to Cart
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;