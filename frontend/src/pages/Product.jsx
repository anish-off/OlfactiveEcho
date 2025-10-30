import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import LoginRedirectWrapper from '@/components/login/LoginRedirectWrapper';
import SampleSection from '@/components/product/SampleSection';
import ReviewList from '@/components/product/ReviewList';
import RatingStars from '@/components/product/RatingStars';
import { getPerfume, listPerfumes } from '@/api/perfume';
import { useCart } from '@/context/CartContext';
import { getImageWithFallbacks, getProxiedImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';

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

const Product = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('50ml');
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);

  const [product, setProduct] = useState(location.state?.perfume || null);
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState('');

  useEffect(()=>{
    if (product) return;
    (async ()=>{
      try{
        setLoading(true);
        const data = await getPerfume(id);
        setProduct(data);
      } catch(err){
        setError('Product not found');
      } finally { setLoading(false); }
    })();
  },[id]);

  const productImages = useMemo(()=>{
    if (!product) return [];
    
    // Collect unique image URLs
    const uniqueUrls = new Set();
    
    // Add main image first
    if (product.image_url) {
      uniqueUrls.add(product.image_url);
    }
    
    // Add all photos from array
    if (product.photos && Array.isArray(product.photos)) {
      product.photos.forEach(photo => {
        if (photo && typeof photo === 'string' && photo.trim()) {
          uniqueUrls.add(photo);
        }
      });
    }
    
    // Convert to array and take first 5
    const finalUrls = Array.from(uniqueUrls).slice(0, 5);
    
    // Proxy URLs
    const proxiedUrls = finalUrls.map(url => getProxiedImageUrl(url));
    
    // Fill to 5 images if needed
    const fallbackImg = proxiedUrls[0] || getProxiedImageUrl(getImageWithFallbacks(product));
    while (proxiedUrls.length < 5) {
      proxiedUrls.push(fallbackImg);
    }
    
    console.log(`🖼️ ${product?.name}: ${uniqueUrls.size} unique → ${new Set(proxiedUrls).size} different thumbnails`);
    
    return proxiedUrls;
  },[product]);

  const sizes = useMemo(()=> product ? [
    { size: '30ml', price: product.price * 0.7, popular: false },
    { size: '50ml', price: product.price, popular: true },
    { size: '100ml', price: product.price * 1.6, popular: false },
  ] : [], [product]);

  const currentPrice = sizes.find(s => s.size === selectedSize)?.price || (product?.price || 0);

  const fragranceNotes = useMemo(()=>{
    if (!product?.notes) return {
      top: ['Bergamot','Lemon','Aldehydes'],
      middle: ['Rose','Jasmine','Ylang-Ylang'],
      base: ['Sandalwood','Vetiver','Vanilla'],
    };
    
    // Handle new database format with "Top Notes", "Middle Notes", "Base Notes", "General Notes"
    if (product.notes["Top Notes"] || product.notes["Middle Notes"] || product.notes["Base Notes"] || product.notes["General Notes"]) {
      const topNotes = product.notes["Top Notes"] || [];
      const middleNotes = product.notes["Middle Notes"] || [];
      const baseNotes = product.notes["Base Notes"] || [];
      const generalNotes = product.notes["General Notes"] || [];
      
      return {
        top: topNotes.length > 0 ? topNotes.map(n => n.name || n) : (generalNotes.length > 0 ? generalNotes.slice(0,3).map(n => n.name || n) : ['Citrus','Fresh']),
        middle: middleNotes.length > 0 ? middleNotes.map(n => n.name || n) : (generalNotes.length > 3 ? generalNotes.slice(3,6).map(n => n.name || n) : ['Floral','Heart']),
        base: baseNotes.length > 0 ? baseNotes.map(n => n.name || n) : (generalNotes.length > 6 ? generalNotes.slice(6,9).map(n => n.name || n) : ['Woody','Warm']),
      };
    }
    
    // Handle simple nested format
    if (product.notes.top || product.notes.middle || product.notes.base) {
      return {
        top: product.notes.top && product.notes.top.length > 0 ? product.notes.top : ['Citrus','Fresh'],
        middle: product.notes.middle && product.notes.middle.length > 0 ? product.notes.middle : ['Floral','Heart'],
        base: product.notes.base && product.notes.base.length > 0 ? product.notes.base : ['Woody','Warm'],
      };
    }
    
    // Handle legacy array format
    if (Array.isArray(product.notes)) {
      return {
        top: product.notes.slice(0,3).length > 0 ? product.notes.slice(0,3) : ['Citrus','Fresh'],
        middle: product.notes.slice(3,6).length > 0 ? product.notes.slice(3,6) : ['Floral','Heart'],
        base: product.notes.slice(6,9).length > 0 ? product.notes.slice(6,9) : ['Woody','Warm'],
      };
    }
    
    return {
      top: ['Bergamot','Lemon','Aldehydes'],
      middle: ['Rose','Jasmine','Ylang-Ylang'],
      base: ['Sandalwood','Vetiver','Vanilla'],
    };
  },[product]);

  const [related, setRelated] = useState([]);
  useEffect(()=>{
    (async ()=>{
      try{
        const data = await listPerfumes();
        const all = Array.isArray(data) ? data : (data.perfumes || []);
        if (product) {
          // First try to find products with same scent family, then fallback to brand/category
          const rel = all.filter(p=> 
            p._id !== product._id && (
              p.scentFamily === product.scentFamily || 
              p.category === product.category || 
              (p.brand?.name || p.brand) === (product.brand?.name || product.brand)
            )
          ).slice(0,4);
          setRelated(rel);
        } else {
          setRelated(all.slice(0,4));
        }
      } catch {}
    })();
  }, [product]);

  const { addItem, addSample, subtotal } = useCart();

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ ...product, selectedSize, effectivePrice: currentPrice }, quantity);
    toast.success('Added to cart');
  };

  const handleAddSample = (sampleProduct, sampleQuantity) => {
    addSample(sampleProduct, sampleQuantity);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    toast('Proceeding to checkout...', { icon: '🛒' });
    navigate('/checkout');
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {loading && <div className="py-24 text-center text-gray-500">Loading product...</div>}
      {error && !loading && <div className="py-24 text-center text-[#a06800]">{error}</div>}
      {!loading && !error && product && (
        <>
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
        <li className="text-[#8C501B] font-medium">{product?.name}</li>
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
                      alt={`${product?.name || 'Fragrance'} view ${index + 1}`}
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
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <img
                  src={productImages[selectedImage]}
                  alt={product?.name || 'Fragrance'}
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
                  <span className="inline-block bg-[#F2C84B] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
                  <div className="flex items-center space-x-1" />
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2 mb-2">{cleanPerfumeName(product.name)}</h1>
                <p className="text-lg text-gray-600 mb-4">by {product.brand?.name || product.brand || 'Olfactive Echo'}</p>
                <p className="text-[#8C501B] leading-relaxed mb-6">{product.description}</p>

                <div className="flex items-baseline space-x-3 mb-6">
                  <span className="text-4xl font-bold text-[#F2C84B]">₹{currentPrice.toFixed(2)}</span>
                  {selectedSize !== '50ml' && product && (
                    <span className="text-xl text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
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
                      {sizeOption.size} - ₹{sizeOption.price.toFixed(2)}
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
                  BUY NOW
                </button>
              </div>
            </div>
          </div>

          {/* Sample Section - Full Width */}
          <div className="mb-12">
            <SampleSection 
              product={product} 
              onAddSample={handleAddSample}
              cartTotal={subtotal}
            />
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
                  Express Shipping Available
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#F2C84B] rounded-full mr-2"></span>
                  {currentPrice >= 2500 ? (
                    <span className="text-[#c69a2d] font-medium">✓ FREE Shipping Applied!</span>
                  ) : (
                    `Add ₹${(2500 - currentPrice).toFixed(0)} for Free Shipping`
                  )}
                </li>
                {product?.volume && (
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#F2C84B] rounded-full mr-2"></span>
                    {product.volume}ml - Premium Packaging
                  </li>
                )}
              </ul>
            </div>

            {/* Returns */}
            <div className="bg-white border border-[#F2D785] rounded-lg p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-[#F2C84B] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 010-2h5a1 1 0 011 1v5a1 1 0 01-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
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
                  100% Authentic Guarantee
                </li>
                {product?.concentration && (
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#F2C84B] rounded-full mr-2"></span>
                    {product.concentration} Concentration
                  </li>
                )}
              </ul>
            </div>

            {/* Perfume Details */}
            <div className="bg-white border border-[#F2D785] rounded-lg p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-[#F2C84B] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[#8C501B]">PERFUME DETAILS</h3>
              </div>
              <div className="space-y-3">
                {/* Brand and Category */}
                <div className="bg-[#F2D785] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-[#8C501B] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {(product?.brand?.name || product?.brand || 'OE').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[#8C501B] text-sm">{product?.brand?.name || product?.brand || 'Olfactive Echo'}</p>
                        <p className="text-xs text-gray-600 capitalize">{product?.scentFamily || 'Premium'} Family</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Product Info */}
                <div className="space-y-2 text-sm">
                  {product?.longevity && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Longevity:</span>
                      <span className="font-medium text-[#8C501B]">{product.longevity}</span>
                    </div>
                  )}
                  {product?.sillage && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Sillage:</span>
                      <span className="font-medium text-[#8C501B] capitalize">{product.sillage}</span>
                    </div>
                  )}
                  {product?.intensity && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Intensity:</span>
                      <span className="font-medium text-[#8C501B] capitalize">{product.intensity}</span>
                    </div>
                  )}
                  {product?.gender && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">For:</span>
                      <span className="font-medium text-[#8C501B] capitalize">{product.gender}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fragrance Notes Section - Full Width */}
          <div className="bg-gradient-to-br from-yellow-100 via-amber-50 to-white rounded-xl p-6 shadow-lg mb-12 max-w-full">
            <h2 className="font-bold text-2xl text-[#8C501B] mb-6 text-center">Fragrance Notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {/* Top Notes */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-white to-yellow-50 rounded-full flex items-center justify-center mb-3 shadow-md border border-yellow-200">
                  <svg className="w-8 h-8 text-[#8C501B]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#8C501B] text-lg mb-3">Top Notes</h3>
                <div className="flex flex-wrap gap-2 justify-center w-full">
                  {fragranceNotes.top.map((note, index) => (
                    <div key={index} className="bg-gradient-to-r from-white to-yellow-50 rounded-full px-3 py-1.5 shadow-sm border border-yellow-100 hover:shadow-md transition-all duration-200 hover:scale-105">
                      <span className="text-xs font-medium text-[#8C501B] capitalize">{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Middle Notes */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-white to-yellow-50 rounded-full flex items-center justify-center mb-3 shadow-md border border-yellow-200">
                  <svg className="w-8 h-8 text-[#8C501B]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#8C501B] text-lg mb-3">Middle Notes</h3>
                <div className="flex flex-wrap gap-2 justify-center w-full">
                  {fragranceNotes.middle.map((note, index) => (
                    <div key={index} className="bg-gradient-to-r from-white to-yellow-50 rounded-full px-3 py-1.5 shadow-sm border border-yellow-100 hover:shadow-md transition-all duration-200 hover:scale-105">
                      <span className="text-xs font-medium text-[#8C501B] capitalize">{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Base Notes */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-white to-yellow-50 rounded-full flex items-center justify-center mb-3 shadow-md border border-yellow-200">
                  <svg className="w-8 h-8 text-[#8C501B]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#8C501B] text-lg mb-3">Base Notes</h3>
                <div className="flex flex-wrap gap-2 justify-center w-full">
                  {fragranceNotes.base.map((note, index) => (
                    <div key={index} className="bg-gradient-to-r from-white to-yellow-50 rounded-full px-3 py-1.5 shadow-sm border border-yellow-100 hover:shadow-md transition-all duration-200 hover:scale-105">
                      <span className="text-xs font-medium text-[#8C501B] capitalize">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="font-bold text-3xl text-[#8C501B] mb-4">Customer Reviews</h2>
              <div className="w-20 h-1 bg-[#F2C84B] mx-auto rounded-full"></div>
              {product?.rating > 0 && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <RatingStars rating={product.rating} size="lg" showCount reviewCount={product.reviewCount} />
                </div>
              )}
            </div>
            <ReviewList perfumeId={id} />
          </div>

          {/* Related Products */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="font-bold text-3xl text-[#8C501B] mb-4">You May Also Like</h2>
              <div className="w-20 h-1 bg-[#F2C84B] mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(relatedProduct => (
                <div
                  key={relatedProduct._id}
                  onClick={() => navigate(`/product/${relatedProduct._id}`, { state: { perfume: relatedProduct } })}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer hover:scale-105"
                >
                  <div className="bg-white p-6">
                    <img
                      src={getProxiedImageUrl(getImageWithFallbacks(relatedProduct))}
                      alt={cleanPerfumeName(relatedProduct.name)}
                      className="w-full h-40 object-contain group-hover:scale-110 transition-transform duration-300"
                      onError={e => {
                        if (!e.target.src.includes('default-perfume.svg')) {
                          e.target.src = '/perfume-images/default-perfume.svg';
                        }
                      }}
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-[#8C501B] mb-1 group-hover:text-[#BF7C2A] transition-colors">
                      {cleanPerfumeName(relatedProduct.name)}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{relatedProduct.brand?.name || relatedProduct.brand}</p>
                    <p className="font-bold text-[#F2C84B] text-lg">₹{relatedProduct.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Product;