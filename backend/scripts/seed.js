require('dotenv').config();
const mongoose = require('mongoose');
const Perfume = require('../models/Perfume');
const User = require('../models/User');
const Sample = require('../models/Sample');
const combinedPerfumes = require('../data/combined_perfumes.json');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/olfactive_echo', { 
      dbName: process.env.MONGO_DB_NAME || 'olfactive_echo' 
    });

    console.log('🌱 Seeding database with real perfume data...');

    // Admin user
    const adminEmail = 'admin@olfactiveecho.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({ 
        name: 'Admin', 
        email: adminEmail, 
        password: 'AdminPass123!', 
        role: 'admin' 
      });
      console.log('✅ Created admin user: admin@olfactiveecho.com / AdminPass123!');
    }

    // Clear existing perfumes to start fresh
    const existingCount = await Perfume.countDocuments();
    if (existingCount > 0) {
      await Perfume.deleteMany({});
      console.log(`🗑️ Cleared ${existingCount} existing perfumes`);
    }

    // Seed real perfume data with actual image URLs from Fragrantica
    const perfumesToSeed = combinedPerfumes.slice(0, 150).map((perfume, index) => {
      // Extract brand information (keep as object structure)
      let brand = { name: 'Unknown Brand' };
      if (perfume.brand) {
        if (typeof perfume.brand === 'object') {
          brand = {
            name: perfume.brand.name || 'Unknown Brand',
            url: perfume.brand.url || '',
            logo_url: perfume.brand.logo_url || ''
          };
        } else if (typeof perfume.brand === 'string') {
          brand = { name: perfume.brand };
        }
      }
      
      // Map main accords to our format
      const mainAccords = perfume.main_accords ? perfume.main_accords.slice(0, 5) : [];
      const mainNotes = mainAccords.map(accord => accord.name);
      
      // Generate categories based on main accords
      const category = getCategory(mainNotes);
      
      // Generate price based on brand prestige and random factor
      const basePrice = getBrandPrice(brand.name);
      const price = Math.floor(basePrice + (Math.random() * 2000) + 500);
      
      return {
        name: perfume.name || 'Unnamed Fragrance',
        brand: brand,
        description: generateDescription(perfume.name || 'Unnamed Fragrance', brand.name, mainNotes),
        price: price,
        image_url: perfume.image_url || '', // Use actual Fragrantica image URL
        main_accords: mainAccords,
        category: category,
        scentFamily: getScentFamily(mainNotes),
        occasions: [getOccasion(mainNotes)],
        seasons: [getSeason(mainNotes)],
        gender: getGender(perfume.name || ''),
        isPopular: index < 20, // First 20 are popular
        isNew: index < 10, // First 10 are new
        samplesAvailable: true,
        stock: Math.floor(Math.random() * 50) + 10,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0 rating
        reviewCount: Math.floor(Math.random() * 500) + 10
      };
    });

    const createdPerfumes = await Perfume.insertMany(perfumesToSeed);
    console.log(`🧴 Created ${createdPerfumes.length} perfumes from real data`);

    // Log perfume families distribution
    const familyStats = await Perfume.aggregate([
      { $group: { _id: '$scentFamily', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 Perfume Distribution by Scent Family:');
    familyStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} perfumes`);
    });

    // Create samples for each perfume
    console.log('\n🧪 Creating sample vials...');
    let sampleCount = 0;
    
    for (const perfume of createdPerfumes) {
      const sampleName = `${perfume.name} - Sample Vial`;
      const existingSample = await Sample.findOne({ name: sampleName });
      
      if (!existingSample) {
        await Sample.create({
          name: sampleName,
          perfume: perfume._id,
          description: `2ml sample vial of ${perfume.name} by ${perfume.brand}`,
          price: Math.max(Math.floor(perfume.price * 0.05), 199) // 5% of perfume price, minimum ₹199
        });
        sampleCount++;
      }
    }
    
    console.log(`🧪 Created ${sampleCount} sample vials`);

    // Log summary
    const totalPerfumes = await Perfume.countDocuments();
    const totalSamples = await Sample.countDocuments();
    const avgPrice = await Perfume.aggregate([
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('=====================================');
    console.log(`📦 Total Perfumes: ${totalPerfumes}`);
    console.log(`🧪 Total Samples: ${totalSamples}`);
    console.log(`💰 Average Price: ₹${Math.round(avgPrice[0]?.avgPrice || 0)}`);
    console.log(`🏷️ Price Range: ₹${await getPriceRange()}`);
    console.log(`🔥 Popular Items: ${await Perfume.countDocuments({ isPopular: true })}`);
    console.log(`✨ New Items: ${await Perfume.countDocuments({ isNew: true })}`);
    
    console.log('\n🚀 Ready to serve real perfume recommendations!');

  } catch (e) {
    console.error('❌ Seed error:', e);
  } finally {
    await mongoose.disconnect();
  }
})();

async function getPriceRange() {
  const result = await Perfume.aggregate([
    {
      $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);
  
  if (result.length > 0) {
    return `${result[0].minPrice} - ${result[0].maxPrice}`;
  }
  return 'N/A';
}

// Helper functions for data transformation
function getCategory(mainNotes) {
  const notes = mainNotes.join(' ').toLowerCase();
  if (notes.includes('vanilla') || notes.includes('sweet') || notes.includes('caramel')) return 'gourmand';
  if (notes.includes('rose') || notes.includes('jasmine') || notes.includes('lily')) return 'floral';
  if (notes.includes('wood') || notes.includes('cedar') || notes.includes('sandalwood')) return 'woody';
  if (notes.includes('citrus') || notes.includes('lemon') || notes.includes('bergamot')) return 'fresh';
  if (notes.includes('oud') || notes.includes('amber') || notes.includes('musk')) return 'oriental';
  return 'fresh';
}

function getScentFamily(mainNotes) {
  const notes = mainNotes.join(' ').toLowerCase();
  if (notes.includes('floral') || notes.includes('rose') || notes.includes('jasmine')) return 'Floral';
  if (notes.includes('wood') || notes.includes('cedar') || notes.includes('sandalwood')) return 'Woody';
  if (notes.includes('citrus') || notes.includes('fresh') || notes.includes('aquatic')) return 'Fresh';
  if (notes.includes('oriental') || notes.includes('amber') || notes.includes('spicy')) return 'Oriental';
  if (notes.includes('vanilla') || notes.includes('sweet') || notes.includes('gourmand')) return 'Gourmand';
  return 'Fresh';
}

function getOccasion(mainNotes) {
  const notes = mainNotes.join(' ').toLowerCase();
  if (notes.includes('fresh') || notes.includes('citrus') || notes.includes('light')) return 'casual';
  if (notes.includes('amber') || notes.includes('oud') || notes.includes('heavy')) return 'formal';
  if (notes.includes('romantic') || notes.includes('rose') || notes.includes('sweet')) return 'romantic';
  if (notes.includes('sport') || notes.includes('aquatic')) return 'sport';
  return 'daily';
}

function getSeason(mainNotes) {
  const notes = mainNotes.join(' ').toLowerCase();
  if (notes.includes('fresh') || notes.includes('citrus') || notes.includes('aquatic')) return 'summer';
  if (notes.includes('warm') || notes.includes('amber') || notes.includes('vanilla')) return 'winter';
  if (notes.includes('floral') || notes.includes('green') || notes.includes('light')) return 'spring';
  if (notes.includes('woody') || notes.includes('spicy') || notes.includes('tobacco')) return 'autumn';
  return 'spring';
}

function getGender(name) {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('for women')) return 'female';
  if (lowerName.includes('for men')) return 'male';
  if (lowerName.includes('unisex') || lowerName.includes('for women and men')) return 'unisex';
  // Default based on common patterns
  if (lowerName.includes('homme') || lowerName.includes('man') || lowerName.includes('masculine')) return 'male';
  if (lowerName.includes('femme') || lowerName.includes('woman') || lowerName.includes('feminine')) return 'female';
  return 'unisex';
}

function getBrandPrice(brandName) {
  if (!brandName || typeof brandName !== 'string') return 2000; // Default price for undefined brands
  
  const luxuryBrands = ['Tom Ford', 'Creed', 'Maison Francis Kurkdjian', 'Amouage', 'Roja'];
  const premiumBrands = ['Chanel', 'Dior', 'Hermès', 'Guerlain', 'Yves Saint Laurent'];
  const popularBrands = ['Calvin Klein', 'Hugo Boss', 'Versace', 'Armani', 'Burberry'];
  
  if (luxuryBrands.some(brand => brandName.includes(brand))) return 8000;
  if (premiumBrands.some(brand => brandName.includes(brand))) return 5000;
  if (popularBrands.some(brand => brandName.includes(brand))) return 3000;
  return 2000; // Default price
}

function generateDescription(name, brand, mainNotes) {
  const notesText = mainNotes.length > 0 ? mainNotes.slice(0, 3).join(', ') : 'exquisite blend';
  return `${name} by ${brand} is a captivating fragrance featuring ${notesText}. This sophisticated scent offers a perfect balance of elegance and modernity, making it an ideal choice for those who appreciate fine fragrances.`;
}
