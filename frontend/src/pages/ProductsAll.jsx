import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const ProductsAll = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState(new Set());

  const perfumes = [
    { id: 1, name: 'Chanel No. 5', brand: 'Chanel', price: 120, category: 'floral', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=400&fit=crop&auto=format', description: "The world's most iconic fragrance. A timeless bouquet of ylang-ylang and rose, heightened by woody base notes.", rating: 4.8, reviews: 2450 },
    { id: 2, name: 'Dior Sauvage', brand: 'Christian Dior', price: 95, category: 'fresh', image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400&h=400&fit=crop&auto=format', description: 'A fresh and woody composition that captures the essence of wide open spaces.', rating: 4.7, reviews: 1890 },
    { id: 3, name: 'Tom Ford Black Orchid', brand: 'Tom Ford', price: 150, category: 'oriental', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&auto=format', description: 'A luxurious and sensual fragrance with notes of black orchid, spice, and dark chocolate.', rating: 4.6, reviews: 1234 },
    { id: 4, name: 'Giorgio Armani Acqua di Gio', brand: 'Giorgio Armani', price: 85, category: 'fresh', image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59db9?w=400&h=400&fit=crop&auto=format', description: 'A fresh aquatic fragrance inspired by the Mediterranean sea breeze.', rating: 4.5, reviews: 3210 },
    { id: 5, name: 'Yves Saint Laurent Black Opium', brand: 'Yves Saint Laurent', price: 110, category: 'oriental', image: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&h=400&fit=crop&auto=format', description: 'A mysterious and alluring fragrance with coffee, vanilla, and white flowers.', rating: 4.7, reviews: 1567 },
    { id: 6, name: 'Creed Aventus', brand: 'Creed', price: 320, category: 'woody', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=400&fit=crop&auto=format', description: 'A sophisticated blend of pineapple, birch, and musk for the modern gentleman.', rating: 4.9, reviews: 987 },
    { id: 7, name: 'Marc Jacobs Daisy', brand: 'Marc Jacobs', price: 75, category: 'floral', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&auto=format', description: 'A youthful and feminine fragrance with notes of wild berries and jasmine.', rating: 4.4, reviews: 2103 },
    { id: 8, name: 'Dolce & Gabbana Light Blue', brand: 'Dolce & Gabbana', price: 90, category: 'fresh', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=400&fit=crop&auto=format&q=80', description: 'Captures the essence of the Mediterranean with citrus and bamboo notes.', rating: 4.3, reviews: 1876 },
    { id: 9, name: 'Viktor & Rolf Flowerbomb', brand: 'Viktor & Rolf', price: 125, category: 'floral', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=400&fit=crop&auto=format&q=80', description: 'An explosion of flowers with jasmine, rose, and patchouli.', rating: 4.6, reviews: 1432 },
    { id: 10, name: "Hermès Terre d'Hermès", brand: 'Hermès', price: 105, category: 'woody', image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400&h=400&fit=crop&auto=format&q=80', description: 'A woody and mineral fragrance connecting man to earth and the elements.', rating: 4.5, reviews: 1098 },
    { id: 11, name: "Lancôme La Vie Est Belle", brand: 'Lancôme', price: 100, category: 'floral', image: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&h=400&fit=crop&auto=format&q=80', description: "A sweet and gourmand fragrance celebrating life's simple pleasures.", rating: 4.4, reviews: 1765 },
    { id: 12, name: 'Versace Bright Crystal', brand: 'Versace', price: 70, category: 'floral', image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59db9?w=400&h=400&fit=crop&auto=format&q=80', description: 'A luminous and fresh floral fragrance with pomegranate and peony.', rating: 4.2, reviews: 1543 },
    { id: 13, name: 'Bleu de Chanel', brand: 'Chanel', price: 130, category: 'woody', image: 'https://images.unsplash.com/photo-1549049950-48d5887197a0?w=400&h=400&fit=crop&auto=format', description: 'A timeless yet unpredictable scent in a round bottle as simple as it is elegant.', rating: 4.6, reviews: 2187 },
    { id: 14, name: 'Gucci Bloom', brand: 'Gucci', price: 98, category: 'floral', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&auto=format', description: 'A rich white floral fragrance designed to celebrate the authenticity of women.', rating: 4.5, reviews: 1654 },
    { id: 15, name: 'Burberry Her', brand: 'Burberry', price: 88, category: 'fresh', image: 'https://images.unsplash.com/photo-1582930036748-82d18d25b4d3?w=400&h=400&fit=crop&auto=format', description: 'A gourmand with a twist, this fragrance brings together berries and florals.', rating: 4.3, reviews: 1432 },
    { id: 16, name: 'Prada Black', brand: 'Prada', price: 115, category: 'oriental', image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=400&fit=crop&auto=format', description: 'A contemporary oriental fragrance with angelica and black pepper.', rating: 4.4, reviews: 987 },
    { id: 17, name: 'Calvin Klein Eternity', brand: 'Calvin Klein', price: 65, category: 'floral', image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=400&h=400&fit=crop&auto=format', description: 'A classic floral fragrance that embodies the eternal love between a man and woman.', rating: 4.1, reviews: 2876 },
    { id: 18, name: 'Maison Margiela Replica Beach Walk', brand: 'Maison Margiela', price: 142, category: 'fresh', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop&auto=format', description: 'Captures the essence of a summer stroll on a warm sandy beach.', rating: 4.7, reviews: 1234 },
    { id: 19, name: 'Jo Malone Peony & Blush Suede', brand: 'Jo Malone', price: 135, category: 'floral', image: 'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=400&h=400&fit=crop&auto=format', description: 'A radiant floral with peony, red apple, jasmine, and rose.', rating: 4.5, reviews: 1567 },
    { id: 20, name: 'Byredo Gypsy Water', brand: 'Byredo', price: 180, category: 'woody', image: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&h=400&fit=crop&auto=format&sat=-100', description: 'An ode to the romani lifestyle, a colorful and free-spirited journey.', rating: 4.8, reviews: 892 }
  ];

  const categories = [
    { id: 'all', name: 'All Perfumes', count: perfumes.length },
    { id: 'floral', name: 'Floral', count: perfumes.filter(p => p.category === 'floral').length },
    { id: 'fresh', name: 'Fresh', count: perfumes.filter(p => p.category === 'fresh').length },
    { id: 'oriental', name: 'Oriental', count: perfumes.filter(p => p.category === 'oriental').length },
    { id: 'woody', name: 'Woody', count: perfumes.filter(p => p.category === 'woody').length },
  ];

  const filteredPerfumes =
    selectedCategory === 'all'
      ? perfumes
      : perfumes.filter(perfume => perfume.category === selectedCategory);

  const handleProductClick = perfume => {
    navigate(`/product/${perfume.id}`, { state: { perfume } });
  };

  const toggleFavorite = (e, perfumeId) => {
    e.stopPropagation(); // Prevent card click when clicking heart
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(perfumeId)) {
        newFavorites.delete(perfumeId);
      } else {
        newFavorites.add(perfumeId);
      }
      return newFavorites;
    });
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredPerfumes.map(perfume => (
            <div
              key={perfume.id}
              onClick={() => handleProductClick(perfume)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:scale-105"
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-[#F2D785] to-[#F2C84B]">
                <img
                  src={perfume.image}
                  alt={perfume.name}
                  className="w-full h-64 object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                  onError={e => {
                    e.target.src = `https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&auto=format`;
                  }}
                />
                <button 
                  onClick={(e) => toggleFavorite(e, perfume.id)}
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-10 w-10 absolute top-4 right-4 z-10 bg-white/30 backdrop-blur-sm text-white rounded-full hover:bg-white/40 transition-colors duration-300 ${
                    favorites.has(perfume.id) ? 'text-red-500' : 'text-white'
                  }`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill={favorites.has(perfume.id) ? "currentColor" : "none"} 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="lucide lucide-heart h-5 w-5"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#8C501B] bg-yellow-100 px-2 py-1 rounded-full uppercase tracking-wide">
                    {perfume.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span className="text-sm text-gray-600">{perfume.rating}</span>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-[#BF7C2A] transition-colors">
                  {perfume.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">{perfume.brand}</p>

                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {perfume.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {perfume.reviews.toLocaleString()} reviews
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">${perfume.price}</span>
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
