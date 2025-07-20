"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Search, Eye, Flag, Trash2, Ban } from "lucide-react";
import { format } from "date-fns";

// Mock data for reported posts
const mockReportedPosts = [
  {
    id: "report1",
    postId: "post123",
    postTitle: "Feeling overwhelmed with anxiety",
    content:
      "I've been struggling with anxiety lately and don't know how to cope...",
    reporterName: "John Doe",
    reporterId: "user123",
    authorName: "Sarah Miller",
    authorId: "user456",
    reason: "Needs immediate attention",
    description:
      "This post indicates the user might need immediate professional help.",
    dateReported: "2025-05-02T14:22:00Z",
    status: "pending",
    community: "Anxiety Support",
  },
  {
    id: "report2",
    postId: "post789",
    postTitle: "Alternative treatment for depression",
    content:
      "I've found that certain herbs and supplements have completely cured my depression...",
    reporterName: "Michael Brown",
    reporterId: "user444",
    authorName: "Jennifer Lee",
    authorId: "user777",
    reason: "Misinformation",
    description:
      "This post contains potentially dangerous health misinformation.",
    dateReported: "2025-04-26T13:10:00Z",
    status: "pending",
    community: "Depression Support",
  },
  {
    id: "report3",
    postId: "post456",
    postTitle: "Struggling with medication side effects",
    content:
      "The side effects of my medication are really difficult to deal with...",
    reporterName: "Emily Chen",
    reporterId: "user789",
    authorName: "Kevin Smith",
    authorId: "user555",
    reason: "Potentially harmful advice",
    description:
      "There are comments suggesting dangerous medication practices.",
    dateReported: "2025-05-01T09:15:00Z",
    status: "resolved",
    community: "Medication Support",
  },
];

export default function ReportedPostsPage() {
  const [reports, setReports] = useState(mockReportedPosts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<typeof mockReportedPosts[0] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "delete" | "dismiss" | "ban" | null
  >(null);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a");
    } catch {
      return dateString;
    }
  };

  const filteredReports = reports.filter((report) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      report.postTitle.toLowerCase().includes(searchLower) ||
      report.authorName.toLowerCase().includes(searchLower) ||
      report.reporterName.toLowerCase().includes(searchLower) ||
      report.reason.toLowerCase().includes(searchLower) ||
      report.community.toLowerCase().includes(searchLower)
    );
  });

  const handleReportAction = (type: "delete" | "dismiss" | "ban") => {
    setActionType(type);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedReport || !actionType) return;

    // In a real application, you would make API calls to perform these actions
    if (actionType === "dismiss" || actionType === "delete") {
      const updatedReports = reports.map((report) =>
        report.id === selectedReport.id
          ? { ...report, status: "resolved" }
          : report
      );
      setReports(updatedReports);
    }

    setActionDialogOpen(false);
    setDetailsOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Resolved
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reported Posts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and moderate posts that have been reported by users
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search reports..."
            className="pl-10 w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-blue-600">Total Reports</p>
            <h3 className="text-2xl font-bold mt-1">{reports.length}</h3>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-100">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-yellow-600">Pending</p>
            <h3 className="text-2xl font-bold mt-1">
              {reports.filter((r) => r.status === "pending").length}
            </h3>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-green-600">Resolved</p>
            <h3 className="text-2xl font-bold mt-1">
              {reports.filter((r) => r.status === "resolved").length}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Reported Posts</CardTitle>
          <CardDescription>
            Review posts that have been reported by users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post Title</TableHead>
                <TableHead>Community</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {report.postTitle}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.community}</Badge>
                  </TableCell>
                  <TableCell>{report.reporterName}</TableCell>
                  <TableCell>{report.authorName}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>{formatDate(report.dateReported)}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setDetailsOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredReports.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-gray-500"
                  >
                    No reports found matching your search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Review the details of this reported post
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h2 className="text-lg font-semibold">
                  {selectedReport.postTitle}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <Badge variant="outline">{selectedReport.community}</Badge>
                  <span>•</span>
                  <span>Posted by {selectedReport.authorName}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Post Content
                </h3>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">
                  {selectedReport.content}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Reported By
                  </h3>
                  <p className="mt-1">{selectedReport.reporterName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="mt-1">
                    {getStatusBadge(selectedReport.status)}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Report Reason
                  </h3>
                  <p className="mt-1">{selectedReport.reason}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Date Reported
                  </h3>
                  <p className="mt-1">
                    {formatDate(selectedReport.dateReported)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Reporter&apos;s Description
                </h3>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">
                  {selectedReport.description}
                </p>
              </div>

              <div className="border-t pt-4 flex justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Take Action
                  </h3>
                  <div className="flex space-x-2">
                    {selectedReport.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleReportAction("dismiss")}
                        >
                          <Flag className="h-4 w-4 mr-1" />
                          Dismiss Report
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleReportAction("delete")}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete Post
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleReportAction("ban")}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Ban User
                        </Button>
                      </>
                    )}
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
              {actionType === "delete" && "Delete Post"}
              {actionType === "dismiss" && "Dismiss Report"}
              {actionType === "ban" && "Ban User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "delete" &&
                "Are you sure you want to delete this post? This action cannot be undone."}
              {actionType === "dismiss" &&
                "This will dismiss the report and no action will be taken against the post or its author."}
              {actionType === "ban" &&
                `This will ban ${selectedReport?.authorName} from the platform. Their account will be deactivated and they will not be able to log in.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionType === "delete" || actionType === "ban"
                  ? "bg-red-600 hover:bg-red-700"
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
