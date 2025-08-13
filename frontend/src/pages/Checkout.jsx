import React from 'react';
import { Link } from 'react-router-dom';

const Checkout = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 mb-4">Checkout process coming soon!</p>
          <Link to="/cart" className="text-amber-600 hover:text-amber-700">Back to Cart</Link>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 
