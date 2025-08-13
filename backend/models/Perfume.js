const mongoose = require('mongoose');

const perfumeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  notes: [{ type: String }],
  category: { type: String },
  gender: { type: String, enum: ['male', 'female', 'unisex'], default: 'unisex' },
  imageUrl: { type: String },
  stock: { type: Number, default: 0 },
  samplesAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Perfume', perfumeSchema);
