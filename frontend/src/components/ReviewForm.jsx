import React, { useState } from 'react';
import StarRating from './StarRating';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Send, Sparkles } from 'lucide-react';

const availableTags = [
  'Friendly',
  'On Time',
  'Clean',
  'Value for Money',
  'Skilled',
  'Highly Recommended',
];

const ReviewForm = ({ businessId, bookingId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        businessId,
        bookingId,
        rating,
        comment,
        tags: selectedTags,
      });

      toast.success('Thank you! Your verified review has been published.');
      setComment('');
      setSelectedTags([]);
      if (onReviewSubmitted) onReviewSubmitted(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h4 className="text-sm font-bold text-gray-900">Leave a Verified Review</h4>
          <p className="text-xs text-gray-400">Share your genuine experience with other customers</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-500">Rating:</span>
          <StarRating rating={rating} size="lg" interactive={true} onChange={setRating} />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-700 block mb-1">Your Review</label>
        <textarea
          rows={3}
          required
          placeholder="How was the service, staff behavior, hygiene, and overall experience?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-[11px] font-semibold text-gray-500 block mb-2">Quick Tags:</label>
        <div className="flex flex-wrap gap-1.5">
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{submitting ? 'Posting...' : 'Submit Review'}</span>
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
