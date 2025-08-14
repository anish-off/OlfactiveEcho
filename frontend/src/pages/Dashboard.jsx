import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

const Dashboard = () => {
  const { ids: wishlistIds } = useWishlist();
  const { totalItems } = useCart();
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your account.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cart</h3>
            <p className="text-gray-600 mb-4">{totalItems} item{totalItems!==1 && 's'} in cart</p>
            <Link to="/cart" className="text-amber-600 hover:text-amber-700">View cart →</Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Wishlist</h3>
            <p className="text-gray-600 mb-4">{wishlistIds.length} item{wishlistIds.length!==1 && 's'} in wishlist</p>
            <Link to="/wishlist" className="text-amber-600 hover:text-amber-700">View wishlist →</Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Settings</h3>
            <p className="text-gray-600 mb-4">Manage your preferences</p>
            <Link to="/settings" className="text-amber-600 hover:text-amber-700">Go to settings →</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/products"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <div className="p-2 bg-amber-100 rounded-lg mr-4">
                <span className="text-amber-600 text-xl">🛍️</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Browse Products</h3>
                <p className="text-sm text-gray-600">Discover new fragrances</p>
              </div>
            </Link>

            <Link
              to="/community"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <div className="p-2 bg-amber-100 rounded-lg mr-4">
                <span className="text-amber-600 text-xl">👥</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Community</h3>
                <p className="text-sm text-gray-600">Connect with others</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
