import React, { useState, useEffect } from 'react';
import { 
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  UsersIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch('/api/admin/dashboard/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data || data);
      } else {
        // Set fallback data
        setStats(getFallbackStats());
      }
    } catch (error) {
      // Set fallback data
      setStats(getFallbackStats());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackStats = () => ({
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todaySales: { total: 0, count: 0 },
    weekSales: { total: 0, count: 0 },
    monthSales: { total: 0, count: 0 },
    topProducts: [],
    recentOrders: [],
    salesChart: [],
    categoryDistribution: []
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Revenue',
      value: `₹${stats?.overview?.monthSales?.toLocaleString() || 0}`,
      change: '+12.5%',
      changeType: 'increase',
      icon: CurrencyRupeeIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Total Orders',
      value: stats?.overview?.totalOrders || 0,
      change: '+8.2%',
      changeType: 'increase',
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Customers',
      value: stats?.overview?.totalCustomers || 0,
      change: '+15.3%',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Total Products',
      value: stats?.overview?.totalProducts || 0,
      change: '+2.1%',
      changeType: 'increase',
      icon: ShoppingBagIcon,
      color: 'bg-orange-500'
    }
  ];

  // Sample data for charts (replace with real data)
  const salesData = stats?.salesOverTime?.map(item => ({
    date: `${item._id.day}/${item._id.month}`,
    sales: item.sales,
    orders: item.orders
  })) || [];

  const orderStatusData = stats?.orderStatusStats?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const hasTopProducts = (stats?.topProducts?.length || 0) > 0;
  const hasRecentOrders = (stats?.recentOrders?.length || 0) > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Over Time</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'sales' ? `₹${value.toLocaleString()}` : value,
                  name === 'sales' ? 'Sales' : 'Orders'
                ]} />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity (only when data is available) */}
      {(hasTopProducts || hasRecentOrders) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Products */}
          {hasTopProducts && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
              <div className="space-y-4">
                {stats?.topProducts?.slice(0, 5).map((product) => (
                  <div key={product._id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={product.image || '/api/placeholder/40/40'}
                        alt={product.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{product.totalSold} sold</p>
                      <p className="text-sm text-gray-500">₹{product.revenue?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {hasRecentOrders && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
              <div className="space-y-4">
                {stats?.recentOrders?.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">#{order._id.slice(-6)}</p>
                      <p className="text-sm text-gray-500">{order.user?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{order.total}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
