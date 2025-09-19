const express = require('express');
const router = express.Router();
const { createPerfume, getPerfumes, getPerfume, updatePerfume, deletePerfume, updatePerfumeImage } = require('../controllers/perfumeController');
const { auth, requireAdmin } = require('../middleware/authMiddleware');


router.get('/', getPerfumes);
router.get('/:id', getPerfume);
router.post('/', auth, requireAdmin, createPerfume);
router.put('/:id', auth, requireAdmin, updatePerfume);
router.patch('/:id/image', auth, requireAdmin, updatePerfumeImage);
router.delete('/:id', auth, requireAdmin, deletePerfume);

module.exports = router;
