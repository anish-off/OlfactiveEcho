const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true 
  },
  logo: { 
    type: String 
  },
  website: { 
    type: String 
  },
  country: { 
    type: String 
  },
  foundedYear: { 
    type: Number 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  sortOrder: { 
    type: Number, 
    default: 0 
  },
  seoTitle: { 
    type: String 
  },
  seoDescription: { 
    type: String 
  },
  productCount: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

// Index for better search performance
brandSchema.index({ name: 'text', description: 'text' });
brandSchema.index({ isActive: 1 });
brandSchema.index({ isFeatured: 1 });
brandSchema.index({ sortOrder: 1 });

module.exports = mongoose.model('Brand', brandSchema);
