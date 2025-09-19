
const Perfume = require('../models/Perfume');

// Create a new perfume
exports.createPerfume = async (req, res) => {
  try {
    const perfume = new Perfume(req.body);
    await perfume.save();
    res.status(201).json(perfume);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all perfumes with filtering and search
exports.getPerfumes = async (req, res) => {
  try {
    const { 
      q, 
      category, 
      brand, 
      gender, 
      scentFamily, 
      minPrice, 
      maxPrice, 
      seasons, 
      occasions,
      sortBy = 'rating',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = req.query;
    
    // Build query object
    const query = {};
    
    // Text search
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { 'brand.name': { $regex: q, $options: 'i' } },
        { 'main_accords.name': { $regex: q, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Brand filter
    if (brand) {
      query['brand.name'] = { $regex: brand, $options: 'i' };
    }
    
    // Gender filter
    if (gender) {
      query.gender = gender;
    }
    
    // Scent family filter
    if (scentFamily) {
      query.scentFamily = scentFamily;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Seasons filter
    if (seasons) {
      const seasonArray = Array.isArray(seasons) ? seasons : [seasons];
      query.seasons = { $in: seasonArray };
    }
    
    // Occasions filter  
    if (occasions) {
      const occasionArray = Array.isArray(occasions) ? occasions : [occasions];
      query.occasions = { $in: occasionArray };
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query
    const perfumes = await Perfume.find(query)
      .sort(sortConfig)
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    // Map image URLs for consistent frontend access
    const perfumesWithImages = perfumes.map(perfume => ({
      ...perfume,
      imageUrl: perfume.imageUrl || perfume.image_url || `/perfume-images/${perfume.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.svg`
    }));
    
    // Get total count for pagination
    const total = await Perfume.countDocuments(query);
    
    res.json({
      perfumes: perfumesWithImages,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: perfumesWithImages.length,
        totalItems: total
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single perfume by ID
exports.getPerfume = async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id).lean();
    if (!perfume) {
      return res.status(404).json({ message: 'Perfume not found' });
    }
    
    // Add imageUrl mapping for consistent frontend access
    const perfumeWithImage = {
      ...perfume,
      imageUrl: perfume.imageUrl || perfume.image_url || `/perfume-images/${perfume.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.svg`
    };
    
    res.json(perfumeWithImage);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Perfume not found' });
    }
    res.status(500).json({ message: err.message });
  }
};

// Update a perfume
exports.updatePerfume = async (req, res) => {
  try {
    const perfume = await Perfume.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!perfume) {
      return res.status(404).json({ message: 'Perfume not found' });
    }
    
    res.json(perfume);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Perfume not found' });
    }
    res.status(400).json({ message: err.message });
  }
};

// Update only image_url or photos
exports.updatePerfumeImage = async (req, res) => {
  try {
    const updateData = {};
    
    // Only allow updating image_url and/or photos
    if ('image_url' in req.body) {
      updateData.image_url = req.body.image_url;
    }
    if ('photos' in req.body) {
      updateData.photos = req.body.photos;
    }
    
    const perfume = await Perfume.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!perfume) {
      return res.status(404).json({ message: 'Perfume not found' });
    }
    
    res.json(perfume);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Perfume not found' });
    }
    res.status(400).json({ message: err.message });
  }
};

// Delete a perfume
exports.deletePerfume = async (req, res) => {
  try {
    const perfume = await Perfume.findByIdAndDelete(req.params.id);
    
    if (!perfume) {
      return res.status(404).json({ message: 'Perfume not found' });
    }
    
    res.json({ message: 'Perfume deleted successfully' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Perfume not found' });
    }
    res.status(500).json({ message: err.message });
  }
};

// Get popular perfumes
exports.getPopularPerfumes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const perfumes = await Perfume.find({ isPopular: true })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .lean();
    
    // Map image URLs for consistent frontend access
    const perfumesWithImages = perfumes.map(perfume => ({
      ...perfume,
      imageUrl: perfume.imageUrl || perfume.image_url || `/perfume-images/${perfume.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.svg`
    }));
    
    res.json(perfumesWithImages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get new perfumes
exports.getNewPerfumes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const perfumes = await Perfume.find({ isNew: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    // Map image URLs for consistent frontend access
    const perfumesWithImages = perfumes.map(perfume => ({
      ...perfume,
      imageUrl: perfume.imageUrl || perfume.image_url || `/perfume-images/${perfume.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.svg`
    }));
    
    res.json(perfumesWithImages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get perfumes by brand
exports.getPerfumesByBrand = async (req, res) => {
  try {
    const { brandName } = req.params;
    const perfumes = await Perfume.find({ 'brand.name': { $regex: brandName, $options: 'i' } })
      .sort({ name: 1 })
      .lean();
    
    res.json(perfumes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all unique brands
exports.getBrands = async (req, res) => {
  try {
    const brands = await Perfume.distinct('brand.name');
    res.json(brands.sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get perfume statistics
exports.getPerfumeStats = async (req, res) => {
  try {
    const stats = await Perfume.aggregate([
      {
        $group: {
          _id: null,
          totalPerfumes: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          avgPrice: { $avg: '$price' },
          popularCount: {
            $sum: { $cond: [{ $eq: ['$isPopular', true] }, 1, 0] }
          },
          newCount: {
            $sum: { $cond: [{ $eq: ['$isNew', true] }, 1, 0] }
          }
        }
      }
    ]);
    
    const categoryStats = await Perfume.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const genderStats = await Perfume.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      overview: stats[0] || {},
      byCategory: categoryStats,
      byGender: genderStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
