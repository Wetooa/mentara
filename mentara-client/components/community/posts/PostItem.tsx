'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowUp, 
  ArrowDown, 
  MessageCircle, 
  Share2,
  Bookmark,
  MoreHorizontal,
  Pin,
  Lock,
  Flag,
  Edit,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  FileText,
  Eye
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

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    role?: 'client' | 'therapist' | 'moderator' | 'admin';
    isOP?: boolean;
  };
  community: {
    id: string;
    name: string;
  };
  votes: {
    upvotes: number;
    downvotes: number;
    userVote?: 'up' | 'down' | null;
  };
  comments: {
    count: number;
    preview?: Array<{
      id: string;
      content: string;
      author: {
        id: string;
        name: string;
      };
      createdAt: string;
    }>;
  };
  tags?: string[];
  isPinned: boolean;
  isLocked: boolean;
  isBookmarked?: boolean;
  isOwner?: boolean;
  createdAt: string;
  updatedAt: string;
  attachments?: Array<{
    id: string;
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: number;
  }>;
}

interface PostItemProps {
  post: Post;
  variant?: 'default' | 'compact' | 'detailed';
  showCommunity?: boolean;
  showPreview?: boolean;
  onClick?: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  className?: string;
}

export function PostItem({ 
  post, 
  variant = 'default',
  showCommunity = false,
  showPreview = true,
  onClick,
  onEdit,
  onDelete,
  className = ''
}: PostItemProps) {
  const api = useApi();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  const voteScore = post.votes.upvotes - post.votes.downvotes;

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: ({ postId, voteType }: { postId: string; voteType: 'up' | 'down' | null }) =>
      api.posts.vote(postId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
    onError: () => {
      toast.error('Failed to register vote');
    },
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: (postId: string) =>
      post.isBookmarked ? api.posts.unbookmark(postId) : api.posts.bookmark(postId),
    onSuccess: () => {
      toast.success(post.isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
    onError: () => {
      toast.error('Failed to update bookmark');
    },
  });

  const handleVote = (voteType: 'up' | 'down') => {
    const newVote = post.votes.userVote === voteType ? null : voteType;
    voteMutation.mutate({ postId: post.id, voteType: newVote });
  };

  const handleBookmark = () => {
    bookmarkMutation.mutate(post.id);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/communities/${post.community.id}/posts/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.content.substring(0, 100) + '...',
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy link');
      }
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

  const truncateContent = (content: string, maxLength: number = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (variant === 'compact') {
    return (
      <Card className={`hover:shadow-md transition-shadow cursor-pointer ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            {/* Vote Score */}
            <div className="text-center">
              <p className="text-sm font-medium">{voteScore}</p>
              <ArrowUp className="h-3 w-3 mx-auto text-muted-foreground" />
            </div>
            
            {/* Post Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {post.isPinned && <Pin className="h-3 w-3 text-green-500" />}
                {post.isLocked && <Lock className="h-3 w-3 text-orange-500" />}
                <h4 className="font-medium truncate">{post.title}</h4>
              </div>
              <div className="flex items-center text-xs text-muted-foreground space-x-2">
                <span>{post.author.name}</span>
                <span>•</span>
                <span>{post.comments.count} comments</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-0">
        <div className="flex">
          {/* Vote Section */}
          <div className="flex flex-col items-center p-3 space-y-1 bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${post.votes.userVote === 'up' ? 'text-orange-500 bg-orange-50' : ''}`}
              onClick={() => handleVote('up')}
              disabled={voteMutation.isPending}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            
            <span className={`text-sm font-medium ${
              voteScore > 0 ? 'text-orange-500' : 
              voteScore < 0 ? 'text-blue-500' : 
              'text-muted-foreground'
            }`}>
              {voteScore > 0 ? '+' : ''}{voteScore}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${post.votes.userVote === 'down' ? 'text-blue-500 bg-blue-50' : ''}`}
              onClick={() => handleVote('down')}
              disabled={voteMutation.isPending}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Post Content */}
          <div className="flex-1 p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                {/* Post Title */}
                <div className="flex items-center gap-2 mb-2">
                  {post.isPinned && (
                    <Badge variant="secondary" className="text-xs">
                      <Pin className="h-3 w-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                  {post.isLocked && (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                  <h3 
                    className="font-semibold text-lg hover:text-blue-600 cursor-pointer line-clamp-2"
                    onClick={() => onClick?.(post)}
                  >
                    {post.title}
                  </h3>
                </div>

                {/* Author and Community Info */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                    <AvatarFallback className="text-xs">{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{post.author.name}</span>
                  
                  {getRoleLabel(post.author.role) && (
                    <Badge variant="secondary" className={`text-xs ${getRoleColor(post.author.role)}`}>
                      {getRoleLabel(post.author.role)}
                    </Badge>
                  )}
                  
                  {post.author.isOP && (
                    <Badge variant="outline" className="text-xs">OP</Badge>
                  )}
                  
                  {showCommunity && (
                    <>
                      <span>in</span>
                      <span className="font-medium hover:text-blue-600 cursor-pointer">
                        r/{post.community.name}
                      </span>
                    </>
                  )}
                  
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                  
                  {post.updatedAt !== post.createdAt && (
                    <>
                      <span>•</span>
                      <span>edited</span>
                    </>
                  )}
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onClick?.(post)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBookmark}>
                    <Bookmark className="h-4 w-4 mr-2" />
                    {post.isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  
                  {post.isOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit?.(post)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Post
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Post
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this post? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete?.(post.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleReport}>
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              {variant === 'detailed' || isExpanded ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                <div>
                  <p className="text-muted-foreground line-clamp-3">
                    {post.excerpt || truncateContent(post.content)}
                  </p>
                  {post.content.length > 300 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-1"
                      onClick={() => setIsExpanded(true)}
                    >
                      Read more
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Attachments */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {post.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center space-x-2 p-2 border rounded-md">
                      {attachment.type === 'image' ? (
                        <ImageIcon className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      <span className="text-sm">{attachment.name}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center space-x-4 text-sm">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onClick?.(post)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {post.comments.count} comments
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-muted-foreground hover:text-foreground ${
                  post.isBookmarked ? 'text-blue-600' : ''
                }`}
                onClick={handleBookmark}
                disabled={bookmarkMutation.isPending}
              >
                <Bookmark className="h-4 w-4 mr-1" />
                {post.isBookmarked ? 'Saved' : 'Save'}
              </Button>
            </div>

            {/* Comment Preview */}
            {showPreview && post.comments.preview && post.comments.preview.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Recent comments:</p>
                <div className="space-y-2">
                  {post.comments.preview.slice(0, 2).map((comment) => (
                    <div key={comment.id} className="text-sm">
                      <span className="font-medium">{comment.author.name}</span>
                      <span className="text-muted-foreground ml-2">
                        {truncateContent(comment.content, 100)}
                      </span>
                    </div>
                  ))}
                </div>
                {post.comments.count > 2 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto mt-2"
                    onClick={() => onClick?.(post)}
                  >
                    View all {post.comments.count} comments
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}