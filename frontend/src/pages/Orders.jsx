import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
  EyeIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const formatCurrency = (v) => `₹${(v ?? 0).toFixed(2)}`;

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
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
      return <ClockIcon className="h-4 w-4" />;
    case 'confirmed':
      return <CheckCircleIcon className="h-4 w-4" />;
    case 'processing':
      return <ShoppingBagIcon className="h-4 w-4" />;
    case 'shipped':
      return <TruckIcon className="h-4 w-4" />;
    case 'delivered':
      return <CheckCircleIcon className="h-4 w-4" />;
    case 'cancelled':
    case 'declined':
      return <XCircleIcon className="h-4 w-4" />;
    default:
      return <ClockIcon className="h-4 w-4" />;
  }
};

const getPaymentStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Calculate estimated delivery date based on order status
const getEstimatedDeliveryDate = (order) => {
  // If admin has set an estimated delivery date, use that
  if (order.estimatedDeliveryDate) {
    return new Date(order.estimatedDeliveryDate);
  }
  
  if (!order.createdAt) return null;
  
  const createdDate = new Date(order.createdAt);
  
  // Add business days (Monday-Friday) skipping weekends
  const addBusinessDays = (date, days) => {
    const result = new Date(date);
    let addedDays = 0;
    
    while (addedDays < days) {
      result.setDate(result.getDate() + 1);
      // Check if it's a weekday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        addedDays++;
      }
    }
    
    return result;
  };
  
  // Add buffer for potential delays (1-2 days)
  const addBufferDays = (date, bufferDays = 2) => {
    const result = new Date(date);
    result.setDate(result.getDate() + bufferDays);
    return result;
  };
  
  // Get final delivery date with buffer
  const getDeliveryDateWithBuffer = (baseDate) => {
    return addBufferDays(baseDate, 1); // 1 day buffer for potential delays
  };
  
  switch (order.status) {
    case 'pending':
    case 'confirmed':
      // 5-7 business days for pending/confirmed orders
      return getDeliveryDateWithBuffer(addBusinessDays(createdDate, 6));
    case 'processing':
      // 3-5 business days for processing orders
      return getDeliveryDateWithBuffer(addBusinessDays(createdDate, 4));
    case 'shipped':
      // 1-3 business days for shipped orders
      return getDeliveryDateWithBuffer(addBusinessDays(createdDate, 2));
    case 'delivered':
    case 'cancelled':
    case 'declined':
    default:
      return null;
  }
};

const formatDeliveryDate = (date, prefix = 'Est. Delivery: ') => {
  if (!date) return '';
  return `${prefix}${date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })}`;
};

// Determine if payment status should be shown
const shouldShowPaymentStatus = (order) => {
  // Don't show if there's no payment status
  if (!order.paymentStatus) return false;
  
  // Don't show if payment status is the same as order status
  if (order.paymentStatus === order.status) return false;
  
  // Don't show pending payment status (it's redundant)
  if (order.paymentStatus === 'pending') return false;
  
  // For COD orders, only show payment status when it's completed or failed
  if (order.paymentMethod === 'cod') {
    return order.paymentStatus === 'completed' || order.paymentStatus === 'failed';
  }
  
  // For online payments, show when it provides additional information
  return order.paymentStatus === 'completed' || 
         order.paymentStatus === 'failed' || 
         order.paymentStatus === 'refunded';
};

const OrderCard = ({ order, onOrderUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    // Validate orderId
    if (!orderId) {
      alert('Invalid order ID');
      return;
    }

    setCancelling(true);
    try {
      console.log('Attempting to cancel order:', orderId);
      const response = await api.patch(`/orders/${orderId}/cancel`);
      console.log('Cancel order response:', response);
      
      if (response.data && response.data.success) {
        onOrderUpdate(response.data.order);
        alert('Order cancelled successfully!');
      } else {
        alert(`Failed to cancel order: ${response.data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      let errorMessage = 'Failed to cancel order';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        console.log('Error response:', status, data);
        
        if (status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (status === 403) {
          errorMessage = 'Access denied. You can only cancel your own orders.';
        } else if (status === 404) {
          errorMessage = 'Order not found.';
        } else if (status === 400) {
          errorMessage = data?.message || 'Order cannot be cancelled (may not be in pending status).';
        } else {
          errorMessage = data?.message || `Server error: ${status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        console.log('Error request:', error.request);
        errorMessage = 'Network error - server is not responding.';
      } else {
        // Something else happened
        console.log('Error message:', error.message);
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/orders/${order._id}`)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order #{order._id.slice(-8)}</h3>
            <p className="text-sm text-gray-600 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-primary">{formatCurrency(order.total)}</div>
            <div className="flex gap-2 mt-2 items-center justify-end flex-wrap">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status}</span>
              </span>
              {/* Show payment status only when it provides additional information */}
              {shouldShowPaymentStatus(order) && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              )}
              {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'declined' && getEstimatedDeliveryDate(order) && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                  {formatDeliveryDate(getEstimatedDeliveryDate(order))}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                {order.sample?.samplePerfume && ' + 1 sample'}
              </p>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <CreditCardIcon className="h-4 w-4 mr-1" />
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </p>
            </div>
            {getEstimatedDeliveryDate(order) && (
              <p className="text-sm text-blue-600 font-medium flex items-center">
                <TruckIcon className="h-4 w-4 mr-1" />
                {formatDeliveryDate(getEstimatedDeliveryDate(order))}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click when clicking this button
              setExpanded(!expanded);
            }}
            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            {expanded ? 'Hide Details' : 'View Details'}
          </button>
          
          <div className="flex gap-2">
            {order.status === 'shipped' && order.trackingNumber && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://track.example.com/${order.trackingNumber}`, '_blank');
                }}
                className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                <TruckIcon className="h-4 w-4 mr-1" />
                Track Order
              </button>
            )}
            {order.status === 'shipped' && getEstimatedDeliveryDate(order) && (
              <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-md text-sm font-medium">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {formatDeliveryDate(getEstimatedDeliveryDate(order), '')}
              </span>
            )}
            {order.status === 'pending' && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelOrder(order._id);
                }}
                disabled={cancelling}
                className="inline-flex items-center px-3 py-1 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                title={`Cancel order ${order._id} (Status: ${order.status})`}
              >
                <XCircleIcon className="h-4 w-4 mr-1" />
                {cancelling ? 'Cancelling...' : 'Cancel'}
              </button>
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Items */}
              <div>
                <h4 className="font-medium mb-3">Items Ordered</h4>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <img
                        src={item.perfume?.imageUrl || '/placeholder.png'}
                        alt={item.perfume?.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.perfume?.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                  
                  {order.sample?.samplePerfume && (
                    <div className="flex items-center gap-3">
                      <img
                        src={order.sample.samplePerfume.imageUrl || '/placeholder.png'}
                        alt={order.sample.samplePerfume.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{order.sample.samplePerfume.name} (Sample)</p>
                        <p className="text-xs text-gray-600">Qty: 1</p>
                      </div>
                      <div className="text-sm font-medium">
                        {order.sample.price === 0 ? 'Free' : formatCurrency(order.sample.price)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div>
                <h4 className="font-medium mb-3">Order Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  {getEstimatedDeliveryDate(order) && (
                    <div className="flex justify-between">
                      <span>Est. Delivery Date:</span>
                      <span className="font-medium">{formatDeliveryDate(getEstimatedDeliveryDate(order), '')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>

                {order.shippingAddress && (
                  <div className="mt-4">
                    <h5 className="font-medium text-sm mb-2">Shipping Address</h5>
                    <div className="text-sm text-gray-600">
                      <p>{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                      {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Orders = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Show success message if redirected from checkout
  const successMessage = location.state?.message;
  const newOrderId = location.state?.orderId;

  const handleOrderUpdate = (updatedOrder) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const response = await api.get('/orders');
        setOrders(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Please Login</h1>
        <p className="text-gray-600 mb-8">You need to be logged in to view your orders.</p>
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Orders</h1>
        <p className="text-gray-600">Track and manage your fragrance orders</p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
          {newOrderId && (
            <p className="text-green-600 text-sm mt-1">Order ID: #{newOrderId.slice(-8)}</p>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
          <Link 
            to="/products" 
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} onOrderUpdate={handleOrderUpdate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;