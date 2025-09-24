const Coupon = require('../models/Coupon');
const Perfume = require('../models/Perfume');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

// Get all coupons
const getCoupons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const skip = (page - 1) * limit;

    let searchQuery = {};
    
    if (search) {
      searchQuery.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') {
      const now = new Date();
      searchQuery.isActive = true;
      searchQuery.startDate = { $lte: now };
      searchQuery.endDate = { $gte: now };
    } else if (status === 'expired') {
      searchQuery.endDate = { $lt: new Date() };
    } else if (status === 'inactive') {
      searchQuery.isActive = false;
    }

    const [coupons, total] = await Promise.all([
      Coupon.find(searchQuery)
        .populate('createdBy', 'name email')
        .populate('applicableProducts', 'name')
        .populate('applicableCategories', 'name')
        .populate('applicableBrands', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Coupon.countDocuments(searchQuery)
    ]);

    res.json({
      success: true,
      data: {
        coupons,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons'
    });
  }
};

// Get single coupon
const getCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id)
      .populate('createdBy', 'name email')
      .populate('applicableProducts', 'name brand.name price')
      .populate('applicableCategories', 'name')
      .populate('applicableBrands', 'name');
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Get coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon'
    });
  }
};

// Create coupon
const createCoupon = async (req, res) => {
  try {
    const couponData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    // Validate required fields
    if (!couponData.code || !couponData.name || !couponData.type || !couponData.value) {
      return res.status(400).json({
        success: false,
        message: 'Code, name, type, and value are required'
      });
    }

    // Validate dates
    if (new Date(couponData.startDate) >= new Date(couponData.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Validate percentage value
    if (couponData.type === 'percentage' && couponData.value > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%'
      });
    }

    const coupon = new Coupon(couponData);
    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create coupon'
      });
    }
  }
};

// Update coupon
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate dates if provided
    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.startDate) >= new Date(updateData.endDate)) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    // Validate percentage value
    if (updateData.type === 'percentage' && updateData.value > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%'
      });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon'
    });
  }
};

// Delete coupon
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findByIdAndDelete(id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon'
    });
  }
};

// Toggle coupon status
const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      data: coupon
    });
  } catch (error) {
    console.error('Toggle coupon status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon status'
    });
  }
};

// Get coupon analytics
const getCouponAnalytics = async (req, res) => {
  try {
    const now = new Date();
    
    // Coupon status distribution
    const statusStats = await Coupon.aggregate([
      {
        $addFields: {
          status: {
            $cond: [
              { $eq: ['$isActive', false] }, 'inactive',
              { $cond: [
                { $gt: ['$startDate', now] }, 'scheduled',
                { $cond: [
                  { $lt: ['$endDate', now] }, 'expired',
                  'active'
                ]}
              ]}
            ]
          }
        }
      },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Usage statistics
    const usageStats = await Coupon.aggregate([
      {
        $group: {
          _id: null,
          totalCoupons: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' },
          averageUsage: { $avg: '$usageCount' }
        }
      }
    ]);

    // Top performing coupons
    const topCoupons = await Coupon.find()
      .sort({ usageCount: -1 })
      .limit(5)
      .select('code name usageCount type value');

    res.json({
      success: true,
      data: {
        statusStats,
        usageStats: usageStats[0] || { totalCoupons: 0, totalUsage: 0, averageUsage: 0 },
        topCoupons
      }
    });
  } catch (error) {
    console.error('Coupon analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon analytics'
    });
  }
};

module.exports = {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleStatus,
  getCouponAnalytics
};
