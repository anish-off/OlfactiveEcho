import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductDiscountBadge } from './DiscountBadge';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getImageWithFallbacks, getProxiedImageUrl } from '@/utils/imageUtils';

const DiscountProductSection = ({ 
  title = "Flash Sale Products",
  subtitle = "Limited time offers - Grab them before they're gone!",
  products = [],
  saleEndTime,
  theme = "flash", // flash, seasonal, premium, regular
  showTimer = true,
  maxVisible = 4
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const navigate = useNavigate();

  // Timer logic
  useEffect(() => {
    if (!showTimer || !saleEndTime) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(saleEndTime).getTime();
      const distance = end - now;

      if (distance > 0) {
        setTimeLeft({
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [saleEndTime, showTimer]);

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + maxVisible >= products.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, products.length - maxVisible) : prev - 1
    );
  };

  const themeStyles = {
    flash: {
      gradient: "bg-gradient-to-r from-[#c69a2d]/10 to-[#b8860b]/10",
      accent: "text-[#c69a2d]",
      button: "bg-[#c69a2d] hover:bg-[#b8860b]"
    },
    seasonal: {
      gradient: "bg-gradient-to-r from-[#c69a2d]/5 to-[#a06800]/10",
      accent: "text-[#a06800]",
      button: "bg-[#a06800] hover:bg-[#8b5a00]"
    },
    premium: {
      gradient: "bg-gradient-to-r from-[#a06800]/5 to-[#c69a2d]/8",
      accent: "text-[#a06800]",
      button: "bg-gradient-to-r from-[#a06800] to-[#b8860b] hover:from-[#8b5a00] hover:to-[#a06800]"
    },
    regular: {
      gradient: "bg-gradient-to-r from-[#b8860b]/5 to-[#c69a2d]/8",
      accent: "text-[#b8860b]",
      button: "bg-[#b8860b] hover:bg-[#a06800]"
    }
  };

  const currentTheme = themeStyles[theme] || themeStyles.flash;
  const visibleProducts = products.slice(currentIndex, currentIndex + maxVisible);

  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`, { state: { perfume: product } });
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const displayBrand = typeof product.brand === 'object' ? product.brand?.name : product.brand;
    addItem({
      _id: product._id,
      name: product.name,
      brand: displayBrand,
      price: product.salePrice || product.price,
      imageUrl: getProxiedImageUrl(getImageWithFallbacks(product)),
      description: product.description
    });
    toast.success('Added to cart');
  };

  const handleWishlistToggle = (e, productId) => {
    e.stopPropagation();
    const isWished = has(productId);
    toggle(productId);
    toast.success(isWished ? 'Removed from wishlist' : 'Added to wishlist');
  };

  if (!products || products.length === 0) return null;

  return (
    <section className={`${currentTheme.gradient} rounded-3xl p-8 mb-12`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <h2 className={`text-3xl font-bold ${currentTheme.accent} mb-2`}>
            {title}
          </h2>
          <p className="text-gray-600 text-lg">{subtitle}</p>
        </div>

        {/* Timer */}
        {showTimer && saleEndTime && (timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0) && (
          <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-4 shadow-lg">
            <Clock className={`h-6 w-6 ${currentTheme.accent}`} />
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Sale ends in:</div>
              <div className="flex gap-2">
                <div className="bg-gray-900 text-white px-3 py-1 rounded-lg min-w-[50px]">
                  <div className="text-xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
                  <div className="text-xs">HRS</div>
                </div>
                <div className="bg-gray-900 text-white px-3 py-1 rounded-lg min-w-[50px]">
                  <div className="text-xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                  <div className="text-xs">MIN</div>
                </div>
                <div className="bg-gray-900 text-white px-3 py-1 rounded-lg min-w-[50px]">
                  <div className="text-xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                  <div className="text-xs">SEC</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {products.length > maxVisible && (
        <div className="flex justify-end gap-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentIndex + maxVisible >= products.length}
            className="rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleProducts.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:scale-105"
            onClick={() => handleProductClick(product)}
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={getProxiedImageUrl(getImageWithFallbacks(product))}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = '/fragrance_images/Unknown.jpg';
                }}
              />
              
              {/* Discount Badge */}
              <ProductDiscountBadge
                discount={product.discount}
                originalPrice={product.originalPrice || product.price}
                salePrice={product.salePrice}
                saleType={theme}
              />

              {/* Quick Actions */}
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  size="sm"
                  variant={has(product._id) ? "default" : "secondary"}
                  onClick={(e) => handleWishlistToggle(e, product._id)}
                  className="rounded-full p-2 bg-white/90 hover:bg-white shadow-lg"
                >
                  <Heart className={`h-4 w-4 ${has(product._id) ? 'fill-[#c69a2d] text-[#c69a2d]' : 'text-gray-600'}`} />
                </Button>
              </div>

              {/* Trending/Popular Badge */}
              {(product.isPopular || product.trending) && (
                <div className="absolute bottom-2 left-2">
                  <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {product.isPopular ? 'Popular' : 'Trending'}
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-5">
              <div className="mb-3">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {typeof product.brand === 'object' ? product.brand?.name : product.brand}
                </p>
              </div>

              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-1 mb-3">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-xs text-gray-500">
                    ({product.reviewCount || 0} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{(product.salePrice || product.price)?.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > (product.salePrice || product.price) && (
                    <span className="text-lg text-gray-500 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                className={`w-full ${currentTheme.button} text-white rounded-full font-semibold py-2 px-4 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300`}
                onClick={(e) => handleAddToCart(e, product)}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>

              {/* Low Stock Warning */}
              {product.stock && product.stock <= 5 && (
                <div className="mt-2 text-center">
                  <span className="text-xs text-[#c69a2d] font-medium">
                    Only {product.stock} left in stock!
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      {products.length > maxVisible && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/collections', { 
              state: { 
                filter: { saleType: theme },
                title: `${title} - All Products`
              }
            })}
            className="rounded-full px-8 py-3 font-semibold border-2 hover:bg-gray-50"
          >
            View All {title}
          </Button>
        </div>
      )}
    </section>
  );
};

export default DiscountProductSection;