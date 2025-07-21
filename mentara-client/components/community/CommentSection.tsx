"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Heart, 
  MessageCircle, 
  Reply,
  Calendar,
  Send,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Edit3,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommunityComments } from "@/hooks/community";
import { useAuth } from "@/contexts/AuthContext";
import type { Comment } from "@/types/api/comments";

interface CommentSectionProps {
  postId: string;
  className?: string;
}

interface CommentItemProps {
  comment: Comment;
  onCreateNestedComment: (parentId: string, content: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onHeart: (commentId: string) => void;
  onUnheart: (commentId: string) => void;
  isLoading?: boolean;
  currentUserId?: string;
}

function CommentItem({ 
  comment, 
  onCreateNestedComment, 
  onEdit, 
  onDelete, 
  onHeart, 
  onUnheart, 
  isLoading, 
  currentUserId 
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);

  const isHearted = comment.hearts?.some(heart => heart.userId === currentUserId);
  const isAuthor = comment.userId === currentUserId;

  const handleReply = () => {
    if (replyContent.trim()) {
      onCreateNestedComment(comment.id, replyContent.trim());
      setReplyContent("");
      setIsReplying(false);
    }
  };

  const handleEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <div className="space-y-3">
      <Card className="bg-white/80 backdrop-blur-sm border-community-calm/20 hover:border-community-accent/30 transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 ring-2 ring-community-calm/20 ring-offset-1 ring-offset-white">
              <AvatarImage src={comment.user.avatarUrl} className="object-cover" />
              <AvatarFallback className="text-xs bg-community-accent/20 text-community-accent-foreground font-medium">
                {getUserInitials(comment.user.firstName, comment.user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-sm">
                  {comment.user.firstName} {comment.user.lastName}
                </h4>
                {comment.user.role === 'therapist' && (
                  <Badge variant="secondary" className="text-xs bg-community-heart/20 text-community-heart-foreground border-community-heart/30">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    Therapist
                  </Badge>
                )}
                <p className="text-xs text-community-soothing-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            {isAuthor && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isLoading}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(comment.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                rows={3}
                className="resize-none"
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
                  <Send className="h-3 w-3 mr-1" />
                  Update
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-community-soothing-foreground whitespace-pre-wrap leading-relaxed">
              {comment.content}
            </p>
          )}

          <Separator className="my-3 bg-community-calm/20" />

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => isHearted ? onUnheart(comment.id) : onHeart(comment.id)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200",
                isHearted 
                  ? "text-community-heart bg-community-heart/10 border border-community-heart/20" 
                  : "text-community-soothing-foreground hover:text-community-heart hover:bg-community-heart/5"
              )}
              disabled={isLoading}
            >
              <Heart className={cn("h-3 w-3 transition-transform duration-200", isHearted && "fill-current scale-110")} />
              <span className="font-medium">{comment._count?.hearts || 0}</span>
            </button>

            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-community-soothing-foreground hover:text-community-accent hover:bg-community-accent/5 transition-all duration-200"
            >
              <Reply className="h-3 w-3" />
              <span className="font-medium">Reply</span>
            </button>

            {comment.children && comment.children.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 hover:text-neutral-700 transition-colors"
              >
                {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                <span>{comment.children.length} {comment.children.length === 1 ? 'reply' : 'replies'}</span>
              </button>
            )}
          </div>

          {isReplying && (
            <div className="mt-3 space-y-3">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Replies */}
      {showReplies && comment.children && comment.children.length > 0 && (
        <div className="ml-6 space-y-3 border-l-2 border-community-calm/30 pl-4">
          {comment.children.map((nestedComment) => (
            <Card key={nestedComment.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={nestedComment.user.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {getUserInitials(nestedComment.user.firstName, nestedComment.user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h5 className="font-medium text-xs">
                        {nestedComment.user.firstName} {nestedComment.user.lastName}
                      </h5>
                      {nestedComment.user.role === 'therapist' && (
                        <Badge variant="secondary" className="text-xs">
                          <Stethoscope className="h-2 w-2 mr-1" />
                          Therapist
                        </Badge>
                      )}
                      <p className="text-xs text-neutral-500">
                        {formatDistanceToNow(new Date(nestedComment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-xs text-neutral-700 whitespace-pre-wrap">
                      {nestedComment.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ postId, className }: CommentSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const {
    comments,
    isLoading,
    error,
    createComment,
    updateComment,
    deleteComment,
    heartComment,
    unheartComment,
    isCreatingComment,
    isUpdatingComment,
    isDeletingComment,
    isHeartingComment,
    isUnheartingComment,
  } = useCommunityComments(postId);

  const handleCreateComment = () => {
    if (newComment.trim()) {
      createComment({ postId, content: newComment.trim() });
      setNewComment("");
    }
  };

  const handleCreateNestedComment = (parentId: string, content: string) => {
    createComment({ postId, content, parentId });
  };

  const isOperationLoading = 
    isCreatingComment || 
    isUpdatingComment || 
    isDeletingComment || 
    isHeartingComment || 
    isUnheartingComment;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Comments Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-community-accent hover:text-community-accent-foreground hover:bg-community-accent/10 transition-all duration-200"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="font-medium">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
          {showComments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {comments.length > 0 && (
          <div className="text-xs text-community-soothing-foreground">
            Community Discussion
          </div>
        )}
      </div>

      {showComments && (
        <div className="space-y-4">
          {/* New Comment Form */}
          <Card className="bg-white/90 backdrop-blur-sm border-community-accent/30 shadow-lg">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-4 w-4 text-community-accent" />
                  <span className="text-sm font-medium text-community-calm-foreground">Join the conversation</span>
                </div>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts, experiences, or offer support..."
                  rows={3}
                  className="resize-none border-community-calm/30 focus:border-community-accent/50 focus:ring-community-accent/20"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-community-soothing-foreground">
                    💬 Remember: This is a safe, supportive space for sharing
                  </p>
                  <Button
                    onClick={handleCreateComment}
                    disabled={!newComment.trim() || isCreatingComment}
                    className="bg-community-accent hover:bg-community-accent/90 text-community-accent-foreground shadow-lg shadow-community-accent/20"
                  >
                    {isCreatingComment ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                        Sharing...
                      </div>
                    ) : (
                      <>
                        <Send className="h-3 w-3 mr-2" />
                        Share Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Card key={i} className="bg-white/80 backdrop-blur-sm border-community-calm/20">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full bg-community-calm/20" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24 bg-community-soothing/30" />
                        <Skeleton className="h-3 w-16 bg-community-warm/40" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full bg-community-warm/30" />
                      <Skeleton className="h-4 w-3/4 bg-community-warm/25" />
                      <Skeleton className="h-4 w-1/2 bg-community-warm/20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="bg-white/90 backdrop-blur-sm border-community-heart/30">
              <CardContent className="text-center py-8">
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-full bg-community-heart/20">
                    <MessageCircle className="h-6 w-6 text-community-heart" />
                  </div>
                  <div>
                    <p className="text-community-heart-foreground font-medium mb-1">Comments Unavailable</p>
                    <p className="text-community-soothing-foreground text-sm">
                      We&apos;re having trouble loading comments right now
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-community-heart/30 text-community-heart hover:bg-community-heart/10"
                  >
                    <Heart className="h-3 w-3 mr-1" />
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : comments.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-community-calm/30">
              <CardContent className="text-center py-10">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 rounded-xl bg-community-calm/20 animate-gentle-glow">
                    <MessageCircle className="h-6 w-6 text-community-accent" />
                  </div>
                  <div className="max-w-xs">
                    <p className="text-community-calm-foreground font-medium mb-2">Start the Conversation</p>
                    <p className="text-community-soothing-foreground text-sm leading-relaxed">
                      Be the first to share your thoughts and connect with others in this supportive space.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-community-soothing/10 border border-community-soothing/20 max-w-sm">
                    <p className="text-xs text-community-soothing-foreground">
                      💭 Your voice matters in building our supportive community
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onCreateNestedComment={handleCreateNestedComment}
                  onEdit={updateComment}
                  onDelete={deleteComment}
                  onHeart={heartComment}
                  onUnheart={unheartComment}
                  isLoading={isOperationLoading}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}