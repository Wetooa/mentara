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

// Mock data for reported comments
const mockReportedComments = [
  {
    id: "report1",
    commentId: "comment456",
    commentContent:
      "You should stop taking your medication, it's not helping you anyway. Just try these herbal supplements instead.",
    postTitle: "Struggling with medication side effects",
    postId: "post123",
    reporterName: "Dr. Lisa Johnson",
    reporterId: "therapist123",
    authorName: "Michael Brown",
    authorId: "user789",
    reason: "Dangerous medical advice",
    description:
      "This comment is recommending that users stop taking prescribed medication which could be harmful.",
    dateReported: "2025-05-01T10:15:00Z",
    status: "pending",
    community: "Medication Support",
  },
  {
    id: "report2",
    commentId: "comment789",
    commentContent:
      "This is completely useless advice. Maybe try actually being helpful next time.",
    postTitle: "Mindfulness techniques that actually work",
    postId: "post456",
    reporterName: "Emily Chen",
    reporterId: "user555",
    authorName: "Kevin Smith",
    authorId: "user123",
    reason: "Harassment",
    description:
      "This comment is unnecessarily hostile and attacking another user.",
    dateReported: "2025-04-29T15:30:00Z",
    status: "pending",
    community: "Stress Management",
  },
  {
    id: "report3",
    commentId: "comment123",
    commentContent:
      "You're just being weak. If you were stronger mentally you wouldn't have these problems.",
    postTitle: "Feeling overwhelmed with anxiety",
    postId: "post789",
    reporterName: "John Doe",
    reporterId: "user444",
    authorName: "Jennifer Lee",
    authorId: "user222",
    reason: "Stigmatizing language",
    description:
      "This comment stigmatizes mental health conditions and blames the user for their symptoms.",
    dateReported: "2025-04-25T09:45:00Z",
    status: "resolved",
    community: "Anxiety Support",
  },
];

export default function ReportedCommentsPage() {
  const [reports, setReports] = useState(mockReportedComments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<typeof mockReportedComments[0] | null>(null);
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
      report.commentContent.toLowerCase().includes(searchLower) ||
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
          <h1 className="text-2xl font-bold text-gray-900">
            Reported Comments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and moderate comments that have been reported by users
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
          <CardTitle>Reported Comments</CardTitle>
          <CardDescription>
            Review comments that have been reported by users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comment</TableHead>
                <TableHead>On Post</TableHead>
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
                    {report.commentContent}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {report.postTitle}
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
              Review the details of this reported comment
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h2 className="text-md font-semibold">
                  Comment on post: {selectedReport.postTitle}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <Badge variant="outline">{selectedReport.community}</Badge>
                  <span>•</span>
                  <span>Commented by {selectedReport.authorName}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Comment Content
                </h3>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">
                  {selectedReport.commentContent}
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
                          Delete Comment
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
              {actionType === "delete" && "Delete Comment"}
              {actionType === "dismiss" && "Dismiss Report"}
              {actionType === "ban" && "Ban User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "delete" &&
                "Are you sure you want to delete this comment? This action cannot be undone."}
              {actionType === "dismiss" &&
                "This will dismiss the report and no action will be taken against the comment or its author."}
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
