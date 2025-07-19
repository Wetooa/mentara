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
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center max-w-md">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">Welcome to Communities</h2>
              <p className="text-neutral-600 mb-6">
                Select a community and room from the sidebar to start engaging with others who share similar experiences.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <Activity className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="font-medium">Active Communities</p>
                  <p className="text-neutral-500">{communityStats?.totalCommunities || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <MessageCircle className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="font-medium">Total Posts</p>
                  <p className="text-neutral-500">{communityStats?.totalPosts || 0}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Room Content
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Room Header */}
            <div className="bg-white border-b border-neutral-200 p-4">
              {breadcrumb && (
                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
                  <span className="font-medium">{breadcrumb.communityName}</span>
                  <span>/</span>
                  <span className="text-neutral-500">{breadcrumb.roomGroupName}</span>
                  <span>/</span>
                  <div className="flex items-center gap-1">
                    {breadcrumb.roomPostingRole === "moderator" || breadcrumb.roomPostingRole === "admin" ? (
                      <Lock className="h-3 w-3 text-amber-500" />
                    ) : (
                      <Hash className="h-3 w-3" />
                    )}
                    <span className="font-medium text-neutral-800">{breadcrumb.roomName}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {selectedRoom?.postingRole === "moderator" || selectedRoom?.postingRole === "admin" ? (
                      <Lock className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Hash className="h-5 w-5 text-neutral-500" />
                    )}
                    <h1 className="text-xl font-semibold text-neutral-800">
                      {selectedRoom?.name}
                    </h1>
                  </div>
                  {selectedRoom?.postingRole !== "member" && (
                    <Badge variant="outline" className="text-xs">
                      {selectedRoom?.postingRole === "moderator" ? "Moderators Only" : "Admins Only"}
                    </Badge>
                  )}
                </div>

                <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="flex items-center gap-2"
                      disabled={!isPostingAllowed()}
                    >
                      <PenSquare className="h-4 w-4" />
                      New Post
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
            <div className="flex-1 overflow-y-auto bg-neutral-50">
              <div className="max-w-4xl mx-auto p-6">
                {postsLoading ? (
                  // Loading state
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <Card key={i}>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                          <CardTitle>
                            <Skeleton className="h-6 w-3/4" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-20 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : postsError ? (
                  // Error state
                  <Card>
                    <CardContent className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <CardTitle className="text-lg mb-2">Failed to load posts</CardTitle>
                      <p className="text-neutral-600 mb-4">
                        There was an error loading posts from this room.
                      </p>
                      <Button onClick={retryLoadPosts}>
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                ) : !postsData?.posts.length ? (
                  // Empty state
                  <Card>
                    <CardContent className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                      <CardTitle className="text-lg mb-2">No posts yet</CardTitle>
                      <p className="text-neutral-600 mb-4">
                        Be the first to start a conversation in this room!
                      </p>
                      {isPostingAllowed() ? (
                        <Button onClick={() => setIsCreatePostOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Post
                        </Button>
                      ) : (
                        <p className="text-sm text-neutral-500">
                          Only moderators can post in this room.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  // Posts list
                  <div className="space-y-6">
                    {postsData.posts.map((post, index) => (
                      (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={post.user.avatarUrl} />
                                <AvatarFallback>
                                  {getUserInitials(post.user.firstName, post.user.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="font-medium text-neutral-800">
                                  {post.user.firstName} {post.user.lastName}
                                </h3>
                                <p className="text-xs text-neutral-500 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            
                            <CardTitle className="mt-3">
                              {(post as unknown as {title?: string}).title || 'Community Post'}
                            </CardTitle>
                          </CardHeader>
                          
                          <CardContent>
                            <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                              {(post as unknown as {content?: string}).content || 'Post content'}
                            </p>
                            
                            <Separator className="my-4" />
                            
                            <div className="flex items-center gap-6 text-sm mb-4">
                              <button
                                onClick={() => console.log('Heart post clicked')}
                                className="flex items-center gap-2 hover:text-red-500 transition-colors"
                                disabled={heartPostMutation.isPending}
                              >
                                <Heart className="h-4 w-4" />
                                <span>{(post as unknown as {_count?: {hearts?: number}})?._count?.hearts || 0}</span>
                              </button>
                              
                              <div className="flex items-center gap-2 text-neutral-500">
                                <MessageCircle className="h-4 w-4" />
                                <span>{(post as unknown as {_count?: {comments?: number}})?._count?.comments || 0}</span>
                              </div>
                            </div>
                            
                            <CommentSection postId={(post as unknown as {id?: string})?.id || ''} />
                          </CardContent>
                        </Card>
                      )
                    ))}
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