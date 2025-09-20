'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  MessageCircle,
  Sort,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CommentItem } from './CommentItem';
import type { Comment } from '@/types/api/comments';

interface CommentTreeProps {
  comments: Comment[];
  postId?: string;
  maxDepth?: number;
  defaultSort?: 'best' | 'new' | 'old';
  onHeart?: (commentId: string) => void;
  onReply?: (commentId: string, content: string, parentId?: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onLoadMoreReplies?: (commentId: string) => void;
  currentUserId?: string;
  className?: string;
}

export function CommentTree({
  comments,
  maxDepth = 10,
  defaultSort = 'best',
  onHeart,
  onReply,
  onEdit,
  onDelete,
  onLoadMoreReplies,
  currentUserId: _,
  className = ''
}: CommentTreeProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unusedCurrentUserId = _;
  const [sortBy, setSortBy] = useState(defaultSort);
  const [collapsedComments, setCollapsedComments] = useState<Set<string>>(new Set());

  // Build comment tree structure
  const commentTree = useMemo(() => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create a map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, children: [] });
    });

    // Second pass: build the tree structure
    comments.forEach(comment => {
      if (comment.parentId && commentMap.has(comment.parentId)) {
        const parent = commentMap.get(comment.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(commentMap.get(comment.id)!);
      } else {
        rootComments.push(commentMap.get(comment.id)!);
      }
    });

    return rootComments;
  }, [comments]);

  // Sort comments based on selected criteria
  const sortComments = (comments: Comment[]): Comment[] => {
    const sorted = [...comments].sort((a, b) => {
      switch (sortBy) {
        case 'best':
          // Sort by heart count
          return (b.heartCount || 0) - (a.heartCount || 0);
        
        case 'new':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        
        case 'old':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        
        default:
          return 0;
      }
    });

    // Recursively sort children
    return sorted.map(comment => ({
      ...comment,
      children: comment.children ? sortComments(comment.children) : []
    }));
  };

  const sortedComments = sortComments(commentTree);

  const toggleCollapse = React.useCallback((commentId: string) => {
    const newCollapsed = new Set(collapsedComments);
    if (newCollapsed.has(commentId)) {
      newCollapsed.delete(commentId);
    } else {
      newCollapsed.add(commentId);
    }
    setCollapsedComments(newCollapsed);
  }, [collapsedComments]);

  // const getVisibleChildrenCount = (comment: Comment): number => {
  //   if (!comment.children || comment.children.length === 0) return 0;
  //   
  //   let count = comment.children.length;
  //   comment.children.forEach(child => {
  //     if (!collapsedComments.has(child.id)) {
  //       count += getVisibleChildrenCount(child);
  //     }
  //   });
  //   return count;
  // };

  // Enhanced recursive comment rendering with infinite nesting support
  const renderComment = React.useCallback((comment: Comment, depth: number = 0): React.ReactNode => {
    const isCollapsed = collapsedComments.has(comment.id);
    const hasChildren = comment.children && comment.children.length > 0;
    const childrenCount = hasChildren ? comment.children!.length : 0;
    const shouldShowIndent = depth > 0;
    const shouldCollapseDeep = depth >= maxDepth;
    const indentLevel = Math.min(depth, 8); // Cap visual indentation at 8 levels

    return (
      <div key={comment.id} className="relative">
        {/* Visual thread indicators */}
        {shouldShowIndent && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-px bg-border opacity-30"
            style={{ left: `${indentLevel * 16}px` }}
          />
        )}
        
        <div className={`relative ${shouldShowIndent ? `ml-${Math.min(indentLevel * 4, 16)} pl-4` : ''}`}>
          {/* Comment Content */}
          <CommentItem
            comment={comment}
            depth={depth}
            isCollapsed={isCollapsed}
            onHeart={onHeart}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleCollapse={() => toggleCollapse(comment.id)}
            showCollapseButton={hasChildren}
            className={isCollapsed ? 'opacity-60' : ''}
          />

          {/* Collapsed thread indicator */}
          {isCollapsed && hasChildren && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCollapse(comment.id)}
                className="text-xs text-blue-600 hover:text-blue-700 h-6"
              >
                <ChevronDown className="h-3 w-3 mr-1" />
                Show {childrenCount} {childrenCount === 1 ? 'reply' : 'replies'}
              </Button>
            </div>
          )}

          {/* Child Comments with infinite nesting */}
          {hasChildren && !isCollapsed && (
            <div className="mt-3">
              {shouldCollapseDeep ? (
                <div className="py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLoadMoreReplies?.(comment.id)}
                    className="text-xs h-7 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Continue this thread ({childrenCount} more)
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {comment.children!.map((child, index) => (
                    <React.Fragment key={child.id}>
                      {renderComment(child, depth + 1)}
                      {/* Add separator between siblings for clarity at deep levels */}
                      {depth > 3 && index < comment.children!.length - 1 && (
                        <div className="h-px bg-border opacity-20 mx-4" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }, [collapsedComments, maxDepth, onHeart, onReply, onEdit, onDelete, onLoadMoreReplies, toggleCollapse]);

  if (comments.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No comments yet</p>
        <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sort className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="best">Most Hearts</SelectItem>
              <SelectItem value="new">Newest</SelectItem>
              <SelectItem value="old">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </div>
      </div>

      {/* Comment Thread */}
      <div className="space-y-4">
        {sortedComments.map(comment => renderComment(comment, 0))}
      </div>

      {/* Thread Navigation Help */}
      <div className="text-xs text-muted-foreground text-center py-4 border-t space-y-1">
        <p>Click the arrows to collapse comment threads</p>
        <p>Deep threads are automatically collapsed for better performance</p>
        {maxDepth < 50 && (
          <p className="text-blue-600">
            Showing up to {maxDepth} levels deep • 
            <button 
              onClick={() => {/* TODO: Implement depth expansion */}}
              className="hover:underline ml-1"
            >
              Show all levels
            </button>
          </p>
        )}
      </div>
    </div>
  );
}