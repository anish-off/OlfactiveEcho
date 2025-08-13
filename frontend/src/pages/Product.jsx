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
      <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Elegant Breadcrumb */}
          <nav className="mb-12">
            <ol className="flex items-center space-x-3 text-sm">
              <li>
                <button onClick={() => navigate('/')} className="text-gray-600 hover:text-yellow-600 font-medium transition-colors duration-200">
                  Home
                </button>
              </li>
              <li className="text-yellow-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <button onClick={() => navigate('/products')} className="text-gray-600 hover:text-yellow-600 font-medium transition-colors duration-200">
                  Perfumes
                </button>
              </li>
              <li className="text-yellow-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li className="text-gray-800 font-semibold">{product.name}</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            {/* Product Image Section */}
            <div className="space-y-8">
              <div className="relative bg-white rounded-3xl shadow-2xl p-12 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-white to-yellow-50 opacity-60"></div>
                <div className="relative text-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full max-w-sm mx-auto h-96 object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
                    onError={e => {
                      e.target.src = `https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop&auto=format`;
                    }}
                  />
                  {/* Decorative Elements */}
                  <div className="absolute top-4 left-4 w-16 h-16 bg-yellow-200 rounded-full opacity-20 animate-pulse"></div>
                  <div className="absolute bottom-4 right-4 w-24 h-24 bg-yellow-100 rounded-full opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
              </div>

              {/* Product Gallery Thumbnails */}
              <div className="flex space-x-4 justify-center">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-24 h-24 bg-white rounded-2xl border-3 border-transparent hover:border-yellow-400 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group">
                    <img
                      src={product.image}
                      alt={`${product.name} view ${i}`}
                      className="w-full h-full object-contain p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300"
                      onError={e => {
                        e.target.src = `https://images.unsplash.com/photo-1541643600914-78b084683601?w=80&h=80&fit=crop&auto=format`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details Section */}
            <div className="space-y-8">
              {/* Product Header */}
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-md">
                    {product.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg
                          key={star}
                          className={`w-6 h-6 transition-colors duration-200 ${star <= Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 font-medium ml-2">({product.reviews} reviews)</span>
                  </div>
                </div>

                <h1 className="text-4xl font-bold text-gray-800 mb-3 font-serif leading-tight">{product.name}</h1>
                <p className="text-xl text-gray-600 mb-6 font-light">by <span className="font-medium">{product.brand}</span></p>

                <div className="flex items-baseline space-x-3 mb-8">
                  <span className="text-4xl font-bold text-yellow-600 font-serif">${currentPrice.toFixed(2)}</span>
                  {selectedSize !== '50ml' && (
                    <span className="text-xl text-gray-400 line-through font-light">${product.price.toFixed(2)}</span>
                  )}
                </div>

                {/* Luxury Features */}
                <div className="grid grid-cols-3 gap-4 py-6 border-t border-yellow-100">
                  <div className="text-center group">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">30-Day Return</span>
                  </div>
                  <div className="text-center group">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Authentic</span>
                  </div>
                  <div className="text-center group">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Expert Support</span>
                  </div>
                </div>
              </div>

              {/* Size Selection */}
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 font-serif">Select Size</h3>
                <div className="grid grid-cols-3 gap-4">
                  {sizes.map(sizeOption => (
                    <button
                      key={sizeOption.size}
                      onClick={() => setSelectedSize(sizeOption.size)}
                      className={`relative p-6 text-center rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                        selectedSize === sizeOption.size
                          ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-700 shadow-lg'
                          : 'border-gray-200 hover:border-yellow-300 hover:shadow-md bg-white'
                      }`}
                    >
                      {sizeOption.popular && (
                        <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                          Popular
                        </span>
                      )}
                      <div className="font-bold text-lg">{sizeOption.size}</div>
                      <div className="text-sm text-gray-600 mt-1">${sizeOption.price.toFixed(2)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 font-serif">Quantity</h3>
                <div className="flex items-center justify-center space-x-6">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all duration-300"
                  >
                    <span className="text-xl font-bold">-</span>
                  </button>
                  <span className="text-2xl font-bold w-12 text-center text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all duration-300"
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white py-6 px-8 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Buy Now - ${(currentPrice * quantity).toFixed(2)}
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-white border-2 border-yellow-400 text-yellow-600 py-6 px-8 rounded-2xl font-bold text-lg hover:bg-yellow-50 hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Elegant Divider */}
          <div className="flex items-center justify-center mb-16">
            <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent w-full max-w-md"></div>
            <div className="px-6">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent w-full max-w-md"></div>
          </div>

          {/* Product Information Tabs */}
          <div className="mb-20">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-100">
                <nav className="flex">
                  {[{ id: 'description', name: 'Description' }, { id: 'notes', name: 'Fragrance Notes' }, { id: 'reviews', name: 'Reviews' }].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-6 px-8 font-semibold text-lg transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-inner'
                          : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-12">
                {activeTab === 'description' && (
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-8 text-lg font-light">{product.description}</p>
                    <div className="bg-gradient-to-r from-yellow-50 to-white rounded-2xl p-8 mb-8">
                      <p className="text-gray-700 leading-relaxed mb-6 font-light">
                        This exquisite fragrance represents the pinnacle of perfumery craftsmanship. Each bottle contains carefully selected ingredients sourced from the finest regions around the world. The composition follows traditional French perfumery techniques while incorporating modern innovations in scent development.
                      </p>
                    </div>
                    <p className="text-gray-700 leading-relaxed font-light">
                      Perfect for both day and evening wear, this versatile fragrance adapts to your skin's natural chemistry to create a unique scent signature. The longevity and sillage have been carefully balanced to provide an elegant presence without being overwhelming.
                    </p>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center bg-gradient-to-br from-yellow-50 to-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-xl mb-3 text-gray-800 font-serif">Top Notes</h3>
                      <p className="text-yellow-600 text-sm mb-4 font-medium">First impression, 15-30 minutes</p>
                      <ul className="space-y-2">
                        {fragranceNotes.top.map((note, index) => (
                          <li key={index} className="text-gray-700 font-medium">{note}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-center bg-gradient-to-br from-yellow-50 to-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-xl mb-3 text-gray-800 font-serif">Heart Notes</h3>
                      <p className="text-yellow-600 text-sm mb-4 font-medium">Main character, 2-4 hours</p>
                      <ul className="space-y-2">
                        {fragranceNotes.middle.map((note, index) => (
                          <li key={index} className="text-gray-700 font-medium">{note}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-center bg-gradient-to-br from-yellow-50 to-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-xl mb-3 text-gray-800 font-serif">Base Notes</h3>
                      <p className="text-yellow-600 text-sm mb-4 font-medium">Final impression, 6+ hours</p>
                      <ul className="space-y-2">
                        {fragranceNotes.base.map((note, index) => (
                          <li key={index} className="text-gray-700 font-medium">{note}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-8">
                    <div className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl p-8 shadow-inner">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                          <div className="text-5xl font-bold text-yellow-600 mb-2 font-serif">{product.rating}</div>
                          <div className="flex justify-center space-x-1 mb-3">
                            {[1, 2, 3, 4, 5].map(star => (
                              <svg
                                key={star}
                                className={`w-6 h-6 ${star <= Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">Average Rating</div>
                        </div>
                        <div>
                          <div className="text-5xl font-bold text-yellow-600 mb-2 font-serif">{product.reviews.toLocaleString()}</div>
                          <div className="text-sm text-gray-600 font-medium">Total Reviews</div>
                        </div>
                        <div>
                          <div className="text-5xl font-bold text-yellow-600 mb-2 font-serif">95%</div>
                          <div className="text-sm text-gray-600 font-medium">Recommend</div>
                        </div>
                      </div>
                    </div>

                    {/* Sample Reviews */}
                    <div className="space-y-6">
                      {[
                        { name: 'Sarah M.', rating: 5, date: '2 weeks ago', review: 'Absolutely love this fragrance! The longevity is incredible and I get compliments every time I wear it. Perfect for both day and night.' },
                        { name: 'Michael R.', rating: 4, date: '1 month ago', review: 'Great scent with excellent projection. The only downside is the price point, but the quality justifies it. Will definitely repurchase.' },
                        { name: 'Emma L.', rating: 5, date: '1 month ago', review: 'This has become my signature scent. Elegant, sophisticated, and unique. The bottle design is also beautiful - looks great on my vanity.' },
                      ].map((review, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-yellow-400">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-14 h-14 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {review.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-lg">{review.name}</div>
                                <div className="text-sm text-gray-500">{review.date}</div>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <svg
                                  key={star}
                                  className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 font-light leading-relaxed">{review.review}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4 font-serif">You May Also Like</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(relatedProduct => (
                <div
                  key={relatedProduct.id}
                  onClick={() => navigate(`/product/${relatedProduct.id}`, { state: { perfume: relatedProduct } })}
                  className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer hover:scale-105"
                >
                  <div className="relative bg-gradient-to-br from-yellow-100 via-white to-yellow-50 p-6 overflow-hidden">
                    <div className="absolute top-2 right-2 w-8 h-8 bg-yellow-200 rounded-full opacity-30 animate-pulse"></div>
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-lg"
                      onError={e => {
                        e.target.src = `https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=300&fit=crop&auto=format`;
                      }}
                    />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors duration-300 font-serif">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 font-light">{relatedProduct.brand}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-yellow-600 font-serif">${relatedProduct.price}</p>
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
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