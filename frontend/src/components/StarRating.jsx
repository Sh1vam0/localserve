import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, size = 'md', interactive = false, onChange = null }) => {
  const stars = [1, 2, 3, 4, 5];

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex items-center space-x-1">
      {stars.map((starIndex) => {
        const isFilled = starIndex <= Math.round(rating);
        return (
          <button
            key={starIndex}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starIndex)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          >
            <Star
              className={`${currentSize} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-200 fill-gray-100'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
