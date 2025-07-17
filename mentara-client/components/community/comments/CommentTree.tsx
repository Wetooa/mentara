'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronRight,
  MessageCircle,
  Sort,
  ArrowDown,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CommentItem } from './CommentItem';

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    role?: 'client' | 'therapist' | 'moderator' | 'admin';
    isOP?: boolean;
  };
  votes: {
    upvotes: number;
    downvotes: number;
    userVote?: 'up' | 'down' | null;
  };
  parentId?: string;
  depth: number;
  isCollapsed?: boolean;
  isOwner?: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Comment[];
  isDeleted?: boolean;
  repliesCount?: number;
  hasMoreReplies?: boolean;
}

interface CommentTreeProps {
  comments: Comment[];
  postId?: string;
  maxDepth?: number;
  defaultSort?: 'best' | 'new' | 'old' | 'controversial';
  onVote?: (commentId: string, voteType: 'up' | 'down' | null) => void;
  onReply?: (commentId: string, content: string, parentId?: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onLoadMoreReplies?: (commentId: string) => void;
  className?: string;
}

export function CommentTree({
  comments,
  maxDepth = 10,
  defaultSort = 'best',
  onVote,
  onReply,
  onEdit,
  onDelete,
  onLoadMoreReplies,
  className = ''
}: CommentTreeProps) {
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
          // Sort by vote score (upvotes - downvotes)
          const scoreA = a.votes.upvotes - a.votes.downvotes;
          const scoreB = b.votes.upvotes - b.votes.downvotes;
          return scoreB - scoreA;
        
        case 'new':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        
        case 'old':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        
        case 'controversial':
          // Sort by controversial score (comments with similar up/down votes)
          const controversialA = Math.min(a.votes.upvotes, a.votes.downvotes);
          const controversialB = Math.min(b.votes.upvotes, b.votes.downvotes);
          return controversialB - controversialA;
        
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

  const toggleCollapse = (commentId: string) => {
    const newCollapsed = new Set(collapsedComments);
    if (newCollapsed.has(commentId)) {
      newCollapsed.delete(commentId);
    } else {
      newCollapsed.add(commentId);
    }
    setCollapsedComments(newCollapsed);
  };

  const getVisibleChildrenCount = (comment: Comment): number => {
    if (!comment.children || comment.children.length === 0) return 0;
    
    let count = comment.children.length;
    comment.children.forEach(child => {
      if (!collapsedComments.has(child.id)) {
        count += getVisibleChildrenCount(child);
      }
    });
    return count;
  };

  const renderComment = (comment: Comment, depth: number = 0): React.ReactNode => {
    const isCollapsed = collapsedComments.has(comment.id);
    const hasChildren = comment.children && comment.children.length > 0;
    const childrenCount = getVisibleChildrenCount(comment);
    const shouldShowIndent = depth > 0;
    const shouldCollapseDeep = depth >= maxDepth;

    if (comment.isDeleted) {
      return (
        <div 
          key={comment.id} 
          className={`${shouldShowIndent ? 'ml-4 border-l-2 border-muted pl-4' : ''}`}
        >
          <div className="py-2 text-sm text-muted-foreground italic">
            [Comment deleted]
          </div>
          {hasChildren && !isCollapsed && (
            <div className="space-y-2">
              {comment.children!.map(child => renderComment(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={comment.id} className={`${shouldShowIndent ? 'ml-4 border-l-2 border-muted pl-4' : ''}`}>
        <div className="space-y-2">
          {/* Collapse/Expand Button for threads */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => toggleCollapse(comment.id)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Comment Content */}
          <CommentItem
            comment={comment}
            depth={depth}
            isCollapsed={isCollapsed}
            onVote={onVote}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleCollapse={() => toggleCollapse(comment.id)}
            showCollapseButton={hasChildren}
            className={isCollapsed ? 'opacity-60' : ''}
          />

          {/* Collapsed thread indicator */}
          {isCollapsed && hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleCollapse(comment.id)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowDown className="h-3 w-3 mr-1" />
              Show {childrenCount} more {childrenCount === 1 ? 'reply' : 'replies'}
            </Button>
          )}

          {/* Child Comments */}
          {hasChildren && !isCollapsed && (
            <div className="space-y-2">
              {shouldCollapseDeep ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLoadMoreReplies?.(comment.id)}
                  className="text-xs"
                >
                  Continue this thread →
                </Button>
              ) : (
                comment.children!.map(child => renderComment(child, depth + 1))
              )}
            </div>
          )}

          {/* Load More Replies Button */}
          {comment.hasMoreReplies && !isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLoadMoreReplies?.(comment.id)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Load more replies...
            </Button>
          )}
        </div>
      </div>
    );
  };

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
              <SelectItem value="best">Best</SelectItem>
              <SelectItem value="new">Newest</SelectItem>
              <SelectItem value="old">Oldest</SelectItem>
              <SelectItem value="controversial">Controversial</SelectItem>
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
      <div className="text-xs text-muted-foreground text-center py-4 border-t">
        <p>Click the arrows to collapse comment threads</p>
      </div>
    </div>
  );
}