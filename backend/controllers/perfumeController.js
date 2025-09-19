
const fs = require('fs').promises;
const path = require('path');
const perfumesFilePath = path.join(__dirname, '..', 'combined_perfumes.json');

async function readPerfumes() {
  const data = await fs.readFile(perfumesFilePath, 'utf8');
  return JSON.parse(data);
}

async function writePerfumes(perfumes) {
  await fs.writeFile(perfumesFilePath, JSON.stringify(perfumes, null, 2), 'utf8');
}


exports.createPerfume = async (req, res) => {
  try {
    const perfumes = await readPerfumes();
    const newPerfume = {
      ...req.body,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    perfumes.push(newPerfume);
    await writePerfumes(perfumes);
    res.status(201).json(newPerfume);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.getPerfumes = async (req, res) => {
  try {
    const { q, category } = req.query;
    let perfumes = await readPerfumes();
    if (q) {
      perfumes = perfumes.filter(p => p.name && p.name.toLowerCase().includes(q.toLowerCase()));
    }
    if (category) {
      perfumes = perfumes.filter(p => p.category === category);
    }
    perfumes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(perfumes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getPerfume = async (req, res) => {
  try {
    const perfumes = await readPerfumes();
    const perfume = perfumes.find(p => p._id === req.params.id);
    if (!perfume) return res.status(404).json({ message: 'Not found' });
    res.json(perfume);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.updatePerfume = async (req, res) => {
  try {
    const perfumes = await readPerfumes();
    const idx = perfumes.findIndex(p => p._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    perfumes[idx] = {
      ...perfumes[idx],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await writePerfumes(perfumes);
    res.json(perfumes[idx]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH /perfumes/:id/image - update only image_url or photos
exports.updatePerfumeImage = async (req, res) => {
  try {
    const perfumes = await readPerfumes();
    const idx = perfumes.findIndex(p => p._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    // Only allow updating image_url and/or photos
    if ('image_url' in req.body) {
      perfumes[idx].image_url = req.body.image_url;
    }
    if ('photos' in req.body) {
      perfumes[idx].photos = req.body.photos;
    }
    perfumes[idx].updatedAt = new Date().toISOString();
    await writePerfumes(perfumes);
    res.json(perfumes[idx]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.deletePerfume = async (req, res) => {
  try {
    let perfumes = await readPerfumes();
    const idx = perfumes.findIndex(p => p._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    perfumes.splice(idx, 1);
    await writePerfumes(perfumes);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
