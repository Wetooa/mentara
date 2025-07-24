"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  MessageCircle, 
  Share2,
  ArrowLeft,
  Clock,
  User,
  Hash,
  ExternalLink,
  FileText,
  Edit,
  Trash2,
  Flag,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import CommentSection from "@/components/community/CommentSection";

import type { Post } from "@/types/api/posts";

interface PostDetailProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  className?: string;
}

export function PostDetail({ 
  post, 
  onEdit, 
  onDelete, 
  className = "" 
}: PostDetailProps) {
  const api = useApi();
  const queryClient = useQueryClient();
  const { user, userRole } = useAuth();
  const router = useRouter();

  const isAuthor = user?.id === post.author.id;

  // Heart mutation
  const heartMutation = useMutation({
    mutationFn: (postId: string) => 
      post.isHearted ? api.communities.unheartPost(postId) : api.communities.heartPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: () => {
      toast.error('Failed to update heart');
    },
  });

  const handleBack = () => {
    router.push(`/${userRole}/community`);
  };

  const handleHeart = () => {
    heartMutation.mutate(post.id);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${userRole}/community/posts/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 100) + '...',
          url: url,
        });
      } catch {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      } catch {
        toast.error('Failed to copy link');
      }
    }
  };

  const handleReport = () => {
    // TODO: Implement report functionality
    toast.info('Report functionality coming soon');
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'therapist': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'moderator': return 'text-green-600 bg-green-50 border-green-200';
      case 'admin': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'therapist': return 'Therapist';
      case 'moderator': return 'Moderator';
      case 'admin': return 'Admin';
      default: return 'Member';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-community-warm/10 via-background to-community-soothing/10 ${className}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 text-community-soothing-foreground hover:text-community-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Community
          </Button>
        </div>

        {/* Post Content */}
        <Card className="mb-6 bg-white/95 backdrop-blur-sm border-community-calm/20 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-4">
                {/* Post Title */}
                <h1 className="text-2xl lg:text-3xl font-bold text-community-calm-foreground leading-tight">
                  {post.title}
                </h1>

                {/* Author and Metadata */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10 ring-2 ring-community-accent/20 ring-offset-2 ring-offset-white">
                      <AvatarImage src={post.author.avatarUrl} className="object-cover" />
                      <AvatarFallback className="bg-community-accent/20 text-community-accent-foreground font-semibold">
                        {getUserInitials(post.author.firstName, post.author.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-community-calm-foreground">
                        {post.author.firstName} {post.author.lastName}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-community-soothing-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                        {post.updatedAt !== post.createdAt && (
                          <>
                            <span>•</span>
                            <span>edited</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-semibold ${getRoleColor(post.author.role || 'client')}`}
                  >
                    <User className="h-3 w-3 mr-1" />
                    {getRoleLabel(post.author.role || 'client')}
                  </Badge>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-community-soothing/20 text-community-soothing-foreground border-community-soothing/30">
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-community-soothing-foreground hover:text-community-accent"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Post
                  </DropdownMenuItem>
                  
                  {isAuthor && (
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
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Post Content */}
            <div className="prose prose-lg max-w-none text-community-calm-foreground">
              <div 
                className="whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Attachments */}
            {post.attachmentUrls && post.attachmentUrls.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-community-calm-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Attachments
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {post.attachmentUrls.map((url, index) => {
                    const fileName = post.attachmentNames?.[index] || `Attachment ${index + 1}`;
                    const fileSize = post.attachmentSizes?.[index];
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

                    if (isImage) {
                      return (
                        <div
                          key={index}
                          className="relative group cursor-pointer overflow-hidden rounded-lg border border-community-calm/20 bg-community-warm/10"
                          onClick={() => window.open(url, '_blank')}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={fileName}
                            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <p className="text-white text-sm truncate">{fileName}</p>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div 
                          key={index} 
                          className="flex items-center space-x-3 p-4 border border-community-calm/20 rounded-lg bg-community-warm/10 hover:bg-community-warm/20 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            <FileText className="h-8 w-8 text-community-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-community-calm-foreground truncate">{fileName}</p>
                            {fileSize && (
                              <p className="text-xs text-community-soothing-foreground">
                                {formatFileSize(fileSize)}
                              </p>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span className="sr-only">Download {fileName}</span>
                            </a>
                          </Button>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}

            <Separator className="bg-community-calm/20" />

            {/* Actions Bar */}
            <div className="flex items-center gap-4">
              <Button 
                variant={post.isHearted ? "default" : "ghost"}
                size="sm" 
                className={`flex items-center gap-2 ${
                  post.isHearted 
                    ? "bg-community-heart hover:bg-community-heart/90 text-white" 
                    : "text-community-soothing-foreground hover:text-community-heart hover:bg-community-heart/10"
                }`}
                onClick={handleHeart}
                disabled={heartMutation.isPending}
              >
                <Heart className={`h-4 w-4 ${post.isHearted ? "fill-current" : ""}`} />
                <span className="font-medium">{post.heartCount}</span>
                <span className="hidden sm:inline">
                  {post.isHearted ? 'Hearted' : 'Heart'}
                </span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 text-community-soothing-foreground hover:text-community-accent hover:bg-community-accent/10"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="font-medium">{post.commentCount}</span>
                <span className="hidden sm:inline">Comments</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 text-community-soothing-foreground hover:text-community-accent hover:bg-community-accent/10"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="bg-white/95 backdrop-blur-sm border-community-calm/20 shadow-lg">
          <CardHeader>
            <h2 className="text-xl font-semibold text-community-calm-foreground flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-community-accent" />
              Comments ({post.commentCount})
            </h2>
          </CardHeader>
          <CardContent>
            <CommentSection postId={post.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}