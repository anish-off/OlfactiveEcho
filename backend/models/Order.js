const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      perfume: { type: mongoose.Schema.Types.ObjectId, ref: 'Perfume', required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true }
    }
  ],
  sample: {
    samplePerfume: { type: mongoose.Schema.Types.ObjectId, ref: 'Perfume' },
    price: { type: Number, default: 0 }
  },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
