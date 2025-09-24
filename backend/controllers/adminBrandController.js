const Brand = require('../models/Brand');
const Perfume = require('../models/Perfume');

// Get all brands
const getBrands = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const searchQuery = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const [brands, total] = await Promise.all([
      Brand.find(searchQuery)
        .sort({ isFeatured: -1, sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(limit),
      Brand.countDocuments(searchQuery)
    ]);

    // Update product counts
    const brandsWithCounts = await Promise.all(
      brands.map(async (brand) => {
        const productCount = await Perfume.countDocuments({ 'brand.name': brand.name });
        if (brand.productCount !== productCount) {
          await Brand.findByIdAndUpdate(brand._id, { productCount });
        }
        return { ...brand.toObject(), productCount };
      })
    );

    res.json({
      success: true,
      data: {
        brands: brandsWithCounts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands'
    });
  }
};

// Get single brand
const getBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Get products from this brand
    const products = await Perfume.find({ 'brand.name': brand.name })
      .select('name price stock image_url category')
      .limit(10);

    res.json({
      success: true,
      data: {
        brand,
        products
      }
    });
  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brand'
    });
  }
};

// Create brand
const createBrand = async (req, res) => {
  try {
    const { name, description, logo, website, country, foundedYear, seoTitle, seoDescription } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Brand name is required'
      });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const brand = new Brand({
      name,
      description,
      slug,
      logo,
      website,
      country,
      foundedYear,
      seoTitle,
      seoDescription
    });

    await brand.save();

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand
    });
  } catch (error) {
    console.error('Create brand error:', error);
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Brand with this name already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create brand'
      });
    }
  }
};

// Update brand
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Update slug if name is changed
    if (updateData.name) {
      updateData.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const brand = await Brand.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.json({
      success: true,
      message: 'Brand updated successfully',
      data: brand
    });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update brand'
    });
  }
};

// Delete brand
const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Check if brand has products
    const productCount = await Perfume.countDocuments({ 'brand.name': brand.name });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete brand. It has ${productCount} products assigned to it.`
      });
    }

    await Brand.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete brand'
    });
  }
};

// Toggle featured status
const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    brand.isFeatured = !brand.isFeatured;
    await brand.save();

    res.json({
      success: true,
      message: `Brand ${brand.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: brand
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update brand featured status'
    });
  }
};

// Get brand analytics
const getBrandAnalytics = async (req, res) => {
  try {
    // Top brands by product count
    const topBrands = await Perfume.aggregate([
      { $group: { _id: '$brand.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Featured vs non-featured brands
    const featuredStats = await Brand.aggregate([
      { $group: { _id: '$isFeatured', count: { $sum: 1 } } }
    ]);

    // Brands by country
    const countryStats = await Brand.aggregate([
      { $match: { country: { $exists: true, $ne: null } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        topBrands,
        featuredStats,
        countryStats
      }
    });
  } catch (error) {
    console.error('Brand analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brand analytics'
    });
  }
};

module.exports = {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleFeatured,
  getBrandAnalytics
};
