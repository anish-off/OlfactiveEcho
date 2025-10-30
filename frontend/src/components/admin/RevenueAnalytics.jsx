import React, { useState, useEffect } from 'react';
import {
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

const RevenueAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30'); // days
  const [comparisonMode, setComparisonMode] = useState(false);

  useEffect(() => {
    fetchRevenueAnalytics();
  }, [timeframe]);

  const fetchRevenueAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/admin/analytics/revenue?days=${timeframe}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data || {});
      }
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      toast.error('Failed to load revenue analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Generate CSV export
    if (!analytics?.revenueOverTime) return;

    const csvData = analytics.revenueOverTime.map(item => ({
      date: item.date,
      revenue: item.revenue,
      orders: item.orders,
      averageOrderValue: item.averageOrderValue
    }));

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Date,Revenue,Orders,Average Order Value\n' +
      csvData.map(row => `${row.date},${row.revenue},${row.orders},${row.averageOrderValue}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `revenue_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const stats = analytics?.summary || {};
  const revenueData = analytics?.revenueOverTime || [];
  const categoryRevenue = analytics?.categoryRevenue || [];
  const topProducts = analytics?.topProducts || [];
  const customerSegments = analytics?.customerSegments || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="text-gray-600">Comprehensive financial insights and revenue trends</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          <button
            onClick={exportReport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <ArrowTrendingDownIcon className="h-5 w-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <CurrencyRupeeIcon className="h-8 w-8" />
            <div className="text-right">
              <p className="text-sm opacity-90">Total Revenue</p>
              <p className="text-3xl font-bold">₹{stats.totalRevenue?.toLocaleString() || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            {stats.revenueGrowth >= 0 ? (
              <>
                <ArrowTrendingUpIcon className="h-4 w-4" />
                <span>+{stats.revenueGrowth?.toFixed(1)}% vs last period</span>
              </>
            ) : (
              <>
                <ArrowTrendingDownIcon className="h-4 w-4" />
                <span>{stats.revenueGrowth?.toFixed(1)}% vs last period</span>
              </>
            )}
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCartIcon className="h-8 w-8" />
            <div className="text-right">
              <p className="text-sm opacity-90">Avg Order Value</p>
              <p className="text-3xl font-bold">₹{stats.averageOrderValue?.toLocaleString() || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            {stats.aovGrowth >= 0 ? (
              <>
                <ArrowTrendingUpIcon className="h-4 w-4" />
                <span>+{stats.aovGrowth?.toFixed(1)}% vs last period</span>
              </>
            ) : (
              <>
                <ArrowTrendingDownIcon className="h-4 w-4" />
                <span>{stats.aovGrowth?.toFixed(1)}% vs last period</span>
              </>
            )}
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <ChartBarIcon className="h-8 w-8" />
            <div className="text-right">
              <p className="text-sm opacity-90">Total Orders</p>
              <p className="text-3xl font-bold">{stats.totalOrders?.toLocaleString() || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            {stats.ordersGrowth >= 0 ? (
              <>
                <ArrowTrendingUpIcon className="h-4 w-4" />
                <span>+{stats.ordersGrowth?.toFixed(1)}% vs last period</span>
              </>
            ) : (
              <>
                <ArrowTrendingDownIcon className="h-4 w-4" />
                <span>{stats.ordersGrowth?.toFixed(1)}% vs last period</span>
              </>
            )}
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <UserGroupIcon className="h-8 w-8" />
            <div className="text-right">
              <p className="text-sm opacity-90">Conversion Rate</p>
              <p className="text-3xl font-bold">{stats.conversionRate?.toFixed(2) || 0}%</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            {stats.conversionGrowth >= 0 ? (
              <>
                <ArrowTrendingUpIcon className="h-4 w-4" />
                <span>+{stats.conversionGrowth?.toFixed(1)}% vs last period</span>
              </>
            ) : (
              <>
                <ArrowTrendingDownIcon className="h-4 w-4" />
                <span>{stats.conversionGrowth?.toFixed(1)}% vs last period</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                comparisonMode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Compare Periods
            </button>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryRevenue}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {categoryRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Revenue Products</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={150} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Segments by Value</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {customerSegments.map((segment, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{segment.name}</h4>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    segment.name === 'High Value'
                      ? 'bg-green-100 text-green-800'
                      : segment.name === 'Medium Value'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {segment.count} customers
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-medium">₹{segment.revenue?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Lifetime Value</span>
                  <span className="font-medium">₹{segment.avgLifetimeValue?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Orders</span>
                  <span className="font-medium">{segment.avgOrders?.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Key Insights & Recommendations</h3>
        <div className="space-y-3 text-sm text-gray-700">
          {stats.revenueGrowth > 10 && (
            <div className="flex items-start gap-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600 mt-0.5" />
              <p>
                <strong>Strong growth!</strong> Your revenue is up {stats.revenueGrowth?.toFixed(1)}% compared
                to the previous period. Keep focusing on high-performing products.
              </p>
            </div>
          )}
          {stats.conversionRate < 2 && (
            <div className="flex items-start gap-2">
              <ArrowTrendingDownIcon className="h-5 w-5 text-orange-600 mt-0.5" />
              <p>
                <strong>Low conversion rate.</strong> Consider improving product descriptions, adding customer
                reviews, and optimizing your checkout process.
              </p>
            </div>
          )}
          {stats.averageOrderValue < 1000 && (
            <div className="flex items-start gap-2">
              <ShoppingCartIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <p>
                <strong>Upsell opportunity.</strong> Your average order value is ₹
                {stats.averageOrderValue?.toLocaleString()}. Consider bundling products or offering volume
                discounts to increase cart values.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
