"use client";

import React, { useState } from "react";
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
import { ReportModal } from "@/components/community/ReportModal";
import { useReportPost } from "@/hooks/community/useCommunityReporting";

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

  const isAuthor = user?.id === post?.author?.id;
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const reportPostMutation = useReportPost();

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
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = (reason: string, content?: string) => {
    reportPostMutation.mutate({
      postId: post.id,
      reason,
      content,
    });
    setIsReportModalOpen(false);
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'therapist': return 'text-primary bg-primary/10 border-primary/20';
      case 'moderator': return 'text-blue-600 bg-blue-50 border-blue-200';
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
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 ${className}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
        {/* Breadcrumbs */}
        <PageBreadcrumbs
          dynamicData={
            post
              ? {
                  [post.id]: post.title || "Post",
                }
              : {}
          }
        />

        {/* Back Navigation */}
        <div>
          <BackButton
            label="Back to Community"
            href="/client/community"
            variant="ghost"
            className="text-gray-600 hover:text-primary"
          />
        </div>

        {/* Post Content */}
        <Card className="mb-6 shadow-lg border-border/50 overflow-hidden">
          {/* Decorative top bar */}
          <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary"></div>
          
          <CardHeader className="p-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-md">
                    <AvatarImage src={post?.author?.avatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                      {getUserInitials(post?.author?.firstName || '', post?.author?.lastName || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">
                        {post?.author?.firstName} {post?.author?.lastName}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-semibold ${getRoleColor(post?.author?.role || 'client')}`}
                      >
                        {getRoleLabel(post?.author?.role || 'client')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                      {post.updatedAt !== post.createdAt && (
                        <>
                          <span>•</span>
                          <span className="italic">edited</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Post Title */}
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {post.title}
                </h1>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
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
                    className="text-gray-600 hover:text-primary hover:bg-primary/10"
                  >
                    <MoreHorizontal className="h-5 w-5" />
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

          <CardContent className="px-6 pb-6 space-y-6">
            {/* Post Content */}
            <div className="prose prose-base max-w-none">
              <div 
                className="whitespace-pre-wrap leading-relaxed text-gray-700 text-sm"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Attachments */}
            {post.attachmentUrls && post.attachmentUrls.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Attachments
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {post.attachmentUrls.map((url, index) => {
                    const fileName = post.attachmentNames?.[index] || `Attachment ${index + 1}`;
                    const fileSize = post.attachmentSizes?.[index];
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

                    if (isImage) {
                      return (
                        <div
                          key={index}
                          className="relative group cursor-pointer overflow-hidden rounded-xl border border-border shadow-sm hover:shadow-md transition-all"
                          onClick={() => window.open(url, '_blank')}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={fileName}
                            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                            <p className="text-white text-xs font-medium truncate">{fileName}</p>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div 
                          key={index} 
                          className="flex items-center gap-3 p-3 border border-border rounded-xl bg-gray-50 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer"
                          onClick={() => window.open(url, '_blank')}
                        >
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                            {fileSize && (
                              <p className="text-xs text-gray-500">
                                {formatFileSize(fileSize)}
                              </p>
                            )}
                          </div>
                          <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}

            <Separator />

            {/* Actions Bar */}
            <div className="flex items-center gap-3">
              <Button 
                variant={post.isHearted ? "default" : "outline"}
                size="sm" 
                className={`flex items-center gap-2 ${
                  post.isHearted 
                    ? "bg-pink-500 hover:bg-pink-600 text-white border-pink-500" 
                    : "text-gray-600 hover:text-pink-600 hover:bg-pink-50 hover:border-pink-200"
                }`}
                onClick={handleHeart}
                disabled={heartMutation.isPending}
              >
                <Heart className={`h-4 w-4 ${post.isHearted ? "fill-current" : ""}`} />
                <span className="font-semibold">{post.heartCount}</span>
                <span className="hidden sm:inline text-sm">
                  {post.isHearted ? 'Hearted' : 'Heart'}
                </span>
              </Button>
              
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <MessageCircle className="h-4 w-4" />
                <span className="font-semibold">{post.commentCount}</span>
                <span className="hidden sm:inline text-sm">Comments</span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 text-gray-600 hover:text-primary hover:bg-primary/10 hover:border-primary/30"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Share</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="shadow-lg border-border/50">
          <CardHeader className="bg-primary/5 border-b border-border/50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Comments ({post.commentCount})
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            <CommentSection postId={post.id} />
          </CardContent>
        </Card>

        {/* Report Modal */}
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={handleReportSubmit}
          targetType="post"
          targetId={post.id}
          isLoading={reportPostMutation.isPending}
        />
      </div>
    </div>
  );
}