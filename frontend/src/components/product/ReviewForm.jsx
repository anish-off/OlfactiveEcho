import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Star } from 'lucide-react';
import RatingStars from './RatingStars';

const ReviewForm = ({ perfumeId, orderId, onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    rating: initialData?.rating || 0,
    title: initialData?.title || '',
    comment: initialData?.comment || '',
    longevity: initialData?.longevity || '',
    sillage: initialData?.sillage || '',
    seasonRating: initialData?.seasonRating || [],
    occasionRating: initialData?.occasionRating || [],
    images: initialData?.images || []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const seasons = ['spring', 'summer', 'autumn', 'winter'];
  const occasions = ['daily', 'office', 'evening', 'party', 'romantic', 'formal', 'casual', 'sport'];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const toggleArrayValue = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    if (!formData.comment.trim()) {
      newErrors.comment = 'Review comment is required';
    } else if (formData.comment.length < 10) {
      newErrors.comment = 'Review must be at least 10 characters';
    } else if (formData.comment.length > 2000) {
      newErrors.comment = 'Review must be less than 2000 characters';
    }
    if (!formData.longevity) {
      newErrors.longevity = 'Please rate the longevity';
    }
    if (!formData.sillage) {
      newErrors.sillage = 'Please rate the sillage';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        perfumeId,
        orderId
      });
    } catch (error) {
      console.error('Submit review error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <RatingStars
              rating={formData.rating}
              size="xl"
              editable
              onChange={(value) => handleChange('rating', value)}
            />
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Summarize your experience in one line"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#BF7C2A] focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={100}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => handleChange('comment', e.target.value)}
              placeholder="Share your detailed experience with this perfume..."
              rows={5}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#BF7C2A] focus:border-transparent ${
                errors.comment ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.comment ? (
                <p className="text-sm text-red-600">{errors.comment}</p>
              ) : (
                <p className="text-sm text-gray-500">Minimum 10 characters</p>
              )}
              <p className="text-sm text-gray-500">
                {formData.comment.length}/2000
              </p>
            </div>
          </div>

          {/* Longevity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longevity <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['poor', 'moderate', 'good', 'excellent'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleChange('longevity', option)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.longevity === option
                      ? 'border-[#BF7C2A] bg-amber-50 text-[#8C501B]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
            {errors.longevity && (
              <p className="mt-1 text-sm text-red-600">{errors.longevity}</p>
            )}
          </div>

          {/* Sillage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sillage <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['intimate', 'moderate', 'strong', 'enormous'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleChange('sillage', option)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.sillage === option
                      ? 'border-[#BF7C2A] bg-amber-50 text-[#8C501B]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
            {errors.sillage && (
              <p className="mt-1 text-sm text-red-600">{errors.sillage}</p>
            )}
          </div>

          {/* Seasons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Best Seasons (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {seasons.map((season) => (
                <button
                  key={season}
                  type="button"
                  onClick={() => toggleArrayValue('seasonRating', season)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.seasonRating.includes(season)
                      ? 'border-[#BF7C2A] bg-amber-50 text-[#8C501B]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Occasions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Best Occasions (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {occasions.map((occasion) => (
                <button
                  key={occasion}
                  type="button"
                  onClick={() => toggleArrayValue('occasionRating', occasion)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.occasionRating.includes(occasion)
                      ? 'border-[#BF7C2A] bg-amber-50 text-[#8C501B]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#BF7C2A] to-[#8C501B] text-white rounded-lg hover:from-[#8C501B] hover:to-[#704a00] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : initialData ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ReviewForm;
