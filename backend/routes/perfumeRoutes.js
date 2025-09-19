const express = require('express');
const router = express.Router();
const { 
  createPerfume, 
  getPerfumes, 
  getPerfume, 
  updatePerfume, 
  deletePerfume, 
  updatePerfumeImage,
  getPopularPerfumes,
  getNewPerfumes,
  getPerfumesByBrand,
  getBrands,
  getPerfumeStats
} = require('../controllers/perfumeController');
const { auth, requireAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getPerfumes);
router.get('/popular', getPopularPerfumes);
router.get('/new', getNewPerfumes);
router.get('/brands', getBrands);
router.get('/stats', getPerfumeStats);
router.get('/brand/:brandName', getPerfumesByBrand);
router.get('/:id', getPerfume);

// Admin routes
router.post('/', auth, requireAdmin, createPerfume);
router.put('/:id', auth, requireAdmin, updatePerfume);
router.patch('/:id/image', auth, requireAdmin, updatePerfumeImage);
router.delete('/:id', auth, requireAdmin, deletePerfume);

module.exports = router;
