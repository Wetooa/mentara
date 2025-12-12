"use client";

import React from "react";
import { ModerationQueue } from "@/components/moderator";
import { useModeratorContentQueue } from "@/hooks/moderator/useModeratorContentQueue";
import { useModeratorContentStore, useModeratorUIStore } from "@/store/moderator";
import type { Post, Comment } from "@/types/api";
import { logger } from "@/lib/logger";

// Local types that match the actual API response structure
interface ModerationPost {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: "link" | "text" | "video" | "image" | "poll";
  title: string;
  content: string;
  isDeleted: boolean;
  communityId: string;
  authorId: string;
  likeCount: number;
  commentCount: number;
}

interface ModerationComment {
  id: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  isDeleted: boolean;
  postId: string;
  authorId: string;
  parentId?: string;
  likeCount: number;
}

type ModerationContent = ModerationPost | ModerationComment;

export default function ModeratorContentPage() {
  const { 
    filters, 
    setFilters, 
    clearSelection 
  } = useModeratorContentStore();
  
  const {
    setCurrentAction,
    setActionDialogOpen
  } = useModeratorUIStore();
  
  const { data: queueData, isLoading, refetch } = useModeratorContentQueue(filters);

  const content = queueData?.content || [];
  const total = queueData?.total || 0;

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    refetch();
    clearSelection();
  };

  const handlePreview = (item: ModerationContent) => {
    // Handle content preview - could open a modal or navigate to detail view
    logger.debug('Preview content:', item);
  };

  const handleAction = (item: ModerationContent, action: 'approve' | 'reject' | 'remove') => {
    setCurrentAction({
      type: 'moderate-content',
      targetId: item.id,
      actionType: action,
    });
    setActionDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and moderate flagged content from the community
        </p>
      </header>

      <main>
        <ModerationQueue
        content={content as unknown as (Post | Comment)[]}
        total={total}
        isLoading={isLoading}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onRefresh={handleRefresh}
        onPreview={handlePreview as unknown as (item: Post | Comment) => void}
        onAction={handleAction as unknown as (item: Post | Comment, action: 'approve' | 'reject' | 'remove') => void}
      />
      </main>

      {/* Action dialogs would be handled here using the UI store state */}
    </div>
  );
}