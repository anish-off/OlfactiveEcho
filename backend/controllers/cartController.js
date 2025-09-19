
const fs = require('fs').promises;
const path = require('path');
const perfumesFilePath = path.join(__dirname, '..', 'combined_perfumes.json');

async function readPerfumes() {
  const data = await fs.readFile(perfumesFilePath, 'utf8');
  return JSON.parse(data);
}

// Validate cart items against JSON file
exports.validateCart = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required'
      });
    }
    const perfumeIds = items.map(item => item.id || item.perfume);
    const perfumes = await readPerfumes();
    const perfumeMap = perfumes.reduce((acc, p) => {
      acc[p._id] = p;
      return acc;
    }, {});
    const validatedItems = [];
    const errors = [];
    let subtotal = 0;
    for (const item of items) {
      const perfumeId = (item.id || item.perfume).toString();
      const perfume = perfumeMap[perfumeId];
      if (!perfume) {
        errors.push(`Perfume not found: ${perfumeId}`);
        continue;
      }
      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for ${perfume.name}`);
        continue;
      }
      const itemTotal = perfume.price * item.quantity;
      subtotal += itemTotal;
      validatedItems.push({
        id: perfume._id,
        product: perfume,
        quantity: item.quantity,
        itemTotal
      });
    }
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart validation failed',
        errors
      });
    }
    res.json({
      success: true,
      items: validatedItems,
      subtotal,
      totalItems: validatedItems.reduce((sum, item) => sum + item.quantity, 0),
      message: 'Cart validated successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get available samples based on cart
exports.getAvailableSamples = async (req, res) => {
  try {
    const { cartTotal } = req.query;
    const perfumes = await readPerfumes();
    const samples = perfumes.filter(p => ['sample', 'perfume'].includes(p.category));
    const freeThreshold = 2; // Free samples if 2+ items in cart
    const samplePrice = parseFloat(cartTotal) >= freeThreshold ? 0 : 5;
    res.json({
      success: true,
      samples: samples.map(sample => ({
        ...sample,
        samplePrice
      })),
      freeThreshold,
      message: 'Available samples retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
