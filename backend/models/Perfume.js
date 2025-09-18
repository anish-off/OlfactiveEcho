const mongoose = require('mongoose');

const perfumeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  notes: {
    top: [{ type: String }],
    middle: [{ type: String }],
    base: [{ type: String }]
  },
  scentFamily: { 
    type: String, 
    enum: ['citrus', 'floral', 'woody', 'oriental', 'fresh', 'gourmand'],
    required: true 
  },
  category: { type: String },
  gender: { type: String, enum: ['male', 'female', 'unisex'], default: 'unisex' },
  intensity: { 
    type: String, 
    enum: ['light', 'moderate', 'strong'],
    default: 'moderate'
  },
  longevity: { 
    type: String,
    enum: ['2-4 hours', '4-6 hours', '6-8 hours', '8+ hours'],
    default: '4-6 hours'
  },
  sillage: {
    type: String,
    enum: ['intimate', 'moderate', 'strong', 'enormous'],
    default: 'moderate'
  },
  occasions: [{
    type: String,
    enum: ['daily', 'office', 'evening', 'party', 'romantic', 'formal', 'casual', 'sport']
  }],
  seasons: [{
    type: String,
    enum: ['spring', 'summer', 'autumn', 'winter']
  }],
  imageUrl: { type: String },
  stock: { type: Number, default: 0 },
  samplesAvailable: { type: Boolean, default: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isPopular: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  volume: { type: Number, default: 100 }, // ml
  concentration: {
    type: String,
    enum: ['EDT', 'EDP', 'Parfum', 'EDC'],
    default: 'EDT'
  }
}, { timestamps: true });

// Add virtual for flattened notes (for backward compatibility)
perfumeSchema.virtual('allNotes').get(function() {
  const notes = [];
  if (this.notes?.top) notes.push(...this.notes.top);
  if (this.notes?.middle) notes.push(...this.notes.middle);  
  if (this.notes?.base) notes.push(...this.notes.base);
  return notes;
});

// Index for better search performance
perfumeSchema.index({ scentFamily: 1 });
perfumeSchema.index({ price: 1 });
perfumeSchema.index({ gender: 1 });
perfumeSchema.index({ occasions: 1 });
perfumeSchema.index({ seasons: 1 });
perfumeSchema.index({ stock: 1 });

module.exports = mongoose.model('Perfume', perfumeSchema);
