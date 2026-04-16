"use client";

import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  totalReviews?: number;
  size?: "xs" | "sm" | "md" | "lg";
  showNumber?: boolean;
  showReviewCount?: boolean;
  className?: string;
}

export default function StarRating({
  rating = 0,
  totalReviews = 0,
  size = "sm",
  showNumber = true,
  showReviewCount = true,
  className = "",
}: StarRatingProps) {
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const starSize = sizeClasses[size];
  const textSize = textSizeClasses[size];

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const isFilled = index < Math.floor(rating);
      const isHalfFilled = index === Math.floor(rating) && rating % 1 >= 0.5;
      
      return (
        <div key={index} className="relative">
          <Star className={`${starSize} text-gray-300`} />
          {(isFilled || isHalfFilled) && (
            <Star 
              className={`${starSize} text-yellow-400 fill-yellow-400 absolute top-0 left-0`}
              style={isHalfFilled ? { clipPath: 'inset(0 50% 0 0)' } : {}}
            />
          )}
        </div>
      );
    });
  };

  if (totalReviews === 0) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className="flex items-center space-x-0.5">
          {Array.from({ length: 5 }, (_, index) => (
            <Star key={index} className={`${starSize} text-gray-300`} />
          ))}
        </div>
        <span className={`text-gray-500 ${textSize}`}>No reviews</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-0.5">
        {renderStars()}
      </div>
      
      <div className={`flex items-center space-x-1 ${textSize}`}>
        {showNumber && (
          <span className="font-medium text-gray-900">
            {rating.toFixed(1)}
          </span>
        )}
        
        {showReviewCount && (
          <span className="text-gray-500">
            ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
          </span>
        )}
      </div>
    </div>
  );
}