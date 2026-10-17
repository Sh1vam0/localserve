import React from 'react';
import StarRating from './StarRating';
import { ShieldCheck, MessageSquare } from 'lucide-react';

const ReviewCard = ({ review }) => {
  const customerName = review.customer?.name || 'Verified Customer';
  const initial = customerName.charAt(0).toUpperCase();

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
            {initial}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h5 className="text-sm font-bold text-gray-900">{customerName}</h5>
              {review.isVerified && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700" title="Verified visit with completion OTP">
                  <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-600" />
                  Verified Visit
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-400">{formattedDate}</span>
          </div>
        </div>

        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Review Comment */}
      <p className="text-xs text-gray-700 leading-relaxed">{review.comment}</p>

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {review.tags.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-50 text-gray-600 border border-gray-100">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Owner Reply */}
      {review.ownerReply?.text && (
        <div className="mt-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/60 text-xs space-y-1">
          <div className="flex items-center space-x-1 font-semibold text-indigo-900 text-[11px]">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span>Response from Business Owner:</span>
          </div>
          <p className="text-indigo-800 text-[11px] italic pl-4">
            "{review.ownerReply.text}"
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
