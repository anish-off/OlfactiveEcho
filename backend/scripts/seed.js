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

    // Popular perfumes from Reddit fragrance communities (60 entries)
    const perfumes = [
      // Reddit Hall of Fame - Most recommended
      { name: 'Aventus', brand: 'Creed', price: 15999, notes: ['pineapple','bergamot','black currant','birch','patchouli','musk'], category: 'fruity', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80' },
      { name: 'Sauvage', brand: 'Dior', price: 7999, notes: ['bergamot','pepper','lavender','geranium','elemi','cedar'], category: 'aromatic', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1523293836414-754725df0545?auto=format&fit=crop&w=800&q=80' },
      { name: 'Bleu de Chanel', brand: 'Chanel', price: 8999, notes: ['grapefruit','lemon','mint','pink pepper','cedar','labdanum'], category: 'woody', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1557170334-a9632e77c6e9?auto=format&fit=crop&w=800&q=80' },
      { name: 'Baccarat Rouge 540', brand: 'Maison Francis Kurkdjian', price: 19999, notes: ['saffron','jasmine','ambergris','fir resin','ambroxan','cedar'], category: 'oriental', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1625602814500-2866d82d475d?auto=format&fit=crop&w=800&q=80' },
      
      // Reddit Niche Favorites
      { name: 'Santal 33', brand: 'Le Labo', price: 14999, notes: ['sandalwood','cedarwood','cardamom','iris','violet','ambrox'], category: 'woody', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1557170334-a9632e77c6e9?auto=format&fit=crop&w=800&q=80' },
      { name: 'Black Orchid', brand: 'Tom Ford', price: 12999, notes: ['black orchid','spice','dark chocolate','incense','patchouli','vanilla'], category: 'oriental', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80' },
      { name: 'Portrait of a Lady', brand: 'Frederic Malle', price: 18999, notes: ['turkish rose','raspberry','black currant','cinnamon','clove','incense'], category: 'floral', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80' },
      { name: 'Molecule 01', brand: 'Escentric Molecules', price: 6999, notes: ['iso e super'], category: 'synthetic', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80' },
      { name: 'Philosykos', brand: 'Diptyque', price: 11999, notes: ['fig leaf','fig fruit','green notes','coconut','wood'], category: 'green', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1610375461246-83df859d9d15?auto=format&fit=crop&w=800&q=80' },
      
      // Reddit Designer Hits
      { name: 'Aqua di Gio', brand: 'Giorgio Armani', price: 6999, notes: ['marine notes','mandarin','neroli','persimmon','rosemary','white musk'], category: 'aquatic', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1523293836414-754725df0545?auto=format&fit=crop&w=800&q=80' },
      { name: 'The One', brand: 'Dolce & Gabbana', price: 6499, notes: ['grapefruit','coriander','basil','cardamom','orange blossom','cedar'], category: 'oriental', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1625602814500-2866d82d475d?auto=format&fit=crop&w=800&q=80' },
      { name: 'Light Blue', brand: 'Dolce & Gabbana', price: 5999, notes: ['lemon','apple','cedar','bellflower','bamboo','white rose'], category: 'fresh', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1610375461246-83df859d9d15?auto=format&fit=crop&w=800&q=80' },
      { name: 'Chanel No. 5', brand: 'Chanel', price: 9999, notes: ['aldehydes','neroli','ylang-ylang','rose','jasmine','sandalwood'], category: 'floral', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1601040120827-5120d54cbc51?auto=format&fit=crop&w=800&q=80' },
      { name: 'Black Opium', brand: 'Yves Saint Laurent', price: 7999, notes: ['coffee','vanilla','white flowers','cedrat','pear','orange blossom'], category: 'gourmand', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1585386959984-a4155222cd05?auto=format&fit=crop&w=800&q=80' },
      
      // Reddit Affordable Favorites
      { name: 'Cloud', brand: 'Ariana Grande', price: 2999, notes: ['lavender','pear','bergamot','whipped cream','praline','vanilla'], category: 'gourmand', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1585386959984-a4155222cd05?auto=format&fit=crop&w=800&q=80' },
      { name: 'Polo Blue', brand: 'Ralph Lauren', price: 4999, notes: ['cucumber','cantaloupe','basil','sage','geranium','woodsy notes'], category: 'aquatic', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1523293836414-754725df0545?auto=format&fit=crop&w=800&q=80' },
      { name: 'Cool Water', brand: 'Davidoff', price: 3499, notes: ['lavender','mint','green notes','geranium','sandalwood','musk'], category: 'aquatic', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1523293836414-754725df0545?auto=format&fit=crop&w=800&q=80' },
      { name: 'La Vie Est Belle', brand: 'Lancôme', price: 7499, notes: ['iris','patchouli','sweet notes','praline','vanilla','black currant'], category: 'gourmand', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1601040120827-5120d54cbc51?auto=format&fit=crop&w=800&q=80' },
      { name: 'Angel', brand: 'Thierry Mugler', price: 7299, notes: ['cotton candy','honey','coconut','caramel','chocolate','vanilla'], category: 'gourmand', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1585386959984-a4155222cd05?auto=format&fit=crop&w=800&q=80' },
      
      // Reddit Niche Deep Cuts
      { name: 'Jazz Club', brand: 'Maison Margiela', price: 9999, notes: ['pink pepper','primofiore lemon','rum','java vetiver','tobacco leaf','vanilla bean'], category: 'oriental', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1625602814500-2866d82d475d?auto=format&fit=crop&w=800&q=80' },
      { name: 'By the Fireplace', brand: 'Maison Margiela', price: 9999, notes: ['pink pepper','orange blossom','chestnut','guaiac wood','vanilla','cashmeran'], category: 'woody', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1557170334-a9632e77c6e9?auto=format&fit=crop&w=800&q=80' },
      { name: 'Tobacco Vanille', brand: 'Tom Ford', price: 18999, notes: ['tobacco leaf','vanilla','ginger','fig','date fruit','cacao'], category: 'gourmand', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1625602814500-2866d82d475d?auto=format&fit=crop&w=800&q=80' },
      { name: 'Lost Cherry', brand: 'Tom Ford', price: 19999, notes: ['black cherry','cherry liqueur','bitter almond','turkish rose','jasmine sambac','roasted tonka'], category: 'fruity', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1601040120827-5120d54cbc51?auto=format&fit=crop&w=800&q=80' },
      { name: 'Ambre Nuit', brand: 'Dior', price: 13999, notes: ['pink pepper','ginger','damask rose','amber','patchouli','sandalwood'], category: 'oriental', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1625602814500-2866d82d475d?auto=format&fit=crop&w=800&q=80' },
      
      // Reddit Modern Hits
      { name: 'Good Girl', brand: 'Carolina Herrera', price: 8499, notes: ['almond','coffee','tuberose','jasmine sambac','tonka bean','cacao'], category: 'gourmand', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1585386959984-a4155222cd05?auto=format&fit=crop&w=800&q=80' },
      { name: 'Libre', brand: 'Yves Saint Laurent', price: 8999, notes: ['mandarin orange','lavender','black currant','orange blossom','jasmine','cedar'], category: 'floral', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80' },
      { name: 'Y EDP', brand: 'Yves Saint Laurent', price: 7999, notes: ['apple','ginger','bergamot','sage','juniper berries','ambroxan'], category: 'aromatic', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80' },
      { name: 'Dylan Blue', brand: 'Versace', price: 5999, notes: ['calabrian bergamot','grapefruit','fig leaves','violet leaf','papyrus','mineral musk'], category: 'aromatic', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1523293836414-754725df0545?auto=format&fit=crop&w=800&q=80' },
      { name: 'Flowerbomb', brand: 'Viktor & Rolf', price: 8999, notes: ['tea','bergamot','freesia','orchid','rose','patchouli'], category: 'floral', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80' },
      
      // Reddit Cult Classics
      { name: 'Glossier You', brand: 'Glossier', price: 4999, notes: ['pink pepper','iris root','ambrette seeds','ambrox','musk'], category: 'musky', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80' },
      { name: 'Green Tea', brand: 'Elizabeth Arden', price: 2999, notes: ['lemon','bergamot','mint','green tea','jasmine','white amber'], category: 'fresh', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1610375461246-83df859d9d15?auto=format&fit=crop&w=800&q=80' },
      { name: 'Drakkar Noir', brand: 'Guy Laroche', price: 3999, notes: ['lavender','lemon','bergamot','juniper','coriander','sandalwood'], category: 'aromatic', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1557170334-a9632e77c6e9?auto=format&fit=crop&w=800&q=80' },
      { name: 'Burberry Her', brand: 'Burberry', price: 7999, notes: ['strawberry','raspberry','blackberry','jasmine','violet','dry woods'], category: 'fruity', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1601040120827-5120d54cbc51?auto=format&fit=crop&w=800&q=80' },
      { name: 'Montblanc Legend', brand: 'Montblanc', price: 4999, notes: ['lavender','pineapple','bergamot','geranium','coumarin','sandalwood'], category: 'aromatic', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80' },
      
      // Reddit Fresh & Clean
      { name: 'Beach Walk', brand: 'Maison Margiela', price: 9999, notes: ['bergamot','lemon','pink pepper','ylang-ylang','coconut milk','cedar'], category: 'aquatic', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1523293836414-754725df0545?auto=format&fit=crop&w=800&q=80' },
      { name: 'Another 13', brand: 'Le Labo', price: 14999, notes: ['ambroxan','jasmine petals','moss','ambergris','musk'], category: 'musky', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80' },
      { name: 'Bergamote 22', brand: 'Le Labo', price: 14999, notes: ['bergamot','grapefruit','petit grain','bay leaves','ginger','vetiver'], category: 'fresh', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1610375461246-83df859d9d15?auto=format&fit=crop&w=800&q=80' },
      { name: 'Do Son', brand: 'Diptyque', price: 11999, notes: ['tuberose','orange blossom','jasmine','rose','white musk'], category: 'floral', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80' },
      { name: 'Tam Dao', brand: 'Diptyque', price: 11999, notes: ['sandalwood','rose','spices','cedar','myrrhis'], category: 'woody', gender: 'unisex', imageUrl:'https://images.unsplash.com/photo-1557170334-a9632e77c6e9?auto=format&fit=crop&w=800&q=80' },
      
      // Reddit Hidden Gems
      { name: 'Encre Noire', brand: 'Lalique', price: 4999, notes: ['vetiver','cassia','cypress','musk'], category: 'woody', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1557170334-a9632e77c6e9?auto=format&fit=crop&w=800&q=80' },
      { name: 'Herod', brand: 'Parfums de Marly', price: 16999, notes: ['cinnamon','pepper','tobacco','vanilla','labdanum','cedar'], category: 'oriental', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1625602814500-2866d82d475d?auto=format&fit=crop&w=800&q=80' },
      { name: 'Layton', brand: 'Parfums de Marly', price: 16999, notes: ['apple','lavender','bergamot','geranium','violet','vanilla'], category: 'aromatic', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80' },
      { name: 'Pegasus', brand: 'Parfums de Marly', price: 16999, notes: ['bergamot','heliotrope','bitter almond','jasmine','vanilla','sandalwood'], category: 'gourmand', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1625602814500-2866d82d475d?auto=format&fit=crop&w=800&q=80' },
      { name: 'Delina', brand: 'Parfums de Marly', price: 16999, notes: ['bergamot','lychee','peony','rose','vanilla','white musk'], category: 'floral', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80' },
      
      // Reddit Seasonal Favorites
      { name: 'Spicebomb', brand: 'Viktor & Rolf', price: 7999, notes: ['bergamot','grapefruit','elemi','pink pepper','chili','saffron'], category: 'spicy', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1625602814500-2866d82d475d?auto=format&fit=crop&w=800&q=80' },
      { name: 'Allure Homme Sport', brand: 'Chanel', price: 8999, notes: ['orange','sea notes','aldehydes','pepper','cedar','tonka bean'], category: 'fresh', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1523293836414-754725df0545?auto=format&fit=crop&w=800&q=80' },
      { name: 'Terre d\'Hermes', brand: 'Hermes', price: 9999, notes: ['orange','grapefruit','pepper','flint','vetiver','cedar'], category: 'woody', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1557170334-a9632e77c6e9?auto=format&fit=crop&w=800&q=80' },
      { name: 'Miss Dior', brand: 'Christian Dior', price: 8999, notes: ['blood orange','lily of the valley','centifolia rose','peony','iris','white musk'], category: 'floral', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80' },
      { name: 'J\'adore', brand: 'Christian Dior', price: 9999, notes: ['mandarin','ivy leaves','plum','orchid','rose','jasmine'], category: 'floral', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1601040120827-5120d54cbc51?auto=format&fit=crop&w=800&q=80' },
      
      // Reddit Final Favorites  
      { name: 'Hypnotic Poison', brand: 'Christian Dior', price: 7999, notes: ['coconut','plum','jasmine','almond','caraway','rosewood'], category: 'oriental', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1625602814500-2866d82d475d?auto=format&fit=crop&w=800&q=80' },
      { name: 'Ultra Male', brand: 'Jean Paul Gaultier', price: 6999, notes: ['pear','bergamot','mint','lavender','vanilla','amber'], category: 'gourmand', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80' },
      { name: 'Invictus', brand: 'Paco Rabanne', price: 6499, notes: ['grapefruit','mandarin','bay leaf','jasmine','guaiac wood','oakmoss'], category: 'aquatic', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1523293836414-754725df0545?auto=format&fit=crop&w=800&q=80' },
      { name: 'One Million', brand: 'Paco Rabanne', price: 6999, notes: ['grapefruit','mint','blood mandarin','rose','cinnamon','leather'], category: 'spicy', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1625602814500-2866d82d475d?auto=format&fit=crop&w=800&q=80' },
      { name: 'Stronger With You', brand: 'Giorgio Armani', price: 6999, notes: ['cardamom','pink pepper','violet leaf','sage','vanilla','chestnuts'], category: 'gourmand', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1625602814500-2866d82d475d?auto=format&fit=crop&w=800&q=80' },
      { name: 'Bright Crystal', brand: 'Versace', price: 5999, notes: ['pomegranate','yuzu','peony','magnolia','lotus flower','plant amber'], category: 'floral', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80' },
      { name: 'Prada Luna Rossa', brand: 'Prada', price: 7499, notes: ['lavender','bitter orange','mint','juniper berries','ambroxan'], category: 'aromatic', gender: 'male', imageUrl:'https://images.unsplash.com/photo-1523293836414-754725df0545?auto=format&fit=crop&w=800&q=80' },
      { name: 'Candy', brand: 'Prada', price: 7999, notes: ['caramel','honey','musk','benzoin','powder'], category: 'gourmand', gender: 'female', imageUrl:'https://images.unsplash.com/photo-1585386959984-a4155222cd05?auto=format&fit=crop&w=800&q=80' }
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
