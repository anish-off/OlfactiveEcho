import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  UserIcon,
  MapPinIcon,
  CreditCardIcon,
  CalendarIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        
        // Set default delivery date (5 days from now)
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 5);
        setEstimatedDeliveryDate(defaultDate.toISOString().split('T')[0]);
      } else {
        console.error('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/orders/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estimatedDeliveryDate,
          adminNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setShowApproveModal(false);
        showToast('Order approved successfully!', 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to approve order', 'error');
      }
    } catch (error) {
      console.error('Error approving order:', error);
      showToast('Failed to approve order', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineOrder = async () => {
    if (!declineReason.trim()) {
      showToast('Please provide a reason for declining the order', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/orders/${id}/decline`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          declineReason,
          adminNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setShowDeclineModal(false);
        showToast('Order declined successfully!', 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to decline order', 'error');
      }
    } catch (error) {
      console.error('Error declining order:', error);
      showToast('Failed to decline order', 'error');
    } finally {
      setActionLoading(false);
    }
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
        return <ClockIcon className="h-5 w-5" />;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order._id.slice(-8)}
            </h1>
            <p className="text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        {order.status === 'pending' && (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowApproveModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <CheckCircleIcon className="h-5 w-5" />
              <span>Approve Order</span>
            </button>
            <button
              onClick={() => setShowDeclineModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <XCircleIcon className="h-5 w-5" />
              <span>Decline Order</span>
            </button>
          </div>
        )}
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg border ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {order.status}
              </h3>
              <p className="text-gray-600">
                {order.status === 'pending' && 'Waiting for admin approval'}
                {order.status === 'confirmed' && 'Order confirmed and being processed'}
                {order.status === 'declined' && 'Order has been declined'}
                {order.status === 'processing' && 'Order is being prepared'}
                {order.status === 'shipped' && 'Order has been shipped'}
                {order.status === 'delivered' && 'Order has been delivered'}
                {order.status === 'cancelled' && 'Order has been cancelled'}
              </p>
            </div>
          </div>
          
          {order.estimatedDeliveryDate && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Estimated Delivery</p>
              <p className="font-semibold text-gray-900">
                {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Admin Actions Info */}
        {(order.approvedBy || order.declinedBy) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.approvedBy && (
                <div>
                  <p className="text-sm text-gray-600">Approved by</p>
                  <p className="font-medium text-green-600">Admin</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.approvedAt).toLocaleString()}
                  </p>
                </div>
              )}
              {order.declinedBy && (
                <div>
                  <p className="text-sm text-gray-600">Declined by</p>
                  <p className="font-medium text-red-600">Admin</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.declinedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            
            {order.declineReason && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">Decline Reason</p>
                <p className="text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  {order.declineReason}
                </p>
              </div>
            )}
            
            {order.adminNotes && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">Admin Notes</p>
                <p className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                  {order.adminNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Customer Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-gray-900">{order.user?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{order.user?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Payment Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-medium text-gray-900 capitalize">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                order.paymentStatus === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
            {order.paymentId && (
              <div>
                <p className="text-sm text-gray-600">Payment ID</p>
                <p className="font-medium text-gray-900">{order.paymentId}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPinIcon className="h-5 w-5 mr-2" />
          Shipping Address
        </h3>
        <div className="text-gray-700">
          <p className="font-medium">{order.shippingAddress?.fullName}</p>
          <p>{order.shippingAddress?.address}</p>
          <p>
            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
          </p>
          {order.shippingAddress?.phone && (
            <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items?.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
              <div className="flex items-center space-x-4">
                <img
                  src={item.perfume?.image_url || item.perfume?.imageUrl}
                  alt={item.perfume?.name}
                  className="w-15 h-15 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{item.perfume?.name}</h4>
                  <p className="text-sm text-gray-600">
                    Brand: {item.perfume?.brand?.name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">₹{item.price?.toLocaleString()}</p>
                <p className="text-sm text-gray-600">
                  Total: ₹{(item.price * item.quantity)?.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">₹{order.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">₹{order.shipping?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">₹{order.tax?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>₹{order.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Order Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Order</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Add any notes for the customer..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleApproveOrder}
                disabled={actionLoading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Approving...' : 'Approve Order'}
              </button>
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Order Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Decline Order</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Declining *
                </label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Please provide a reason for declining this order..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleDeclineOrder}
                disabled={actionLoading || !declineReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Declining...' : 'Decline Order'}
              </button>
              <button
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`flex items-center p-4 rounded-lg shadow-lg max-w-sm ${
            toast.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast({ show: false, message: '', type: '' })}
              className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
