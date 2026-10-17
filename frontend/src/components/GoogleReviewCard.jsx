import React from 'react';
import StarRating from './StarRating';
import { ExternalLink, Award } from 'lucide-react';

const GoogleReviewCard = ({ review, googleMapsUrl }) => {
  const authorName = review.authorName || 'Google User';
  const initial = authorName.charAt(0).toUpperCase();

  // Color generator based on name initial for Google-style avatar
  const avatarColors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-cyan-500',
  ];
  const colorIndex = (authorName.charCodeAt(0) || 0) % avatarColors.length;
  const avatarBg = avatarColors[colorIndex];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-3 relative hover:border-gray-200 transition-colors">
      {/* Google Maps source badge */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`w-9 h-9 rounded-full ${avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
          >
            {initial}
          </div>
          <div>
            <div className="flex items-center space-x-1.5 flex-wrap">
              <h5 className="text-sm font-bold text-gray-900">{authorName}</h5>
              {review.isLocalGuide && (
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                  title="Google Local Guide reviewer"
                >
                  <Award className="w-3 h-3 mr-0.5 text-amber-600" />
                  Local Guide {review.reviewCount ? `· ${review.reviewCount} reviews` : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
              <span>{review.relativeTime || 'Recently'}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-0.5 text-blue-600 font-semibold">
                via Google Maps
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-[10px] font-bold text-gray-500">
            {review.rating}.0 ★ on Google
          </span>
        </div>
      </div>

      {/* Review text */}
      <p className="text-xs text-gray-700 leading-relaxed italic">
        "{review.text}"
      </p>

      {/* Footer attribution */}
      <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
        <span className="flex items-center gap-1 text-gray-500">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google Maps Verified Community Feedback
        </span>

        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2f6b4f] hover:underline flex items-center gap-0.5 text-[10px] font-bold"
          >
            <span>View on Maps</span>
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
};

export default GoogleReviewCard;
