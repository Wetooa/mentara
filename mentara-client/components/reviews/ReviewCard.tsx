"use client";

import React, { useState } from "react";
import { Star, ThumbsUp, MoreHorizontal, User, Flag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Review } from "@/types/review";
import { useMarkReviewHelpful } from "@/hooks/useReviews";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  review: Review;
  showTherapistInfo?: boolean;
  currentUserId?: string;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
}

export default function ReviewCard({
  review,
  showTherapistInfo = false,
  currentUserId,
  onEdit,
  onDelete,
  onReport,
}: ReviewCardProps) {
  const [isHelpfulClicked, setIsHelpfulClicked] = useState(false);
  const markHelpfulMutation = useMarkReviewHelpful();

  const isOwnReview = currentUserId === review.clientId;
  const canModify = isOwnReview && review.status === 'PENDING';

  const handleMarkHelpful = async () => {
    if (isOwnReview) return; // Can't mark own review as helpful
    
    setIsHelpfulClicked(true);
    await markHelpfulMutation.mutateAsync(review.id);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const getStatusBadge = () => {
    if (review.status === 'PENDING') {
      return <Badge variant="outline" className="text-orange-600 border-orange-200">Pending Review</Badge>;
    }
    if (review.status === 'REJECTED') {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (review.status === 'FLAGGED') {
      return <Badge variant="outline" className="text-red-600 border-red-200">Flagged</Badge>;
    }
    return null;
  };

  const displayName = review.isAnonymous 
    ? "Anonymous User" 
    : `${review.client.user.firstName} ${review.client.user.lastName.charAt(0)}.`;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                {!review.isAnonymous && review.client.user.avatarUrl ? (
                  <AvatarImage src={review.client.user.avatarUrl} alt={displayName} />
                ) : (
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{displayName}</p>
                  {review.isVerified && (
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getStatusBadge()}
              
              {(isOwnReview || onReport) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canModify && onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(review)}>
                        Edit Review
                      </DropdownMenuItem>
                    )}
                    {isOwnReview && onDelete && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(review.id)}
                        className="text-red-600"
                      >
                        Delete Review
                      </DropdownMenuItem>
                    )}
                    {!isOwnReview && onReport && (
                      <DropdownMenuItem onClick={() => onReport(review.id)}>
                        <Flag className="h-4 w-4 mr-2" />
                        Report Review
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Therapist Info (if showing multiple therapists) */}
          {showTherapistInfo && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                Review for: <span className="font-medium text-gray-900">
                  Dr. {review.therapist.firstName} {review.therapist.lastName}
                </span>
              </p>
            </div>
          )}

          {/* Review Content */}
          <div className="space-y-2">
            {review.title && (
              <h4 className="font-semibold text-gray-900">{review.title}</h4>
            )}
            {review.content && (
              <p className="text-gray-700 leading-relaxed">{review.content}</p>
            )}
          </div>

          {/* Session Info */}
          {review.meeting && (
            <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
              Session on {new Date(review.meeting.startTime).toLocaleDateString()} 
              ({review.meeting.duration} minutes)
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkHelpful}
              disabled={isOwnReview || markHelpfulMutation.isPending || isHelpfulClicked}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-600"
            >
              <ThumbsUp className={`h-4 w-4 ${isHelpfulClicked ? "fill-blue-600 text-blue-600" : ""}`} />
              <span>Helpful ({review.helpfulCount})</span>
            </Button>

            {review.moderationNote && isOwnReview && (
              <div className="text-xs text-gray-500">
                Moderator note: {review.moderationNote}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}