"use client";

import React, { useState, useMemo } from "react";
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
import { Search, Eye, Flag, Trash2, Ban, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAdminReports, useReportActions } from "@/hooks/admin";

export default function ReportedPostsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "delete" | "dismiss" | "ban" | "restrict" | null
  >(null);

  // API hooks
  const { data: reportsData, isLoading, error } = useAdminReports({
    type: 'post',
    search: searchTerm || undefined,
  });
  const { banUser, restrictUser, deleteContent, dismissReport, isLoading: isActionLoading } = useReportActions();

  const reports = (reportsData && typeof reportsData === 'object' && 'reports' in reportsData) ? (reportsData as any).reports : [];
  const totalCount = reportsData?.pagination?.total || 0;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a");
    } catch {
      return dateString;
    }
  };

  // Use useMemo for filtered reports (though API handles filtering, we keep this for client-side refinement)
  const filteredReports = useMemo(() => {
    if (!searchTerm.trim()) return reports;
    
    const searchLower = searchTerm.toLowerCase();
    return reports.filter((report: any) => 
      report.postTitle?.toLowerCase().includes(searchLower) ||
      report.reportedUserName?.toLowerCase().includes(searchLower) ||
      report.reporterName?.toLowerCase().includes(searchLower) ||
      report.reason?.toLowerCase().includes(searchLower) ||
      report.community?.toLowerCase().includes(searchLower)
    );
  }, [reports, searchTerm]);

  const handleReportAction = (type: "delete" | "dismiss" | "ban" | "restrict") => {
    setActionType(type);
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedReport || !actionType) return;

    try {
      switch (actionType) {
        case "ban":
          await banUser(selectedReport.id, "User banned due to reported content");
          break;
        case "restrict":
          await restrictUser(selectedReport.id, "User restricted due to reported content");
          break;
        case "delete":
          await deleteContent(selectedReport.id, "Content deleted due to report");
          break;
        case "dismiss":
          await dismissReport(selectedReport.id, "Report dismissed by admin");
          break;
      }
    } catch (error) {
      console.error("Failed to perform action:", error);
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
            <h3 className="text-2xl font-bold mt-1">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalCount}
            </h3>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-100">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-yellow-600">Pending</p>
            <h3 className="text-2xl font-bold mt-1">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : reports.filter((r: any) => r.status === "pending").length}
            </h3>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-green-600">Resolved</p>
            <h3 className="text-2xl font-bold mt-1">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : reports.filter((r: any) => r.status === "reviewed" || r.status === "dismissed").length}
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
          {error && (
            <div className="text-center py-6 text-red-500">
              Error loading reports: {error.message}
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-6">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-gray-500">Loading reports...</p>
            </div>
          ) : (
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
                {filteredReports.map((report: any) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {report.postTitle || 'Untitled Post'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.community || 'General'}</Badge>
                    </TableCell>
                    <TableCell>{report.reporterName}</TableCell>
                    <TableCell>{report.reportedUserName}</TableCell>
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
                        disabled={isActionLoading}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filteredReports.length === 0 && (
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
          )}
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
                  {selectedReport.postTitle || 'Untitled Post'}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <Badge variant="outline">{selectedReport.community || 'General'}</Badge>
                  <span>•</span>
                  <span>Posted by {selectedReport.reportedUserName}</span>
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
                          disabled={isActionLoading}
                        >
                          {isActionLoading && actionType === "dismiss" ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Flag className="h-4 w-4 mr-1" />
                          )}
                          Dismiss Report
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          onClick={() => handleReportAction("restrict")}
                          disabled={isActionLoading}
                        >
                          {isActionLoading && actionType === "restrict" ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Ban className="h-4 w-4 mr-1" />
                          )}
                          Restrict User
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleReportAction("delete")}
                          disabled={isActionLoading}
                        >
                          {isActionLoading && actionType === "delete" ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1" />
                          )}
                          Delete Post
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleReportAction("ban")}
                          disabled={isActionLoading}
                        >
                          {isActionLoading && actionType === "ban" ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Ban className="h-4 w-4 mr-1" />
                          )}
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
              {actionType === "restrict" && "Restrict User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "delete" &&
                "Are you sure you want to delete this post? This action cannot be undone."}
              {actionType === "dismiss" &&
                "This will dismiss the report and no action will be taken against the post or its author."}
              {actionType === "ban" &&
                `This will ban ${selectedReport?.reportedUserName} from the platform. Their account will be deactivated and they will not be able to log in.`}
              {actionType === "restrict" &&
                `This will restrict ${selectedReport?.reportedUserName} from posting and commenting. They will still be able to log in but with limited privileges.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionType === "delete" || actionType === "ban"
                  ? "bg-red-600 hover:bg-red-700"
                  : actionType === "restrict"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : ""
              }
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
