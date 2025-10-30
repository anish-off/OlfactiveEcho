const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');

const {
  createReview,
  getReviewsByPerfume,
  getReviewsByUser,
  updateReview,
  deleteReview,
  voteReview,
  canReview,
  moderateReview,
  replyToReview,
  getAllReviews
} = require('../controllers/reviewController');

// Public routes
router.get('/perfume/:perfumeId', getReviewsByPerfume);

// Protected routes (authenticated users)
router.post('/', auth, createReview);
router.get('/my-reviews', auth, getReviewsByUser);
router.get('/can-review/:perfumeId', auth, canReview);
router.put('/:reviewId', auth, updateReview);
router.delete('/:reviewId', auth, deleteReview);
router.post('/:reviewId/vote', auth, voteReview);

// Admin routes
router.get('/admin/all', adminAuth, getAllReviews);
router.put('/admin/:reviewId/moderate', adminAuth, moderateReview);
router.post('/admin/:reviewId/reply', adminAuth, replyToReview);

module.exports = router;
