"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
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
  Activity,
  Stethoscope,
  UserCheck,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/api/communities";
import { useCommunityPage } from "@/hooks/community/useCommunityPage";
import { useCommunityStats } from "@/hooks/community";


// Local interface for post data with all required properties
interface PostData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role?: string;
  };
  hearts: Array<{id: string; userId: string}>;
  comments: Array<{id: string}>;
  _count: {
    hearts: number;
    comments: number;
  };
}

export default function TherapistCommunity() {
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
    handleHeartPost,
    retryLoadPosts,
    setIsCreatePostOpen,
    setNewPostTitle,
    setNewPostContent,
    getUserInitials,
    getRoomBreadcrumb,
    isPostingAllowed,
    isPostHearted,
  } = useCommunityPage();

  // Enhanced community stats for therapists
  const { stats: communityStats } = useCommunityStats();
  const router = useRouter();

  // Mobile sidebar visibility state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Navigation function for viewing post details
  const handleViewPost = (postId: string) => {
    router.push(`/therapist/community/posts/${postId}`);
  };

  const breadcrumb = getRoomBreadcrumb();

  return (
    <main className="w-full h-full">
      {/* Mobile overlay for sidebar */}
      <div className="lg:hidden">
        {(selectedCommunityId || isSidebarOpen) && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => {
              handleCommunitySelect('');
              setIsSidebarOpen(false);
            }} />
            <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
              <CommunitySidebar
                selectedCommunityId={selectedCommunityId}
                selectedRoomId={selectedRoomId}
                onCommunitySelect={(communityId) => {
                  handleCommunitySelect(communityId);
                  setIsSidebarOpen(false);
                }}
                onRoomSelect={handleRoomSelect}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Desktop resizable layout */}
      <div className="hidden lg:block h-full">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35} className="min-w-[240px]">
            <CommunitySidebar
              selectedCommunityId={selectedCommunityId}
              selectedRoomId={selectedRoomId}
              onCommunitySelect={handleCommunitySelect}
              onRoomSelect={handleRoomSelect}
            />
          </ResizablePanel>
          <ResizableHandle withHandle className="w-1.5 bg-slate-100/60 hover:bg-blue-200/80 transition-colors duration-200" />
          <ResizablePanel defaultSize={80}>
            {/* Desktop Main Content Area */}
        {/* Main Content Area */}
        {!selectedRoomId ? (
          // Welcome/No Room Selected State - Professional Healthcare Design
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="text-center max-w-md">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Therapist Community Hub</h2>
              <p className="text-slate-600 mb-6">
                Connect with fellow therapists, share insights, and engage with clients in a supportive environment.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                  <Activity className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="font-medium text-slate-700">Active Communities</p>
                  <p className="text-slate-500">{communityStats?.totalCommunities || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                  <MessageCircle className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="font-medium text-slate-700">Professional Posts</p>
                  <p className="text-slate-500">{communityStats?.totalPosts || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                  <UserCheck className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="font-medium text-slate-700">Active Members</p>
                  <p className="text-slate-500">{communityStats?.totalMembers || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                  <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="font-medium text-slate-700">Therapists Online</p>
                  <p className="text-slate-500">{communityStats?.totalMembers || 0}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Room Content - Same as user version but with therapist-specific messaging
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
                      {selectedRoom?.postingRole === "moderator" ? "Professional Only" : "Admin Only"}
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
                      Share Insight
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Share Professional Insight in {selectedRoom?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                          placeholder="What professional insight would you like to share?"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder="Share your professional experience, therapeutic insights, or guidance for the community..."
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
                              Sharing...
                            </div>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Share
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
                  // Empty state - Enhanced for therapists
                  <Card>
                    <CardContent className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                      <CardTitle className="text-lg mb-2">No discussions yet</CardTitle>
                      <p className="text-neutral-600 mb-4">
                        Be the first to share professional insights in this room!
                      </p>
                      {isPostingAllowed() ? (
                        <Button onClick={() => setIsCreatePostOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Start Professional Discussion
                        </Button>
                      ) : (
                        <p className="text-sm text-neutral-500">
                          Only licensed professionals can initiate discussions in this room.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  // Posts list
                  <div className="space-y-6">
                    {(postsData.posts as unknown as PostData[]).map((post: PostData) => (
                      <Card key={post.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={post.user.avatarUrl} />
                              <AvatarFallback>
                                {getUserInitials(post.user.firstName, post.user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-neutral-800">
                                  {post.user.firstName} {post.user.lastName}
                                </h3>
                                {post.user?.role === 'therapist' && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Stethoscope className="h-3 w-3 mr-1" />
                                    Therapist
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-neutral-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          
                          <CardTitle className="mt-3">
                            {post.title}
                          </CardTitle>
                        </CardHeader>
                        
                        <CardContent>
                          <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                            {post.content}
                          </p>
                          
                          <Separator className="my-4" />
                          
                          <div className="flex items-center gap-6 text-sm mb-4">
                            <button
                              onClick={() => handleHeartPost(post as unknown as Post)}
                              className={cn(
                                "flex items-center gap-2 hover:text-red-500 transition-colors",
                                isPostHearted(post as unknown as Post) && "text-red-500"
                              )}
                              disabled={heartPostMutation.isPending}
                            >
                              <Heart className={cn("h-4 w-4", isPostHearted(post as unknown as Post) && "fill-current")} />
                              <span>{post._count.hearts}</span>
                            </button>
                            
                            <div className="flex items-center gap-2 text-neutral-500">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post._count.comments}</span>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewPost(post.id)}
                              className="flex items-center gap-2 text-neutral-600 hover:text-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View Post</span>
                            </Button>
                          </div>
                          
                          <CommentSection postId={post.id} />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      {/* Mobile layout */}
      <div className="lg:hidden flex flex-col h-full">
        {/* Mobile header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedCommunityId) {
                  // Show sidebar to change community selection
                  handleCommunitySelect(selectedCommunityId);
                } else {
                  // Show sidebar for initial community selection
                  setIsSidebarOpen(true);
                }
              }}
              className="border-blue-300 text-blue-600"
            >
              <Hash className="h-4 w-4 mr-1" />
              {selectedCommunityId ? 'Communities' : 'Select Community'}
            </Button>
            {selectedRoom && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>/</span>
                <span className="font-medium text-blue-700">{selectedRoom.name}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Main Content */}
        <div className="flex-1 flex flex-col h-full">
          {!selectedRoomId ? (
            // Mobile Welcome State - Professional Healthcare Design
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
              <div className="text-center max-w-md p-4">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Therapist Community Hub</h2>
                <p className="text-slate-600 mb-6">
                  Tap Communities above to connect with fellow therapists and clients.
                </p>
              </div>
            </div>
          ) : (
            // Mobile Room Content (simplified)
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4 shadow-sm">
                <h1 className="text-xl font-bold text-neutral-800 truncate">
                  {selectedRoom?.name}
                </h1>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto bg-neutral-50">
                <div className="p-4">
                  <div className="text-center py-8">
                    <p className="text-neutral-600">Mobile room content loading...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}