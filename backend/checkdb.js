const mongoose = require('mongoose');
const Perfume = require('./models/Perfume');

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/olfactive_echo');
    
    const count = await Perfume.countDocuments();
    console.log('Total perfumes in database:', count);
    
    const firstFive = await Perfume.find({}).limit(5).select('name brand imageUrl');
    console.log('First 5 perfumes:');
    firstFive.forEach((p, i) => {
      console.log(`${i+1}. ${p.name} by ${p.brand || 'Unknown'} - Image: ${p.imageUrl || 'No image'}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Database check error:', error);
  }
}

checkDatabase();