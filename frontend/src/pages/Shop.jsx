import React from 'react';
import { Link } from 'react-router-dom';

const Shop = () => {
  const categories = [
    { name: 'Men\'s Fragrances', count: 24, image: '/assets/mens.jpg' },
    { name: 'Women\'s Fragrances', count: 32, image: '/assets/womens.jpg' },
    { name: 'Unisex Fragrances', count: 18, image: '/assets/unisex.jpg' },
    { name: 'Niche Fragrances', count: 15, image: '/assets/niche.jpg' },
    { name: 'Limited Editions', count: 8, image: '/assets/limited.jpg' },
    { name: 'Gift Sets', count: 12, image: '/assets/gifts.jpg' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our extensive collection of luxury fragrances, 
            carefully curated for every preference and occasion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {categories.map((category, index) => (
            <Link
              key={index}
              to="/products"
              className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <span className="text-amber-600 text-4xl font-bold group-hover:scale-110 transition-transform">
                  {category.name.charAt(0)}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600">
                  {category.count} products available
                </p>
              </div>
            </Link>
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

export default Shop; 
