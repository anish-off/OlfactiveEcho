import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { listPerfumes } from '@/api/perfume';
import { getImageWithFallbacks, getProxiedImageUrl } from '@/utils/imageUtils';

const placeholderImg = 'https://images.unsplash.com/photo-1595425964079-7b5485fe353f?auto=format&fit=crop&w=880&q=80';

const ShopByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async () => {
      try {
        const data = await listPerfumes({ limit: 100 });
        const perfumes = Array.isArray(data) ? data : (data.perfumes || []);
        const map = new Map();
        perfumes.forEach(p => {
          if (!p.category) return;
          if (!map.has(p.category)) {
            const categoryImage = getProxiedImageUrl(getImageWithFallbacks({ 
              image_url: p.image_url, 
              imageUrl: p.imageUrl, 
              image: p.image, 
              name: p.name 
            })) || placeholderImg;
            map.set(p.category, { name: p.category, image: categoryImage, count: 1 });
          } else {
            map.get(p.category).count += 1;
          }
        });
        setCategories(Array.from(map.values()).sort((a,b)=> b.count - a.count));
      } finally {
        setLoading(false);
      }
    })();
  },[]);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by <span className="text-primary">Scent Family</span></h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Discover your perfect fragrance by exploring our carefully curated scent categories.</p>
        </div>
        {loading && <div className="text-center py-12">Loading categories...</div>}
        {!loading && categories.length === 0 && <div className="text-center py-12 text-gray-500">No categories available.</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(category => (
            <div key={category.name} className="group relative overflow-hidden rounded-xl aspect-square shadow-md hover:shadow-lg transition-all duration-300">
              <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e)=>{ e.target.onerror=null; e.target.src=placeholderImg; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                <div className="flex items-center text-white/90 group-hover:text-white transition-colors duration-300">
                  <span className="text-sm font-medium">{category.count} {category.count===1? 'scent':'scents'}</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;