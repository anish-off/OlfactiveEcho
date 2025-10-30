import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import OrderDetails from './OrderDetails';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [trackingModal, setTrackingModal] = useState({ show: false, order: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, statusFilter]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter
      });

      const response = await fetch(`/api/admin/orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data.orders || []);
        setTotalPages(data.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, trackingData = {}) => {
    try {
      setActionLoading(prev => ({ ...prev, [orderId]: 'updating' }));
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          ...trackingData
        })
      });

      if (response.ok) {
        fetchOrders();
        showToast(`Order status updated to ${newStatus}`, 'success');
      } else {
        showToast('Failed to update order status', 'error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Failed to update order status', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      declined: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClipboardDocumentListIcon className="h-4 w-4" />;
      case 'processing':
        return <ClipboardDocumentListIcon className="h-4 w-4" />;
      case 'shipped':
        return <TruckIcon className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled':
      case 'declined':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClipboardDocumentListIcon className="h-4 w-4" />;
    }
  };

  const handleApproveOrder = async (orderId) => {
    try {
      setActionLoading(prev => ({ ...prev, [orderId]: 'approving' }));
      const token = localStorage.getItem('token');
      
      // Default delivery date: 5 days from now
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 5);
      
      const response = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estimatedDeliveryDate: deliveryDate.toISOString(),
          adminNotes: 'Order approved from admin panel'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(prev => prev.map(order => 
          order._id === orderId ? data.order : order
        ));
        showToast('Order approved successfully!', 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to approve order', 'error');
      }
    } catch (error) {
      console.error('Error approving order:', error);
      showToast('Failed to approve order', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  const handleDeclineOrder = async (orderId) => {
    const reason = prompt('Please provide a reason for declining this order:');
    if (!reason || !reason.trim()) {
      showToast('Decline reason is required', 'error');
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [orderId]: 'declining' }));
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/orders/${orderId}/decline`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          declineReason: reason.trim(),
          adminNotes: 'Order declined from admin panel'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(prev => prev.map(order => 
          order._id === orderId ? data.order : order
        ));
        showToast('Order declined successfully!', 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to decline order', 'error');
      }
    } catch (error) {
      console.error('Error declining order:', error);
      showToast('Failed to decline order', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600">Track and manage customer orders</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="declined">Declined</option>
              </select>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Total Orders:</span>
                <span className="font-semibold text-gray-900">{orders.length}</span>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              #{order._id.slice(-8)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.user?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.user?.email || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {order.items?.length || 0} items
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.items?.[0]?.perfume?.name || 'N/A'}
                              {order.items?.length > 1 && ` +${order.items.length - 1} more`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{order.total?.toLocaleString() || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">{order.status}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {order.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveOrder(order._id)}
                                    disabled={actionLoading[order._id] === 'approving'}
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                  >
                                    {actionLoading[order._id] === 'approving' ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    ) : (
                                      <CheckCircleIcon className="h-3 w-3" />
                                    )}
                                    <span className="ml-1">Accept</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeclineOrder(order._id)}
                                    disabled={actionLoading[order._id] === 'declining'}
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                                  >
                                    {actionLoading[order._id] === 'declining' ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    ) : (
                                      <XCircleIcon className="h-3 w-3" />
                                    )}
                                    <span className="ml-1">Decline</span>
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => navigate(`/admin/orders/${order._id}`)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="View Details"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing page <span className="font-medium">{currentPage}</span> of{' '}
                          <span className="font-medium">{totalPages}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === currentPage
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

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
      } />
      <Route path="/:id" element={<OrderDetails />} />
    </Routes>
  );
};


export default OrderManagement;
