import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  CreditCardIcon,
  CalendarIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const formatCurrency = (v) => `₹${(v ?? 0).toFixed(2)}`;

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    processing: 'bg-purple-100 text-purple-800 border-purple-200',
    shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    declined: 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return <ClockIcon className="h-5 w-5" />;
    case 'confirmed':
      return <CheckCircleIcon className="h-5 w-5" />;
    case 'processing':
      return <ShoppingBagIcon className="h-5 w-5" />;
    case 'shipped':
      return <TruckIcon className="h-5 w-5" />;
    case 'delivered':
      return <CheckCircleIcon className="h-5 w-5" />;
    case 'cancelled':
    case 'declined':
      return <XCircleIcon className="h-5 w-5" />;
    default:
      return <ClockIcon className="h-5 w-5" />;
  }
};

const UserOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Please Login</h1>
        <p className="text-gray-600 mb-8">You need to be logged in to view order details.</p>
        <Link to="/login" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90">
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <div className="animate-pulse space-y-6">
          <div className="bg-gray-200 h-8 rounded w-1/3"></div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
          <div className="bg-gray-200 h-32 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
        <Link 
          to="/orders"
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Orders
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order._id.slice(-8)}</h1>
            <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary mb-2">{formatCurrency(order.total)}</div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="ml-2 capitalize">{order.status}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={item.perfume?.image_url || item.perfume?.imageUrl}
                    alt={item.perfume?.name || 'Product'}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.perfume?.name || 'Unknown Product'}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Price: {formatCurrency(item.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
              
              {order.sample?.samplePerfume && (
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <img
                    src={order.sample.samplePerfume.image_url || order.sample.samplePerfume.imageUrl}
                    alt={order.sample.samplePerfume.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{order.sample.samplePerfume.name} (Sample)</h3>
                    <p className="text-sm text-blue-600">Free sample included</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">
                      {order.sample.price === 0 ? 'Free' : formatCurrency(order.sample.price)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Messages */}
          {(order.declineReason || order.adminNotes || order.estimatedDeliveryDate) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">Order Updates</h2>
              <div className="space-y-4">
                {order.status === 'confirmed' && order.estimatedDeliveryDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-blue-800 font-medium">Order Approved!</p>
                        <p className="text-blue-700 text-sm mt-1">
                          Your order has been confirmed and will be delivered by {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                        </p>
                        {order.approvedAt && (
                          <p className="text-blue-600 text-xs mt-1">
                            Approved on {new Date(order.approvedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {order.status === 'declined' && order.declineReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <XCircleIcon className="h-5 w-5 text-red-600 mr-3" />
                      <div>
                        <p className="text-red-800 font-medium">Order Declined</p>
                        <p className="text-red-700 text-sm mt-1">{order.declineReason}</p>
                        {order.declinedAt && (
                          <p className="text-red-600 text-xs mt-1">
                            Declined on {new Date(order.declinedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {order.adminNotes && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <p className="text-gray-800 font-medium">Admin Note</p>
                        <p className="text-gray-700 text-sm mt-1">{order.adminNotes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary & Details */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Payment Information
            </h2>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Method:</span>{' '}
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </p>
              {order.paymentStatus && (
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{' '}
                  <span className="capitalize">{order.paymentStatus}</span>
                </p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                Shipping Address
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
              </div>
            </div>
          )}

          {/* Tracking Information */}
          {order.status === 'shipped' && order.trackingNumber && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <TruckIcon className="h-5 w-5 mr-2" />
                Tracking Information
              </h2>
              <div className="space-y-3">
                <p className="text-sm">
                  <span className="font-medium">Tracking Number:</span>{' '}
                  <span className="font-mono">{order.trackingNumber}</span>
                </p>
                <button 
                  onClick={() => window.open(`https://track.example.com/${order.trackingNumber}`, '_blank')}
                  className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Track Package
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetails;
