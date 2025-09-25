import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const AdminProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(data.data);
      } else {
        console.error('Failed to fetch product');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock <= 10) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <p className="text-gray-600">The requested product could not be found.</p>
        <button
          onClick={() => navigate('/admin/products')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/products', { state: { refreshProducts: true } })}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600">{product.brand?.name}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/admin/products/${product._id}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Image and Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="aspect-square mb-4">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <PhotoIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Stock Status</h3>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${stockStatus.color}`}>
                  {stockStatus.text}
                </span>
                <p className="text-sm text-gray-600 mt-1">{product.stock} units available</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Price</h3>
                <p className="text-2xl font-bold text-indigo-600">₹{product.price?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Category</h4>
                <p className="text-sm text-gray-900">{product.category || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Gender</h4>
                <p className="text-sm text-gray-900 capitalize">{product.gender || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Volume</h4>
                <p className="text-sm text-gray-900">{product.volume || 100}ml</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Concentration</h4>
                <p className="text-sm text-gray-900">{product.concentration || 'EDT'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Intensity</h4>
                <p className="text-sm text-gray-900 capitalize">{product.intensity || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Longevity</h4>
                <p className="text-sm text-gray-900">{product.longevity || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Sillage</h4>
                <p className="text-sm text-gray-900 capitalize">{product.sillage || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Rating</h4>
                <p className="text-sm text-gray-900">{product.rating || 0}/5 ({product.reviewCount || 0} reviews)</p>
              </div>
            </div>
            
            {product.description && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                <p className="text-sm text-gray-900">{product.description}</p>
              </div>
            )}
            
            {product.occasions && product.occasions.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Occasions</h4>
                <div className="flex flex-wrap gap-2">
                  {product.occasions.map((occasion, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                      {occasion}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {product.seasons && product.seasons.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Seasons</h4>
                <div className="flex flex-wrap gap-2">
                  {product.seasons.map((season, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full capitalize">
                      {season}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fragrance Notes */}
      {product.notes && Object.keys(product.notes).some(key => product.notes[key]?.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fragrance Notes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(product.notes).map(([noteType, notes]) => {
              if (!notes || notes.length === 0) return null;
              return (
                <div key={noteType}>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">{noteType}</h4>
                  <div className="space-y-1">
                    {notes.map((note, index) => (
                      <p key={index} className="text-sm text-gray-900">{note.name}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Accords */}
      {product.main_accords && product.main_accords.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Main Accords</h3>
          <div className="space-y-3">
            {product.main_accords.map((accord, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-900 capitalize">{accord.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${accord.intensity || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{accord.intensity || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductDetail;
