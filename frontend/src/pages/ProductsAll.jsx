import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import { listPerfumes } from '@/api/perfume';
import { useWishlist } from '@/context/WishlistContext';
import toast from 'react-hot-toast';

const ProductsAll = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toggle: toggleWishlist, has } = useWishlist();
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(()=>{
    (async ()=>{
      try{
        setLoading(true);
        const data = await listPerfumes();
        setPerfumes(data);
      } catch(err){
        setError('Failed to load perfumes');
      } finally { setLoading(false); }
    })();
  },[]);

  const categories = useMemo(()=>{
    const counts = perfumes.reduce((acc,p)=>{ const c = p.category || 'uncategorized'; acc[c] = (acc[c]||0)+1; return acc; },{});
    const list = Object.entries(counts).map(([id,count])=>({ id, name: id.charAt(0).toUpperCase()+id.slice(1), count }));
    list.sort((a,b)=> b.count - a.count);
    return [{ id:'all', name:'All Perfumes', count: perfumes.length }, ...list];
  },[perfumes]);

  const filteredPerfumes = selectedCategory === 'all' ? perfumes : perfumes.filter(p => p.category === selectedCategory);

  const handleProductClick = perfume => {
    navigate(`/product/${perfume._id}`, { state: { perfume } });
  };

  const toggleFavorite = (e, perfumeId) => {
    e.stopPropagation();
    const already = has(perfumeId);
    toggleWishlist(perfumeId);
    toast.success(already ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover Your
            <span className="bg-gradient-to-r from-[#D9A036] to-[#BF7C2A] bg-clip-text text-transparent"> Signature Scent</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our curated collection of premium perfumes from the world's most prestigious brands
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-[#D9A036] to-[#BF7C2A] text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-[#D9A036]'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Status */}
        {loading && <div className="text-center py-8">Loading...</div>}
        {error && !loading && <div className="text-center py-8 text-red-500">{error}</div>}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {!loading && !error && filteredPerfumes.map(perfume => (
            <div
              key={perfume._id}
              onClick={() => handleProductClick(perfume)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:scale-105"
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-[#F2D785] to-[#F2C84B]">
                <img
                  src={'https://via.placeholder.com/400x400?text=Fragrance'}
                  alt={perfume.name}
                  className="w-full h-64 object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                  // Commented out original image source and error handling
                  // src={perfume.imageUrl || 'https://via.placeholder.com/400x400?text=Fragrance'}
                  // onError={e => {
                  //   e.target.src = `https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&auto=format`;
                  // }}
                />
                <button
                  onClick={(e) => toggleFavorite(e, perfume._id)}
                  aria-label={has(perfume._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`inline-flex items-center justify-center h-10 w-10 absolute top-4 right-4 z-10 rounded-full backdrop-blur-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-white/30 hover:bg-white/40 ${has(perfume._id) ? 'text-red-500' : 'text-white'}`}
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

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#8C501B] bg-yellow-100 px-2 py-1 rounded-full uppercase tracking-wide">
                    {perfume.category}
                  </span>
                  <div className="flex items-center space-x-1"/>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-[#BF7C2A] transition-colors">
                  {perfume.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">{perfume.brand || 'Olfactive Echo'}</p>

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
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-[#D9A036] to-[#BF7C2A] rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Can't Find Your Perfect Scent?</h2>
          <p className="text-xl mb-8 opacity-90">
            Get personalized recommendations from our fragrance experts
          </p>
          <button className="bg-white text-[#BF7C2A] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
            Get Personalized Advice
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductsAll;
