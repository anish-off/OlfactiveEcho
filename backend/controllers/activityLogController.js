const ActivityLog = require('../models/ActivityLog');

// Get activity logs with filtering
const getActivityLogs = async (req, res) => {
  try {
    const { filter = 'all', days = 7, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build query based on filter
    let query = {};
    
    if (filter !== 'all') {
      const typeFilters = {
        orders: ['order_created', 'order_updated', 'order_cancelled'],
        products: ['product_created', 'product_updated', 'product_deleted', 'stock_updated'],
        customers: ['customer_registered', 'customer_updated'],
        coupons: ['coupon_created', 'coupon_used'],
        payments: ['payment_received', 'refund_processed']
      };

      if (typeFilters[filter]) {
        query.type = { $in: typeFilters[filter] };
      }
    }

    // Date range filter
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    query.createdAt = { $gte: daysAgo };

    // Get activities with pagination
    const [activities, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ActivityLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs'
    });
  }
};

// Create activity log (helper function to be used by other controllers)
const createActivityLog = async (type, userId, details, req) => {
  try {
    const activityLog = new ActivityLog({
      type,
      user: userId || null,
      details: details || {},
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers?.['user-agent']
    });

    await activityLog.save();
    return activityLog;
  } catch (error) {
    console.error('Create activity log error:', error);
    // Don't throw error - activity logging shouldn't break main functionality
    return null;
  }
};

// Get activity summary
const getActivitySummary = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const summary = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get activity summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity summary'
    });
  }
};

module.exports = {
  getActivityLogs,
  createActivityLog,
  getActivitySummary
};
