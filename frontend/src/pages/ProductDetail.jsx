import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // This would be replaced with actual API call
    // Mocking API delay
    const timer = setTimeout(() => {
      // In a real implementation, this data would come from the API
      const mockProduct = {
        _id: id,
        name: `Perfume ${id}`,
        description: `Description for perfume ${id}`,
        price: Math.floor(Math.random() * 100) + 50,
        category: ['Floral', 'Woody', 'Oriental', 'Fresh'][Math.floor(Math.random() * 4)],
        availability: 'In Stock',
        fragranceNotes: {
          top: [`Top Note 1 ${id}`, `Top Note 2 ${id}`],
          middle: [`Middle Note 1 ${id}`, `Middle Note 2 ${id}`],
          base: [`Base Note 1 ${id}`, `Base Note 2 ${id}`]
        },
        imageUrl: `https://picsum.photos/seed/perfume-${id}/800/600`
      };
      
      setProduct(mockProduct);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Error</h1>
            <p className="text-red-600">{error}</p>
            <Link to="/products" className="text-amber-600 hover:text-amber-700 mt-4 inline-block">
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <Link to="/products" className="text-amber-600 hover:text-amber-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H27v2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Products
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-8">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
            
            <div className="md:w-1/2 p-8">
              <p className="text-gray-600 mb-6">{product.description}</p>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Fragrance Notes</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Top Notes</h3>
                    <ul className="space-y-1">
                      {product.fragranceNotes.top.map(note => (
                        <li key={note} className="text-gray-600">• {note}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Middle Notes</h3>
                    <ul className="space-y-1">
                      {product.fragranceNotes.middle.map(note => (
                        <li key={note} className="text-gray-600">• {note}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Base Notes</h3>
                    <ul className="space-y-1">
                      {product.fragranceNotes.base.map(note => (
                        <li key={note} className="text-gray-600">• {note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-gray-600">Price:</span>
                  <span className="text-2xl font-bold text-gray-900 ml-2">${product.price}</span>
                </div>
                <div>
                  <span className="text-gray-600">Availability:</span>
                  <span className="text-green-600 font-medium ml-2">{product.availability}</span>
                </div>
              </div>
              
              <div className="mt-8 flex space-x-4">
                <button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md transition duration-200">
                  Add to Cart
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md transition duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;