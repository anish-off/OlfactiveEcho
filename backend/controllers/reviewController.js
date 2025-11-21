const Review = require('../models/Review');
const Order = require('../models/Order');
const Perfume = require('../models/Perfume');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { perfumeId, orderId, rating, title, comment, longevity, sillage, seasonRating, occasionRating, images } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!perfumeId || !rating || !title || !comment || !longevity || !sillage) {
      return res.status(400).json({ 
        message: 'Please provide all required fields' 
      });
    }

    // Check if perfume exists
    const perfume = await Perfume.findById(perfumeId);
    if (!perfume) {
      return res.status(404).json({ message: 'Perfume not found' });
    }

    // Check if user already reviewed this perfume
    const existingReview = await Review.findOne({ user: userId, perfume: perfumeId });
    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this product' 
      });
    }

    // Check if this is a verified purchase
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        user: userId,
        status: 'delivered',
        'items.perfume': perfumeId
      });
      
      if (order) {
        isVerifiedPurchase = true;
        // Mark order as reviewed
        order.reviewed = true;
        await order.save();
      }
    }

    // Create review
    const review = new Review({
      perfume: perfumeId,
      user: userId,
      order: orderId || null,
      rating,
      title,
      comment,
      longevity,
      sillage,
      seasonRating: seasonRating || [],
      occasionRating: occasionRating || [],
      images: images || [],
      isVerifiedPurchase,
      status: 'approved' // Auto-approve for now
    });

    await review.save();

    // Populate user data
    await review.populate('user', 'name avatar');

    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ 
      message: 'Failed to submit review',
      error: error.message 
    });
  }
};

// Get reviews for a perfume
exports.getReviewsByPerfume = async (req, res) => {
  try {
    const { perfumeId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt',
      rating,
      verified 
    } = req.query;

    const query = { 
      perfume: perfumeId, 
      status: 'approved' 
    };

    // Filter by rating
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Filter by verified purchase
    if (verified === 'true') {
      query.isVerifiedPurchase = true;
    }

    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Review.countDocuments(query);

    // Get rating distribution
    const ratingStats = await Review.aggregate([
      { 
        $match: { 
          perfume: new require('mongoose').Types.ObjectId(perfumeId),
          status: 'approved'
        } 
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const distribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    ratingStats.forEach(stat => {
      distribution[stat._id] = stat.count;
    });

    res.json({
      reviews,
      totalReviews: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      ratingDistribution: distribution
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch reviews',
      error: error.message 
    });
  }
};

// Get reviews by user
exports.getReviewsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ user: userId })
      .populate('perfume', 'name image_url brand price')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Review.countDocuments({ user: userId });

    res.json({
      reviews,
      totalReviews: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch reviews',
      error: error.message 
    });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const { rating, title, comment, longevity, sillage, seasonRating, occasionRating, images } = req.body;

    const review = await Review.findOne({ _id: reviewId, user: userId });

    if (!review) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (longevity) review.longevity = longevity;
    if (sillage) review.sillage = sillage;
    if (seasonRating) review.seasonRating = seasonRating;
    if (occasionRating) review.occasionRating = occasionRating;
    if (images) review.images = images;

    await review.save();
    await review.populate('user', 'name avatar');

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ 
      message: 'Failed to update review',
      error: error.message 
    });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const query = { _id: reviewId };
    
    // Non-admin users can only delete their own reviews
    if (userRole !== 'admin') {
      query.user = userId;
    }

    const review = await Review.findOneAndDelete(query);

    if (!review) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ 
      message: 'Failed to delete review',
      error: error.message 
    });
  }
};

// Vote helpful/not helpful
exports.voteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isHelpful } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.voteHelpful(userId, isHelpful);
    await review.save();

    res.json({
      message: 'Vote recorded successfully',
      helpfulCount: review.helpfulCount,
      notHelpfulCount: review.notHelpfulCount
    });
  } catch (error) {
    console.error('Vote review error:', error);
    res.status(500).json({ 
      message: 'Failed to record vote',
      error: error.message 
    });
  }
};

// Check if user can review a perfume
exports.canReview = async (req, res) => {
  try {
    const { perfumeId } = req.params;
    const userId = req.user.id;

    // Check if already reviewed
    const existingReview = await Review.findOne({ 
      user: userId, 
      perfume: perfumeId 
    });

    if (existingReview) {
      return res.json({ 
        canReview: false, 
        reason: 'Already reviewed',
        existingReview
      });
    }

    // Check if purchased
    const order = await Order.findOne({
      user: userId,
      status: 'delivered',
      'items.perfume': perfumeId
    });

    res.json({
      canReview: true,
      hasVerifiedPurchase: !!order,
      orderId: order?._id
    });
  } catch (error) {
    console.error('Can review check error:', error);
    res.status(500).json({ 
      message: 'Failed to check review eligibility',
      error: error.message 
    });
  }
};

// Admin: Moderate review
exports.moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, moderatorNote } = req.body;
    const adminId = req.user.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.status = status;
    review.moderatorNote = moderatorNote;
    review.moderatedBy = adminId;
    review.moderatedAt = new Date();

    await review.save();

    res.json({
      message: 'Review moderated successfully',
      review
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({ 
      message: 'Failed to moderate review',
      error: error.message 
    });
  }
};

// Admin: Reply to review
exports.replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;
    const adminId = req.user.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.reply = {
      comment,
      repliedBy: adminId,
      repliedAt: new Date()
    };

    await review.save();
    await review.populate('reply.repliedBy', 'name');

    res.json({
      message: 'Reply added successfully',
      review
    });
  } catch (error) {
    console.error('Reply to review error:', error);
    res.status(500).json({ 
      message: 'Failed to add reply',
      error: error.message 
    });
  }
};

// Get all reviews for admin
exports.getAllReviews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      status,
      rating,
      verified 
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (rating) query.rating = parseInt(rating);
    if (verified === 'true') query.isVerifiedPurchase = true;

    const reviews = await Review.find(query)
      .populate('user', 'name email avatar')
      .populate('perfume', 'name image_url brand')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Review.countDocuments(query);

    res.json({
      reviews,
      totalReviews: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch reviews',
      error: error.message 
    });
  }
};
