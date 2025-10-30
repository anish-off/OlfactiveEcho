import React from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, HeartOff, Star, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getImageWithFallbacks, getProxiedImageUrl } from '@/utils/imageUtils';
import { ProductDiscountBadge } from '@/components/discount/DiscountBadge';
import CompareButton from './CompareButton';

const ProductCard = ({ 
  _id, 
  id, 
  name, 
  brand,
  description, 
  price, 
  originalPrice, // Add originalPrice prop for discount calculations
  salePrice, // Add salePrice prop
  discount, // Add discount prop
  saleType, // Add saleType prop (flash, seasonal, premium, regular)
  imageUrl, 
  image_url, 
  image, 
  notes, 
  scentFamily,
  intensity,
  rating,
  reviewCount,
  isPopular,
  isNew,
  stock,
  concentration
}) => {
  const { addItem } = useCart();
  const { toggle, has, hydrated } = useWishlist();
  const navigate = useNavigate();
  const pid = _id || id;
  const wished = has(pid);

  const getAllNotes = () => {
    if (!notes) return [];
    if (Array.isArray(notes)) return notes; // Legacy format
    
    // New nested format with names from objects
    const allNotes = [];
    if (notes["Top Notes"]) allNotes.push(...notes["Top Notes"].map(n => n.name || n));
    if (notes["Middle Notes"]) allNotes.push(...notes["Middle Notes"].map(n => n.name || n));
    if (notes["Base Notes"]) allNotes.push(...notes["Base Notes"].map(n => n.name || n));
    if (notes["General Notes"]) allNotes.push(...notes["General Notes"].map(n => n.name || n));
    
    // Fallback to legacy nested format
    if (allNotes.length === 0) {
      if (notes.top) allNotes.push(...notes.top);
      if (notes.middle) allNotes.push(...notes.middle);
      if (notes.base) allNotes.push(...notes.base);
    }
    
    return allNotes;
  };

  const displayNotes = getAllNotes();
  const displayImage = getProxiedImageUrl(getImageWithFallbacks({ image_url, imageUrl, image, name }));
  const displayBrand = typeof brand === 'object' ? brand?.name : brand;
  const finalPrice = salePrice || price;
  const showDiscount = originalPrice && originalPrice > finalPrice;

  return (
    <Card 
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={() => navigate(`/product/${pid}`)}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = '/fragrance_images/Unknown.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        
        {/* Discount Badge */}
        {(showDiscount || discount) && (
          <ProductDiscountBadge
            discount={discount}
            originalPrice={originalPrice || price}
            salePrice={salePrice}
            saleType={saleType || "regular"}
          />
        )}
        
        {/* Other Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && (
            <span className="px-2 py-1 bg-[#c69a2d] text-white text-xs font-medium rounded">
              New
            </span>
          )}
          {isPopular && !showDiscount && !discount && (
            <span className="px-2 py-1 bg-[#b8860b] text-white text-xs font-medium rounded">
              Popular
            </span>
          )}
          {stock <= 5 && stock > 0 && (
            <span className="px-2 py-1 bg-[#a06800] text-white text-xs font-medium rounded">
              Low Stock
            </span>
          )}
        </div>

        {/* Wishlist and Compare Buttons */}
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <CompareButton 
            product={{ 
              _id: pid, 
              name, 
              brand, 
              price, 
              salePrice, 
              originalPrice,
              imageUrl: displayImage, 
              rating, 
              reviewCount,
              notes,
              scentFamily,
              concentration,
              intensity,
              category: scentFamily
            }} 
            size="md" 
          />
          <Button
            size="icon"
            type="button"
            variant={wished?"default":"ghost"}
            disabled={!hydrated}
            onClick={(e)=>{ 
              e.preventDefault(); 
              e.stopPropagation(); 
              toggle(pid); 
              toast.success(wished? 'Removed from wishlist':'Added to wishlist'); 
            }}
            className={`rounded-full backdrop-blur-sm transition-colors duration-300 ${wished? 'bg-[#c69a2d] text-white hover:bg-[#b8860b]':'bg-white/30 text-white hover:bg-white/40'}`}
          >
            {wished ? <HeartOff className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <CardHeader className="p-4 flex-grow">
        <div className="mb-2">
          <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1">{name}</CardTitle>
          {displayBrand && (
            <p className="text-sm text-gray-600 mt-1">{displayBrand}</p>
          )}
        </div>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating}</span>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-500">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Scent Family & Intensity */}
        <div className="flex flex-wrap gap-1 mb-3">
          {scentFamily && (
            <span className="text-xs font-medium bg-[#c69a2d]/10 text-[#c69a2d] px-2 py-1 rounded-full capitalize">
              {scentFamily}
            </span>
          )}
          {intensity && (
            <span className="text-xs font-medium bg-[#b8860b]/10 text-[#b8860b] px-2 py-1 rounded-full capitalize">
              {intensity}
            </span>
          )}
          {concentration && (
            <span className="text-xs font-medium bg-[#a06800]/10 text-[#a06800] px-2 py-1 rounded-full">
              {concentration}
            </span>
          )}
        </div>

        {/* Notes */}
        <div className="flex flex-wrap gap-1">
          {displayNotes.slice(0,3).map((note, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {note}
            </span>
          ))}
          {displayNotes.length > 3 && (
            <span className="text-xs text-gray-500 px-2 py-1">
              +{displayNotes.length - 3} more
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">₹{finalPrice?.toLocaleString()}</span>
            {showDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ₹{originalPrice?.toLocaleString()}
              </span>
            )}
          </div>
          {stock <= 0 ? (
            <span className="text-sm text-[#a06800] font-medium">Out of Stock</span>
          ) : (
            <span className="text-sm text-[#c69a2d]">{stock} in stock</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            type="button"
            disabled={stock <= 0}
            onClick={(e)=>{ 
              e.stopPropagation();
              addItem({ 
                _id: pid, 
                name, 
                brand: displayBrand,
                price: finalPrice, 
                imageUrl: displayImage, 
                notes: displayNotes, 
                description,
                scentFamily,
                intensity,
                concentration
              }); 
              toast.success('Added to cart'); 
            }}
            className="flex-1 rounded-full gap-1.5"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
          
          {stock > 0 && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to product detail page using React Router
                navigate(`/product/${pid}`);
              }}
              className="rounded-full"
            >
              <Package className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;