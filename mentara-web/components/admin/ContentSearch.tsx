"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  MessageSquare,
  Eye,
  Flag,
  Trash2,
  Filter,
  UserX,
} from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for posts
const mockPosts = [
  {
    id: "post1",
    title: "Dealing with anxiety during social situations",
    content:
      "I've been struggling with social anxiety lately, especially in large group settings. Does anyone have tips for managing this?",
    authorName: "Sarah Miller",
    authorId: "user456",
    authorRole: "patient",
    authorAvatar: "https://ui-avatars.com/api/?name=Sarah+Miller",
    datePosted: "2025-04-25T09:15:00Z",
    commentCount: 8,
    likeCount: 24,
    isReported: false,
    community: "Anxiety Support",
  },
  {
    id: "post2",
    title: "Mindfulness techniques that actually work",
    content:
      "I've been practicing mindfulness for about 3 months now and wanted to share some techniques that have really helped me manage my stress levels.",
    authorName: "Dr. Lisa Johnson",
    authorId: "therapist123",
    authorRole: "therapist",
    authorAvatar: "https://ui-avatars.com/api/?name=Lisa+Johnson",
    datePosted: "2025-04-28T14:30:00Z",
    commentCount: 15,
    likeCount: 56,
    isReported: false,
    community: "Stress Management",
  },
  {
    id: "post3",
    title: "Feeling hopeless and don't know what to do",
    content:
      "I've been feeling extremely low for the past few weeks and nothing seems to help. I'm starting to lose hope that things will get better.",
    authorName: "John Doe",
    authorId: "user123",
    authorRole: "patient",
    authorAvatar: "https://ui-avatars.com/api/?name=John+Doe",
    datePosted: "2025-04-30T16:45:00Z",
    commentCount: 12,
    likeCount: 18,
    isReported: true,
    community: "Depression Support",
  },
  {
    id: "post4",
    title: "How to support a loved one with depression",
    content:
      "My partner was recently diagnosed with depression and I want to be as supportive as possible. Looking for advice from those who have experience.",
    authorName: "Emily Chen",
    authorId: "user789",
    authorRole: "patient",
    authorAvatar: "https://ui-avatars.com/api/?name=Emily+Chen",
    datePosted: "2025-05-01T11:20:00Z",
    commentCount: 9,
    likeCount: 32,
    isReported: false,
    community: "Supporting Loved Ones",
  },
  {
    id: "post5",
    title: "Recommended books for understanding trauma",
    content:
      "I'm looking for book recommendations that can help me understand trauma better. Any suggestions are welcome!",
    authorName: "Kevin Smith",
    authorId: "user555",
    authorRole: "patient",
    authorAvatar: "https://ui-avatars.com/api/?name=Kevin+Smith",
    datePosted: "2025-05-02T08:10:00Z",
    commentCount: 6,
    likeCount: 15,
    isReported: false,
    community: "Trauma Recovery",
  },
];

// Mock data for comments
const mockComments = [
  {
    id: "comment1",
    content:
      "I've found that deep breathing exercises really help when I'm in those situations. Try the 4-7-8 technique: breathe in for 4 seconds, hold for 7, exhale for 8.",
    authorName: "Dr. Lisa Johnson",
    authorId: "therapist123",
    authorRole: "therapist",
    authorAvatar: "https://ui-avatars.com/api/?name=Lisa+Johnson",
    datePosted: "2025-04-25T10:30:00Z",
    postId: "post1",
    postTitle: "Dealing with anxiety during social situations",
    likeCount: 12,
    isReported: false,
  },
  {
    id: "comment2",
    content:
      "Have you tried exposure therapy? Starting with small social interactions and gradually working your way up can help desensitize you to the anxiety.",
    authorName: "Emily Chen",
    authorId: "user789",
    authorRole: "patient",
    authorAvatar: "https://ui-avatars.com/api/?name=Emily+Chen",
    datePosted: "2025-04-25T11:45:00Z",
    postId: "post1",
    postTitle: "Dealing with anxiety during social situations",
    likeCount: 8,
    isReported: false,
  },
  {
    id: "comment3",
    content:
      "This post really speaks to me. I've been going through something similar and it's comforting to know I'm not alone.",
    authorName: "John Doe",
    authorId: "user123",
    authorRole: "patient",
    authorAvatar: "https://ui-avatars.com/api/?name=John+Doe",
    datePosted: "2025-04-30T17:20:00Z",
    postId: "post3",
    postTitle: "Feeling hopeless and don't know what to do",
    likeCount: 5,
    isReported: false,
  },
  {
    id: "comment4",
    content:
      "Have you tried talking to a professional? It sounds like you might benefit from some additional support right now.",
    authorName: "Dr. Lisa Johnson",
    authorId: "therapist123",
    authorRole: "therapist",
    authorAvatar: "https://ui-avatars.com/api/?name=Lisa+Johnson",
    datePosted: "2025-04-30T18:05:00Z",
    postId: "post3",
    postTitle: "Feeling hopeless and don't know what to do",
    likeCount: 9,
    isReported: false,
  },
  {
    id: "comment5",
    content:
      "This is completely useless advice. Maybe try actually being helpful next time.",
    authorName: "Michael Brown",
    authorId: "user789",
    authorRole: "patient",
    authorAvatar: "https://ui-avatars.com/api/?name=Michael+Brown",
    datePosted: "2025-04-28T16:15:00Z",
    postId: "post2",
    postTitle: "Mindfulness techniques that actually work",
    likeCount: 0,
    isReported: true,
  },
];

interface PostItem {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorId: string;
  authorRole: string;
  authorAvatar: string;
  datePosted: string;
  commentCount: number;
  likeCount: number;
  isReported: boolean;
  community: string;
}

interface CommentItem {
  id: string;
  content: string;
  authorName: string;
  authorId: string;
  authorRole: string;
  authorAvatar: string;
  datePosted: string;
  postId: string;
  postTitle: string;
  likeCount: number;
  isReported: boolean;
}

type ContentItem = PostItem | CommentItem;

export function ContentSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contentType, setContentType] = useState("posts");
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "delete" | "report" | "ban" | null
  >(null);
  const [communityFilter, setCommunityFilter] = useState("all");
  const [contentSource, setContentSource] = useState(
    contentType === "posts" ? mockPosts : mockComments
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a");
    } catch {
      return dateString;
    }
  };

  // Update content source when tab changes
  React.useEffect(() => {
    setContentSource(contentType === "posts" ? mockPosts : mockComments);
  }, [contentType]);

  const filteredContent = contentSource.filter((item) => {
    const searchLower = searchTerm.toLowerCase();

    if (contentType === "posts") {
      const post = item as (typeof mockPosts)[0];
      const matchesSearch =
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.authorName.toLowerCase().includes(searchLower) ||
        post.community.toLowerCase().includes(searchLower);

      const matchesCommunity =
        communityFilter === "all" || post.community === communityFilter;

      return matchesSearch && matchesCommunity;
    } else {
      const comment = item as (typeof mockComments)[0];
      const matchesSearch =
        comment.content.toLowerCase().includes(searchLower) ||
        comment.authorName.toLowerCase().includes(searchLower) ||
        comment.postTitle.toLowerCase().includes(searchLower);

      return matchesSearch;
    }
  });

  const handleContentAction = (type: "delete" | "report" | "ban") => {
    setActionType(type);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedContent || !actionType) return;

    // In a real application, you would make API calls to perform these actions
    // For now, we'll just update our local state
    if (actionType === "delete") {
      if (contentType === "posts") {
        setContentSource(
          mockPosts.filter((post) => post.id !== selectedContent.id)
        );
      } else {
        setContentSource(
          mockComments.filter((comment) => comment.id !== selectedContent.id)
        );
      }
    }

    setActionDialogOpen(false);
    setDetailsOpen(false);
  };

  // Get unique communities from posts for the filter
  const communities = [
    "all",
    ...Array.from(new Set(mockPosts.map((post) => post.community))),
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Search</h1>
          <p className="text-sm text-gray-500 mt-1">
            Search and manage posts and comments across the platform
          </p>
        </div>
        <div className="relative w-[400px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={`Search ${contentType}...`}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Content Management</CardTitle>
          <CardDescription>
            Search, review, and moderate content across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="posts"
            value={contentType}
            onValueChange={(value) => {
              setContentType(value);
              setSearchTerm("");
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>

              {contentType === "posts" && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Community:</span>
                  <Select
                    value={communityFilter}
                    onValueChange={setCommunityFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by community" />
                    </SelectTrigger>
                    <SelectContent>
                      {communities.map((community) => (
                        <SelectItem key={community} value={community}>
                          {community === "all" ? "All Communities" : community}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <TabsContent value="posts" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Community</TableHead>
                    <TableHead>Date Posted</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.map((post) => {
                    // Type guard to ensure we're working with a post
                    const isPost = (item: ContentItem): item is PostItem => 
                      'title' in item;
                    
                    if (!isPost(post)) return null;
                    
                    return (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">
                        {post.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100">
                            <Image
                              src={post.authorAvatar}
                              alt={post.authorName}
                              className="w-full h-full object-cover"
                              width={24}
                              height={24}
                            />
                          </div>
                          <span>{post.authorName}</span>
                          {post.authorRole === "therapist" && (
                            <Badge
                              variant="outline"
                              className="ml-1 bg-blue-50 text-blue-700"
                            >
                              Therapist
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{post.community}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(post.datePosted)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-sm flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5 text-gray-500" />
                            {post.commentCount}
                          </span>
                          {post.isReported && (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                              Reported
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedContent(post);
                            setDetailsOpen(true);
                          }}
                          className="mr-2"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                  {filteredContent.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-gray-500"
                      >
                        No posts found matching your search criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Comment</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>On Post</TableHead>
                    <TableHead>Date Posted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.map((comment: ContentItem) => {
                    // Type guard to ensure we're working with a comment
                    const isComment = (item: ContentItem): item is CommentItem => 
                      'postTitle' in item;
                    
                    if (!isComment(comment)) return null;
                    
                    return (
                    <TableRow key={comment.id}>
                      <TableCell className="max-w-sm truncate">
                        {comment.content}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100">
                            <Image
                              src={comment.authorAvatar}
                              alt={comment.authorName}
                              className="w-full h-full object-cover"
                              width={24}
                              height={24}
                            />
                          </div>
                          <span>{comment.authorName}</span>
                          {comment.authorRole === "therapist" && (
                            <Badge
                              variant="outline"
                              className="ml-1 bg-blue-50 text-blue-700"
                            >
                              Therapist
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="truncate max-w-[200px]">
                        {comment.postTitle}
                      </TableCell>
                      <TableCell>{formatDate(comment.datePosted)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedContent(comment);
                            setDetailsOpen(true);
                          }}
                          className="mr-2"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                  {filteredContent.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-gray-500"
                      >
                        No comments found matching your search criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Content Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {contentType === "posts" ? "Post Details" : "Comment Details"}
            </DialogTitle>
            <DialogDescription>
              Review content and take moderation actions if necessary
            </DialogDescription>
          </DialogHeader>

          {selectedContent && (
            <div className="space-y-4">
              {contentType === "posts" && 'title' in selectedContent && (
                <>
                  <div className="border-b pb-2">
                    <h2 className="text-lg font-semibold">
                      {selectedContent.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Badge variant="outline">
                        {selectedContent.community}
                      </Badge>
                      <span>•</span>
                      <span>{formatDateTime(selectedContent.datePosted)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="whitespace-pre-line">
                      {selectedContent.content}
                    </p>
                  </div>
                </>
              )}

              {contentType === "comments" && 'postTitle' in selectedContent && (
                <>
                  <div className="border-b pb-2">
                    <h2 className="text-md font-medium">
                      Comment on: {selectedContent.postTitle}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span>{formatDateTime(selectedContent.datePosted)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="whitespace-pre-line">
                      {selectedContent.content}
                    </p>
                  </div>
                </>
              )}

              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                    <Image
                      src={selectedContent.authorAvatar}
                      alt={selectedContent.authorName}
                      className="w-full h-full object-cover"
                      width={32}
                      height={32}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{selectedContent.authorName}</p>
                    <p className="text-sm text-gray-500 capitalize flex items-center">
                      {selectedContent.authorRole}
                      {selectedContent.authorRole === "therapist" && (
                        <Badge
                          variant="outline"
                          className="ml-2 bg-blue-50 text-blue-700"
                        >
                          Therapist
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Moderation Actions
                  </h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleContentAction("delete")}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Content
                    </Button>

                    {!selectedContent.isReported && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        onClick={() => handleContentAction("report")}
                      >
                        <Flag className="h-4 w-4 mr-1" />
                        Flag Content
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleContentAction("ban")}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Ban User
                    </Button>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "delete" && "Delete Content"}
              {actionType === "report" && "Flag Content"}
              {actionType === "ban" && "Ban User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "delete" &&
                `Are you sure you want to delete this ${contentType === "posts" ? "post" : "comment"}? This action cannot be undone.`}
              {actionType === "report" &&
                `This will flag the ${contentType === "posts" ? "post" : "comment"} for review by the moderation team.`}
              {actionType === "ban" &&
                `This will ban ${selectedContent?.authorName} from the platform. Their account will be deactivated and they will not be able to log in.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionType === "delete" || actionType === "ban"
                  ? "bg-red-600 hover:bg-red-700"
                  : actionType === "report"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : ""
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
