"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CommunitySidebar from "@/components/community/Sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Heart,
  MessageCircle,
  Hash,
  Users,
  PenSquare,
  Lock,
  X,
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
import { RoomContentTabs } from "./RoomContentTabs";
import { PostsList } from "./posts/PostsList";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Send } from "lucide-react";

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
    deletePostMutation,
    handleCommunitySelect,
    handleRoomSelect,
    handleCreatePost,
    handleHeartPost,
    handleEditPost,
    handleDeletePost,
    retryLoadPosts,
    setIsCreatePostOpen,
    setNewPostTitle,
    setNewPostContent,
    getUserInitials,
    getRoomBreadcrumb,
    isPostingAllowed,
    isPostHearted,
    isPostOwner,
  } = useCommunityPage();

  const router = useRouter();
  const { stats: communityStats } = useCommunityStats();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleViewPost = (postId: string) => {
    router.push(config.navigation.postDetailPath(postId));
  };

  const canCreateSession =
    (role as string) === "therapist" || (role as string) === "moderator";
  const breadcrumb = getRoomBreadcrumb();

  // Render posts content (will be passed to tabs)
  const postsContent = (
    <ScrollArea
      className={cn(
        "h-[calc(100vh-290px)] relative",
        config.features.advancedTheming
          ? "bg-community-warm/10"
          : "bg-neutral-50"
      )}
    >
      {config.features.advancedTheming && (
        <div className="absolute inset-0 bg-community-gradient opacity-20" />
      )}
      <div className="relative max-w-4xl mx-auto p-4 lg:p-6 pb-8">
        {postsLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-4/5 mb-4" />
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : postsError ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-8 w-8 mx-auto mb-3 text-red-500" />
              <CardTitle className="text-xl mb-3">
                Unable to load posts
              </CardTitle>
              <p className="mb-6 text-muted-foreground">Please try again</p>
              <Button onClick={retryLoadPosts}>
                <Heart className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : !postsData?.posts.length ? (
          <Card>
            <CardContent className="text-center py-16">
              <MessageCircle className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <CardTitle className="text-2xl mb-3">
                {config.messages.emptyStateTitle}
              </CardTitle>
              <p className="mb-8 text-lg">
                {config.messages.emptyStateDescription}
              </p>
              {isPostingAllowed() ? (
                <Button onClick={() => setIsCreatePostOpen(true)}>
                  <PenSquare className="h-5 w-5 mr-2" />
                  {config.messages.emptyStateButton}
                </Button>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 max-w-sm mx-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-amber-700 text-sm">
                      Restricted Room
                    </span>
                  </div>
                  <p className="text-xs text-amber-600">
                    {config.messages.restrictedRoomDescription}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <PostsList
            posts={postsData.posts as unknown as Post[]}
            onHeartPost={handleHeartPost}
            onViewPost={handleViewPost}
            onEditPost={config.features.editPost ? handleEditPost : undefined}
            onDeletePost={
              config.features.editPost ? handleDeletePost : undefined
            }
            isPostHearted={isPostHearted}
            isPostOwner={isPostOwner}
            getUserInitials={getUserInitials}
            heartPostPending={heartPostMutation.isPending}
            editPostPending={false}
            deletePostPending={deletePostMutation.isPending}
            canEditDelete={config.features.editPost}
            advancedTheming={config.features.advancedTheming}
            userRole={role}
          />
        )}
      </div>
    </ScrollArea>
  );

  return (
    <main className="w-full h-full">
      {/* Mobile overlay for sidebar */}
      <div className="lg:hidden">
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => {
                setIsSidebarOpen(false);
              }}
            />
            <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
              {/* Close button (mobile) */}
              <div className="absolute top-3 right-3 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(false)}
                  className="rounded-full hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <CommunitySidebar
                selectedCommunityId={selectedCommunityId}
                selectedRoomId={selectedRoomId}
                onCommunitySelect={(communityId) => {
                  // Keep sidebar open after selecting a community so user can choose a room
                  handleCommunitySelect(communityId);
                }}
                onRoomSelect={(roomId, communityId) => {
                  handleRoomSelect(roomId, communityId);
                  // Close after room selection for cleaner UX
                  setIsSidebarOpen(false);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Desktop resizable layout */}
      <div className="hidden lg:block h-full">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={35}
            className="min-w-[240px]"
          >
            <CommunitySidebar
              selectedCommunityId={selectedCommunityId}
              selectedRoomId={selectedRoomId}
              onCommunitySelect={handleCommunitySelect}
              onRoomSelect={handleRoomSelect}
            />
          </ResizablePanel>
          <ResizableHandle
            withHandle
            className={cn(
              "w-1.5 hover:bg-blue-200/80 transition-colors duration-200",
              config.features.advancedTheming
                ? "bg-slate-100/60"
                : "bg-gray-200"
            )}
          />
          <ResizablePanel defaultSize={80} className="h-full !overflow-y-auto">
            {!selectedRoomId ? (
              // Welcome/No Room Selected State
              <div
                className={cn(
                  "flex-1 flex items-center justify-center h-full",
                  config.features.advancedTheming
                    ? "bg-gradient-to-br from-community-warm/30 via-white to-community-soothing/20"
                    : "bg-gradient-to-br from-slate-50 to-blue-50"
                )}
              >
                <div className="text-center max-w-md">
                  <div
                    className={cn(
                      "rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm",
                      config.features.advancedTheming
                        ? "bg-white border border-community-accent/20"
                        : "bg-white border border-blue-100"
                    )}
                  >
                    <config.icons.primary
                      className={cn(
                        "h-8 w-8",
                        config.features.advancedTheming
                          ? "text-community-accent"
                          : "text-blue-600"
                      )}
                    />
                  </div>
                  <h2
                    className={cn(
                      "text-2xl font-bold mb-2",
                      config.features.advancedTheming
                        ? "text-community-calm-foreground"
                        : "text-blue-900"
                    )}
                  >
                    {config.messages.welcomeTitle}
                  </h2>
                  <p
                    className={cn(
                      "mb-6",
                      config.features.advancedTheming
                        ? "text-community-soothing-foreground"
                        : "text-slate-600"
                    )}
                  >
                    {config.messages.welcomeDescription}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                      <config.icons.activity
                        className={cn(
                          "h-5 w-5 mx-auto mb-1",
                          config.features.advancedTheming
                            ? "text-community-accent"
                            : "text-blue-600"
                        )}
                      />
                      <p className="font-medium text-slate-700">
                        Active Communities
                      </p>
                      <p className="text-slate-500">
                        {communityStats?.totalCommunities ?? 0}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                      <MessageCircle
                        className={cn(
                          "h-5 w-5 mx-auto mb-1",
                          config.features.advancedTheming
                            ? "text-community-accent"
                            : "text-blue-600"
                        )}
                      />
                      <p className="font-medium text-slate-700">
                        Community Posts
                      </p>
                      <p className="text-slate-500">
                        {communityStats?.totalPosts ?? 0}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                      <config.icons.members
                        className={cn(
                          "h-5 w-5 mx-auto mb-1",
                          config.features.advancedTheming
                            ? "text-community-accent"
                            : "text-blue-600"
                        )}
                      />
                      <p className="font-medium text-slate-700">
                        Active Members
                      </p>
                      <p className="text-slate-500">
                        {communityStats?.totalMembers ?? 0}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                      <Users
                        className={cn(
                          "h-5 w-5 mx-auto mb-1",
                          config.features.advancedTheming
                            ? "text-community-accent"
                            : "text-blue-600"
                        )}
                      />
                      <p className="font-medium text-slate-700">
                        Members Online
                      </p>
                      <p className="text-slate-500">
                        {communityStats?.totalMembers ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Room Content with Tabs
              <div className="flex flex-col h-full">
                {/* Room Header */}
                <div
                  className={cn(
                    "bg-white border-b p-4 lg:p-6",
                    config.features.advancedTheming
                      ? "border-community-calm/30"
                      : "border-neutral-200"
                  )}
                >
                  {breadcrumb && (
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <div
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-gradient-to-r shadow-sm",
                          config.features.advancedTheming
                            ? "from-primary/10 to-primary/5 border-primary/30"
                            : "from-blue-50 to-slate-50 border-blue-200"
                        )}
                      >
                        <Hash
                          className={cn(
                            "h-3.5 w-3.5",
                            config.features.advancedTheming
                              ? "text-primary"
                              : "text-blue-600"
                          )}
                        />
                        <span
                          className={cn(
                            "font-semibold text-sm",
                            config.features.advancedTheming
                              ? "text-primary"
                              : "text-blue-700"
                          )}
                        >
                          {breadcrumb.communityName}
                        </span>
                      </div>
                      <span className="text-muted-foreground font-medium">
                        /
                      </span>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border">
                        <span className="text-foreground font-medium text-sm">
                          {breadcrumb.roomGroupName}
                        </span>
                      </div>
                      <span className="text-muted-foreground font-medium">
                        /
                      </span>
                      <div
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-md border shadow-sm",
                          breadcrumb.roomPostingRole === "moderator" ||
                            breadcrumb.roomPostingRole === "admin"
                            ? "bg-amber-100 border-amber-300"
                            : "bg-secondary/20 border-secondary/40"
                        )}
                      >
                        {breadcrumb.roomPostingRole === "moderator" ||
                        breadcrumb.roomPostingRole === "admin" ? (
                          <Lock className="h-3.5 w-3.5 text-amber-700" />
                        ) : (
                          <Hash className="h-3.5 w-3.5 text-secondary" />
                        )}
                        <span
                          className={cn(
                            "font-bold text-sm",
                            breadcrumb.roomPostingRole === "moderator" ||
                              breadcrumb.roomPostingRole === "admin"
                              ? "text-amber-800"
                              : "text-secondary"
                          )}
                        >
                          {breadcrumb.roomName}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold">{selectedRoom?.name}</h1>

                    <Dialog
                      open={isCreatePostOpen}
                      onOpenChange={setIsCreatePostOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          disabled={!isPostingAllowed()}
                          className={cn(
                            config.features.advancedTheming
                              ? "bg-community-accent hover:bg-community-accent/90"
                              : "bg-blue-600 hover:bg-blue-700"
                          )}
                        >
                          <PenSquare className="h-4 w-4 mr-2" />
                          New Post
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
                        {/* Header with gradient */}
                        <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-b p-6">
                          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                          <DialogHeader className="relative">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30 shadow-sm">
                                <PenSquare className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <DialogTitle className="text-2xl font-bold text-foreground">
                                  Create New Post
                                </DialogTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Share your thoughts in{" "}
                                  <span className="font-semibold text-primary">
                                    {selectedRoom?.name}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </DialogHeader>
                        </div>

                        {/* Form Content */}
                        <div className="p-6 space-y-6">
                          {/* Title Input */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label
                                htmlFor="post-title"
                                className="text-base font-semibold flex items-center gap-2"
                              >
                                📝 Post Title
                              </Label>
                              <span
                                className={cn(
                                  "text-xs font-medium",
                                  newPostTitle.length > 100
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                                )}
                              >
                                {newPostTitle.length}/120
                              </span>
                            </div>
                            <Input
                              id="post-title"
                              value={newPostTitle}
                              onChange={(e) => setNewPostTitle(e.target.value)}
                              placeholder="Give your post a clear, descriptive title..."
                              maxLength={120}
                              className="text-base h-11 border-2 focus:border-primary/50 transition-colors"
                            />
                            <p className="text-xs text-muted-foreground">
                              A good title helps others understand your post at
                              a glance
                            </p>
                          </div>

                          {/* Content Textarea */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label
                                htmlFor="post-content"
                                className="text-base font-semibold flex items-center gap-2"
                              >
                                💭 Your Thoughts
                              </Label>
                              <span
                                className={cn(
                                  "text-xs font-medium",
                                  newPostContent.length > 1800
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                                )}
                              >
                                {newPostContent.length}/2000
                              </span>
                            </div>
                            <Textarea
                              id="post-content"
                              value={newPostContent}
                              onChange={(e) =>
                                setNewPostContent(e.target.value)
                              }
                              placeholder="Share your experiences, ask for support, or offer encouragement to others...&#10;&#10;💚 Remember: This is a safe space. Be kind, be respectful, and be yourself."
                              rows={8}
                              maxLength={2000}
                              className="resize-none text-base border-2 focus:border-primary/50 transition-colors leading-relaxed"
                            />
                            <p className="text-xs text-muted-foreground">
                              Express yourself openly - your voice matters here
                            </p>
                          </div>

                          {/* Tips Section */}
                          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-primary/20 mt-0.5">
                                <Heart className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <h4 className="text-sm font-semibold text-foreground">
                                  Community Guidelines
                                </h4>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  <li>✓ Be respectful and supportive</li>
                                  <li>✓ Share authentically and honestly</li>
                                  <li>
                                    ✓ Respect others&#39; privacy and
                                    experiences
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-between items-center pt-2 border-t">
                            <div className="text-xs text-muted-foreground">
                              {createPostMutation.isPending ? (
                                <span className="flex items-center gap-2">
                                  <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                  Posting...
                                </span>
                              ) : (
                                <span>Ready to share?</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsCreatePostOpen(false)}
                                disabled={createPostMutation.isPending}
                                className="border-2"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleCreatePost}
                                disabled={
                                  createPostMutation.isPending ||
                                  !newPostTitle.trim() ||
                                  !newPostContent.trim()
                                }
                                className={cn(
                                  "gap-2 shadow-lg min-w-[120px]",
                                  config.features.advancedTheming
                                    ? "bg-primary hover:bg-primary/90 shadow-primary/20"
                                    : "bg-blue-600 hover:bg-blue-700"
                                )}
                              >
                                {createPostMutation.isPending ? (
                                  <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Posting...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4" />
                                    Share Post
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Tabs with Posts and Sessions */}
                <RoomContentTabs
                  postsContent={postsContent}
                  communityId={selectedCommunityId}
                  roomId={selectedRoomId}
                  canCreateSession={canCreateSession}
                  className="flex-1"
                />
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden flex flex-col h-full">
        <div className="bg-white border-b p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsSidebarOpen(true);
              }}
            >
              <Hash className="h-4 w-4 mr-1" />
              {selectedCommunityId ? "Communities" : "Select Community"}
            </Button>
            {selectedRoom && (
              <span className="text-sm font-medium">/ {selectedRoom.name}</span>
            )}
          </div>
        </div>

        {!selectedRoomId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-4">
              <h2 className="text-2xl font-bold mb-2">
                {config.messages.welcomeTitle}
              </h2>
              <p className="text-muted-foreground">
                {config.messages.welcomeDescription}
              </p>
            </div>
          </div>
        ) : (
          <RoomContentTabs
            postsContent={postsContent}
            communityId={selectedCommunityId}
            roomId={selectedRoomId}
            canCreateSession={canCreateSession}
            className="flex-1"
          />
        )}
      </div>
    </main>
  );
}
