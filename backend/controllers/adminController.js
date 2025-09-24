const User = require('../models/User');
const Perfume = require('../models/Perfume');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Coupon = require('../models/Coupon');

// Dashboard Overview
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get basic counts
    const [
      totalCustomers,
      totalProducts,
      totalOrders,
      totalBrands,
      totalCategories
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Perfume.countDocuments(),
      Order.countDocuments(),
      Brand.countDocuments(),
      Category.countDocuments()
    ]);

    // Get sales data
    const [todaySales, weekSales, monthSales] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfWeek }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ])
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { 
        $group: { 
          _id: '$items.perfume', 
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        } 
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
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
          brand: '$product.brand.name',
          totalSold: 1,
          revenue: 1,
          image: '$product.image_url'
        }
      }
    ]);

    // Get order status distribution
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('items.perfume', 'name brand.name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id user items total status createdAt');

    // Sales over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const salesOverTime = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: thirtyDaysAgo },
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
          sales: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          totalProducts,
          totalOrders,
          totalBrands,
          totalCategories,
          todaySales: todaySales[0]?.total || 0,
          todayOrders: todaySales[0]?.count || 0,
          weekSales: weekSales[0]?.total || 0,
          weekOrders: weekSales[0]?.count || 0,
          monthSales: monthSales[0]?.total || 0,
          monthOrders: monthSales[0]?.count || 0
        },
        topProducts,
        orderStatusStats,
        recentOrders,
        salesOverTime
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// Get all customers with pagination and search
const getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const searchQuery = search ? {
      role: 'user',
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : { role: 'user' };

    const [customers, total] = await Promise.all([
      User.find(searchQuery)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(searchQuery)
    ]);

    // Get order counts for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await Order.countDocuments({ user: customer._id });
        const totalSpent = await Order.aggregate([
          { $match: { user: customer._id, status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        
        return {
          ...customer.toObject(),
          orderCount,
          totalSpent: totalSpent[0]?.total || 0
        };
      })
    );

    res.json({
      success: true,
      data: {
        customers: customersWithStats,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers'
    });
  }
};

// Get customer details with order history
const getCustomerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await User.findById(id).select('-password');
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const orders = await Order.find({ user: id })
      .populate('items.perfume', 'name brand.name image_url')
      .sort({ createdAt: -1 });

    const stats = await Order.aggregate([
      { $match: { user: customer._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        customer,
        orders,
        stats: stats[0] || { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 }
      }
    });
  } catch (error) {
    console.error('Get customer details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer details'
    });
  }
};

module.exports = {
  getDashboardStats,
  getCustomers,
  getCustomerDetails
};
