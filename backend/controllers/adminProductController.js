const Perfume = require('../models/Perfume');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

// Get all products with pagination, search, and filters
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const brand = req.query.brand || '';
    const status = req.query.status || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'brand.name': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      searchQuery.category = category;
    }

    if (brand) {
      searchQuery['brand.name'] = { $regex: brand, $options: 'i' };
    }

    if (status === 'in_stock') {
      searchQuery.stock = { $gt: 0 };
    } else if (status === 'out_of_stock') {
      searchQuery.stock = { $lte: 0 };
    } else if (status === 'low_stock') {
      searchQuery.stock = { $gt: 0, $lte: 10 };
    }

    const [products, total] = await Promise.all([
      Perfume.find(searchQuery)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      Perfume.countDocuments(searchQuery)
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Perfume.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Validate required fields
    if (!productData.name || !productData.brand?.name || !productData.price) {
      return res.status(400).json({
        success: false,
        message: 'Name, brand, and price are required'
      });
    }

    const product = new Perfume(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Product with this name already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create product'
      });
    }
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Perfume.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Perfume.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

// Bulk update stock
const bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, stock }
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: 'Updates must be an array'
      });
    }

    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.id },
        update: { stock: update.stock }
      }
    }));

    const result = await Perfume.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: `Updated stock for ${result.modifiedCount} products`,
      data: result
    });
  } catch (error) {
    console.error('Bulk update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock levels'
    });
  }
};

// Get product analytics
const getProductAnalytics = async (req, res) => {
  try {
    // Stock status distribution
    const stockStats = await Perfume.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$stock', 0] }, 'out_of_stock',
              { $cond: [{ $lte: ['$stock', 10] }, 'low_stock', 'in_stock'] }
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Category distribution
    const categoryStats = await Perfume.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Brand distribution
    const brandStats = await Perfume.aggregate([
      { $group: { _id: '$brand.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Price range distribution
    const priceStats = await Perfume.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ['$price', 1000] }, 'Under ₹1,000',
              { $cond: [
                { $lt: ['$price', 3000] }, '₹1,000 - ₹3,000',
                { $cond: [
                  { $lt: ['$price', 5000] }, '₹3,000 - ₹5,000',
                  'Above ₹5,000'
                ]}
              ]}
            ]
          },
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        stockStats,
        categoryStats,
        brandStats,
        priceStats
      }
    });
  } catch (error) {
    console.error('Product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product analytics'
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateStock,
  getProductAnalytics
};
