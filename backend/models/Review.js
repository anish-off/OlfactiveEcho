const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  perfume: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Perfume', 
    required: true,
    index: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order',
    index: true
  },
  
  // Review content
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  comment: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000
  },
  
  // Review attributes
  longevity: { 
    type: String,
    enum: ['poor', 'moderate', 'good', 'excellent'],
    required: true
  },
  sillage: {
    type: String,
    enum: ['intimate', 'moderate', 'strong', 'enormous'],
    required: true
  },
  seasonRating: [{
    type: String,
    enum: ['spring', 'summer', 'autumn', 'winter']
  }],
  occasionRating: [{
    type: String,
    enum: ['daily', 'office', 'evening', 'party', 'romantic', 'formal', 'casual', 'sport']
  }],
  
  // Media
  images: [{ 
    type: String 
  }],
  
  // Verification & Status
  isVerifiedPurchase: { 
    type: Boolean, 
    default: false 
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // Auto-approve by default
  },
  
  // Engagement
  helpfulCount: { 
    type: Number, 
    default: 0 
  },
  notHelpfulCount: { 
    type: Number, 
    default: 0 
  },
  helpfulVoters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  notHelpfulVoters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Admin moderation
  moderatorNote: { 
    type: String 
  },
  moderatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  moderatedAt: { 
    type: Date 
  },
  
  // Reply from seller/admin
  reply: {
    comment: { type: String },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    repliedAt: { type: Date }
  }
}, { 
  timestamps: true 
});

// Compound index to ensure one review per user per perfume
reviewSchema.index({ user: 1, perfume: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ perfume: 1, status: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isVerifiedPurchase: 1 });

// Method to vote helpful/not helpful
reviewSchema.methods.voteHelpful = function(userId, isHelpful) {
  const helpfulIndex = this.helpfulVoters.indexOf(userId);
  const notHelpfulIndex = this.notHelpfulVoters.indexOf(userId);
  
  if (isHelpful) {
    // Remove from not helpful if exists
    if (notHelpfulIndex > -1) {
      this.notHelpfulVoters.splice(notHelpfulIndex, 1);
      this.notHelpfulCount = Math.max(0, this.notHelpfulCount - 1);
    }
    // Add to helpful if not exists
    if (helpfulIndex === -1) {
      this.helpfulVoters.push(userId);
      this.helpfulCount += 1;
    }
  } else {
    // Remove from helpful if exists
    if (helpfulIndex > -1) {
      this.helpfulVoters.splice(helpfulIndex, 1);
      this.helpfulCount = Math.max(0, this.helpfulCount - 1);
    }
    // Add to not helpful if not exists
    if (notHelpfulIndex === -1) {
      this.notHelpfulVoters.push(userId);
      this.notHelpfulCount += 1;
    }
  }
};

// Static method to calculate average rating for a perfume
reviewSchema.statics.calculateAverageRating = async function(perfumeId) {
  const stats = await this.aggregate([
    { 
      $match: { 
        perfume: mongoose.Types.ObjectId(perfumeId),
        status: 'approved'
      } 
    },
    {
      $group: {
        _id: '$perfume',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length > 0) {
    const Perfume = mongoose.model('Perfume');
    await Perfume.findByIdAndUpdate(perfumeId, {
      rating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount
    });
    return stats[0];
  }
  
  return { averageRating: 0, reviewCount: 0 };
};

// Middleware to update perfume rating after review save/delete
reviewSchema.post('save', async function() {
  if (this.status === 'approved') {
    await this.constructor.calculateAverageRating(this.perfume);
  }
});

reviewSchema.post('remove', async function() {
  await this.constructor.calculateAverageRating(this.perfume);
});

reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.perfume);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
