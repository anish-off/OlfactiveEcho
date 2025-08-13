require('dotenv').config();
const mongoose = require('mongoose');
const Perfume = require('../models/Perfume');
const User = require('../models/User');
const Sample = require('../models/Sample');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME });

    console.log('Seeding data...');

    // Admin user
    const adminEmail = 'admin@example.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({ name: 'Admin', email: adminEmail, password: 'AdminPass123!', role: 'admin' });
      console.log('Created admin user: admin@example.com / AdminPass123!');
    }

    // Perfumes (richer dataset - remove if already exists)
    const perfumes = [
      { name: 'Velvet Orchid & Oud', brand: 'Olfactive Echo', price: 2999, notes: ['orchid','oud','bergamot','vanilla'], category: 'oriental', gender: 'unisex', description:'Rich orchid entwined with smoky oud and a hint of citrus brightness.', imageUrl:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80' },
      { name: 'Citrus Burst Elixir', brand: 'Olfactive Echo', price: 2450, notes: ['lemon','grapefruit','basil','mint','cedarwood'], category: 'fresh', gender: 'unisex', description:'Sparkling citrus layered over fresh herbs and a clean woody base.', imageUrl:'https://images.unsplash.com/photo-1610375461246-83df859d9d15?auto=format&fit=crop&w=800&q=80' },
      { name: 'Midnight Rose Serenade', brand: 'Olfactive Echo', price: 3200, notes: ['rose','blackcurrant','amber','musk','jasmine'], category: 'floral', gender: 'female', description:'Dark velvety roses serenaded by sensual amber & musk.', imageUrl:'https://images.unsplash.com/photo-1585386959984-a4155222cd05?auto=format&fit=crop&w=800&q=80' },
      { name: 'Ocean Breeze', brand: 'Olfactive Echo', price: 2200, notes: ['marine','salt','citrus','driftwood'], category: 'aquatic', gender: 'unisex', description:'Fresh marine accord with salty air and sunlit citrus.', imageUrl:'https://images.unsplash.com/photo-1523293836414-754725df0545?auto=format&fit=crop&w=800&q=80' },
      { name: 'Golden Hour', brand: 'Olfactive Echo', price: 2800, notes: ['amber','tonka','sandalwood','sun-warm skin'], category: 'amber', gender: 'unisex', description:'Glowing amber and creamy woods capture sunset warmth.', imageUrl:'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80' },
      { name: 'Mystic Amber', brand: 'Olfactive Echo', price: 3100, notes: ['amber','spice','vanilla','smoke'], category: 'oriental', gender: 'unisex', description:'Incense-laced amber cloaked in spiced vanilla haze.', imageUrl:'https://images.unsplash.com/photo-1625602814500-2866d82d475d?auto=format&fit=crop&w=800&q=80' },
      { name: 'Forest Whisper', brand: 'Olfactive Echo', price: 2600, notes: ['pine','cedar','moss','earth'], category: 'woody', gender: 'unisex', description:'Green conifer needles and damp moss after rain.', imageUrl:'https://images.unsplash.com/photo-1557170334-a9632e77c6e9?auto=format&fit=crop&w=800&q=80' },
      { name: 'Floral Muse', brand: 'Olfactive Echo', price: 2550, notes: ['rose','jasmine','peony','musk'], category: 'floral', gender: 'female', description:'A bouquet of luminous petals resting on sheer musk.', imageUrl:'https://images.unsplash.com/photo-1601040120827-5120d54cbc51?auto=format&fit=crop&w=800&q=80' }
    ];

    let createdCount = 0;
    for (const p of perfumes) {
      const exists = await Perfume.findOne({ name: p.name });
      if (!exists) { 
        await Perfume.create(p); 
        createdCount++; 
      } else if (!exists.imageUrl && p.imageUrl) {
        exists.imageUrl = p.imageUrl;
        await exists.save();
      }
    }
    console.log(`Perfumes seeded (new: ${createdCount}, total now: ${await Perfume.countDocuments()})`);

    // Samples (tie to an existing perfume arbitrarily)
    const anyPerfume = await Perfume.findOne();
    if (anyPerfume) {
      const sampleName = 'Sample Vial';
      const existsSample = await Sample.findOne({ name: sampleName });
      if (!existsSample) await Sample.create({ name: sampleName, perfume: anyPerfume._id, description: 'Generic sample vial', price: 5 });
    }

    console.log('Samples seeded');
    console.log('Done.');
  } catch (e) {
    console.error('Seed error:', e);
  } finally {
    await mongoose.disconnect();
  }
})();
