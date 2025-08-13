import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ScrollAnimationWrapper from "@/components/ui/ScrollAnimationWrapper";
import { listPerfumes } from '@/api/perfume';
import { useCart } from '@/context/CartContext';

const FeaturedProduct = () => {
  const { addItem } = useCart();
  const [featured, setFeatured] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(()=>{
    (async () => {
      try {
        const perfumes = await listPerfumes();
        const sorted = [...perfumes].sort((a,b)=> b.price - a.price);
        setFeatured(sorted.slice(0,5));
      } catch {
        setFeatured([]);
      }
    })();
  },[]);

  const nextProduct = () => setCurrentIndex(i => featured.length ? (i+1)%featured.length : 0);
  const prevProduct = () => setCurrentIndex(i => featured.length ? (i-1+featured.length)%featured.length : 0);

  useEffect(()=>{
    if (!featured.length) return; const t = setInterval(()=> nextProduct(), 7000); return ()=> clearInterval(t);
  },[currentIndex, featured.length]);

  const current = featured[currentIndex];

  return (
    <ScrollAnimationWrapper className="w-full">
      <div className="relative bg-gradient-to-r from-amber-50 to-gray-50 rounded-2xl overflow-hidden p-8 md:p-12 min-h-[400px]">
        {!featured.length && <div className="text-center py-24">Loading featured fragrances...</div>}
        {featured.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={current._id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px] overflow-hidden"
            >
              <motion.div className="order-2 lg:order-1 min-h-[400px] flex items-center justify-center" initial={{ opacity:0, x:-40 }} animate={{ opacity:1,x:0 }} transition={{ duration:0.8 }}>
                <img src={current.imageUrl || 'https://via.placeholder.com/600x800?text=Fragrance'} alt={current.name} className="rounded-xl shadow-xl w-full h-auto object-cover max-h-[600px]" />
              </motion.div>
              <motion.div className="order-1 lg:order-2 px-4 sm:px-8" initial={{ opacity:0,x:40 }} animate={{ opacity:1,x:0 }} transition={{ duration:0.8, delay:0.2 }}>
                <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Featured</h2>
                <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{current.name}</h3>
                <p className="text-lg text-gray-600 mb-8">{current.description}</p>
                <motion.div className="flex flex-wrap items-center gap-4" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.4 }}>
                  <Button size="lg" onClick={()=> addItem(current,1)} className="rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                    <ShoppingCart className="mr-3 h-6 w-6" /> Add to Cart - ₹{current.price}
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-full px-6 py-6 gap-2">Learn More <ArrowRight className="h-5 w-5" /></Button>
                </motion.div>
                <motion.div className="mt-8 pt-8 border-t border-gray-200" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.6, delay:0.6 }}>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Fragrance Notes</h4>
                  <div className="flex flex-wrap gap-3">
                    {current.notes?.slice(0,6).map(n => <span key={n} className="text-sm font-medium bg-white text-gray-700 px-3 py-1.5 rounded-full shadow-sm">{n}</span>)}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
        {featured.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <Button variant="ghost" size="icon" onClick={prevProduct} className="rounded-full bg-white/80 hover:bg-white shadow-md"><ChevronLeft className="h-6 w-6" /></Button>
            <Button variant="ghost" size="icon" onClick={nextProduct} className="rounded-full bg-white/80 hover:bg-white shadow-md"><ChevronRight className="h-6 w-6" /></Button>
          </div>
        )}
      </div>
    </ScrollAnimationWrapper>
  );
};

export default FeaturedProduct;