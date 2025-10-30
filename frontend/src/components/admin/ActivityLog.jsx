import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  UserIcon,
  ShoppingBagIcon,
  CurrencyRupeeIcon,
  TagIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7'); // days
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchActivities();
  }, [filter, dateRange, page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/admin/activity-log?filter=${filter}&days=${dateRange}&page=${page}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setActivities(data.data.activities || []);
        setTotalPages(data.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'order_created':
      case 'order_updated':
      case 'order_cancelled':
        return <ShoppingBagIcon className="h-5 w-5" />;
      case 'product_created':
      case 'product_updated':
      case 'product_deleted':
        return <ArchiveBoxIcon className="h-5 w-5" />;
      case 'customer_registered':
      case 'customer_updated':
        return <UserGroupIcon className="h-5 w-5" />;
      case 'coupon_created':
      case 'coupon_used':
        return <TagIcon className="h-5 w-5" />;
      case 'payment_received':
      case 'refund_processed':
        return <CurrencyRupeeIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  const getActivityColor = (type) => {
    if (type.includes('created') || type.includes('registered')) return 'text-green-600 bg-green-100';
    if (type.includes('updated')) return 'text-blue-600 bg-blue-100';
    if (type.includes('deleted') || type.includes('cancelled')) return 'text-red-600 bg-red-100';
    if (type.includes('payment') || type.includes('coupon')) return 'text-purple-600 bg-purple-100';
    return 'text-gray-600 bg-gray-100';
  };

  const formatActivityMessage = (activity) => {
    const { type, details, user } = activity;
    const userName = user?.name || 'System';

    switch (type) {
      case 'order_created':
        return `${userName} placed a new order #${details?.orderId?.slice(-6)} worth ₹${details?.amount}`;
      case 'order_updated':
        return `Order #${details?.orderId?.slice(-6)} status changed to ${details?.status}`;
      case 'order_cancelled':
        return `${userName} cancelled order #${details?.orderId?.slice(-6)}`;
      case 'product_created':
        return `New product "${details?.productName}" added to catalog`;
      case 'product_updated':
        return `Product "${details?.productName}" was updated`;
      case 'product_deleted':
        return `Product "${details?.productName}" was removed`;
      case 'customer_registered':
        return `New customer ${userName} registered`;
      case 'coupon_created':
        return `New coupon "${details?.couponCode}" created`;
      case 'coupon_used':
        return `${userName} used coupon "${details?.couponCode}" - saved ₹${details?.discount}`;
      case 'payment_received':
        return `Payment of ₹${details?.amount} received for order #${details?.orderId?.slice(-6)}`;
      case 'stock_updated':
        return `Stock updated for "${details?.productName}" - ${details?.oldStock} → ${details?.newStock}`;
      default:
        return activity.message || 'Activity recorded';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = formatActivityMessage(activity)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log & Audit Trail</h1>
        <p className="text-gray-600">Monitor all activities and changes in your store</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Activity Type Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Activities</option>
            <option value="orders">Orders</option>
            <option value="products">Products</option>
            <option value="customers">Customers</option>
            <option value="coupons">Coupons</option>
            <option value="payments">Payments</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="1">Last 24 Hours</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {filteredActivities.map((activity, idx) => (
                <li key={activity._id}>
                  <div className="relative pb-8">
                    {/* Timeline line */}
                    {idx !== filteredActivities.length - 1 && (
                      <span
                        className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}

                    <div className="relative flex items-start space-x-3">
                      {/* Icon */}
                      <div>
                        <span
                          className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white ${getActivityColor(
                            activity.type
                          )}`}
                        >
                          {getActivityIcon(activity.type)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div>
                          <div className="text-sm text-gray-900">
                            {formatActivityMessage(activity)}
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {new Date(activity.createdAt).toLocaleString()}
                            </span>
                            {activity.user && (
                              <span className="flex items-center gap-1">
                                <UserIcon className="h-4 w-4" />
                                {activity.user.email}
                              </span>
                            )}
                            {activity.ipAddress && (
                              <span className="text-xs text-gray-400">
                                IP: {activity.ipAddress}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Additional Details */}
                        {activity.details && Object.keys(activity.details).length > 0 && (
                          <div className="mt-2">
                            <details className="group">
                              <summary className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-700">
                                View Details
                              </summary>
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs font-mono">
                                <pre className="whitespace-pre-wrap">
                                  {JSON.stringify(activity.details, null, 2)}
                                </pre>
                              </div>
                            </details>
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            activity.type.includes('created') || activity.type.includes('registered')
                              ? 'bg-green-100 text-green-800'
                              : activity.type.includes('deleted') || activity.type.includes('cancelled')
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {activity.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Empty State */}
          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or date range
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
