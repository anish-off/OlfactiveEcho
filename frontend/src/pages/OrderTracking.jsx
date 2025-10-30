import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
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
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon
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

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [requestingReturn, setRequestingReturn] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  useEffect(() => {
    fetchOrderTimeline();
  }, [id]);

  const fetchOrderTimeline = async () => {
    try {
      setLoading(true);
      const timelineResponse = await api.get(`/orders/${id}/timeline`);
      const orderResponse = await api.get(`/orders/${id}`);
      
      setTimeline(timelineResponse.data.timeline);
      setTrackingInfo(timelineResponse.data.trackingInfo);
      setCurrentStatus(timelineResponse.data.currentStatus);
      setOrder(orderResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      setCancellingOrder(true);
      const reason = prompt('Please provide a reason for cancellation (optional):');
      await api.patch(`/orders/${id}/cancel`, { reason });
      await fetchOrderTimeline();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingOrder(false);
    }
  };

  const handleRequestReturn = async () => {
    try {
      setRequestingReturn(true);
      await api.post(`/orders/${id}/return`, { reason: returnReason });
      setShowReturnModal(false);
      setReturnReason('');
      await fetchOrderTimeline();
      alert('Return request submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setRequestingReturn(false);
    }
  };

  const handleReorder = async () => {
    try {
      const response = await api.post(`/orders/${id}/reorder`);
      if (response.data.success) {
        navigate('/checkout', { 
          state: { 
            reorderData: response.data.order,
            message: 'Items from your previous order have been added to cart' 
          }
        });
      } else {
        // Show availability issues
        const message = `${response.data.message}\n\nAvailable items: ${response.data.availableItems?.length || 0}\nUnavailable items: ${response.data.unavailableItems?.length || 0}`;
        if (response.data.canProceed && window.confirm(`${message}\n\nDo you want to proceed with available items only?`)) {
          // Handle partial reorder
          navigate('/checkout', { 
            state: { 
              reorderData: { items: response.data.availableItems },
              message: 'Available items have been added to cart'
            }
          });
        } else {
          alert(message);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reorder');
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockIcon className="h-5 w-5" />,
      confirmed: <CheckCircleIcon className="h-5 w-5" />,
      processing: <ArrowPathIcon className="h-5 w-5" />,
      shipped: <TruckIcon className="h-5 w-5" />,
      out_for_delivery: <MapPinIcon className="h-5 w-5" />,
      delivered: <CheckCircleIcon className="h-5 w-5" />,
      cancelled: <XCircleIcon className="h-5 w-5" />,
      declined: <XCircleIcon className="h-5 w-5" />,
      returned: <ArrowPathIcon className="h-5 w-5" />,
      refunded: <CreditCardIcon className="h-5 w-5" />
    };
    return icons[status] || <ClockIcon className="h-5 w-5" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      declined: 'bg-red-100 text-red-800 border-red-200',
      returned: 'bg-gray-100 text-gray-800 border-gray-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Order</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Orders
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
              <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary mb-2">{formatCurrency(order.total)}</div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-2 capitalize">{order.status.replace('_', ' ')}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Order Timeline</h2>
              
              <div className="space-y-6">
                {timeline.map((event, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 capitalize">
                          {event.status.replace('_', ' ')}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      {event.note && (
                        <p className="mt-1 text-sm text-gray-600">{event.note}</p>
                      )}
                      {event.location && (
                        <p className="mt-1 text-xs text-gray-500">📍 {event.location}</p>
                      )}
                      {event.updatedBy && event.updatedBy.name && (
                        <p className="mt-1 text-xs text-gray-500">Updated by {event.updatedBy.name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Current Status Message */}
              {currentStatus && (
                <div className={`mt-6 p-4 rounded-lg ${
                  currentStatus.color === 'green' ? 'bg-green-50 border border-green-200' :
                  currentStatus.color === 'red' ? 'bg-red-50 border border-red-200' :
                  currentStatus.color === 'yellow' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    currentStatus.color === 'green' ? 'text-green-800' :
                    currentStatus.color === 'red' ? 'text-red-800' :
                    currentStatus.color === 'yellow' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {currentStatus.message}
                  </p>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.perfume?.image || '/fragrance_images/Unknown.jpg'}
                      alt={item.perfume?.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/fragrance_images/Unknown.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.perfume?.name}</h3>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.quantity * item.price)}</p>
                    </div>
                  </div>
                ))}

                {/* Order Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>{formatCurrency(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tracking Information */}
            {trackingInfo && (trackingInfo.trackingNumber || trackingInfo.carrier) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4">Tracking Information</h2>
                <div className="space-y-3">
                  {trackingInfo.trackingNumber && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Tracking Number</p>
                      <p className="font-mono text-sm bg-gray-50 p-2 rounded">{trackingInfo.trackingNumber}</p>
                    </div>
                  )}
                  {trackingInfo.carrier && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Carrier</p>
                      <p className="text-sm">{trackingInfo.carrier}</p>
                    </div>
                  )}
                  {trackingInfo.trackingUrl && (
                    <button
                      onClick={() => window.open(trackingInfo.trackingUrl, '_blank')}
                      className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Track Package
                    </button>
                  )}
                  {trackingInfo.estimatedDelivery && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Estimated Delivery</p>
                      <p className="text-sm">{formatDate(trackingInfo.estimatedDelivery)}</p>
                    </div>
                  )}
                  {trackingInfo.actualDelivery && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Delivered On</p>
                      <p className="text-sm text-green-600 font-medium">{formatDate(trackingInfo.actualDelivery)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Order Actions</h2>
              <div className="space-y-3">
                {/* Cancel Order */}
                {order.canCancel && ['pending', 'confirmed'].includes(order.status) && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancellingOrder}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {cancellingOrder ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}

                {/* Request Return */}
                {order.status === 'delivered' && !order.returnRequest?.requested && (
                  <button
                    onClick={() => setShowReturnModal(true)}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Request Return
                  </button>
                )}

                {/* Return Status */}
                {order.returnRequest?.requested && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-medium text-orange-800">Return Requested</p>
                    <p className="text-xs text-orange-600">Status: {order.returnRequest.status}</p>
                  </div>
                )}

                {/* Reorder */}
                <button
                  onClick={handleReorder}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Order Again
                </button>

                {/* Contact Support */}
                <Link
                  to="/contact"
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-center block"
                >
                  Contact Support
                </Link>
              </div>
            </div>

            {/* Delivery Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Delivery Address
                </h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                  {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Return Request Modal */}
        {showReturnModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Request Return</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for return
                  </label>
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Please explain why you want to return this order..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowReturnModal(false);
                      setReturnReason('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestReturn}
                    disabled={requestingReturn || !returnReason.trim()}
                    className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  >
                    {requestingReturn ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;