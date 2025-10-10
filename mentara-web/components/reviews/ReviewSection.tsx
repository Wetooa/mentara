"use client";

import React, { useState } from "react";
import { Star, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewCard from "./ReviewCard";
import { useTherapistReviews, useTherapistReviewStats } from "@/hooks/reviews/useReviews";
// import { Review } from "@/types/review";

interface ReviewSectionProps {
  therapistId: string;
  currentUserId?: string;
  onWriteReview?: () => void;
  showWriteReviewButton?: boolean;
}

export default function ReviewSection({
  therapistId,
  currentUserId,
  onWriteReview,
  showWriteReviewButton = true,
}: ReviewSectionProps) {
  const [sortBy, setSortBy] = useState("createdAt");
  const [filterRating, setFilterRating] = useState<number | undefined>();
  const [isExpanded, setIsExpanded] = useState(false);

  const { 
    data: reviewsData, 
    isLoading: reviewsLoading, 
    error: reviewsError 
  } = useTherapistReviews(therapistId, {
    page: 1,
    limit: isExpanded ? 50 : 6,
    sortBy,
    sortOrder: "desc",
    rating: filterRating,
  });

  const { 
    data: stats, 
    isLoading: statsLoading 
  } = useTherapistReviewStats(therapistId);

  const reviews = reviewsData?.reviews || [];
  const hasMoreReviews = (reviewsData?.pagination?.total || 0) > 6;

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${starSize} ${
          index < rating
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const renderRatingDistribution = () => {
    if (!stats) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] || 0;
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center space-x-2 text-sm">
              <span className="w-6 text-gray-600">{rating}</span>
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-500 text-xs">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (statsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Overall Rating */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Patient Reviews</h3>
          {showWriteReviewButton && onWriteReview && (
            <Button onClick={onWriteReview} size="sm">
              Write a Review
            </Button>
          )}
        </div>

        {stats && stats.totalReviews > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</span>
                <div className="flex items-center space-x-1">
                  {renderStars(Math.round(stats.averageRating), "md")}
                </div>
              </div>
              <p className="text-gray-600">
                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Rating Distribution</h4>
              {renderRatingDistribution()}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Star className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p>No reviews yet</p>
            <p className="text-sm">Be the first to review this therapist</p>
          </div>
        )}
      </div>

      {/* Filters and Sort */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterRating?.toString()} onValueChange={(value) => setFilterRating(value === "all" ? undefined : parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All stars" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stars</SelectItem>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} star{rating !== 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Most Recent</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="helpfulCount">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Badge variant="outline">
            {reviewsData?.pagination?.total || 0} review{(reviewsData?.pagination?.total || 0) !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}

      {/* Reviews List */}
      {reviewsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : reviewsError ? (
        <div className="text-center py-8 text-red-500">
          <p>Failed to load reviews</p>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {/* Always visible reviews */}
          {reviews.slice(0, 6).map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              currentUserId={currentUserId}
            />
          ))}

          {/* Expandable reviews */}
          {hasMoreReviews && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleContent className="space-y-4">
                {reviews.slice(6).map((review) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    currentUserId={currentUserId}
                  />
                ))}
              </CollapsibleContent>
              
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full mt-4">
                  {isExpanded ? 'Show Less' : `Show More Reviews (${(reviewsData?.pagination?.total || 0) - 6} more)`}
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No reviews match your filters</p>
        </div>
      )}
    </div>
  );
}