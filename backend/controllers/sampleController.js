const Sample = require('../models/Sample');

exports.createSample = async (req, res) => {
  try {
    const sample = await Sample.create(req.body);
    res.status(201).json(sample);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSamples = async (req, res) => {
  try {
    const samples = await Sample.find({ available: true }).sort('-createdAt');
    res.json(samples);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
