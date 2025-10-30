require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Perfume = require('../models/Perfume');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const detectGender = (name) => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('for women')) return 'female';
  if (nameLower.includes('for men')) return 'male';
  if (nameLower.includes('for women and men') || nameLower.includes('unisex')) return 'unisex';
  return 'unisex'; // default
};

const detectCategory = (mainAccords) => {
  if (!mainAccords || !Array.isArray(mainAccords)) return 'fragrance';
  
  const topAccord = mainAccords[0]?.name?.toLowerCase();
  if (!topAccord) return 'fragrance';
  
  // Map main accords to categories
  const categoryMap = {
    'citrus': 'fresh',
    'fresh': 'fresh',
    'aquatic': 'fresh',
    'floral': 'floral',
    'rose': 'floral',
    'jasmine': 'floral',
    'woody': 'woody',
    'sandalwood': 'woody',
    'cedar': 'woody',
    'vanilla': 'gourmand',
    'sweet': 'gourmand',
    'chocolate': 'gourmand',
    'amber': 'oriental',
    'oriental': 'oriental',
    'spicy': 'oriental',
    'oud': 'oriental'
  };
  
  return categoryMap[topAccord] || 'fragrance';
};

const detectSeasons = (seasonalityStats) => {
  if (!seasonalityStats) return ['spring', 'summer'];
  
  const seasons = [];
  const threshold = 30; // minimum percentage to include season
  
  if (seasonalityStats.spring >= threshold) seasons.push('spring');
  if (seasonalityStats.summer >= threshold) seasons.push('summer');
  if (seasonalityStats.fall >= threshold) seasons.push('autumn');
  if (seasonalityStats.winter >= threshold) seasons.push('winter');
  
  return seasons.length > 0 ? seasons : ['spring', 'summer'];
};

const detectOccasions = (seasonalityStats, sentimentStats) => {
  const occasions = [];
  
  if (!seasonalityStats) return ['daily', 'casual'];
  
  // Based on day/night preference
  if (seasonalityStats.day > seasonalityStats.night) {
    occasions.push('daily', 'office', 'casual');
  } else if (seasonalityStats.night > seasonalityStats.day) {
    occasions.push('evening', 'romantic', 'party');
  } else {
    occasions.push('daily', 'casual');
  }
  
  // Add formal if sentiment is very positive
  if (sentimentStats?.love > 80) {
    occasions.push('formal');
  }
  
  return occasions;
};

const mapIntensity = (mainAccords) => {
  if (!mainAccords || !Array.isArray(mainAccords)) return 'moderate';
  
  const averageIntensity = mainAccords.reduce((sum, accord) => sum + (accord.intensity || 50), 0) / mainAccords.length;
  
  if (averageIntensity > 80) return 'strong';
  if (averageIntensity < 40) return 'light';
  return 'moderate';
};

const calculateRating = (sentimentStats) => {
  if (!sentimentStats) return 4.0;
  
  const { love = 0, like = 0, ok = 0, dislike = 0, hate = 0 } = sentimentStats;
  const total = love + like + ok + dislike + hate;
  
  if (total === 0) return 4.0;
  
  // Weighted average (love=5, like=4, ok=3, dislike=2, hate=1)
  const weightedSum = (love * 5) + (like * 4) + (ok * 3) + (dislike * 2) + (hate * 1);
  const rating = weightedSum / total;
  
  return Math.round(rating * 10) / 10; // Round to 1 decimal place
};

const transformProsAndCons = (data) => {
  let pros = [];
  let cons = [];
  
  try {
    // Handle pros
    if (data.pros) {
      if (Array.isArray(data.pros)) {
        pros = data.pros.map(item => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item.text) return item.text;
          return String(item);
        }).filter(item => item && item.length > 0);
      } else if (typeof data.pros === 'string' && data.pros.trim().startsWith('[')) {
        // Try to parse as JSON array
        try {
          const parsed = JSON.parse(data.pros);
          pros = parsed.map(item => item.text || String(item)).filter(item => item && item.length > 0);
        } catch {
          pros = [];
        }
      }
    }
    
    // Handle cons
    if (data.cons) {
      if (Array.isArray(data.cons)) {
        cons = data.cons.map(item => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item.text) return item.text;
          return String(item);
        }).filter(item => item && item.length > 0);
      } else if (typeof data.cons === 'string' && data.cons.trim().startsWith('[')) {
        // Try to parse as JSON array
        try {
          const parsed = JSON.parse(data.cons);
          cons = parsed.map(item => item.text || String(item)).filter(item => item && item.length > 0);
        } catch {
          cons = [];
        }
      }
    }
  } catch (error) {
    console.log(`   Warning: Could not parse pros/cons for ${data.name}`);
  }
  
  return { pros, cons };
};

const importPerfumes = async () => {
  try {
    await connectDB();
    
    // Read the JSON file
    const filePath = path.join(__dirname, '..', 'data', 'combined_perfumes.json');
    const data = await fs.readFile(filePath, 'utf8');
    const perfumesData = JSON.parse(data);
    
    console.log(`Found ${perfumesData.length} perfumes in JSON file`);
    
    // Clear existing perfumes (optional - comment out if you want to keep existing data)
    // await Perfume.deleteMany({});
    // console.log('Cleared existing perfume data');
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const perfumeData of perfumesData) {
      try {
        // Skip invalid entries
        if (!perfumeData.name || !perfumeData.brand?.name) {
          console.log(`Skipping invalid perfume entry: missing name or brand`);
          skipped++;
          continue;
        }
        
        // Check if perfume already exists (by name and brand)
        const existingPerfume = await Perfume.findOne({
          name: perfumeData.name,
          'brand.name': perfumeData.brand?.name
        });
        
        if (existingPerfume) {
          console.log(`Skipping existing perfume: ${perfumeData.name}`);
          skipped++;
          continue;
        }
        
        // Transform pros and cons
        const { pros, cons } = transformProsAndCons(perfumeData);
        
        // Transform data to match our schema
        const transformedData = {
          name: perfumeData.name,
          image_url: perfumeData.image_url,
          url: perfumeData.url,
          brand: perfumeData.brand,
          main_accords: perfumeData.main_accords || [],
          notes: perfumeData.notes || {},
          photos: perfumeData.photos || [],
          pros: pros,
          cons: cons,
          ownership_stats: perfumeData.ownership_stats || {},
          sentiment_stats: perfumeData.sentiment_stats || {},
          seasonality_stats: perfumeData.seasonality_stats || {},
          
          // Derived fields for better compatibility
          gender: detectGender(perfumeData.name),
          category: detectCategory(perfumeData.main_accords),
          seasons: detectSeasons(perfumeData.seasonality_stats),
          occasions: detectOccasions(perfumeData.seasonality_stats, perfumeData.sentiment_stats),
          intensity: mapIntensity(perfumeData.main_accords),
          rating: calculateRating(perfumeData.sentiment_stats),
          reviewCount: Math.floor(Math.random() * 100) + 10, // Random review count
          
          // Default values
          price: Math.floor(Math.random() * 200) + 50, // Random price between 50-250
          stock: Math.floor(Math.random() * 50) + 5, // Random stock
          samplesAvailable: true,
          isNew: false,
          isPopular: (perfumeData.sentiment_stats?.love || 0) > 70,
          volume: 100,
          concentration: 'EDT',
          longevity: '4-6 hours',
          sillage: 'moderate'
        };
        
        // Create and save the perfume
        const perfume = new Perfume(transformedData);
        await perfume.save();
        
        imported++;
        if (imported % 10 === 0) {
          console.log(`Imported ${imported} perfumes...`);
        }
        
      } catch (error) {
        console.error(`Error importing perfume ${perfumeData.name}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n=== Import Summary ===');
    console.log(`Total perfumes processed: ${perfumesData.length}`);
    console.log(`Successfully imported: ${imported}`);
    console.log(`Skipped (already exist): ${skipped}`);
    console.log(`Errors: ${errors}`);
    
    mongoose.connection.close();
    console.log('\nImport completed successfully!');
    
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
};

// Run the import
if (require.main === module) {
  importPerfumes();
}

module.exports = { importPerfumes };