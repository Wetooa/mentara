"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Eye,
  FileText,
  MessageSquare,
  User,
} from "lucide-react";
import { Post, Comment, Community } from "@/types/api/communities";

// Mock data for search results
const mockPosts = [
  {
    id: "post123",
    title: "Feeling overwhelmed with anxiety",
    content:
      "I've been struggling with anxiety lately and don't know how to cope...",
    authorName: "Sarah Miller",
    authorId: "user456",
    community: "Anxiety Support",
    date: "2025-04-15T14:22:00Z",
    type: "post",
    likes: 24,
    comments: 12,
  },
  {
    id: "post789",
    title: "Alternative treatment for depression",
    content:
      "I've found that certain herbs and supplements have completely cured my depression...",
    authorName: "Jennifer Lee",
    authorId: "user777",
    community: "Depression Support",
    date: "2025-04-26T13:10:00Z",
    type: "post",
    likes: 5,
    comments: 31,
  },
  {
    id: "post456",
    title: "Struggling with medication side effects",
    content:
      "The side effects of my medication are really difficult to deal with...",
    authorName: "Kevin Smith",
    authorId: "user555",
    community: "Medication Support",
    date: "2025-04-20T09:15:00Z",
    type: "post",
    likes: 18,
    comments: 7,
  },
];

const mockComments = [
  {
    id: "comment456",
    content:
      "You should stop taking your medication, it's not helping you anyway. Just try these herbal supplements instead.",
    postTitle: "Struggling with medication side effects",
    postId: "post123",
    authorName: "Michael Brown",
    authorId: "user789",
    date: "2025-05-01T10:15:00Z",
    type: "comment",
    likes: 1,
  },
  {
    id: "comment789",
    content:
      "This is completely useless advice. Maybe try actually being helpful next time.",
    postTitle: "Mindfulness techniques that actually work",
    postId: "post456",
    authorName: "Kevin Smith",
    authorId: "user123",
    date: "2025-04-29T15:30:00Z",
    type: "comment",
    likes: 0,
  },
  {
    id: "comment123",
    content:
      "You're just being weak. If you were stronger mentally you wouldn't have these problems.",
    postTitle: "Feeling overwhelmed with anxiety",
    postId: "post789",
    authorName: "Jennifer Lee",
    authorId: "user222",
    date: "2025-04-25T09:45:00Z",
    type: "comment",
    likes: 0,
  },
];

const mockUsers = [
  {
    id: "user123",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "user",
    registeredDate: "2025-01-15T10:30:00Z",
    postCount: 15,
    commentCount: 42,
    status: "active",
  },
  {
    id: "user456",
    name: "Sarah Miller",
    email: "sarah.miller@example.com",
    role: "user",
    registeredDate: "2025-02-20T14:45:00Z",
    postCount: 8,
    commentCount: 27,
    status: "active",
  },
  {
    id: "therapist123",
    name: "Dr. Lisa Johnson",
    email: "lisa.johnson@example.com",
    role: "therapist",
    registeredDate: "2025-03-10T09:15:00Z",
    postCount: 5,
    commentCount: 18,
    status: "active",
  },
];

export default function ContentSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [contentType, setContentType] = useState("all");
  const [timeRange, setTimeRange] = useState("all");
  const [community, setCommunity] = useState("all");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Filter content based on search and filters
  const filterContent = (items: Array<Post | Comment | Community>, type: string) => {
    return items.filter((item) => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const contentMatches =
        type === "post"
          ? item.title?.toLowerCase().includes(searchLower) ||
            item.content?.toLowerCase().includes(searchLower)
          : type === "comment"
            ? item.content?.toLowerCase().includes(searchLower) ||
              item.postTitle?.toLowerCase().includes(searchLower)
            : item.name?.toLowerCase().includes(searchLower) ||
              item.email?.toLowerCase().includes(searchLower);

      if (!contentMatches) return false;

      // Time range filter
      if (timeRange !== "all") {
        const now = new Date();
        const itemDate = new Date(item.date || item.registeredDate);
        const daysDiff = Math.floor(
          (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (timeRange === "last24h" && daysDiff > 1) return false;
        if (timeRange === "last7d" && daysDiff > 7) return false;
        if (timeRange === "last30d" && daysDiff > 30) return false;
      }

      // Community filter (only for posts and comments)
      if (community !== "all" && type !== "user") {
        if (item.community !== community) return false;
      }

      return true;
    });
  };

  const filteredPosts = filterContent(mockPosts, "post");
  const filteredComments = filterContent(mockComments, "comment");
  const filteredUsers = filterContent(mockUsers, "user");

  // Get combined results for "All" tab
  const getFilteredResults = () => {
    if (contentType === "posts" || activeTab === "posts") return filteredPosts;
    if (contentType === "comments" || activeTab === "comments")
      return filteredComments;
    if (contentType === "users" || activeTab === "users") return filteredUsers;

    // Combine all results for "all" tab
    return [...filteredPosts, ...filteredComments, ...filteredUsers];
  };

  const results = getFilteredResults();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Search</h1>
        <p className="text-sm text-gray-500 mt-1">
          Search and moderate content across the platform
        </p>
      </div>

      {/* Search bar and filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search for content..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="ml-2" disabled={!searchTerm}>
                Search
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium mr-2">Content Type:</span>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="posts">Posts</SelectItem>
                    <SelectItem value="comments">Comments</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">Time Range:</span>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="last24h">Last 24 hours</SelectItem>
                    <SelectItem value="last7d">Last 7 days</SelectItem>
                    <SelectItem value="last30d">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">Community:</span>
                <Select value={community} onValueChange={setCommunity}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All communities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All communities</SelectItem>
                    <SelectItem value="Anxiety Support">
                      Anxiety Support
                    </SelectItem>
                    <SelectItem value="Depression Support">
                      Depression Support
                    </SelectItem>
                    <SelectItem value="Medication Support">
                      Medication Support
                    </SelectItem>
                    <SelectItem value="Stress Management">
                      Stress Management
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* All results tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All Results</CardTitle>
              <CardDescription>
                {results.length} {results.length === 1 ? "result" : "results"}{" "}
                found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Author/User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.length > 0 ? (
                    results.slice(0, 10).map((item) => (
                      <TableRow key={`${item.type}-${item.id}`}>
                        <TableCell>
                          {item.type === "post" && (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              <FileText className="h-3 w-3 mr-1" />
                              Post
                            </Badge>
                          )}
                          {item.type === "comment" && (
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Comment
                            </Badge>
                          )}
                          {item.role && (
                            <Badge
                              className={`${
                                item.role === "therapist"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                              }`}
                            >
                              <User className="h-3 w-3 mr-1" />
                              {item.role === "therapist" ? "Therapist" : "User"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium max-w-[400px] truncate">
                          {item.title || item.content || item.name || ""}
                          {item.postTitle && (
                            <div className="text-xs text-gray-500 mt-1">
                              On post: {item.postTitle}
                            </div>
                          )}
                          {item.email && (
                            <div className="text-xs text-gray-500 mt-1">
                              {item.email}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.authorName || item.name || ""}
                        </TableCell>
                        <TableCell>
                          {formatDate(item.date || item.registeredDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-gray-500"
                      >
                        No results found matching your search criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Posts tab */}
        <TabsContent value="posts">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Posts</CardTitle>
              <CardDescription>
                {filteredPosts.length}{" "}
                {filteredPosts.length === 1 ? "post" : "posts"} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Community</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium max-w-[300px] truncate">
                          {post.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{post.community}</Badge>
                        </TableCell>
                        <TableCell>{post.authorName}</TableCell>
                        <TableCell>{formatDate(post.date)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2 text-xs text-gray-500">
                            <span>{post.likes} likes</span>
                            <span>•</span>
                            <span>{post.comments} comments</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments tab */}
        <TabsContent value="comments">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Comments</CardTitle>
              <CardDescription>
                {filteredComments.length}{" "}
                {filteredComments.length === 1 ? "comment" : "comments"} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Comment</TableHead>
                    <TableHead>On Post</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComments.length > 0 ? (
                    filteredComments.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell className="font-medium max-w-[300px] truncate">
                          {comment.content}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {comment.postTitle}
                        </TableCell>
                        <TableCell>{comment.authorName}</TableCell>
                        <TableCell>{formatDate(comment.date)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Users</CardTitle>
              <CardDescription>
                {filteredUsers.length}{" "}
                {filteredUsers.length === 1 ? "user" : "users"} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              user.role === "therapist"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                            }`}
                          >
                            {user.role === "therapist" ? "Therapist" : "User"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{formatDate(user.registeredDate)}</TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              user.status === "active"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                            }`}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-gray-500"
                      >
                        No users found matching your search criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
