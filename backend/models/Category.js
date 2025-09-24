const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
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
  image: { 
    type: String 
  },
  isActive: { 
    type: Boolean, 
    default: true 
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
categorySchema.index({ name: 'text', description: 'text' });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });

module.exports = mongoose.model('Category', categorySchema);
