const mongoose = require('mongoose');

const sampleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  perfume: { type: mongoose.Schema.Types.ObjectId, ref: 'Perfume' },
  description: { type: String },
  price: { type: Number, default: 5 },
  available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Sample', sampleSchema);
