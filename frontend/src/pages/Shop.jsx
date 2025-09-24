import React from 'react';
import { Link } from 'react-router-dom';

const Shop = () => {
  const categories = [
    { 
      name: 'Men\'s Fragrances', 
      count: 24, 
      image: '/assets/mens.jpg',
      route: '/collections?gender=men',
      description: 'Bold and sophisticated scents for men'
    },
    { 
      name: 'Women\'s Fragrances', 
      count: 32, 
      image: '/assets/womens.jpg',
      route: '/collections?gender=women',
      description: 'Elegant and captivating fragrances for women'
    },
    { 
      name: 'Unisex Fragrances', 
      count: 18, 
      image: '/assets/unisex.jpg',
      route: '/collections?gender=unisex',
      description: 'Versatile scents for everyone'
    },
    { 
      name: 'Citrus Collection', 
      count: 15, 
      image: '/assets/citrus.jpg',
      route: '/collections?family=citrus',
      description: 'Fresh and energizing citrus fragrances'
    },
    { 
      name: 'Oriental Collection', 
      count: 12, 
      image: '/assets/oriental.jpg',
      route: '/collections?family=oriental',
      description: 'Rich and exotic oriental scents'
    },
    { 
      name: 'Floral Collection', 
      count: 20, 
      image: '/assets/floral.jpg',
      route: '/collections?family=floral',
      description: 'Beautiful and romantic floral bouquets'
    },
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
              to={category.route}
              className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="h-48 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-amber-600/20"></div>
                <span className="text-amber-700 text-5xl font-bold group-hover:scale-110 transition-transform duration-300 relative z-10">
                  {category.name.charAt(0)}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-3 text-sm">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-amber-600 font-medium">
                    {category.count} products
                  </span>
                  <svg 
                    className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/collections"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#c69a2d] hover:bg-[#b8860b] transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Shop; 
