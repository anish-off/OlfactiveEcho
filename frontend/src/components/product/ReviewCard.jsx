import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, ShieldCheck, Calendar } from 'lucide-react';
import RatingStars from './RatingStars';
import { format } from 'date-fns';

const ReviewCard = ({ review, onVote, currentUserId }) => {
  const [hasVoted, setHasVoted] = React.useState(null);

  const handleVote = async (isHelpful) => {
    if (hasVoted === isHelpful) return; // Already voted this way
    
    setHasVoted(isHelpful);
    if (onVote) {
      await onVote(review._id, isHelpful);
    }
  };

  const getLongevityLabel = (longevity) => {
    const labels = {
      poor: '2-4 hours',
      moderate: '4-6 hours',
      good: '6-8 hours',
      excellent: '8+ hours'
    };
    return labels[longevity] || longevity;
  };

  const getSillageLabel = (sillage) => {
    const labels = {
      intimate: 'Intimate',
      moderate: 'Moderate',
      strong: 'Strong',
      enormous: 'Enormous'
    };
    return labels[sillage] || sillage;
  };

  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {/* User Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-[#BF7C2A] to-[#8C501B] rounded-full flex items-center justify-center text-white font-semibold">
            {review.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">
                {review.user?.name || 'Anonymous'}
              </h4>
              {review.isVerifiedPurchase && (
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Purchase
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={review.rating} size="sm" />
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(review.createdAt), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Title */}
      <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>

      {/* Review Comment */}
      <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

      {/* Review Attributes */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-sm">
          <span className="text-gray-600">Longevity:</span>
          <span className="ml-1 font-medium text-gray-900">
            {getLongevityLabel(review.longevity)}
          </span>
        </div>
        <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-sm">
          <span className="text-gray-600">Sillage:</span>
          <span className="ml-1 font-medium text-gray-900">
            {getSillageLabel(review.sillage)}
          </span>
        </div>
      </div>

      {/* Season & Occasion Tags */}
      {(review.seasonRating?.length > 0 || review.occasionRating?.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.seasonRating?.map((season) => (
            <span
              key={season}
              className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium"
            >
              {season}
            </span>
          ))}
          {review.occasionRating?.map((occasion) => (
            <span
              key={occasion}
              className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-medium"
            >
              {occasion}
            </span>
          ))}
        </div>
      )}

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => window.open(image, '_blank')}
            />
          ))}
        </div>
      )}

      {/* Admin Reply */}
      {review.reply && (
        <div className="bg-amber-50 border-l-4 border-[#BF7C2A] p-4 mt-4">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#BF7C2A] to-[#8C501B] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">OE</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Response from OlfactiveEcho
              </p>
              <p className="text-sm text-gray-700">{review.reply.comment}</p>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Voting */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-600">Was this helpful?</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote(true)}
            disabled={!currentUserId}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
              hasVoted === true
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{review.helpfulCount || 0}</span>
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={!currentUserId}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
              hasVoted === false
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>{review.notHelpfulCount || 0}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewCard;
