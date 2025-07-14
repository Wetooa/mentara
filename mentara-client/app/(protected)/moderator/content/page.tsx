"use client";

import React from "react";
import { ModerationQueue } from "@/components/moderator";
import { useModeratorContentQueue } from "@/hooks/useModeratorContentQueue";
import { useModeratorContentStore, useModeratorUIStore } from "@/store/moderator";
import type { Post, Comment } from "@/types/api";

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

  const handlePreview = (item: Post | Comment) => {
    // Handle content preview - could open a modal or navigate to detail view
    console.log('Preview content:', item);
  };

  const handleAction = (item: Post | Comment, action: 'approve' | 'reject' | 'remove') => {
    setCurrentAction({
      type: 'moderate-content',
      targetId: item.id,
      actionType: action,
    });
    setActionDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and moderate flagged content from the community
        </p>
      </div>

      <ModerationQueue
        content={content}
        total={total}
        isLoading={isLoading}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onRefresh={handleRefresh}
        onPreview={handlePreview}
        onAction={handleAction}
      />

      {/* Action dialogs would be handled here using the UI store state */}
    </div>
  );
}