"use client";

import { formatDistanceToNow } from "date-fns";
import CommunitySidebar from "@/components/community/Sidebar";
import CommentSection from "@/components/community/CommentSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Heart, 
  MessageCircle, 
  Plus, 
  Hash, 
  Users, 
  Calendar,
  PenSquare,
  Send,
  Lock,
  AlertCircle,
  Activity
} from "lucide-react";
import { useCommunityPage } from "@/hooks/useCommunityPage";
import { useCommunityStats } from "@/hooks/community";
import { cn } from "@/lib/utils";

export default function UserCommunity() {
  const {
    selectedCommunityId,
    selectedRoomId,
    selectedRoom,
    isCreatePostOpen,
    newPostTitle,
    newPostContent,
    postsData,
    postsLoading,
    postsError,
    createPostMutation,
    heartPostMutation,
    handleCommunitySelect,
    handleRoomSelect,
    handleCreatePost,
    retryLoadPosts,
    setIsCreatePostOpen,
    setNewPostTitle,
    setNewPostContent,
    getUserInitials,
    getRoomBreadcrumb,
    isPostingAllowed,
  } = useCommunityPage();

  // Enhanced community data with new hooks
  const { stats: communityStats } = useCommunityStats();

  const breadcrumb = getRoomBreadcrumb();

  return (
    <main className="w-full flex h-full">
      <CommunitySidebar
        selectedCommunityId={selectedCommunityId}
        selectedRoomId={selectedRoomId}
        onCommunitySelect={handleCommunitySelect}
        onRoomSelect={handleRoomSelect}
      />

      <div className="flex-1 flex flex-col h-full">
        {/* Main Content Area */}
        {!selectedRoomId ? (
          // Welcome/No Room Selected State
          <div className="flex-1 flex items-center justify-center bg-community-gradient relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-community-soothing-gradient opacity-30" />
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-community-heart/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-community-accent/15 rounded-full blur-2xl" />
            
            <div className="relative text-center max-w-lg p-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-community-calm/20 animate-gentle-glow">
                <Heart className="h-10 w-10 text-community-heart" />
              </div>
              
              <h2 className="text-3xl font-bold text-community-calm-foreground mb-3">
                Welcome to Your Community Space
              </h2>
              <p className="text-community-soothing-foreground mb-8 text-lg leading-relaxed">
                Select a community and room from the sidebar to connect with others who understand your journey.
              </p>
              
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-md border border-community-calm/20 hover:shadow-lg transition-all duration-200">
                  <div className="p-2 rounded-full bg-community-accent/20 w-fit mx-auto mb-2">
                    <Activity className="h-6 w-6 text-community-accent" />
                  </div>
                  <p className="font-semibold text-community-calm-foreground">Active Communities</p>
                  <p className="text-2xl font-bold text-community-accent mt-1">
                    {communityStats?.totalCommunities || 0}
                  </p>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-md border border-community-calm/20 hover:shadow-lg transition-all duration-200">
                  <div className="p-2 rounded-full bg-community-heart/20 w-fit mx-auto mb-2">
                    <MessageCircle className="h-6 w-6 text-community-heart" />
                  </div>
                  <p className="font-semibold text-community-calm-foreground">Community Posts</p>
                  <p className="text-2xl font-bold text-community-heart mt-1">
                    {communityStats?.totalPosts || 0}
                  </p>
                </div>
              </div>
              
              <div className="mt-8 p-4 rounded-xl bg-community-soothing/10 border border-community-soothing/20">
                <p className="text-sm text-community-soothing-foreground">
                  💭 Start meaningful conversations, share experiences, and find support in our safe community spaces.
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Room Content
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Room Header */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-community-calm/30 p-6 shadow-sm">
              {breadcrumb && (
                <div className="flex items-center gap-2 text-sm text-community-soothing-foreground mb-4">
                  <span className="font-semibold text-community-calm-foreground">{breadcrumb.communityName}</span>
                  <span className="text-community-calm/60">/</span>
                  <span className="text-community-soothing-foreground">{breadcrumb.roomGroupName}</span>
                  <span className="text-community-calm/60">/</span>
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-community-accent/10 border border-community-accent/20">
                    {breadcrumb.roomPostingRole === "moderator" || breadcrumb.roomPostingRole === "admin" ? (
                      <Lock className="h-3 w-3 text-amber-500" />
                    ) : (
                      <Hash className="h-3 w-3 text-community-accent" />
                    )}
                    <span className="font-semibold text-community-accent-foreground">{breadcrumb.roomName}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl",
                      selectedRoom?.postingRole === "moderator" || selectedRoom?.postingRole === "admin"
                        ? "bg-amber-50 border border-amber-200"
                        : "bg-community-accent/10 border border-community-accent/20"
                    )}>
                      {selectedRoom?.postingRole === "moderator" || selectedRoom?.postingRole === "admin" ? (
                        <Lock className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Hash className="h-5 w-5 text-community-accent" />
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-community-calm-foreground">
                        {selectedRoom?.name}
                      </h1>
                      <p className="text-sm text-community-soothing-foreground mt-1">
                        Safe space for meaningful conversations
                      </p>
                    </div>
                  </div>
                  {selectedRoom?.postingRole !== "member" && (
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    >
                      {selectedRoom?.postingRole === "moderator" ? "Moderators Only" : "Admins Only"}
                    </Badge>
                  )}
                </div>

                <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="flex items-center gap-2 bg-community-accent hover:bg-community-accent/90 text-community-accent-foreground shadow-lg shadow-community-accent/20 border-0 px-6 py-2"
                      disabled={!isPostingAllowed()}
                    >
                      <PenSquare className="h-4 w-4" />
                      Share Your Thoughts
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Post in {selectedRoom?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                          placeholder="What's on your mind?"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder="Share your thoughts, experiences, or ask for support..."
                          rows={6}
                          className="mt-1 resize-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsCreatePostOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreatePost}
                          disabled={createPostMutation.isPending || !newPostTitle.trim() || !newPostContent.trim()}
                        >
                          {createPostMutation.isPending ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              Posting...
                            </div>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Post
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Posts Content */}
            <div className="flex-1 overflow-y-auto bg-community-warm/10 relative">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-community-gradient opacity-20" />
              <div className="relative max-w-4xl mx-auto p-6">
                {postsLoading ? (
                  // Loading state
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <Card key={i} className="bg-white/80 backdrop-blur-sm border-community-calm/20 shadow-lg">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full bg-community-calm/20" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-32 bg-community-soothing/30" />
                              <Skeleton className="h-3 w-20 bg-community-warm/40" />
                            </div>
                            <Skeleton className="h-6 w-16 bg-community-accent/20 rounded-full" />
                          </div>
                          <div className="mt-4">
                            <Skeleton className="h-6 w-4/5 bg-community-calm/30 mb-2" />
                            <Skeleton className="h-4 w-2/3 bg-community-soothing/20" />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full bg-community-warm/30" />
                            <Skeleton className="h-4 w-5/6 bg-community-warm/25" />
                            <Skeleton className="h-4 w-3/4 bg-community-warm/20" />
                          </div>
                          <div className="flex items-center gap-6 pt-2">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-4 bg-community-heart/30" />
                              <Skeleton className="h-3 w-8 bg-community-heart/20" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-4 bg-community-accent/30" />
                              <Skeleton className="h-3 w-8 bg-community-accent/20" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : postsError ? (
                  // Error state
                  <Card className="bg-white/90 backdrop-blur-sm border-community-heart/30 shadow-lg">
                    <CardContent className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 rounded-full bg-community-heart/20 animate-gentle-glow">
                          <AlertCircle className="h-8 w-8 text-community-heart" />
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-3 text-community-calm-foreground">
                            Connection Interrupted
                          </CardTitle>
                          <p className="text-community-soothing-foreground mb-6 max-w-md">
                            We're having trouble loading posts right now. Your mental health journey is important to us - let's try again.
                          </p>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-community-soothing/10 border border-community-soothing/20 max-w-sm">
                          <p className="text-sm text-community-soothing-foreground">
                            💙 If this continues, our support team is here to help you stay connected.
                          </p>
                        </div>
                        
                        <Button 
                          onClick={retryLoadPosts}
                          className="bg-community-heart hover:bg-community-heart/90 text-community-heart-foreground shadow-lg shadow-community-heart/20 px-6 py-2"
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : !postsData?.posts.length ? (
                  // Empty state
                  <Card className="bg-white/90 backdrop-blur-sm border-community-calm/30 shadow-xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-community-soothing-gradient opacity-20" />
                    <div className="absolute top-4 right-4 w-16 h-16 bg-community-heart/10 rounded-full blur-2xl" />
                    
                    <CardContent className="text-center py-16 relative">
                      <div className="flex flex-col items-center space-y-6">
                        <div className="p-6 rounded-2xl bg-community-calm/20 animate-gentle-glow backdrop-blur-sm">
                          <MessageCircle className="h-10 w-10 text-community-accent" />
                        </div>
                        
                        <div className="max-w-md">
                          <CardTitle className="text-2xl mb-3 text-community-calm-foreground">
                            A Fresh Start
                          </CardTitle>
                          <p className="text-community-soothing-foreground mb-8 text-lg leading-relaxed">
                            This room is waiting for its first conversation. Your voice matters here.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 max-w-lg w-full">
                          <div className="p-4 rounded-xl bg-community-warm/20 border border-community-warm/30">
                            <div className="flex items-center gap-3 mb-2">
                              <Heart className="h-4 w-4 text-community-heart" />
                              <span className="font-medium text-community-calm-foreground text-sm">Safe Space</span>
                            </div>
                            <p className="text-xs text-community-soothing-foreground">
                              Share your experiences in a supportive, moderated environment
                            </p>
                          </div>
                          
                          <div className="p-4 rounded-xl bg-community-accent/10 border border-community-accent/20">
                            <div className="flex items-center gap-3 mb-2">
                              <Users className="h-4 w-4 text-community-accent" />
                              <span className="font-medium text-community-calm-foreground text-sm">Community Support</span>
                            </div>
                            <p className="text-xs text-community-soothing-foreground">
                              Connect with others who understand your journey
                            </p>
                          </div>
                        </div>
                        
                        {isPostingAllowed() ? (
                          <Button 
                            onClick={() => setIsCreatePostOpen(true)}
                            className="bg-community-accent hover:bg-community-accent/90 text-community-accent-foreground shadow-lg shadow-community-accent/20 px-8 py-3 text-base"
                          >
                            <PenSquare className="h-5 w-5 mr-2" />
                            Start the Conversation
                          </Button>
                        ) : (
                          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/50 max-w-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <Lock className="h-4 w-4 text-amber-600" />
                              <span className="font-medium text-amber-700 text-sm">Restricted Room</span>
                            </div>
                            <p className="text-xs text-amber-600">
                              Only moderators can post in this room, but you can still read and engage with content.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // Posts list
                  <div className="space-y-8">
                    {postsData.posts.map((post, index) => {
                      const heartCount = (post as unknown as {_count?: {hearts?: number}})?._count?.hearts || 0;
                      const commentCount = (post as unknown as {_count?: {comments?: number}})?._count?.comments || 0;
                      const hasUserHearted = false; // TODO: Add user heart status logic
                      
                      return (
                        <Card key={index} className="group bg-white/90 backdrop-blur-sm border-community-calm/30 shadow-lg hover:shadow-xl hover:border-community-accent/40 transition-all duration-300 overflow-hidden">
                          {/* Subtle gradient background */}
                          <div className="absolute inset-0 bg-community-warm-gradient opacity-30 group-hover:opacity-40 transition-opacity duration-300" />
                          
                          <CardHeader className="relative pb-3">
                            <div className="flex items-start gap-4">
                              <div className="relative">
                                <Avatar className="h-12 w-12 ring-2 ring-community-calm/20 ring-offset-2 ring-offset-white">
                                  <AvatarImage src={post.user.avatarUrl} className="object-cover" />
                                  <AvatarFallback className="bg-community-accent/20 text-community-accent-foreground font-semibold text-sm">
                                    {getUserInitials(post.user.firstName, post.user.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-community-heart rounded-full border-2 border-white animate-heart-beat" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-community-calm-foreground truncate">
                                    {post.user.firstName} {post.user.lastName}
                                  </h3>
                                  <div className="px-2 py-1 rounded-full bg-community-accent/15 border border-community-accent/20">
                                    <span className="text-xs font-medium text-community-accent-foreground">Community Member</span>
                                  </div>
                                </div>
                                <p className="text-sm text-community-soothing-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            
                            <CardTitle className="mt-4 text-xl text-community-calm-foreground leading-relaxed">
                              {(post as unknown as {title?: string}).title || 'Community Post'}
                            </CardTitle>
                          </CardHeader>
                          
                          <CardContent className="relative pt-0">
                            <div className="prose prose-sm max-w-none">
                              <p className="text-community-soothing-foreground whitespace-pre-wrap leading-relaxed text-base">
                                {(post as unknown as {content?: string}).content || 'Post content'}
                              </p>
                            </div>
                            
                            <Separator className="my-6 bg-community-calm/20" />
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                <button
                                  onClick={() => console.log('Heart post clicked')}
                                  className={cn(
                                    "group/heart flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
                                    hasUserHearted 
                                      ? "bg-community-heart/20 text-community-heart border border-community-heart/30" 
                                      : "hover:bg-community-heart/10 text-community-soothing-foreground hover:text-community-heart border border-transparent hover:border-community-heart/20"
                                  )}
                                  disabled={heartPostMutation.isPending}
                                >
                                  <Heart className={cn(
                                    "h-4 w-4 transition-all duration-200",
                                    hasUserHearted 
                                      ? "fill-current scale-110" 
                                      : "group-hover/heart:scale-110"
                                  )} />
                                  <span className="font-medium text-sm">{heartCount}</span>
                                  {heartCount > 0 && (
                                    <span className="text-xs text-community-heart/70">
                                      {heartCount === 1 ? 'heart' : 'hearts'}
                                    </span>
                                  )}
                                </button>
                                
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-community-accent/10 border border-community-accent/20">
                                  <MessageCircle className="h-4 w-4 text-community-accent" />
                                  <span className="font-medium text-sm text-community-accent-foreground">{commentCount}</span>
                                  <span className="text-xs text-community-accent/70">
                                    {commentCount === 1 ? 'comment' : 'comments'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-community-soothing-foreground">
                                <Activity className="h-3 w-3" />
                                <span>Mental Health Community</span>
                              </div>
                            </div>
                            
                            <div className="mt-6 p-4 rounded-xl bg-community-soothing/5 border border-community-soothing/10">
                              <CommentSection postId={(post as unknown as {id?: string})?.id || ''} />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}