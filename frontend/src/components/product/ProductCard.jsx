import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";

const ProductCard = ({ name, description, price, image, tags }) => {
  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <Button 
          size="icon" 
          variant="ghost"
          className="absolute top-4 right-4 z-10 bg-white/30 backdrop-blur-sm text-white rounded-full hover:bg-white/40 transition-colors duration-300"
        >
          <Heart className="h-5 w-5" />
        </Button>
      </div>
      
      <CardHeader className="p-5 flex-grow">
        <CardTitle className="text-xl font-bold text-gray-900">{name}</CardTitle>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags?.map(tag => (
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