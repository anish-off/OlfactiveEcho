import React from "react";
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, HeartOff } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const ProductCard = ({ _id, id, name, description, price, imageUrl, image, notes }) => {
  const { addItem } = useCart();
  const { toggle, has, hydrated } = useWishlist();
  const pid = _id || id;
  const wished = has(pid);

  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageUrl || image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <Button
          size="icon"
          type="button"
          variant={wished?"default":"ghost"}
          disabled={!hydrated}
          onClick={(e)=>{ e.preventDefault(); toggle(pid); toast.success(wished? 'Removed from wishlist':'Added to wishlist'); }}
          className={`absolute top-4 right-4 z-10 rounded-full backdrop-blur-sm transition-colors duration-300 ${wished? 'bg-red-500 text-white hover:bg-red-600':'bg-white/30 text-white hover:bg-white/40'}`}
        >
          {wished ? <HeartOff className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
        </Button>
      </div>

      <CardHeader className="p-5 flex-grow">
        <CardTitle className="text-xl font-bold text-gray-900">{name}</CardTitle>
        <div className="mt-2 flex flex-wrap gap-2">
          {notes?.slice(0,4).map(tag => (
            <span key={tag} className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0">
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">₹{price}</span>
          <Button
            variant="default"
            size="sm"
            type="button"
            onClick={()=>{ addItem({ _id: pid, name, price, imageUrl, notes, description }); toast.success('Added to cart'); }}
            className="rounded-full gap-1.5"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;