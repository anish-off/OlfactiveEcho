
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
      notes, // NEW: Filter by fragrance notes
      longevity, // NEW: Filter by longevity
      sillage, // NEW: Filter by sillage
      intensity, // NEW: Filter by intensity
      rating, // NEW: Filter by minimum rating
      inStock, // NEW: Only show in-stock items
      sortBy = 'rating',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = req.query;
    
    // Build query object
    const query = {};
    
    // Text search with autocomplete support
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { 'brand.name': { $regex: q, $options: 'i' } },
        { 'main_accords.name': { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { scentFamily: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Brand filter - support multiple brands
    if (brand) {
      const brandArray = Array.isArray(brand) ? brand : [brand];
      if (brandArray.length === 1) {
        query['brand.name'] = { $regex: brandArray[0], $options: 'i' };
      } else {
        query['brand.name'] = { 
          $in: brandArray.map(b => new RegExp(b, 'i')) 
        };
      }
    }
    
    // Gender filter
    if (gender) {
      query.gender = gender;
    }
    
    // Scent family filter - support multiple
    if (scentFamily) {
      const familyArray = Array.isArray(scentFamily) ? scentFamily : [scentFamily];
      if (familyArray.length === 1) {
        query.scentFamily = familyArray[0];
      } else {
        query.scentFamily = { $in: familyArray };
      }
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Seasons filter - support multiple
    if (seasons) {
      const seasonArray = Array.isArray(seasons) ? seasons : [seasons];
      query.seasons = { $in: seasonArray };
    }
    
    // Occasions filter - support multiple
    if (occasions) {
      const occasionArray = Array.isArray(occasions) ? occasions : [occasions];
      query.occasions = { $in: occasionArray };
    }
    
    // Notes filter - search in all note types
    if (notes) {
      const noteArray = Array.isArray(notes) ? notes : [notes];
      query.$or = query.$or || [];
      noteArray.forEach(note => {
        query.$or.push(
          { 'notes.Top Notes.name': { $regex: note, $options: 'i' } },
          { 'notes.Middle Notes.name': { $regex: note, $options: 'i' } },
          { 'notes.Base Notes.name': { $regex: note, $options: 'i' } },
          { 'notes.General Notes.name': { $regex: note, $options: 'i' } }
        );
      });
    }
    
    // Longevity filter
    if (longevity) {
      query.longevity = longevity;
    }
    
    // Sillage filter
    if (sillage) {
      query.sillage = sillage;
    }
    
    // Intensity filter
    if (intensity) {
      query.intensity = intensity;
    }
    
    // Rating filter - minimum rating
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }
    
    // Stock filter - only in-stock items
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }
    
    // Count total for pagination
    const total = await Perfume.countDocuments(query);
    
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
    
    res.json({
      perfumes: perfumesWithImages,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: perfumesWithImages.length,
        totalItems: total
      },
      filters: {
        applied: {
          q, category, brand, gender, scentFamily, 
          minPrice, maxPrice, seasons, occasions, 
          notes, longevity, sillage, intensity, rating, inStock
        }
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

// Get search suggestions/autocomplete
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const regex = new RegExp(q, 'i');
    
    // Search in perfume names
    const nameMatches = await Perfume.find({ name: regex })
      .select('name image_url')
      .limit(5)
      .lean();
    
    // Search in brand names
    const brandMatches = await Perfume.aggregate([
      { $match: { 'brand.name': regex } },
      { $group: { _id: '$brand.name', count: { $sum: 1 } } },
      { $limit: 3 }
    ]);
    
    // Search in scent families
    const familyMatches = await Perfume.aggregate([
      { $match: { scentFamily: regex } },
      { $group: { _id: '$scentFamily', count: { $sum: 1 } } },
      { $limit: 2 }
    ]);
    
    res.json({
      suggestions: {
        perfumes: nameMatches.map(p => ({ 
          type: 'perfume', 
          name: p.name, 
          image: p.image_url,
          id: p._id 
        })),
        brands: brandMatches.map(b => ({ 
          type: 'brand', 
          name: b._id, 
          count: b.count 
        })),
        families: familyMatches.map(f => ({ 
          type: 'family', 
          name: f._id, 
          count: f.count 
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get available filter options
exports.getFilterOptions = async (req, res) => {
  try {
    // Get all unique brands
    const brands = await Perfume.aggregate([
      { $group: { _id: '$brand.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);
    
    // Get all unique scent families
    const scentFamilies = await Perfume.aggregate([
      { $match: { scentFamily: { $exists: true, $ne: null } } },
      { $group: { _id: '$scentFamily', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get price range
    const priceRange = await Perfume.aggregate([
      {
        $group: {
          _id: null,
          min: { $min: '$price' },
          max: { $max: '$price' }
        }
      }
    ]);
    
    // Get all unique notes
    const notes = await Perfume.aggregate([
      { $project: { allNotes: { $objectToArray: '$notes' } } },
      { $unwind: '$allNotes' },
      { $unwind: '$allNotes.v' },
      { $group: { _id: '$allNotes.v.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 100 }
    ]);
    
    res.json({
      brands: brands.map(b => ({ name: b._id, count: b.count })),
      scentFamilies: scentFamilies.map(s => ({ name: s._id, count: s.count })),
      priceRange: priceRange[0] || { min: 0, max: 10000 },
      notes: notes.map(n => ({ name: n._id, count: n.count })),
      genders: [
        { name: 'male', label: 'Men' },
        { name: 'female', label: 'Women' },
        { name: 'unisex', label: 'Unisex' }
      ],
      seasons: [
        { name: 'spring', label: 'Spring' },
        { name: 'summer', label: 'Summer' },
        { name: 'autumn', label: 'Autumn' },
        { name: 'winter', label: 'Winter' }
      ],
      occasions: [
        { name: 'daily', label: 'Daily Wear' },
        { name: 'office', label: 'Office' },
        { name: 'evening', label: 'Evening' },
        { name: 'party', label: 'Party' },
        { name: 'romantic', label: 'Romantic' },
        { name: 'formal', label: 'Formal' },
        { name: 'casual', label: 'Casual' },
        { name: 'sport', label: 'Sport' }
      ],
      longevity: [
        { name: '2-4 hours', label: '2-4 hours' },
        { name: '4-6 hours', label: '4-6 hours' },
        { name: '6-8 hours', label: '6-8 hours' },
        { name: '8+ hours', label: '8+ hours' }
      ],
      sillage: [
        { name: 'intimate', label: 'Intimate' },
        { name: 'moderate', label: 'Moderate' },
        { name: 'strong', label: 'Strong' },
        { name: 'enormous', label: 'Enormous' }
      ],
      intensity: [
        { name: 'light', label: 'Light' },
        { name: 'moderate', label: 'Moderate' },
        { name: 'strong', label: 'Strong' }
      ]
    });
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
