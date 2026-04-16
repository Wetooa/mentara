"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  MessageCircle,
  Edit3,
  Trash2,
  Calendar as CalendarIcon,
  MoreHorizontal,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/api/communities";
import CommentSection from "@/components/community/CommentSection";
import { motion } from "framer-motion";

interface PostsListProps {
  posts: Post[];
  onHeartPost: (post: Post) => void;
  onViewPost: (postId: string) => void;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
  isPostHearted: (post: Post) => boolean;
  isPostOwner?: (post: Post) => boolean;
  getUserInitials: (firstName: string, lastName: string) => string;
  heartPostPending?: boolean;
  editPostPending?: boolean;
  deletePostPending?: boolean;
  canEditDelete?: boolean;
  advancedTheming?: boolean;
  userRole?: string;
}

export function PostsList({
  posts,
  onHeartPost,
  onViewPost,
  onEditPost,
  onDeletePost,
  isPostHearted,
  isPostOwner,
  getUserInitials,
  heartPostPending = false,
  editPostPending = false,
  deletePostPending = false,
  canEditDelete = false,
  advancedTheming = false,
  userRole = 'client',
}: PostsListProps) {
  return (
    <div className="space-y-4">
      {posts.map((post, index) => {
        const heartCount = (post as unknown as { _count?: { hearts?: number } })?._count?.hearts || 0;
        const commentCount = (post as unknown as { _count?: { comments?: number } })?._count?.comments || 0;
        const hasUserHearted = isPostHearted(post);

        return (
          <motion.div
            key={post.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className={cn(
                "group hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer border-border/50",
                "hover:border-primary/30"
              )}
              onClick={() => onViewPost(post.id)}
            >
              <CardContent className="p-5">
                {/* Header - Author Info */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar className="h-11 w-11 border-2 border-primary/20 shadow-sm flex-shrink-0">
                      <AvatarImage src={post.user.avatarUrl} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
                        {getUserInitials(post.user.firstName, post.user.lastName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate text-sm">
                          {post.user.firstName} {post.user.lastName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          Member
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {/* Edit/Delete Menu for post owner */}
                  {canEditDelete && isPostOwner && isPostOwner(post) && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPost?.(post);
                        }}
                        className="h-8 w-8 p-0 hover:bg-primary/10 text-gray-500 hover:text-primary"
                        disabled={editPostPending}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePost?.(post.id);
                        }}
                        className="h-8 w-8 p-0 hover:bg-red-50 text-gray-500 hover:text-red-600"
                        disabled={deletePostPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Post Title */}
                <h2 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {post.content}
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Engagement Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Heart Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onHeartPost(post);
                      }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                        hasUserHearted
                          ? "bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
                      )}
                      disabled={heartPostPending}
                    >
                      <Heart className={cn(
                        "h-4 w-4 transition-all",
                        hasUserHearted && "fill-current"
                      )} />
                      <span className="text-sm font-semibold">{heartCount}</span>
                    </motion.button>

                    {/* Comment Count */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm font-semibold">{commentCount}</span>
                    </div>
                  </div>

                  {/* Read More Indicator */}
                  <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                    <span className="text-sm font-medium">Read more</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}


