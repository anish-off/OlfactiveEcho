import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const Product = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('50ml');
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);

  const product = location.state?.perfume || {
    id: parseInt(id),
    name: 'Chanel No. 5',
    brand: 'Chanel',
    price: 120,
    category: 'floral',
    image: '/assets/chanel-no5.jpg',
    description: "The world's most iconic fragrance. A timeless bouquet of ylang-ylang and rose, heightened by woody base notes.",
    rating: 4.8,
    reviews: 2450,
  };

  const productImages = [
    product.image,
    product.image,
    product.image,
    product.image,
    product.image
  ];

  const sizes = [
    { size: '30ml', price: product.price * 0.7, popular: false },
    { size: '50ml', price: product.price, popular: true },
    { size: '100ml', price: product.price * 1.6, popular: false },
  ];

  const currentPrice = sizes.find(s => s.size === selectedSize)?.price || product.price;

  const fragranceNotes = {
    top: ['Bergamot', 'Lemon', 'Aldehydes'],
    middle: ['Rose', 'Jasmine', 'Ylang-Ylang'],
    base: ['Sandalwood', 'Vetiver', 'Vanilla'],
  };

  const relatedProducts = [
    { id: 2, name: 'Dior Sauvage', brand: 'Christian Dior', price: 95, image: '/assets/dior-sauvage.jpg' },
    { id: 3, name: 'Tom Ford Black Orchid', brand: 'Tom Ford', price: 150, image: '/assets/tom-ford-black-orchid.jpg' },
    { id: 4, name: 'Giorgio Armani Acqua di Gio', brand: 'Giorgio Armani', price: 85, image: '/assets/acqua-di-gio.jpg' },
    { id: 5, name: 'Yves Saint Laurent Black Opium', brand: 'Yves Saint Laurent', price: 110, image: '/assets/ysl-black-opium.jpg' },
  ];

  const handleAddToCart = () => {
    alert(`Added ${quantity}x ${product.name} (${selectedSize}) to cart!`);
  };

  const handleBuyNow = () => {
    alert(`Proceeding to checkout with ${quantity}x ${product.name} (${selectedSize})`);
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <button onClick={() => navigate('/')} className="text-gray-600 hover:text-[#BF7C2A] transition-colors">
                  Home
                </button>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <button onClick={() => navigate('/products')} className="text-gray-600 hover:text-[#BF7C2A] transition-colors">
                  Perfumes
                </button>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-[#8C501B] font-medium">{product.name}</li>
            </ol>
          </nav>

          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Thumbnail Carousel - Left */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="flex lg:flex-col gap-3 justify-center lg:justify-start">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 lg:w-20 lg:h-20 rounded-lg border-2 transition-all duration-200 ${
                      selectedImage === index 
                        ? 'border-[#F2C84B] shadow-md' 
                        : 'border-gray-200 hover:border-[#F2D785]'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-contain p-2"
                      onError={e => {
                        e.target.src = `https://images.unsplash.com/photo-1541643600914-78b084683601?w=80&h=80&fit=crop&auto=format`;
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Main Product Image - Center */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="bg-gradient-to-br from-[#F2D785] to-white rounded-2xl p-8 shadow-lg">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-96 lg:h-[500px] object-contain"
                  onError={e => {
                    e.target.src = `https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop&auto=format`;
                  }}
                />
              </div>
            </div>

            {/* Product Info - Right */}
            <div className="lg:col-span-5 order-3 space-y-6">
              {/* Product Header */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block bg-[#F2C84B] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {product.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${star <= Math.floor(product.rating) ? 'text-[#F2C84B] fill-current' : 'text-gray-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                    <span className="text-sm text-gray-600 ml-2">({product.reviews})</span>
                  </div>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-[#8C501B] mb-2 font-serif">{product.name}</h1>
                <p className="text-lg text-gray-600 mb-4">by {product.brand}</p>
                <p className="text-[#8C501B] leading-relaxed mb-6">{product.description}</p>

                <div className="flex items-baseline space-x-3 mb-6">
                  <span className="text-4xl font-bold text-[#F2C84B] font-serif">${currentPrice.toFixed(2)}</span>
                  {selectedSize !== '50ml' && (
                    <span className="text-xl text-gray-400 line-through">${product.price.toFixed(2)}</span>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-[#8C501B] mb-3">Size</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full p-3 border-2 border-[#F2D785] rounded-lg focus:border-[#F2C84B] focus:outline-none transition-colors"
                >
                  {sizes.map(sizeOption => (
                    <option key={sizeOption.size} value={sizeOption.size}>
                      {sizeOption.size} - ${sizeOption.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-[#8C501B] mb-3">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-[#F2D785] hover:bg-[#F2C84B] transition-colors flex items-center justify-center"
                  >
                    <span className="text-lg font-bold text-[#8C501B]">-</span>
                  </button>
                  <span className="text-xl font-semibold w-12 text-center text-[#8C501B]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg bg-[#F2D785] hover:bg-[#F2C84B] transition-colors flex items-center justify-center"
                  >
                    <span className="text-lg font-bold text-[#8C501B]">+</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-[#BF7C2A] hover:bg-[#8C501B] text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  ADD TO CART
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-white border-2 border-[#BF7C2A] text-[#BF7C2A] py-4 px-6 rounded-lg font-semibold text-lg hover:bg-[#BF7C2A] hover:text-white transition-all duration-200 hover:scale-105"
                >
                  COMPARE • TALK TO A HEADPHONE NERD
                </button>
              </div>
            </div>
          </div>

          {/* Details Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Delivery */}
            <div className="bg-white border border-[#F2D785] rounded-lg p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-[#F2C84B] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[#8C501B]">DELIVERY</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#F2C84B] rounded-full mr-2"></span>
                  Dispatched in 24 Hours
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#F2C84B] rounded-full mr-2"></span>
                  Shipping by
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#F2C84B] rounded-full mr-2"></span>
                  Over $99 = Free • Has-Aus ($99)
                </li>
              </ul>
            </div>

            {/* Returns */}
            <div className="bg-white border border-[#F2D785] rounded-lg p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-[#F2C84B] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[#8C501B]">RETURNS & WARRANTY</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#F2C84B] rounded-full mr-2"></span>
                  7 Day Replacement Guarantee
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#F2C84B] rounded-full mr-2"></span>
                  2 Year Easy Exchange
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#F2C84B] rounded-full mr-2"></span>
                  1 Year Warranty
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="bg-white border border-[#F2D785] rounded-lg p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-[#F2C84B] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[#8C501B]">BUY IT WITH</h3>
              </div>
              <div className="bg-[#F2D785] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#8C501B] rounded-full"></div>
                    <div>
                      <p className="font-medium text-[#8C501B] text-sm">HEADPHONE ZONE X KZ</p>
                      <p className="text-xs text-gray-600">SPECIAL CASE</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#8C501B]">+$89</p>
                    <p className="text-xs text-gray-500">SAVE</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fragrance Highlights Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Why KZ Is Special */}
            <div className="bg-[#F2D785] rounded-lg p-6 shadow-lg">
              <h3 className="font-bold text-xl text-[#8C501B] mb-6 font-serif">Why It's Special</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-sm flex items-center justify-center mt-1">
                    <span className="text-white text-xs font-bold">🇨🇳</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#8C501B]">Designed in China</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-400 rounded-sm flex items-center justify-center mt-1">
                    <span className="text-white text-xs">⚡</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#8C501B]">Established Reputation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded-sm flex items-center justify-center mt-1">
                    <span className="text-white text-xs">⭐</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#8C501B]">An IEM Specialist</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-sm flex items-center justify-center mt-1">
                    <span className="text-white text-xs">🎯</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#8C501B]">Born in 2008</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why we love this IEM */}
            <div className="bg-[#F2D785] rounded-lg p-6 shadow-lg">
              <h3 className="font-bold text-xl text-[#8C501B] mb-6 font-serif">Why We Love This IEM</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-sm flex items-center justify-center mt-1">
                    <span className="text-white text-xs">🏆</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#8C501B]">A Headphone Zone Collaboration</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-400 rounded-sm flex items-center justify-center mt-1">
                    <span className="text-white text-xs">💎</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#8C501B]">Value for Money</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-sm flex items-center justify-center mt-1">
                    <span className="text-white text-xs">🎵</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#8C501B]">Ideal for Beginners</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-sm flex items-center justify-center mt-1">
                    <span className="text-white text-xs">🔗</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#8C501B]">Upgradeable 2-Pin Cable</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-sm flex items-center justify-center mt-1">
                    <span className="text-white text-xs">📞</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#8C501B]">Works for Taking Calls</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gray-800 rounded-sm flex items-center justify-center mt-1">
                    <span className="text-white text-xs">📦</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#8C501B]">Works Great with Type-C</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why It Sounds Amazing */}
            <div className="bg-[#F2D785] rounded-lg p-6 shadow-lg">
              <h3 className="font-bold text-xl text-[#8C501B] mb-6 font-serif">Fragrance Notes</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center mt-1">
                    <span className="text-white text-xs">🎤</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#8C501B]">Top Notes</p>
                    <p className="text-sm text-gray-600">{fragranceNotes.top.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-sm flex items-center justify-center mt-1">
                    <span className="text-white text-xs">💫</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#8C501B]">Heart Notes</p>
                    <p className="text-sm text-gray-600">{fragranceNotes.middle.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-sm flex items-center justify-center mt-1">
                    <span className="text-white text-xs">🔧</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#8C501B]">Base Notes</p>
                    <p className="text-sm text-gray-600">{fragranceNotes.base.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-600 rounded-sm flex items-center justify-center mt-1">
                    <span className="text-white text-xs">🌟</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#8C501B]">Bright & Sparkly Highs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-600 rounded-sm flex items-center justify-center mt-1">
                    <span className="text-white text-xs">🎯</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#8C501B]">Sharp & Precise Details</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-sm flex items-center justify-center mt-1">
                    <span className="text-white text-xs">⚡</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#8C501B]">Aggressive and Energetic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#8C501B] mb-4 font-serif">You May Also Like</h2>
              <div className="w-20 h-1 bg-[#F2C84B] mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <div
                  key={relatedProduct.id}
                  onClick={() => navigate(`/product/${relatedProduct.id}`, { state: { perfume: relatedProduct } })}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer hover:scale-105"
                >
                  <div className="bg-gradient-to-br from-[#F2D785] to-white p-4">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-40 object-contain group-hover:scale-110 transition-transform duration-300"
                      onError={e => {
                        e.target.src = `https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=300&fit=crop&auto=format`;
                      }}
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-[#8C501B] mb-1 group-hover:text-[#BF7C2A] transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{relatedProduct.brand}</p>
                    <p className="text-lg font-bold text-[#F2C84B]">${relatedProduct.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Product;