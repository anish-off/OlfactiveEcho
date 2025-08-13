import React from 'react';
import { Heart, ShoppingBag, X } from 'lucide-react';

const WishlistPage = () => {
  const wishlistItems = [
    { id: 1, name: 'Chanel No. 5', price: 120, image: '/products/chanel-no5.jpg' },
    { id: 2, name: 'Tom Ford Black Orchid', price: 150, image: '/products/tom-ford.jpg' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wishlistItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4">
            <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-amber-600 font-bold mt-1">${item.price}</p>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 bg-amber-600 text-white py-2 rounded text-sm flex items-center justify-center gap-1">
                  <ShoppingBag size={16} /> Add to Cart
                </button>
                <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-red-500">
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;