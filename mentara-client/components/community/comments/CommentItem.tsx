'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowUp, 
  ArrowDown, 
  MessageCircle, 
  Reply,
  Edit3,
  Trash2,
  MoreHorizontal,
  Flag,
  Award,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Comment } from './CommentTree';

interface CommentItemProps {
  comment: Comment;
  depth: number;
  isCollapsed?: boolean;
  showCollapseButton?: boolean;
  onVote?: (commentId: string, voteType: 'up' | 'down' | null) => void;
  onReply?: (commentId: string, content: string, parentId?: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onToggleCollapse?: () => void;
  className?: string;
}

export function CommentItem({
  comment,
  depth,
  isCollapsed = false,
  showCollapseButton = false,
  onVote,
  onReply,
  onEdit,
  onDelete,
  onToggleCollapse,
  className = ''
}: CommentItemProps) {
  const api = useApi();
  const queryClient = useQueryClient();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);

  const voteScore = comment.votes.upvotes - comment.votes.downvotes;

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: ({ commentId, voteType }: { commentId: string; voteType: 'up' | 'down' | null }) =>
      api.comments.vote(commentId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
    },
    onError: () => {
      toast.error('Failed to register vote');
    },
  });

  const handleVote = (voteType: 'up' | 'down') => {
    const newVote = comment.votes.userVote === voteType ? null : voteType;
    if (onVote) {
      onVote(comment.id, newVote);
    } else {
      voteMutation.mutate({ commentId: comment.id, voteType: newVote });
    }
  };

  const handleReply = () => {
    if (replyContent.trim() && onReply) {
      onReply(comment.id, replyContent.trim(), comment.id);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleEdit = () => {
    if (editContent.trim() && editContent !== comment.content && onEdit) {
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleReport = () => {
    // TODO: Implement report functionality
    toast.info('Report functionality coming soon');
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'therapist': return 'text-blue-600 bg-blue-50';
      case 'moderator': return 'text-green-600 bg-green-50';
      case 'admin': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'therapist': return 'Therapist';
      case 'moderator': return 'Moderator';
      case 'admin': return 'Admin';
      default: return null;
    }
  };

  const getIndentLines = () => {
    const lines = [];
    for (let i = 0; i < depth; i++) {
      lines.push(
        <div 
          key={i} 
          className={`absolute left-${i * 4 + 2} top-0 bottom-0 w-px bg-border`} 
        />
      );
    }
    return lines;
  };

  if (isCollapsed) {
    return (
      <div className={`py-1 ${className}`}>
        <div className="text-xs text-muted-foreground italic">
          [Comment collapsed]
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Thread lines for depth visualization */}
      {depth > 0 && getIndentLines()}
      
      <div className={`bg-card rounded-lg border p-3 ${depth > 0 ? `ml-${Math.min(depth * 4, 16)}` : ''}`}>
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {/* Collapse button for threaded comments */}
            {showCollapseButton && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={onToggleCollapse}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            )}

            {/* Author Avatar */}
            <Avatar className="h-6 w-6">
              <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
              <AvatarFallback className="text-xs">{comment.author.name.charAt(0)}</AvatarFallback>
            </Avatar>

            {/* Author Info */}
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <span className="font-medium text-sm truncate">{comment.author.name}</span>
              
              {getRoleLabel(comment.author.role) && (
                <Badge variant="secondary" className={`text-xs ${getRoleColor(comment.author.role)}`}>
                  {getRoleLabel(comment.author.role)}
                </Badge>
              )}
              
              {comment.author.isOP && (
                <Badge variant="outline" className="text-xs">OP</Badge>
              )}

              {/* Vote Score */}
              <div className="flex items-center space-x-1">
                <span className={`text-xs font-medium ${
                  voteScore > 0 ? 'text-orange-500' : 
                  voteScore < 0 ? 'text-blue-500' : 
                  'text-muted-foreground'
                }`}>
                  {voteScore > 0 ? '+' : ''}{voteScore}
                </span>
                <span className="text-xs text-muted-foreground">
                  {comment.votes.upvotes + comment.votes.downvotes > 0 && '•'}
                </span>
              </div>

              {/* Timestamp */}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              
              {comment.updatedAt !== comment.createdAt && (
                <span className="text-xs text-muted-foreground italic">edited</span>
              )}
            </div>
          </div>

          {/* Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {comment.isOwner && (
                <>
                  <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this comment? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete?.(comment.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Award className="h-4 w-4 mr-2" />
                Give Award
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Comment Content */}
        <div className="mb-3">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                rows={3}
                className="resize-none text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={!editContent.trim() || editContent === comment.content}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          )}
        </div>

        {/* Comment Actions */}
        <div className="flex items-center space-x-1">
          {/* Vote Buttons */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 ${comment.votes.userVote === 'up' ? 'text-orange-500 bg-orange-50' : 'text-muted-foreground'}`}
            onClick={() => handleVote('up')}
            disabled={voteMutation.isPending}
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 ${comment.votes.userVote === 'down' ? 'text-blue-500 bg-blue-50' : 'text-muted-foreground'}`}
            onClick={() => handleVote('down')}
            disabled={voteMutation.isPending}
          >
            <ArrowDown className="h-3 w-3" />
          </Button>

          {/* Reply Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsReplying(!isReplying)}
          >
            <Reply className="h-3 w-3 mr-1" />
            <span className="text-xs">Reply</span>
          </Button>

          {/* Replies Count */}
          {comment.repliesCount && comment.repliesCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              <span className="text-xs">{comment.repliesCount}</span>
            </Button>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-3 pt-3 border-t space-y-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              className="resize-none text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleReply}
                disabled={!replyContent.trim()}
              >
                Reply
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}