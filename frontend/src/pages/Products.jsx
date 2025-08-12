import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const Products = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const perfumes = [
    { id: 1, name: 'Chanel No. 5', brand: 'Chanel', price: 120, category: 'floral', image: '/assets/chanel-no5.jpg', description: "The world's most iconic fragrance. A timeless bouquet of ylang-ylang and rose, heightened by woody base notes.", rating: 4.8, reviews: 2450 },
    { id: 2, name: 'Dior Sauvage', brand: 'Christian Dior', price: 95, category: 'fresh', image: '/assets/dior-sauvage.jpg', description: 'A fresh and woody composition that captures the essence of wide open spaces.', rating: 4.7, reviews: 1890 },
    { id: 3, name: 'Tom Ford Black Orchid', brand: 'Tom Ford', price: 150, category: 'oriental', image: '/assets/tom-ford-black-orchid.jpg', description: 'A luxurious and sensual fragrance with notes of black orchid, spice, and dark chocolate.', rating: 4.6, reviews: 1234 },
    { id: 4, name: 'Giorgio Armani Acqua di Gio', brand: 'Giorgio Armani', price: 85, category: 'fresh', image: '/assets/acqua-di-gio.jpg', description: 'A fresh aquatic fragrance inspired by the Mediterranean sea breeze.', rating: 4.5, reviews: 3210 },
    { id: 5, name: 'Yves Saint Laurent Black Opium', brand: 'Yves Saint Laurent', price: 110, category: 'oriental', image: '/assets/ysl-black-opium.jpg', description: 'A mysterious and alluring fragrance with coffee, vanilla, and white flowers.', rating: 4.7, reviews: 1567 },
    { id: 6, name: 'Creed Aventus', brand: 'Creed', price: 320, category: 'woody', image: '/assets/creed-aventus.jpg', description: 'A sophisticated blend of pineapple, birch, and musk for the modern gentleman.', rating: 4.9, reviews: 987 },
    { id: 7, name: 'Marc Jacobs Daisy', brand: 'Marc Jacobs', price: 75, category: 'floral', image: '/assets/marc-jacobs-daisy.jpg', description: 'A youthful and feminine fragrance with notes of wild berries and jasmine.', rating: 4.4, reviews: 2103 },
    { id: 8, name: 'Dolce & Gabbana Light Blue', brand: 'Dolce & Gabbana', price: 90, category: 'fresh', image: '/assets/dolce-light-blue.jpg', description: 'Captures the essence of the Mediterranean with citrus and bamboo notes.', rating: 4.3, reviews: 1876 },
    { id: 9, name: 'Viktor & Rolf Flowerbomb', brand: 'Viktor & Rolf', price: 125, category: 'floral', image: '/assets/flowerbomb.jpg', description: 'An explosion of flowers with jasmine, rose, and patchouli.', rating: 4.6, reviews: 1432 },
    { id: 10, name: "Hermès Terre d'Hermès", brand: 'Hermès', price: 105, category: 'woody', image: '/assets/terre-hermes.jpg', description: 'A woody and mineral fragrance connecting man to earth and the elements.', rating: 4.5, reviews: 1098 },
    { id: 11, name : "Lancôme La Vie Est Belle", brand: 'Lancôme', price: 100, category: 'floral', image: '/assets/la-vie-est-belle.jpg', description: "A sweet and gourmand fragrance celebrating life's simple pleasures.", rating: 4.4, reviews: 1765 },
    { id: 12, name: 'Versace Bright Crystal', brand: 'Versace', price: 70, category: 'floral', image: '/assets/versace-bright-crystal.jpg', description: 'A luminous and fresh floral fragrance with pomegranate and peony.', rating: 4.2, reviews: 1543 }
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

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-md">
                  <span className="text-sm font-semibold text-[#BF7C2A]">${perfume.price}</span>
                </div>
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

export default Products;