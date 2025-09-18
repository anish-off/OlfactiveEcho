require('dotenv').config();
const mongoose = require('mongoose');
const Perfume = require('../models/Perfume');
const User = require('../models/User');
const Sample = require('../models/Sample');
const realPerfumeData = require('../data/realPerfumeData');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME });

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

    // Seed real perfume data with proper image paths
    const perfumesToSeed = realPerfumeData.map(perfume => ({
      ...perfume,
      imageUrl: perfume.imageUrl.replace('/perfume-images/', '/perfume-images/').replace('.jpg', '.svg'),
      samplesAvailable: true,
      stock: perfume.stock || Math.floor(Math.random() * 50) + 10 // Random stock if not specified
    }));

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
