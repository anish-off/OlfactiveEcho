import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Filter, ChevronDown } from 'lucide-react';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import RatingStars from './RatingStars';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const ReviewList = ({ perfumeId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState(null);
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [filterRating, setFilterRating] = useState(null);
  const [filterVerified, setFilterVerified] = useState(false);
  const [sortBy, setSortBy] = useState('-createdAt');

  useEffect(() => {
    fetchReviews();
    if (user) {
      checkReviewEligibility();
    }
  }, [perfumeId, currentPage, filterRating, filterVerified, sortBy, user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        sort: sortBy
      };

      if (filterRating) params.rating = filterRating;
      if (filterVerified) params.verified = true;

      const response = await api.get(`/reviews/perfume/${perfumeId}`, { params });
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
      setRatingDistribution(response.data.ratingDistribution || {});
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      const response = await api.get(`/reviews/can-review/${perfumeId}`);
      setCanReview(response.data.canReview);
      setReviewEligibility(response.data);
    } catch (error) {
      console.error('Failed to check review eligibility:', error);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      await api.post('/reviews', reviewData);
      setShowReviewForm(false);
      setCanReview(false);
      fetchReviews();
      // Show success message
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleVoteReview = async (reviewId, isHelpful) => {
    if (!user) {
      alert('Please login to vote');
      return;
    }

    try {
      await api.post(`/reviews/${reviewId}/vote`, { isHelpful });
      fetchReviews(); // Refresh to get updated counts
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const totalReviews = Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0);
  const averageRating = totalReviews > 0
    ? Object.entries(ratingDistribution).reduce((sum, [rating, count]) => sum + (rating * count), 0) / totalReviews
    : 0;

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Average Rating */}
          <div className="text-center md:border-r border-gray-200">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <RatingStars rating={averageRating} size="lg" />
            <p className="text-sm text-gray-600 mt-2">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-gray-900 mb-3">Rating Distribution</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                return (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                    className={`w-full flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors ${
                      filterRating === rating ? 'bg-amber-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#BF7C2A] to-[#8C501B]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      {user && canReview && (
        <motion.button
          onClick={() => setShowReviewForm(true)}
          className="w-full bg-gradient-to-r from-[#BF7C2A] to-[#8C501B] text-white py-3 px-6 rounded-lg font-medium hover:from-[#8C501B] hover:to-[#704a00] transition-all shadow-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Write a Review
          {reviewEligibility?.hasVerifiedPurchase && (
            <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
              Verified Purchase
            </span>
          )}
        </motion.button>
      )}

      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800">
            Please <a href="/login" className="font-semibold underline">login</a> to write a review
          </p>
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterVerified(!filterVerified)}
            className={`px-4 py-2 rounded-lg border-2 transition-all ${
              filterVerified
                ? 'border-[#BF7C2A] bg-amber-50 text-[#8C501B]'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            Verified Only
          </button>
          {(filterRating || filterVerified) && (
            <button
              onClick={() => {
                setFilterRating(null);
                setFilterVerified(false);
              }}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BF7C2A] focus:border-transparent"
          >
            <option value="-createdAt">Most Recent</option>
            <option value="createdAt">Oldest</option>
            <option value="-rating">Highest Rating</option>
            <option value="rating">Lowest Rating</option>
            <option value="-helpfulCount">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BF7C2A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-600">
            Be the first to review this perfume!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onVote={handleVoteReview}
              currentUserId={user?._id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <ReviewForm
            perfumeId={perfumeId}
            orderId={reviewEligibility?.orderId}
            onSubmit={handleSubmitReview}
            onCancel={() => setShowReviewForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewList;
