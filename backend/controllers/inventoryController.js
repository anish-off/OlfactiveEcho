const Perfume = require('../models/Perfume');
const Order = require('../models/Order');

// Get inventory overview with stock levels and sales velocity
const getInventoryOverview = async (req, res) => {
  try {
    // Get all products with stock info
    const products = await Perfume.find()
      .populate('brand', 'name')
      .select('name brand stock price image_url');

    // Calculate sales velocity (sales per day over last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const productsWithVelocity = await Promise.all(
      products.map(async (product) => {
        const sales = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: thirtyDaysAgo },
              status: { $ne: 'cancelled' }
            }
          },
          { $unwind: '$items' },
          {
            $match: {
              'items.perfume': product._id
            }
          },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: '$items.quantity' }
            }
          }
        ]);

        const totalSold = sales[0]?.totalQuantity || 0;
        const salesVelocity = totalSold / 30; // Average per day

        return {
          ...product.toObject(),
          salesVelocity,
          totalSold
        };
      })
    );

    res.json({
      success: true,
      data: productsWithVelocity
    });
  } catch (error) {
    console.error('Get inventory overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory data'
    });
  }
};

// Get low stock alerts
const getLowStockAlerts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;

    const lowStockProducts = await Perfume.find({
      stock: { $gt: 0, $lte: threshold }
    })
      .populate('brand', 'name')
      .select('name brand stock price')
      .sort({ stock: 1 });

    res.json({
      success: true,
      data: lowStockProducts
    });
  } catch (error) {
    console.error('Get low stock alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock alerts'
    });
  }
};

// Get out of stock products
const getOutOfStock = async (req, res) => {
  try {
    const outOfStockProducts = await Perfume.find({ stock: 0 })
      .populate('brand', 'name')
      .select('name brand price image_url')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: outOfStockProducts
    });
  } catch (error) {
    console.error('Get out of stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch out of stock products'
    });
  }
};

module.exports = {
  getInventoryOverview,
  getLowStockAlerts,
  getOutOfStock
};
