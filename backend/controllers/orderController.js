const Order = require('../models/Order');
const Perfume = require('../models/Perfume');

// Pricing logic: if items count (sum of quantities) >= 2, sample free (price 0) else sample price from request/body or default 5
exports.createOrder = async (req, res) => {
  try {
    const { items, sample } = req.body; // items: [{ perfume, quantity }], sample: { samplePerfume }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items required' });
    }
    // Fetch perfumes and calculate prices
    const perfumeDocs = await Perfume.find({ _id: { $in: items.map(i => i.perfume) } });
    const perfumeMap = perfumeDocs.reduce((acc, p) => { acc[p._id] = p; return acc; }, {});
    let total = 0;
    const orderItems = items.map(i => {
      const p = perfumeMap[i.perfume];
      if (!p) throw new Error('Perfume not found: ' + i.perfume);
      const price = p.price * i.quantity;
      total += price;
      return { perfume: p._id, quantity: i.quantity, price: p.price };
    });
    const quantitySum = items.reduce((s, i) => s + i.quantity, 0);
    let sampleData = {};
    if (sample && sample.samplePerfume) {
      sampleData.samplePerfume = sample.samplePerfume;
      sampleData.price = quantitySum >= 2 ? 0 : (sample.price || 5);
      total += sampleData.price;
    }
    const order = await Order.create({ user: req.user._id, items: orderItems, sample: sampleData, total });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.perfume sample.samplePerfume');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user items.perfume sample.samplePerfume');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
