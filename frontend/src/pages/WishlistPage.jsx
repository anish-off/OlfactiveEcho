import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ShoppingBag, X } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { getPerfume } from '@/api/perfume';
import { useCart } from '@/context/CartContext';

const WishlistPage = () => {
  const { ids, remove, clear } = useWishlist();
  const { addItem } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      try{
        setLoading(true);
        const results = [];
        for (const id of ids) {
          try { results.push(await getPerfume(id)); } catch {}
        }
        setItems(results);
      } finally { setLoading(false); }
    })();
  },[ids]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>
      
      {loading && <div className="py-8 text-center">Loading...</div>}
      {!loading && items.length === 0 && <div className="py-8 text-center text-gray-500">Your wishlist is empty.</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {items.map(item => {
    const pid = item._id || item.id;
    return (
    <div key={pid} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4">
            <img src={item.imageUrl || 'https://via.placeholder.com/80x80?text=Fragrance'} alt={item.name} className="w-20 h-20 object-cover rounded" />
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-amber-600 font-bold mt-1">₹{item.price}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={()=> { addItem(item, 1); toast.success('Added to cart'); }} className="flex-1 bg-[#c69a2d] text-white py-2 rounded text-sm flex items-center justify-center gap-1">
                  <ShoppingBag size={16} /> Add to Cart
                </button>
    <button onClick={()=> { remove(pid); toast.success('Removed'); }} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#a06800]">
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
  );})}
      </div>
      {items.length > 0 && (
        <div className="mt-6 text-right">
          <button onClick={()=>{ clear(); toast.success('Wishlist cleared'); }} className="text-sm text-[#a06800] hover:text-[#8b5a00]">Clear wishlist</button>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;