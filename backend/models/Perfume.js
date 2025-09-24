const mongoose = require('mongoose');

// Note schema for fragrance notes
const noteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  intensity: { type: Number, min: 0, max: 1 },
  image_url: { type: String }
}, { _id: false });

// Accord schema for main accords
const accordSchema = new mongoose.Schema({
  name: { type: String, required: true },
  intensity: { type: Number, min: 0, max: 100 }
}, { _id: false });

// Brand schema
const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String },
  logo_url: { type: String }
}, { _id: false });

// Stats schemas
const ownershipStatsSchema = new mongoose.Schema({
  own: { type: Number, default: 0 },
  had: { type: Number, default: 0 },
  want: { type: Number, default: 0 }
}, { _id: false });

const sentimentStatsSchema = new mongoose.Schema({
  love: { type: Number, default: 0 },
  like: { type: Number, default: 0 },
  ok: { type: Number, default: 0 },
  dislike: { type: Number, default: 0 },
  hate: { type: Number, default: 0 }
}, { _id: false });

const seasonalityStatsSchema = new mongoose.Schema({
  winter: { type: Number, default: 0 },
  spring: { type: Number, default: 0 },
  summer: { type: Number, default: 0 },
  fall: { type: Number, default: 0 },
  day: { type: Number, default: 0 },
  night: { type: Number, default: 0 }
}, { _id: false });

const perfumeSchema = new mongoose.Schema({
  // Core information
  name: { type: String, required: true },
  image_url: { type: String },
  url: { type: String },
  
  // Brand information
  brand: { type: brandSchema, required: true },
  
  // Fragrance composition
  main_accords: [accordSchema],
  notes: {
    "Top Notes": [noteSchema],
    "Middle Notes": [noteSchema], 
    "Base Notes": [noteSchema],
    "General Notes": [noteSchema]
  },
  
  // Additional photos
  photos: [{ type: String }],
  
  // Reviews and feedback
  pros: [{ type: String }],
  cons: [{ type: String }],
  
  // Statistics
  ownership_stats: { type: ownershipStatsSchema, default: {} },
  sentiment_stats: { type: sentimentStatsSchema, default: {} },
  seasonality_stats: { type: seasonalityStatsSchema, default: {} },
  
  // Legacy fields for backward compatibility
  price: { type: Number },
  description: { type: String },
  scentFamily: { type: String },
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
}, { timestamps: true, suppressReservedKeysWarning: true });

// Virtual fields for convenience
perfumeSchema.virtual('allNotes').get(function() {
  const notes = [];
  if (this.notes?.["Top Notes"]) notes.push(...this.notes["Top Notes"].map(n => n.name));
  if (this.notes?.["Middle Notes"]) notes.push(...this.notes["Middle Notes"].map(n => n.name));  
  if (this.notes?.["Base Notes"]) notes.push(...this.notes["Base Notes"].map(n => n.name));
  if (this.notes?.["General Notes"]) notes.push(...this.notes["General Notes"].map(n => n.name));
  return notes;
});

// Virtual for main image (backward compatibility)
perfumeSchema.virtual('imageUrl').get(function() {
  return this.image_url;
});

// Virtual for brand name (backward compatibility)
perfumeSchema.virtual('brandName').get(function() {
  return this.brand?.name;
});

// Index for better search performance
perfumeSchema.index({ 'name': 'text' });
perfumeSchema.index({ 'brand.name': 1 });
perfumeSchema.index({ 'main_accords.name': 1 });
perfumeSchema.index({ scentFamily: 1 });
perfumeSchema.index({ price: 1 });
perfumeSchema.index({ gender: 1 });
perfumeSchema.index({ occasions: 1 });
perfumeSchema.index({ seasons: 1 });
perfumeSchema.index({ stock: 1 });
perfumeSchema.index({ createdAt: -1 });
perfumeSchema.index({ isPopular: 1 });
perfumeSchema.index({ isNew: 1 });

module.exports = mongoose.model('Perfume', perfumeSchema);
