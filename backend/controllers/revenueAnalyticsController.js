const Order = require('../models/Order');
const Perfume = require('../models/Perfume');
const User = require('../models/User');
const Category = require('../models/Category');

// Get comprehensive revenue analytics
const getRevenueAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Previous period for comparison
    const previousPeriodEnd = new Date(daysAgo);
    const previousPeriodStart = new Date(previousPeriodEnd);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(days));

    // Current period revenue
    const [currentRevenue, previousRevenue] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: daysAgo },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$total' }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$total' }
          }
        }
      ])
    ]);

    // Calculate growth percentages
    const current = currentRevenue[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    const previous = previousRevenue[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

    const revenueGrowth = previous.totalRevenue > 0
      ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100
      : 0;
    const ordersGrowth = previous.totalOrders > 0
      ? ((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100
      : 0;
    const aovGrowth = previous.avgOrderValue > 0
      ? ((current.avgOrderValue - previous.avgOrderValue) / previous.avgOrderValue) * 100
      : 0;

    // Revenue over time (daily)
    const revenueOverTime = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          date: {
            $concat: [
              { $toString: '$_id.day' },
              '/',
              { $toString: '$_id.month' },
              '/',
              { $toString: '$_id.year' }
            ]
          },
          revenue: 1,
          orders: 1,
          averageOrderValue: 1
        }
      }
    ]);

    // Revenue by category
    const categoryRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'perfumes',
          localField: 'items.perfume',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          name: '$category.name',
          revenue: 1
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Top revenue products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.perfume',
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          quantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'perfumes',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          revenue: 1,
          quantity: 1
        }
      }
    ]);

    // Customer segments by value
    const customerSegments = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $project: {
          totalSpent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$orders',
                    cond: { $ne: ['$$this.status', 'cancelled'] }
                  }
                },
                as: 'order',
                in: '$$order.total'
              }
            }
          },
          orderCount: {
            $size: {
              $filter: {
                input: '$orders',
                cond: { $ne: ['$$this.status', 'cancelled'] }
              }
            }
          }
        }
      },
      {
        $bucket: {
          groupBy: '$totalSpent',
          boundaries: [0, 5000, 20000, 999999999],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            revenue: { $sum: '$totalSpent' },
            avgLifetimeValue: { $avg: '$totalSpent' },
            avgOrders: { $avg: '$orderCount' }
          }
        }
      }
    ]);

    // Map bucket results to friendly names
    const segmentNames = {
      0: 'Low Value',
      5000: 'Medium Value',
      20000: 'High Value'
    };

    const mappedSegments = customerSegments.map(segment => ({
      name: segmentNames[segment._id] || 'Other',
      ...segment
    }));

    // Calculate conversion rate (orders / total customers)
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const conversionRate = totalCustomers > 0 ? (current.totalOrders / totalCustomers) * 100 : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue: current.totalRevenue,
          totalOrders: current.totalOrders,
          averageOrderValue: current.avgOrderValue,
          conversionRate,
          revenueGrowth,
          ordersGrowth,
          aovGrowth,
          conversionGrowth: 0 // Can be calculated if historical data is available
        },
        revenueOverTime,
        categoryRevenue,
        topProducts,
        customerSegments: mappedSegments
      }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics'
    });
  }
};

module.exports = {
  getRevenueAnalytics
};
