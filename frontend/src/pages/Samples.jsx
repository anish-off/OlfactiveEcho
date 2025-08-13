import React from 'react';
import { Link } from 'react-router-dom';

const Samples = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sample Fragrances
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our curated collection of luxury fragrance samples. 
            Try before you buy and find your perfect scent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <span className="text-amber-600 text-4xl font-bold">S{item}</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sample Fragrance {item}
                </h3>
                <p className="text-gray-600 mb-4">
                  Experience the essence of luxury with our premium fragrance samples.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-amber-600">$9.99</span>
                  <Link
                    to="/sample-checkout"
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                  >
                    Add to Cart
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Samples; 
