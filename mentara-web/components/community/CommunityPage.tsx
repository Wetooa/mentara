"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import CommunitySidebar from "@/components/community/Sidebar";
import CommentSection from "@/components/community/CommentSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Hash,
  Users,
  Calendar,
  PenSquare,
  Send,
  Lock,
  AlertCircle,
  Activity,
  Paperclip,
  X,
  Edit3,
  Trash2,
  Eye,
  Stethoscope,
  UserCheck,
  Plus
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useCommunityPage } from "@/hooks/community/useCommunityPage";
import { useCommunityStats } from "@/hooks/community";
import { cn } from "@/lib/utils";
import { getRoleConfig, type UserRole } from "@/lib/community/roleConfig";
import type { Post } from "@/types/api/communities";

interface CommunityPageProps {
  role: UserRole;
}

export default function CommunityPage({ role }: CommunityPageProps) {
  const config = getRoleConfig(role);
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
    // Edit post functionality (only for clients)
    isEditPostOpen,
    editPostTitle,
    editPostContent,
    editPostMutation,
    deletePostMutation,
    handleCommunitySelect,
    handleRoomSelect,
    handleCreatePost,
    handleHeartPost,
    handleEditPost,
    handleUpdatePost,
    handleDeletePost,
    handleFileSelect,
    handleFileRemove,
    retryLoadPosts,
    setIsCreatePostOpen,
    setNewPostTitle,
    setNewPostContent,
    setIsEditPostOpen,
    setEditPostTitle,
    setEditPostContent,
    getUserInitials,
    getRoomBreadcrumb,
    isPostingAllowed,
    isPostHearted,
    isPostOwner,
    selectedFiles,
  } = useCommunityPage();

  const router = useRouter();

  // Enhanced community stats
  const { stats: communityStats } = useCommunityStats();

  // Mobile sidebar visibility state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Navigation function for viewing post details
  const handleViewPost = (postId: string) => {
    router.push(config.navigation.postDetailPath(postId));
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
          <ResizableHandle withHandle className={cn(
            "w-1.5 hover:bg-blue-200/80 transition-colors duration-200",
            config.features.advancedTheming ? "bg-slate-100/60" : "bg-gray-200"
          )} />
          <ResizablePanel defaultSize={80} className="h-full !overflow-y-auto">
            {/* Main Content Area */}
            {!selectedRoomId ? (
              // Welcome/No Room Selected State
              <div className={cn(
                "flex-1 flex items-center justify-center",
                config.features.advancedTheming 
                  ? "bg-gradient-to-br from-community-warm/30 via-white to-community-soothing/20"
                  : "bg-gradient-to-br from-slate-50 to-blue-50"
              )}>
                <div className="text-center max-w-md">
                  <div className={cn(
                    "rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm",
                    config.features.advancedTheming 
                      ? "bg-white border border-community-accent/20" 
                      : "bg-white border border-blue-100"
                  )}>
                    <config.icons.primary className={cn(
                      "h-8 w-8",
                      config.features.advancedTheming ? "text-community-accent" : "text-blue-600"
                    )} />
                  </div>
                  <h2 className={cn(
                    "text-2xl font-bold mb-2",
                    config.features.advancedTheming ? "text-community-calm-foreground" : "text-blue-900"
                  )}>
                    {config.messages.welcomeTitle}
                  </h2>
                  <p className={cn(
                    "mb-6",
                    config.features.advancedTheming ? "text-community-soothing-foreground" : "text-slate-600"
                  )}>
                    {config.messages.welcomeDescription}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                      <config.icons.activity className={cn(
                        "h-5 w-5 mx-auto mb-1",
                        config.features.advancedTheming ? "text-community-accent" : "text-blue-600"
                      )} />
                      <p className="font-medium text-slate-700">Active Communities</p>
                      <p className="text-slate-500">{communityStats?.totalCommunities || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                      <MessageCircle className={cn(
                        "h-5 w-5 mx-auto mb-1",
                        config.features.advancedTheming ? "text-community-accent" : "text-blue-600"
                      )} />
                      <p className="font-medium text-slate-700">
                        {role === 'therapist' ? 'Professional Posts' : 'Community Posts'}
                      </p>
                      <p className="text-slate-500">{communityStats?.totalPosts || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                      <config.icons.members className={cn(
                        "h-5 w-5 mx-auto mb-1",
                        config.features.advancedTheming ? "text-community-accent" : "text-blue-600"
                      )} />
                      <p className="font-medium text-slate-700">Active Members</p>
                      <p className="text-slate-500">{communityStats?.totalMembers || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                      <Users className={cn(
                        "h-5 w-5 mx-auto mb-1",
                        config.features.advancedTheming ? "text-community-accent" : "text-blue-600"
                      )} />
                      <p className="font-medium text-slate-700">
                        {role === 'therapist' ? 'Therapists Online' : 'Members Online'}
                      </p>
                      <p className="text-slate-500">{communityStats?.totalMembers || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Room Content
              <div className="flex-1 flex flex-col overflow-hidden h-full">
                {/* Room Header */}
                <div className={cn(
                  "bg-white border-b p-4 lg:p-6",
                  config.features.advancedTheming ? "border-community-calm/30" : "border-neutral-200"
                )}>
                  {breadcrumb && (
                    <div className={cn(
                      "flex items-center gap-2 text-sm mb-4",
                      config.features.advancedTheming ? "text-community-soothing-foreground" : "text-neutral-600"
                    )}>
                      <span className="font-medium">{breadcrumb.communityName}</span>
                      <span className="text-community-calm/60">/</span>
                      <span className="text-community-soothing-foreground">{breadcrumb.roomGroupName}</span>
                      <span className="text-community-calm/60">/</span>
                      <div className={cn(
                        "flex items-center gap-2 px-2 py-1 rounded-lg border",
                        config.features.advancedTheming 
                          ? "bg-community-accent/10 border-community-accent/20"
                          : "bg-blue-50 border-blue-200"
                      )}>
                        {breadcrumb.roomPostingRole === "moderator" || breadcrumb.roomPostingRole === "admin" ? (
                          <Lock className="h-3 w-3 text-amber-500" />
                        ) : (
                          <Hash className={cn(
                            "h-3 w-3",
                            config.features.advancedTheming ? "text-community-accent" : "text-blue-600"
                          )} />
                        )}
                        <span className={cn(
                          "font-semibold",
                          config.features.advancedTheming ? "text-community-accent-foreground" : "text-blue-700"
                        )}>{breadcrumb.roomName}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn(
                          "p-2 rounded-xl shrink-0",
                          selectedRoom?.postingRole === "moderator" || selectedRoom?.postingRole === "admin"
                            ? "bg-amber-50 border border-amber-200"
                            : config.features.advancedTheming 
                              ? "bg-community-accent/10 border border-community-accent/20"
                              : "bg-blue-50 border border-blue-200"
                        )}>
                          {selectedRoom?.postingRole === "moderator" || selectedRoom?.postingRole === "admin" ? (
                            <Lock className="h-4 w-4 lg:h-5 lg:w-5 text-amber-500" />
                          ) : (
                            <Hash className={cn(
                              "h-4 w-4 lg:h-5 lg:w-5",
                              config.features.advancedTheming ? "text-community-accent" : "text-blue-600"
                            )} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h1 className={cn(
                            "text-xl lg:text-2xl font-bold truncate",
                            config.features.advancedTheming ? "text-community-calm-foreground" : "text-neutral-800"
                          )}>
                            {selectedRoom?.name}
                          </h1>
                          <p className={cn(
                            "text-xs lg:text-sm mt-1",
                            config.features.advancedTheming ? "text-community-soothing-foreground" : "text-neutral-600"
                          )}>
                            {role === 'therapist' 
                              ? 'Professional therapeutic environment' 
                              : 'Safe space for meaningful conversations'
                            }
                          </p>
                        </div>
                      </div>
                      {selectedRoom?.postingRole !== "member" && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 shrink-0"
                        >
                          {config.messages.restrictedRoomBadge[selectedRoom?.postingRole as 'moderator' | 'admin']}
                        </Badge>
                      )}
                    </div>

                    <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className={cn(
                            "flex items-center gap-2 shadow-lg border-0 px-4 lg:px-6 py-2 w-full lg:w-auto",
                            config.features.advancedTheming 
                              ? "bg-community-accent hover:bg-community-accent/90 text-community-accent-foreground shadow-community-accent/20"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          )}
                          disabled={!isPostingAllowed()}
                        >
                          <PenSquare className="h-4 w-4" />
                          <span className="hidden sm:inline">{config.messages.createPostButton}</span>
                          <span className="sm:hidden">New Post</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{config.messages.createPostDialogTitle(selectedRoom?.name || '')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              value={newPostTitle}
                              onChange={(e) => setNewPostTitle(e.target.value)}
                              placeholder={config.messages.createPostPlaceholder}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                              id="content"
                              value={newPostContent}
                              onChange={(e) => setNewPostContent(e.target.value)}
                              placeholder={config.messages.createPostContentPlaceholder}
                              rows={6}
                              className="mt-1 resize-none"
                            />
                          </div>

                          {/* File Attachments - only for clients */}
                          {config.features.fileUpload && (
                            <div>
                              <Label>Attachments (optional)</Label>
                              <div className="mt-2 space-y-3">
                                {/* File Upload Area */}
                                <div className="relative">
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*,application/pdf,text/*,video/*,audio/*"
                                    onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    id="file-upload"
                                  />
                                  <div className="border-2 border-dashed border-community-accent/30 rounded-xl p-6 text-center hover:border-community-accent/50 transition-colors">
                                    <Paperclip className="h-8 w-8 text-community-accent/60 mx-auto mb-2" />
                                    <p className="text-community-calm-foreground font-medium mb-1">
                                      Drag files here or click to browse
                                    </p>
                                    <p className="text-xs text-community-soothing-foreground">
                                      Max 5 files, 10MB each • Images, PDFs, Documents
                                    </p>
                                  </div>
                                </div>

                                {/* Selected Files List */}
                                {selectedFiles.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-community-calm-foreground">
                                      Selected Files ({selectedFiles.length}/5):
                                    </p>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                      {selectedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-community-warm/20 rounded-lg border border-community-accent/20">
                                          <div className="flex items-center gap-2 min-w-0">
                                            <Paperclip className="h-4 w-4 text-community-accent shrink-0" />
                                            <span className="text-sm text-community-calm-foreground truncate">
                                              {file.name}
                                            </span>
                                            <span className="text-xs text-community-soothing-foreground shrink-0">
                                              ({(file.size / 1024 / 1024).toFixed(1)}MB)
                                            </span>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleFileRemove(index)}
                                            className="h-6 w-6 p-0 hover:bg-community-heart/20 text-community-soothing-foreground hover:text-community-heart"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

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
                                  {config.messages.postingButtonText}
                                </div>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  {config.messages.shareButtonText}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Edit Post Dialog - only for clients */}
                    {config.features.editPost && (
                      <Dialog open={isEditPostOpen} onOpenChange={setIsEditPostOpen}>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Post in {selectedRoom?.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-title">Title</Label>
                              <Input
                                id="edit-title"
                                value={editPostTitle}
                                onChange={(e) => setEditPostTitle(e.target.value)}
                                placeholder="Update your post title..."
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-content">Content</Label>
                              <Textarea
                                id="edit-content"
                                value={editPostContent}
                                onChange={(e) => setEditPostContent(e.target.value)}
                                placeholder="Update your thoughts, experiences, or ask for support..."
                                rows={6}
                                className="mt-1 resize-none"
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsEditPostOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleUpdatePost}
                                disabled={editPostMutation.isPending || !editPostTitle.trim() || !editPostContent.trim()}
                                className="bg-community-accent hover:bg-community-accent/90 text-community-accent-foreground"
                              >
                                {editPostMutation.isPending ? (
                                  <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    Updating...
                                  </div>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Update Post
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                {/* Posts Content with fixed scrolling */}
                <ScrollArea className={cn(
                  "h-[calc(100vh-240px)] relative",
                  config.features.advancedTheming ? "bg-community-warm/10" : "bg-neutral-50"
                )}>
                  {/* Background decoration for advanced theming */}
                  {config.features.advancedTheming && (
                    <div className="absolute inset-0 bg-community-gradient opacity-20" />
                  )}
                  <div className="relative max-w-4xl mx-auto p-4 lg:p-6 pb-8">
                    {postsLoading ? (
                      // Loading state
                      <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                          <Card key={i} className={cn(
                            "shadow-lg",
                            config.features.advancedTheming 
                              ? "bg-white/80 backdrop-blur-sm border-community-calm/20"
                              : "bg-white border-neutral-200"
                          )}>
                            <CardHeader className="pb-4">
                              <div className="flex items-center gap-4">
                                <Skeleton className={cn(
                                  "h-12 w-12 rounded-full",
                                  config.features.advancedTheming ? "bg-community-calm/20" : "bg-neutral-200"
                                )} />
                                <div className="space-y-2 flex-1">
                                  <Skeleton className={cn(
                                    "h-4 w-32",
                                    config.features.advancedTheming ? "bg-community-soothing/30" : "bg-neutral-200"
                                  )} />
                                  <Skeleton className={cn(
                                    "h-3 w-20",
                                    config.features.advancedTheming ? "bg-community-warm/40" : "bg-neutral-200"
                                  )} />
                                </div>
                                <Skeleton className={cn(
                                  "h-6 w-16 rounded-full",
                                  config.features.advancedTheming ? "bg-community-accent/20" : "bg-neutral-200"
                                )} />
                              </div>
                              <div className="mt-4">
                                <Skeleton className={cn(
                                  "h-6 w-4/5 mb-2",
                                  config.features.advancedTheming ? "bg-community-calm/30" : "bg-neutral-200"
                                )} />
                                <Skeleton className={cn(
                                  "h-4 w-2/3",
                                  config.features.advancedTheming ? "bg-community-soothing/20" : "bg-neutral-200"
                                )} />
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <Skeleton className={cn(
                                  "h-4 w-full",
                                  config.features.advancedTheming ? "bg-community-warm/30" : "bg-neutral-200"
                                )} />
                                <Skeleton className={cn(
                                  "h-4 w-5/6",
                                  config.features.advancedTheming ? "bg-community-warm/25" : "bg-neutral-200"
                                )} />
                                <Skeleton className={cn(
                                  "h-4 w-3/4",
                                  config.features.advancedTheming ? "bg-community-warm/20" : "bg-neutral-200"
                                )} />
                              </div>
                              <div className="flex items-center gap-6 pt-2">
                                <div className="flex items-center gap-2">
                                  <Skeleton className={cn(
                                    "h-4 w-4",
                                    config.features.advancedTheming ? "bg-community-heart/30" : "bg-neutral-200"
                                  )} />
                                  <Skeleton className={cn(
                                    "h-3 w-8",
                                    config.features.advancedTheming ? "bg-community-heart/20" : "bg-neutral-200"
                                  )} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Skeleton className={cn(
                                    "h-4 w-4",
                                    config.features.advancedTheming ? "bg-community-accent/30" : "bg-neutral-200"
                                  )} />
                                  <Skeleton className={cn(
                                    "h-3 w-8",
                                    config.features.advancedTheming ? "bg-community-accent/20" : "bg-neutral-200"
                                  )} />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : postsError ? (
                      // Error state
                      <Card className={cn(
                        "shadow-lg",
                        config.features.advancedTheming 
                          ? "bg-white/90 backdrop-blur-sm border-community-heart/30"
                          : "bg-white border-neutral-200"
                      )}>
                        <CardContent className="text-center py-12">
                          <div className="flex flex-col items-center space-y-4">
                            <div className={cn(
                              "p-4 rounded-full",
                              config.features.advancedTheming 
                                ? "bg-community-heart/20 animate-gentle-glow"
                                : "bg-red-50"
                            )}>
                              <AlertCircle className={cn(
                                "h-8 w-8",
                                config.features.advancedTheming ? "text-community-heart" : "text-red-500"
                              )} />
                            </div>
                            <div>
                              <CardTitle className={cn(
                                "text-xl mb-3",
                                config.features.advancedTheming ? "text-community-calm-foreground" : "text-neutral-800"
                              )}>
                                {config.messages.errorTitle}
                              </CardTitle>
                              <p className={cn(
                                "mb-6 max-w-md",
                                config.features.advancedTheming ? "text-community-soothing-foreground" : "text-neutral-600"
                              )}>
                                {config.messages.errorDescription}
                              </p>
                            </div>

                            {config.features.advancedTheming && (
                              <div className="p-4 rounded-xl bg-community-soothing/10 border border-community-soothing/20 max-w-sm">
                                <p className="text-sm text-community-soothing-foreground">
                                  💙 If this continues, our support team is here to help you stay connected.
                                </p>
                              </div>
                            )}

                            <Button
                              onClick={retryLoadPosts}
                              className={cn(
                                "shadow-lg px-6 py-2",
                                config.features.advancedTheming 
                                  ? "bg-community-heart hover:bg-community-heart/90 text-community-heart-foreground shadow-community-heart/20"
                                  : "bg-red-600 hover:bg-red-700 text-white"
                              )}
                            >
                              <Heart className="h-4 w-4 mr-2" />
                              Try Again
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : !postsData?.posts.length ? (
                      // Empty state
                      <Card className={cn(
                        "shadow-xl relative",
                        config.features.advancedTheming 
                          ? "bg-white/90 backdrop-blur-sm border-community-calm/30"
                          : "bg-white border-neutral-200"
                      )}>
                        {/* Background decoration for advanced theming */}
                        {config.features.advancedTheming && (
                          <>
                            <div className="absolute inset-0 bg-community-soothing-gradient opacity-20" />
                            <div className="absolute top-4 right-4 w-16 h-16 bg-community-heart/10 rounded-full blur-2xl" />
                          </>
                        )}

                        <CardContent className="text-center py-16 relative">
                          <div className="flex flex-col items-center space-y-6">
                            <div className={cn(
                              "p-6 rounded-2xl backdrop-blur-sm",
                              config.features.advancedTheming 
                                ? "bg-community-calm/20 animate-gentle-glow"
                                : "bg-blue-50"
                            )}>
                              <MessageCircle className={cn(
                                "h-10 w-10",
                                config.features.advancedTheming ? "text-community-accent" : "text-blue-600"
                              )} />
                            </div>

                            <div className="max-w-md">
                              <CardTitle className={cn(
                                "text-2xl mb-3",
                                config.features.advancedTheming ? "text-community-calm-foreground" : "text-neutral-800"
                              )}>
                                {config.messages.emptyStateTitle}
                              </CardTitle>
                              <p className={cn(
                                "mb-8 text-lg leading-relaxed",
                                config.features.advancedTheming ? "text-community-soothing-foreground" : "text-neutral-600"
                              )}>
                                {config.messages.emptyStateDescription}
                              </p>
                            </div>

                            {config.features.advancedTheming && (
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
                            )}

                            {isPostingAllowed() ? (
                              <Button
                                onClick={() => setIsCreatePostOpen(true)}
                                className={cn(
                                  "shadow-lg px-8 py-3 text-base",
                                  config.features.advancedTheming 
                                    ? "bg-community-accent hover:bg-community-accent/90 text-community-accent-foreground shadow-community-accent/20"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                )}
                              >
                                <PenSquare className="h-5 w-5 mr-2" />
                                {config.messages.emptyStateButton}
                              </Button>
                            ) : (
                              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/50 max-w-sm">
                                <div className="flex items-center gap-2 mb-2">
                                  <Lock className="h-4 w-4 text-amber-600" />
                                  <span className="font-medium text-amber-700 text-sm">Restricted Room</span>
                                </div>
                                <p className="text-xs text-amber-600">
                                  {config.messages.restrictedRoomDescription}
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
                          const heartCount = (post as unknown as { _count?: { hearts?: number } })?._count?.hearts || 0;
                          const commentCount = (post as unknown as { _count?: { comments?: number } })?._count?.comments || 0;
                          const hasUserHearted = isPostHearted(post as unknown as Post);

                          return (
                            <Card key={index} className={cn(
                              "group shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative",
                              config.features.advancedTheming 
                                ? "bg-white/95 backdrop-blur-sm border-community-calm/20 hover:border-community-accent/30"
                                : "bg-white border-neutral-200 hover:border-blue-200"
                            )}>
                              {/* Enhanced gradient background for advanced theming */}
                              {config.features.advancedTheming && (
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
                                      config.features.advancedTheming 
                                        ? "ring-2 ring-community-accent/30 ring-offset-3 ring-offset-white"
                                        : "ring-2 ring-blue-200 ring-offset-2 ring-offset-white"
                                    )}>
                                      <AvatarImage src={post.user.avatarUrl} className="object-cover" />
                                      <AvatarFallback className={cn(
                                        "font-bold text-base",
                                        config.features.advancedTheming 
                                          ? "bg-gradient-to-br from-community-accent/30 to-community-heart/20 text-community-calm-foreground"
                                          : "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
                                      )}>
                                        {getUserInitials(post.user.firstName, post.user.lastName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    {config.features.advancedTheming && (
                                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-community-heart to-community-heart/80 rounded-full border-3 border-white animate-heart-beat shadow-md" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className={cn(
                                        "font-semibold truncate",
                                        config.features.advancedTheming ? "text-community-calm-foreground" : "text-neutral-800"
                                      )}>
                                        {post.user.firstName} {post.user.lastName}
                                      </h3>
                                      <div className={cn(
                                        "px-3 py-1 rounded-full border shadow-sm",
                                        config.features.advancedTheming 
                                          ? "bg-gradient-to-r from-community-accent/20 to-community-soothing/20 border-community-accent/30"
                                          : role === 'therapist' && post.user?.role === 'therapist'
                                            ? "bg-blue-50 border-blue-200"
                                            : "bg-neutral-50 border-neutral-200"
                                      )}>
                                        <span className={cn(
                                          "text-xs font-semibold flex items-center gap-1",
                                          config.features.advancedTheming ? "text-community-calm-foreground" : "text-neutral-700"
                                        )}>
                                          {role === 'therapist' && post.user?.role === 'therapist' && (
                                            <Stethoscope className="h-3 w-3 text-blue-600" />
                                          )}
                                          {role === 'therapist' && post.user?.role === 'therapist' 
                                            ? config.messages.memberBadge 
                                            : config.messages.memberBadge
                                          }
                                        </span>
                                      </div>
                                    </div>
                                    <p className={cn(
                                      "text-sm flex items-center gap-1",
                                      config.features.advancedTheming ? "text-community-soothing-foreground" : "text-neutral-500"
                                    )}>
                                      <Calendar className="h-3 w-3" />
                                      {formatDistanceToNow(new Date(), { addSuffix: true })}
                                    </p>
                                  </div>

                                  {/* Edit/Delete buttons for post owner - only for clients */}
                                  {config.features.editPost && isPostOwner(post as unknown as Post) && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditPost(post as unknown as Post)}
                                        className="h-8 w-8 p-0 hover:bg-community-accent/10 text-community-soothing-foreground hover:text-community-accent"
                                        disabled={editPostMutation.isPending}
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeletePost((post as unknown as Post).id)}
                                        className="h-8 w-8 p-0 hover:bg-community-heart/10 text-community-soothing-foreground hover:text-community-heart"
                                        disabled={deletePostMutation.isPending}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                <CardTitle className={cn(
                                  "mt-6 text-2xl font-bold leading-relaxed transition-colors duration-300",
                                  config.features.advancedTheming 
                                    ? "text-community-calm-foreground group-hover:text-community-accent"
                                    : "text-neutral-800 group-hover:text-blue-700"
                                )}>
                                  {(post as unknown as { title?: string }).title || 'Community Post'}
                                </CardTitle>
                              </CardHeader>

                              <CardContent className="relative pt-0">
                                <div className="prose prose-base max-w-none">
                                  <div className={cn(
                                    "rounded-xl p-6 border shadow-sm transition-all duration-300",
                                    config.features.advancedTheming 
                                      ? "bg-white/50 backdrop-blur-sm border-community-calm/20 group-hover:bg-white/70 group-hover:border-community-accent/20"
                                      : "bg-neutral-50 border-neutral-200 group-hover:bg-white"
                                  )}>
                                    <p className={cn(
                                      "whitespace-pre-wrap leading-relaxed text-lg font-medium",
                                      config.features.advancedTheming ? "text-community-calm-foreground" : "text-neutral-700"
                                    )}>
                                      {(post as unknown as { content?: string }).content || 'Post content'}
                                    </p>
                                  </div>
                                </div>

                                <Separator className={cn(
                                  "my-6",
                                  config.features.advancedTheming ? "bg-community-calm/20" : "bg-neutral-200"
                                )} />

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-6">
                                    <button
                                      onClick={() => handleHeartPost(post as unknown as Post)}
                                      className={cn(
                                        "group/heart flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md",
                                        hasUserHearted
                                          ? config.features.advancedTheming
                                            ? "bg-gradient-to-r from-community-heart/30 to-community-heart/20 text-community-heart border-2 border-community-heart/40 shadow-community-heart/20"
                                            : "bg-red-50 text-red-600 border-2 border-red-200"
                                          : config.features.advancedTheming
                                            ? "bg-white/60 hover:bg-community-heart/10 text-community-soothing-foreground hover:text-community-heart border-2 border-transparent hover:border-community-heart/30 backdrop-blur-sm"
                                            : "bg-white hover:bg-red-50 text-neutral-600 hover:text-red-600 border-2 border-transparent hover:border-red-200"
                                      )}
                                      disabled={heartPostMutation.isPending}
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
                                      "flex items-center gap-3 px-4 py-3 rounded-xl border-2 shadow-sm backdrop-blur-sm",
                                      config.features.advancedTheming 
                                        ? "bg-gradient-to-r from-community-accent/20 to-community-soothing/15 border-community-accent/30"
                                        : "bg-blue-50 border-blue-200"
                                    )}>
                                      <MessageCircle className={cn(
                                        "h-5 w-5",
                                        config.features.advancedTheming ? "text-community-accent" : "text-blue-600"
                                      )} />
                                      <span className={cn(
                                        "font-bold text-base",
                                        config.features.advancedTheming ? "text-community-accent-foreground" : "text-blue-700"
                                      )}>{commentCount}</span>
                                      <span className={cn(
                                        "text-sm font-medium",
                                        config.features.advancedTheming ? "text-community-accent/80" : "text-blue-600/80"
                                      )}>
                                        {commentCount === 1 ? 'comment' : 'comments'}
                                      </span>
                                    </div>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewPost((post as unknown as { id?: string })?.id || '')}
                                      className={cn(
                                        "flex items-center gap-2 border-2 backdrop-blur-sm transition-all duration-200",
                                        config.features.advancedTheming 
                                          ? "bg-white/60 hover:bg-community-calm/10 text-community-calm-foreground hover:text-community-accent border-community-calm/30 hover:border-community-accent/50"
                                          : "bg-white hover:bg-blue-50 text-neutral-600 hover:text-blue-600 border-neutral-200 hover:border-blue-300"
                                      )}
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span className="font-medium">View Post</span>
                                    </Button>
                                  </div>

                                  <div className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-full border",
                                    config.features.advancedTheming 
                                      ? "bg-community-soothing/20 border-community-soothing/30"
                                      : "bg-blue-50 border-blue-200"
                                  )}>
                                    <Activity className={cn(
                                      "h-4 w-4",
                                      config.features.advancedTheming ? "text-community-soothing" : "text-blue-600"
                                    )} />
                                    <span className={cn(
                                      "text-sm font-semibold",
                                      config.features.advancedTheming ? "text-community-soothing-foreground" : "text-blue-700"
                                    )}>Mental Health Community</span>
                                  </div>
                                </div>

                                <div className={cn(
                                  "mt-6 p-4 rounded-xl border",
                                  config.features.advancedTheming 
                                    ? "bg-community-soothing/5 border-community-soothing/10"
                                    : "bg-neutral-50 border-neutral-200"
                                )}>
                                  <CommentSection postId={(post as unknown as { id?: string })?.id || ''} />
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden flex flex-col h-full">
        {/* Mobile header */}
        <div className={cn(
          "bg-white/90 backdrop-blur-sm border-b p-4",
          config.features.advancedTheming ? "border-community-calm/30" : "border-gray-200"
        )}>
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
              className={config.navigation.communityButtonClass}
            >
              <Hash className="h-4 w-4 mr-1" />
              {selectedCommunityId ? 'Communities' : 'Select Community'}
            </Button>
            {selectedRoom && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>/</span>
                <span className={cn(
                  "font-medium",
                  config.features.advancedTheming ? "text-community-accent" : "text-blue-700"
                )}>{selectedRoom.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Main Content */}
        <div className="flex-1 flex flex-col h-full">
          {!selectedRoomId ? (
            // Mobile Welcome State
            <div className={cn(
              "flex-1 flex items-center justify-center",
              config.features.advancedTheming 
                ? "bg-gradient-to-br from-community-warm/30 via-white to-community-soothing/20"
                : "bg-gradient-to-br from-slate-50 to-blue-50"
            )}>
              <div className="text-center max-w-md p-4">
                <div className={cn(
                  "rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm border",
                  config.features.advancedTheming 
                    ? "bg-white border-community-accent/20" 
                    : "bg-white border-blue-100"
                )}>
                  <config.icons.primary className={cn(
                    "h-8 w-8",
                    config.features.advancedTheming ? "text-community-accent" : "text-blue-600"
                  )} />
                </div>
                <h2 className={cn(
                  "text-2xl font-bold mb-2",
                  config.features.advancedTheming ? "text-community-calm-foreground" : "text-blue-900"
                )}>
                  {config.messages.welcomeTitle}
                </h2>
                <p className={cn(
                  "mb-6",
                  config.features.advancedTheming ? "text-community-soothing-foreground" : "text-slate-600"
                )}>
                  {role === 'therapist' 
                    ? 'Tap Communities above to connect with fellow therapists and clients.'
                    : config.messages.welcomeDescription
                  }
                </p>
              </div>
            </div>
          ) : (
            // Mobile Room Content (simplified)
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className={cn(
                "bg-white/90 backdrop-blur-sm border-b p-4 shadow-sm",
                config.features.advancedTheming ? "border-community-calm/30" : "border-gray-200"
              )}>
                <h1 className={cn(
                  "text-xl font-bold truncate",
                  config.features.advancedTheming ? "text-community-calm-foreground" : "text-neutral-800"
                )}>
                  {selectedRoom?.name}
                </h1>
              </div>
              <ScrollArea className={cn(
                "flex-1 min-h-0",
                config.features.advancedTheming ? "bg-community-warm/10" : "bg-neutral-50"
              )}>
                <div className="p-4">
                  {postsLoading ? (
                    // Mobile Loading state
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <Card key={i} className={cn(
                          config.features.advancedTheming 
                            ? "bg-white/90 border-community-calm/20"
                            : "bg-white border-neutral-200"
                        )}>
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-8 w-8 rounded-full" />
                              <div className="space-y-1">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-2 w-12" />
                              </div>
                            </div>
                            <CardTitle>
                              <Skeleton className="h-4 w-3/4" />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Skeleton className="h-16 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : postsError ? (
                    // Mobile Error state
                    <Card className={cn(
                      config.features.advancedTheming 
                        ? "bg-white/90 border-community-heart/30"
                        : "bg-white border-neutral-200"
                    )}>
                      <CardContent className="text-center py-6">
                        <AlertCircle className={cn(
                          "h-8 w-8 mx-auto mb-3",
                          config.features.advancedTheming ? "text-community-heart" : "text-red-500"
                        )} />
                        <CardTitle className={cn(
                          "text-base mb-2",
                          config.features.advancedTheming ? "text-community-calm-foreground" : "text-neutral-800"
                        )}>{config.messages.errorTitle}</CardTitle>
                        <p className={cn(
                          "text-sm mb-4",
                          config.features.advancedTheming ? "text-community-soothing-foreground" : "text-neutral-600"
                        )}>
                          {config.messages.errorDescription}
                        </p>
                        <Button onClick={retryLoadPosts} size="sm">
                          Try Again
                        </Button>
                      </CardContent>
                    </Card>
                  ) : !postsData?.posts.length ? (
                    // Mobile Empty state
                    <Card className={cn(
                      config.features.advancedTheming 
                        ? "bg-white/90 border-community-calm/30"
                        : "bg-white border-neutral-200"
                    )}>
                      <CardContent className="text-center py-6">
                        <MessageCircle className={cn(
                          "h-8 w-8 mx-auto mb-3",
                          config.features.advancedTheming ? "text-community-accent" : "text-neutral-400"
                        )} />
                        <CardTitle className={cn(
                          "text-base mb-2",
                          config.features.advancedTheming ? "text-community-calm-foreground" : "text-neutral-800"
                        )}>{config.messages.emptyStateTitle}</CardTitle>
                        <p className={cn(
                          "text-sm mb-4",
                          config.features.advancedTheming ? "text-community-soothing-foreground" : "text-neutral-600"
                        )}>
                          {config.messages.emptyStateDescription}
                        </p>
                        {isPostingAllowed() && (
                          <Button onClick={() => setIsCreatePostOpen(true)} size="sm">
                            <Plus className="h-3 w-3 mr-2" />
                            {role === 'therapist' ? 'Start Discussion' : 'Start Conversation'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    // Mobile Posts list with proper scrolling
                    <div className="space-y-4">
                      {postsData.posts.map((post, index) => {
                        const heartCount = (post as unknown as { _count?: { hearts?: number } })?._count?.hearts || 0;
                        const commentCount = (post as unknown as { _count?: { comments?: number } })?._count?.comments || 0;
                        const hasUserHearted = isPostHearted(post as unknown as Post);

                        return (
                          <Card key={index} className={cn(
                            "hover:shadow-sm transition-shadow",
                            config.features.advancedTheming 
                              ? "bg-white/95 border-community-calm/20"
                              : "bg-white border-neutral-200"
                          )}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={post.user.avatarUrl} />
                                  <AvatarFallback className="text-xs">
                                    {getUserInitials(post.user.firstName, post.user.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <h3 className={cn(
                                      "font-medium text-sm truncate",
                                      config.features.advancedTheming ? "text-community-calm-foreground" : "text-neutral-800"
                                    )}>
                                      {post.user.firstName} {post.user.lastName}
                                    </h3>
                                    {role === 'therapist' && post.user?.role === 'therapist' && (
                                      <Badge variant="secondary" className="text-xs px-1">
                                        <Stethoscope className="h-2 w-2 mr-1" />
                                        T
                                      </Badge>
                                    )}
                                  </div>
                                  <p className={cn(
                                    "text-xs",
                                    config.features.advancedTheming ? "text-community-soothing-foreground" : "text-neutral-500"
                                  )}>
                                    {formatDistanceToNow(new Date(), { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                              <CardTitle className="text-base mt-2">
                                {(post as unknown as { title?: string }).title || 'Community Post'}
                              </CardTitle>
                            </CardHeader>
                            
                            <CardContent className="pt-0">
                              <p className={cn(
                                "text-sm leading-relaxed line-clamp-3",
                                config.features.advancedTheming ? "text-community-calm-foreground" : "text-neutral-700"
                              )}>
                                {(post as unknown as { content?: string }).content || 'Post content'}
                              </p>
                              
                              <div className={cn(
                                "flex items-center justify-between mt-3 pt-3 border-t",
                                config.features.advancedTheming ? "border-community-calm/20" : "border-neutral-200"
                              )}>
                                <div className="flex items-center gap-4 text-xs">
                                  <button
                                    onClick={() => handleHeartPost(post as unknown as Post)}
                                    className={cn(
                                      "flex items-center gap-1 hover:text-red-500 transition-colors",
                                      hasUserHearted && "text-red-500"
                                    )}
                                    disabled={heartPostMutation.isPending}
                                  >
                                    <Heart className={cn("h-3 w-3", hasUserHearted && "fill-current")} />
                                    <span>{heartCount}</span>
                                  </button>
                                  
                                  <div className={cn(
                                    "flex items-center gap-1",
                                    config.features.advancedTheming ? "text-community-soothing-foreground" : "text-neutral-500"
                                  )}>
                                    <MessageCircle className="h-3 w-3" />
                                    <span>{commentCount}</span>
                                  </div>
                                </div>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewPost((post as unknown as { id?: string })?.id || '')}
                                  className="text-xs py-1 px-2 h-auto"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}