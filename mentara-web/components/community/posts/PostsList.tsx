"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Activity,
  Edit3,
  Trash2,
  Eye,
  Stethoscope,
  Calendar as CalendarIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/api/communities";
import CommentSection from "@/components/community/CommentSection";

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
    <div className="space-y-8">
      {posts.map((post, index) => {
        const heartCount = (post as unknown as { _count?: { hearts?: number } })?._count?.hearts || 0;
        const commentCount = (post as unknown as { _count?: { comments?: number } })?._count?.comments || 0;
        const hasUserHearted = isPostHearted(post);

        return (
          <Card key={post.id || index} className={cn(
            "group shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative",
            advancedTheming 
              ? "bg-white/95 backdrop-blur-sm border-community-calm/20 hover:border-community-accent/30"
              : "bg-white border-neutral-200 hover:border-blue-200"
          )}>
            {/* Enhanced gradient background for advanced theming */}
            {advancedTheming && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-community-warm/20 via-community-soothing/10 to-community-calm/20 opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-community-accent/60 via-community-heart/40 to-community-soothing/60 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
              </>
            )}

            <CardHeader className="relative pb-3">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className={cn(
                    "h-14 w-14 shadow-lg",
                    advancedTheming 
                      ? "ring-2 ring-community-accent/30 ring-offset-3 ring-offset-white"
                      : "ring-2 ring-blue-200 ring-offset-2 ring-offset-white"
                  )}>
                    <AvatarImage src={post.user.avatarUrl} className="object-cover" />
                    <AvatarFallback className={cn(
                      "font-bold text-base",
                      advancedTheming 
                        ? "bg-gradient-to-br from-primary/20 to-secondary/20 text-primary"
                        : "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
                    )}>
                      {getUserInitials(post.user.firstName, post.user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  {advancedTheming && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-community-heart to-community-heart/80 rounded-full border-3 border-white animate-heart-beat shadow-md" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      "font-semibold truncate",
                      advancedTheming ? "text-foreground" : "text-neutral-800"
                    )}>
                      {post.user.firstName} {post.user.lastName}
                    </h3>
                    <div className={cn(
                      "px-3 py-1 rounded-full border shadow-sm",
                      advancedTheming 
                        ? "bg-primary/10 border-primary/30"
                        : "bg-neutral-50 border-neutral-200"
                    )}>
                      <span className={cn(
                        "text-xs font-semibold flex items-center gap-1",
                        advancedTheming ? "text-primary" : "text-neutral-700"
                      )}>
                        {userRole === 'therapist' && (post.user as any)?.role === 'therapist' && (
                          <Stethoscope className="h-3 w-3 text-primary" />
                        )}
                        Member
                      </span>
                    </div>
                  </div>
                  <p className={cn(
                    "text-sm flex items-center gap-1",
                    advancedTheming ? "text-muted-foreground" : "text-neutral-500"
                  )}>
                    <CalendarIcon className="h-3 w-3" />
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                </div>

                {/* Edit/Delete buttons for post owner */}
                {canEditDelete && isPostOwner && isPostOwner(post) && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditPost?.(post)}
                      className="h-8 w-8 p-0 hover:bg-primary/10 text-muted-foreground hover:text-primary"
                      disabled={editPostPending}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeletePost?.(post.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      disabled={deletePostPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <CardTitle className={cn(
                "mt-6 text-2xl font-bold leading-relaxed transition-colors duration-300",
                advancedTheming 
                  ? "text-foreground group-hover:text-primary"
                  : "text-neutral-800 group-hover:text-blue-700"
              )}>
                {post.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="relative pt-0">
              <div className="prose prose-base max-w-none">
                <div className={cn(
                  "rounded-xl p-6 border shadow-sm transition-all duration-300",
                  advancedTheming 
                    ? "bg-white/50 backdrop-blur-sm border-community-calm/20 group-hover:bg-white/70 group-hover:border-community-accent/20"
                    : "bg-neutral-50 border-neutral-200 group-hover:bg-white"
                )}>
                  <p className={cn(
                    "whitespace-pre-wrap leading-relaxed text-lg font-medium",
                    advancedTheming ? "text-foreground" : "text-neutral-700"
                  )}>
                    {post.content}
                  </p>
                </div>
              </div>

              <Separator className={cn(
                "my-6",
                advancedTheming ? "bg-community-calm/20" : "bg-neutral-200"
              )} />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => onHeartPost(post)}
                    className={cn(
                      "group/heart flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md",
                      hasUserHearted
                        ? advancedTheming
                          ? "bg-gradient-to-r from-community-heart/30 to-community-heart/20 text-community-heart border-2 border-community-heart/40 shadow-community-heart/20"
                          : "bg-red-50 text-red-600 border-2 border-red-200"
                        : advancedTheming
                          ? "bg-white/60 hover:bg-community-heart/10 text-community-soothing-foreground hover:text-community-heart border-2 border-transparent hover:border-community-heart/30 backdrop-blur-sm"
                          : "bg-white hover:bg-red-50 text-neutral-600 hover:text-red-600 border-2 border-transparent hover:border-red-200"
                    )}
                    disabled={heartPostPending}
                  >
                    <Heart className={cn(
                      "h-5 w-5 transition-all duration-200",
                      hasUserHearted
                        ? "fill-current scale-110 drop-shadow-sm"
                        : "group-hover/heart:scale-110"
                    )} />
                    <span className="font-bold text-base">{heartCount}</span>
                    {heartCount > 0 && (
                      <span className="text-sm font-medium opacity-80">
                        {heartCount === 1 ? 'heart' : 'hearts'}
                      </span>
                    )}
                  </button>

                  <div className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border-2 shadow-sm",
                    advancedTheming 
                      ? "bg-primary/10 border-primary/30"
                      : "bg-blue-50 border-blue-200"
                  )}>
                    <MessageCircle className={cn(
                      "h-5 w-5",
                      advancedTheming ? "text-primary" : "text-blue-600"
                    )} />
                    <span className={cn(
                      "font-bold text-base",
                      advancedTheming ? "text-primary" : "text-blue-700"
                    )}>{commentCount}</span>
                    <span className={cn(
                      "text-sm font-medium",
                      advancedTheming ? "text-primary/80" : "text-blue-600/80"
                    )}>
                      {commentCount === 1 ? 'comment' : 'comments'}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewPost(post.id)}
                    className={cn(
                      "flex items-center gap-2 border-2 transition-all duration-200",
                      advancedTheming 
                        ? "bg-background hover:bg-primary/10 text-foreground hover:text-primary border-border hover:border-primary/50"
                        : "bg-white hover:bg-blue-50 text-neutral-600 hover:text-blue-600 border-neutral-200 hover:border-blue-300"
                    )}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">View Post</span>
                  </Button>
                </div>

                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full border",
                  advancedTheming 
                    ? "bg-secondary/20 border-secondary/40"
                    : "bg-blue-50 border-blue-200"
                )}>
                  <Activity className={cn(
                    "h-4 w-4",
                    advancedTheming ? "text-secondary" : "text-blue-600"
                  )} />
                  <span className={cn(
                    "text-sm font-semibold",
                    advancedTheming ? "text-secondary" : "text-blue-700"
                  )}>Mental Health Community</span>
                </div>
              </div>

              <div className={cn(
                "mt-6 p-4 rounded-xl border",
                advancedTheming 
                  ? "bg-community-soothing/5 border-community-soothing/10"
                  : "bg-neutral-50 border-neutral-200"
              )}>
                <CommentSection postId={post.id} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}


