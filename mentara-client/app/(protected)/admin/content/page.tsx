"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  FileText,
  MessageSquare,
  AlertTriangle,
  Search,
  Eye,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";
import Link from "next/link";
import { useAdminFlaggedContent, useAdminModerationReports } from "@/hooks/admin/useAdmin";

export default function ContentManagementPage() {
  const { data: flaggedContent, isLoading: loadingFlagged } = useAdminFlaggedContent({
    limit: 10,
  });

  const { data: moderationReports, isLoading: loadingReports } = useAdminModerationReports({
    limit: 10,
  });

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

  // Mock stats for content overview
  const contentStats = {
    totalPosts: 1247,
    totalComments: 3891,
    flaggedContent: 23,
    pendingReports: 8,
    resolvedToday: 12,
    avgResponseTime: "2.4h",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor and moderate community content across the platform
          </p>
        </div>
        <Link href="/admin/content/search">
          <Button className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Advanced Search
          </Button>
        </Link>
      </div>

      {/* Content Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.totalPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{contentStats.flaggedContent}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{contentStats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting moderation review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{contentStats.resolvedToday}</div>
            <p className="text-xs text-muted-foreground">
              Great progress today!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              Below 4h target ✓
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/reports">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">View Reports</p>
                  <p className="text-sm text-gray-500">Check moderation reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/content/search">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Content Search</p>
                  <p className="text-sm text-gray-500">Find specific content</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/reports/posts">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Post Reports</p>
                  <p className="text-sm text-gray-500">Review flagged posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/reports/comments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Comment Reports</p>
                  <p className="text-sm text-gray-500">Review flagged comments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Flagged Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Recent Flagged Content
          </CardTitle>
          <CardDescription>
            Content that requires immediate moderation attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingFlagged ? (
            <div className="text-center py-6 text-gray-500">Loading flagged content...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Flagged Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Mock data for demonstration */}
                <TableRow>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      <FileText className="h-3 w-3 mr-1" />
                      Post
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    Controversial medical advice regarding depression treatment...
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      Jennifer Lee
                    </div>
                  </TableCell>
                  <TableCell>{formatDate("2025-01-23T10:30:00Z")}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      Harmful Content
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Comment
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    You should stop taking your medication, it's not helping...
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      Michael Brown
                    </div>
                  </TableCell>
                  <TableCell>{formatDate("2025-01-23T14:45:00Z")}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      Medical Advice
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Comment
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    You're just being weak. If you were stronger mentally...
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      Anonymous User
                    </div>
                  </TableCell>
                  <TableCell>{formatDate("2025-01-23T16:20:00Z")}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      Harassment
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Moderation Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600" />
            Pending Moderation Reports
          </CardTitle>
          <CardDescription>
            Reports submitted by community members that need review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingReports ? (
            <div className="text-center py-6 text-gray-500">Loading moderation reports...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Content Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Mock data for demonstration */}
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      Sarah Miller
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      Post
                    </Badge>
                  </TableCell>
                  <TableCell>Spreading medical misinformation</TableCell>
                  <TableCell>{formatDate("2025-01-23T09:15:00Z")}</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Pending
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      Dr. Lisa Johnson
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                      Comment
                    </Badge>
                  </TableCell>
                  <TableCell>Inappropriate language and harassment</TableCell>
                  <TableCell>{formatDate("2025-01-23T11:30:00Z")}</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Pending
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}