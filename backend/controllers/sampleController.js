const Sample = require('../models/Sample');
const fs = require('fs');
const path = require('path');

// Load perfume data from JSON file
const loadPerfumeData = () => {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'combined_perfumes.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading perfume data:', error);
    return [];
  }
};

exports.createSample = async (req, res) => {
  try {
    const sample = await Sample.create(req.body);
    res.status(201).json(sample);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSamples = async (req, res) => {
  try {
    // Load perfume data from JSON file
    const perfumeData = loadPerfumeData();
    
    // Convert perfume data to sample format
    const samples = perfumeData.map((perfume, index) => {
      // Generate sample pricing based on perfume characteristics
      const basePrice = 199; // Base sample price
      const premiumPrice = 299; // Premium sample price
      
      // Determine if this is a premium fragrance based on main accords
      const premiumAccords = ['oud', 'rose', 'saffron', 'amber', 'sandalwood', 'jasmine'];
      const isPremium = perfume.main_accords?.some(accord => 
        premiumAccords.some(premium => accord.name.toLowerCase().includes(premium))
      );
      
      return {
        _id: `sample_${index}`,
        name: `${perfume.name} Sample`,
        perfumeData: perfume,
        description: `Try before you buy - ${perfume.name}`,
        price: isPremium ? premiumPrice : basePrice,
        available: true,
        createdAt: new Date(),
        // Extract main accords for easy filtering
        mainAccords: perfume.main_accords?.map(accord => accord.name) || [],
        brand: perfume.brand?.name || 'Unknown',
        imageUrl: `/perfume-images/${perfume.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.svg`
      };
    });

    // Optional filtering by query parameters
    const { limit = 20, brand, accord, priceRange } = req.query;
    
    let filteredSamples = samples;
    
    // Filter by brand if specified
    if (brand) {
      filteredSamples = filteredSamples.filter(sample => 
        sample.brand.toLowerCase().includes(brand.toLowerCase())
      );
    }
    
    // Filter by accord if specified
    if (accord) {
      filteredSamples = filteredSamples.filter(sample => 
        sample.mainAccords.some(a => a.toLowerCase().includes(accord.toLowerCase()))
      );
    }
    
    // Filter by price range if specified (e.g., "199-299")
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split('-').map(Number);
      if (minPrice && maxPrice) {
        filteredSamples = filteredSamples.filter(sample => 
          sample.price >= minPrice && sample.price <= maxPrice
        );
      }
    }
    
    // Limit results and sort by created date (newest first)
    const limitedSamples = filteredSamples
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, parseInt(limit));
    
    res.json(limitedSamples);
  } catch (err) {
    console.error('Error in getSamples:', err);
    res.status(500).json({ message: err.message });
  }
};
