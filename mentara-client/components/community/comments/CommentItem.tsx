'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, 
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
import type { Comment } from '@/types/api/comments';

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  isCollapsed?: boolean;
  showCollapseButton?: boolean;
  onHeart?: (commentId: string) => void;
  onReply?: (commentId: string, content: string, parentId?: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onToggleCollapse?: () => void;
  className?: string;
}

export function CommentItem({
  comment,
  depth = 0,
  isCollapsed = false,
  showCollapseButton = false,
  onHeart,
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
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  // Heart mutation
  const heartMutation = useMutation({
    mutationFn: (commentId: string) => api.comments.heart(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
    onError: () => {
      toast.error('Failed to heart comment');
    },
  });

  const handleHeart = () => {
    if (onHeart) {
      onHeart(comment.id);
    } else {
      heartMutation.mutate(comment.id);
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

  // Report mutation
  const reportMutation = useMutation({
    mutationFn: (data: { reason: string; content?: string }) => 
      api.comments.report(comment.id, data),
    onSuccess: () => {
      toast.success('Comment reported successfully');
    },
    onError: () => {
      toast.error('Failed to report comment');
    },
  });

  const handleReport = (reason: string, content?: string) => {
    reportMutation.mutate({ reason, content });
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
              <AvatarImage src={comment.user.avatarUrl} alt={`${comment.user.firstName} ${comment.user.lastName}`} />
              <AvatarFallback className="text-xs">
                {comment.user.firstName?.[0]}{comment.user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            {/* Author Info */}
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <span className="font-medium text-sm truncate">
                {comment.user.firstName} {comment.user.lastName}
              </span>
              
              {getRoleLabel(comment.user.role) && (
                <Badge variant="secondary" className={`text-xs ${getRoleColor(comment.user.role)}`}>
                  {getRoleLabel(comment.user.role)}
                </Badge>
              )}

              {/* Heart Count */}
              <div className="flex items-center space-x-1">
                <span className={`text-xs font-medium ${
                  comment.heartCount > 0 ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {comment.heartCount} {comment.heartCount === 1 ? 'heart' : 'hearts'}
                </span>
                {comment.heartCount > 0 && (
                  <span className="text-xs text-muted-foreground">•</span>
                )}
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
              {/* TODO: Add isOwner logic based on current user */}
              {false && (
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Report Comment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Help us maintain a safe community by reporting inappropriate content.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Reason for reporting:</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        onChange={(e) => setReportReason(e.target.value)}
                        value={reportReason}
                      >
                        <option value="">Select a reason</option>
                        <option value="harassment">Harassment or bullying</option>
                        <option value="spam">Spam or unwanted content</option>
                        <option value="inappropriate">Inappropriate content</option>
                        <option value="misinformation">Misinformation</option>
                        <option value="hate_speech">Hate speech</option>
                        <option value="self_harm">Self-harm or suicidal content</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Additional details (optional):</label>
                      <Textarea
                        placeholder="Provide more context about why you're reporting this comment..."
                        value={reportDetails}
                        onChange={(e) => setReportDetails(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => {
                      setReportReason('');
                      setReportDetails('');
                    }}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => {
                        if (reportReason) {
                          handleReport(reportReason, reportDetails || undefined);
                          setReportReason('');
                          setReportDetails('');
                        }
                      }}
                      disabled={!reportReason || reportMutation.isPending}
                    >
                      {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
          {/* Heart Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 ${comment.isHearted ? 'text-red-500 bg-red-50' : 'text-muted-foreground'}`}
            onClick={handleHeart}
            disabled={heartMutation.isPending}
          >
            <Heart className={`h-3 w-3 ${comment.isHearted ? 'fill-current' : ''}`} />
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

          {/* Children Count */}
          {comment.childrenCount && comment.childrenCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              <span className="text-xs">{comment.childrenCount}</span>
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