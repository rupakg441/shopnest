import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const Rating = ({ rating = 0, max = 5, size = 18, className = '' }) => {
  const stars = [];
  const floorRating = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.4 && rating % 1 <= 0.8;

  for (let i = 1; i <= max; i++) {
    if (i <= floorRating) {
      stars.push(
        <Star
          key={i}
          size={size}
          className="fill-secondary text-secondary"
        />
      );
    } else if (i === floorRating + 1 && hasHalf) {
      stars.push(
        <StarHalf
          key={i}
          size={size}
          className="text-secondary fill-secondary"
        />
      );
    } else {
      stars.push(
        <Star
          key={i}
          size={size}
          className="text-outline-variant/40"
        />
      );
    }
  }

  return (
    <div className={`flex items-center gap-xs ${className}`}>
      {stars}
    </div>
  );
};

export default Rating;
