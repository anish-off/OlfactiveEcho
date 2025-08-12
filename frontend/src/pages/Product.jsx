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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <button onClick={() => navigate('/')} className="text-gray-500 hover:text-[#BF7C2A]">
                Home
              </button>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <button onClick={() => navigate('/products')} className="text-gray-500 hover:text-[#BF7C2A]">
                Perfumes
              </button>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#F2D785] to-[#F2C84B] rounded-3xl p-8 text-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full max-w-md mx-auto h-96 object-contain"
                onError={e => {
                  e.target.src = `https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop&auto=format`;
                }}
              />
            </div>

            {/* Product Gallery Thumbnails */}
            <div className="flex space-x-4 justify-center">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-transparent hover:border-[#D9A036] cursor-pointer transition-colors">
                  <img
                    src={product.image}
                    alt={`${product.name} view ${i}`}
                    className="w-full h-full object-contain p-2 rounded-lg"
                    onError={e => {
                      e.target.src = `https://images.unsplash.com/photo-1541643600914-78b084683601?w=80&h=80&fit=crop&auto=format`;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="bg-yellow-100 text-[#8C501B] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                  {product.category}
                </span>
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${star <= Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-xl text-gray-600 mb-4">by {product.brand}</p>

              <div className="flex items-baseline space-x-2 mb-6">
                <span className="text-3xl font-bold text-gray-900">${currentPrice.toFixed(2)}</span>
                {selectedSize !== '50ml' && <span className="text-lg text-gray-500 line-through">${product.price.toFixed(2)}</span>}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Select Size</h3>
              <div className="grid grid-cols-3 gap-3">
                {sizes.map(sizeOption => (
                  <button
                    key={sizeOption.size}
                    onClick={() => setSelectedSize(sizeOption.size)}
                    className={`relative p-4 text-center rounded-lg border-2 transition-all ${
                      selectedSize === sizeOption.size
                        ? 'border-[#D9A036] bg-yellow-50 text-[#BF7C2A]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {sizeOption.popular && (
                      <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#D9A036] text-white text-xs px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                    <div className="font-semibold">{sizeOption.size}</div>
                    <div className="text-sm text-gray-600">${sizeOption.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <span className="text-lg font-semibold">-</span>
                </button>
                <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <span className="text-lg font-semibold">+</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleBuyNow}
                className="w-full bg-gradient-to-r from-[#D9A036] to-[#BF7C2A] text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Buy Now - ${(currentPrice * quantity).toFixed(2)}
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full bg-white border-2 border-[#D9A036] text-[#BF7C2A] py-4 px-6 rounded-xl font-semibold hover:bg-yellow-50 transition-colors"
              >
                Add to Cart
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-600">30-Day Return</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-600">Authentic Products</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-600">Expert Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mb-16">
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              {[{ id: 'description', name: 'Description' }, { id: 'notes', name: 'Fragrance Notes' }, { id: 'reviews', name: 'Reviews' }].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-[#D9A036] text-[#BF7C2A]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="max-w-4xl">
            {activeTab === 'description' && (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  This exquisite fragrance represents the pinnacle of perfumery craftsmanship. Each bottle contains carefully selected ingredients sourced from the finest regions around the world. The composition follows traditional French perfumery techniques while incorporating modern innovations in scent development.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Perfect for both day and evening wear, this versatile fragrance adapts to your skin's natural chemistry to create a unique scent signature. The longevity and sillage have been carefully balanced to provide an elegant presence without being overwhelming.
                </p>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-[#F2D785] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#D9A036]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Top Notes</h3>
                  <p className="text-gray-600 text-sm">First impression, 15-30 minutes</p>
                  <ul className="mt-3 space-y-1">
                    {fragranceNotes.top.map((note, index) => (
                      <li key={index} className="text-gray-700">{note}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-center">
                  <div className="bg-[#D9A036] bg-opacity-30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#BF7C2A]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Heart Notes</h3>
                  <p className="text-gray-600 text-sm">Main character, 2-4 hours</p>
                  <ul className="mt-3 space-y-1">
                    {fragranceNotes.middle.map((note, index) => (
                      <li key={index} className="text-gray-700">{note}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-center">
                  <div className="bg-[#BF7C2A] bg-opacity-30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#8C501B]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Base Notes</h3>
                  <p className="text-gray-600 text-sm">Final impression, 6+ hours</p>
                  <ul className="mt-3 space-y-1">
                    {fragranceNotes.base.map((note, index) => (
                      <li key={index} className="text-gray-700">{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{product.rating}</div>
                      <div className="flex justify-center space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${star <= Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{product.reviews.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Reviews</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">95%</div>
                      <div className="text-sm text-gray-600">Recommend</div>
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
                    <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#D9A036] to-[#BF7C2A] rounded-full flex items-center justify-center text-white font-semibold">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{review.name}</div>
                            <div className="text-sm text-gray-500">{review.date}</div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.review}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <div
                key={relatedProduct.id}
                onClick={() => navigate(`/product/${relatedProduct.id}`, { state: { perfume: relatedProduct } })}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                <div className="bg-gradient-to-br from-[#F2D785] to-[#F2C84B] p-4">
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
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#BF7C2A] transition-colors">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{relatedProduct.brand}</p>
                  <p className="text-lg font-bold text-gray-900">${relatedProduct.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Product;