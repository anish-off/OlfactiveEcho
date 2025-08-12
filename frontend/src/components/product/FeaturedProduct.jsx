import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ScrollAnimationWrapper from "@/components/ui/ScrollAnimationWrapper";

const featuredProductsData = [
  {
    id: 1,
    name: "Velvet Orchid & Oud",
    tagline: "Limited Edition",
    description: "An intoxicating and mysterious blend where the richness of orchid meets the depth of oud, creating a truly unforgettable aroma.",
    price: "₹2,999",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80",
    notes: ['Top: Bergamot', 'Heart: Orchid', 'Base: Oud'],
  },
  {
    id: 2,
    name: "Citrus Burst Elixir",
    tagline: "Energizing & Refreshing",
    description: "A vibrant and uplifting fragrance, bursting with zesty citrus notes and a hint of fresh herbs, perfect for a bright start to your day.",
    price: "₹2,450",
    image: "https://images.unsplash.com/photo-1588096000000-000000000003?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80",
    notes: ['Top: Lemon, Grapefruit', 'Heart: Basil, Mint', 'Base: Cedarwood'],
  },
  {
    id: 3,
    name: "Midnight Rose Serenade",
    tagline: "Elegant & Romantic",
    description: "A deep and sensual fragrance, combining the timeless elegance of dark roses with warm amber and musk, ideal for evening wear.",
    price: "₹3,200",
    image: "https://images.unsplash.com/photo-1588096000000-000000000004?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80",
    notes: ['Top: Blackcurrant', 'Heart: Rose, Jasmine', 'Base: Amber, Musk'],
  },
];

const FeaturedProduct = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProduct = featuredProductsData[currentIndex];

  const nextProduct = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === featuredProductsData.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevProduct = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? featuredProductsData.length - 1 : prevIndex - 1
    );
  };

  // Optional: Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      nextProduct();
    }, 7000); // Change product every 7 seconds
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <ScrollAnimationWrapper className="w-full">
      <div className="relative bg-gradient-to-r from-amber-50 to-gray-50 rounded-2xl overflow-hidden p-8 md:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProduct.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px] overflow-hidden" 
          >
            <motion.div 
              className="order-2 lg:order-1 min-h-[400px] flex items-center justify-center"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img 
                src={currentProduct.image}
                alt={currentProduct.name}
                className="rounded-xl shadow-xl w-full h-auto object-cover max-h-[600px]"
              />
            </motion.div>
            
            <motion.div 
              className="order-1 lg:order-2 px-4 sm:px-8"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
                {currentProduct.tagline}
              </h2>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {currentProduct.name}
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                {currentProduct.description}
              </p>
              
              <motion.div 
                className="flex flex-wrap items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button 
                  size="lg" 
                  className="rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <ShoppingCart className="mr-3 h-6 w-6" />
                  Add to Bag - {currentProduct.price}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="rounded-full px-6 py-6 gap-2"
                >
                  Learn More
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </motion.div>
              
              <motion.div 
                className="mt-8 pt-8 border-t border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
                  Fragrance Notes
                </h4>
                <div className="flex flex-wrap gap-3">
                  {currentProduct.notes.map((note) => (
                    <span key={note} className="text-sm font-medium bg-white text-gray-700 px-3 py-1.5 rounded-full shadow-sm">
                      {note}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={prevProduct} 
            className="rounded-full bg-white/80 hover:bg-white shadow-md"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={nextProduct} 
            className="rounded-full bg-white/80 hover:bg-white shadow-md"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </ScrollAnimationWrapper>
  );
};

export default FeaturedProduct;