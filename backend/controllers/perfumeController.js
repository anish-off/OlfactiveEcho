const Perfume = require('../models/Perfume');

exports.createPerfume = async (req, res) => {
  try {
    const perfume = await Perfume.create(req.body);
    res.status(201).json(perfume);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getPerfumes = async (req, res) => {
  try {
    const { q, category } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (category) filter.category = category;
    const perfumes = await Perfume.find(filter).sort('-createdAt');
    res.json(perfumes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPerfume = async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id);
    if (!perfume) return res.status(404).json({ message: 'Not found' });
    res.json(perfume);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePerfume = async (req, res) => {
  try {
    const perfume = await Perfume.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!perfume) return res.status(404).json({ message: 'Not found' });
    res.json(perfume);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePerfume = async (req, res) => {
  try {
    const perfume = await Perfume.findByIdAndDelete(req.params.id);
    if (!perfume) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
