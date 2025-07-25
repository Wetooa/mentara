"use client";

import React, { useState, useMemo } from "react";
import { useAdminReports, useReportActions } from "@/hooks/admin";
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
  Eye,
  Ban,
  ShieldAlert,
  Check,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { da } from "date-fns/locale";

export function ReportedContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "ban" | "restrict" | "dismiss" | "suspend" | null
  >(null);

  // API hooks
  const {
    data: reportsData,
    isLoading,
    error,
  } = useAdminReports({
    search: searchTerm || undefined,
  });
  const {
    banUser,
    restrictUser,
    deleteContent,
    dismissReport,
    isLoading: isActionLoading,
  } = useReportActions();

  const reports = reportsData?.reports || [];
  const totalCount = reportsData?.pagination?.total || 0;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a");
    } catch {
      return dateString;
    }
  };

  const filteredReports = useMemo(() => {
    if (!searchTerm.trim()) return reports;

    const searchLower = searchTerm.toLowerCase();
    return reports.filter(
      (report: any) =>
        report.reportedUserName?.toLowerCase().includes(searchLower) ||
        report.reporterName?.toLowerCase().includes(searchLower) ||
        report.reason?.toLowerCase().includes(searchLower) ||
        report.type?.toLowerCase().includes(searchLower) ||
        report.postTitle?.toLowerCase().includes(searchLower) ||
        report.commentContent?.toLowerCase().includes(searchLower)
    );
  }, [reports, searchTerm]);

  const handleReportAction = (
    type: "ban" | "restrict" | "dismiss" | "suspend"
  ) => {
    setActionType(type);
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedReport || !actionType) return;

    try {
      switch (actionType) {
        case "ban":
          await banUser(
            selectedReport.id,
            "User banned due to reported content"
          );
          break;
        case "restrict":
          await restrictUser(
            selectedReport.id,
            "User restricted due to reported content"
          );
          break;
        case "dismiss":
          await dismissReport(selectedReport.id, "Report dismissed by admin");
          break;
        case "suspend":
          // For therapists, we use restrict functionality
          await restrictUser(
            selectedReport.id,
            "Therapist suspended due to reported content"
          );
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
      case "reviewed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Resolved
          </Badge>
        );
      case "dismissed":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Dismissed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-6 text-red-500">
          Error loading reports: {error.message}
        </div>
      </div>
    );
  }

  function logFormDowntown(data: any) {
    console.log("Logging: ", data);
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and take action on reported content
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

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-blue-600">Total Reports</p>
            <h3 className="text-2xl font-bold mt-1">
              {isLoading ? "..." : totalCount}
            </h3>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-100">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-yellow-600">Pending</p>
            <h3 className="text-2xl font-bold mt-1">
              {isLoading
                ? "..."
                : reports.filter((r: any) => r.status === "pending").length}
            </h3>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-green-600">Resolved</p>
            <h3 className="text-2xl font-bold mt-1">
              {isLoading
                ? "..."
                : reports.filter(
                    (r: any) =>
                      r.status === "resolved" || r.status === "reviewed"
                  ).length}
            </h3>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-red-600">Critical</p>
            <h3 className="text-2xl font-bold mt-1">
              {isLoading
                ? "..."
                : reports.filter(
                    (r: any) =>
                      r.reason?.toLowerCase().includes("harassment") ||
                      r.reason?.toLowerCase().includes("impersonation")
                  ).length}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>All Reports</CardTitle>
          <CardDescription>
            Review and manage all reported content on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Reports</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="therapists">Therapists</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading reports...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Reported User</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report: any) => (
                      <TableRow key={report.id}>
                        {logFormDowntown(report)}
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {report.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{report.reporterName}</TableCell>
                        <TableCell>
                          {report.reportedUserName}
                          {report.reportedUserIsTherapist && (
                            <Badge
                              variant="outline"
                              className="ml-2 bg-blue-50 text-blue-700"
                            >
                              Therapist
                            </Badge>
                          )}
                        </TableCell>
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
                            className="mr-2"
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
                          colSpan={7}
                          className="text-center py-6 text-gray-500"
                        >
                          No reports found matching your search criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="posts">
              {isLoading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading reports...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports
                      .filter((r: any) => r.type === "post")
                      .map((report: any) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.reporterName}</TableCell>
                          <TableCell>{report.reportedUserName}</TableCell>
                          <TableCell>{report.reason}</TableCell>
                          <TableCell>
                            {formatDate(report.dateReported)}
                          </TableCell>
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
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="comments">
              {isLoading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading reports...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports
                      .filter((r: any) => r.type === "comment")
                      .map((report: any) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.reporterName}</TableCell>
                          <TableCell>{report.reportedUserName}</TableCell>
                          <TableCell>{report.reason}</TableCell>
                          <TableCell>
                            {formatDate(report.dateReported)}
                          </TableCell>
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
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="users">
              {isLoading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading reports...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Reported User</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports
                      .filter((r: any) => r.type === "user")
                      .map((report: any) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.reporterName}</TableCell>
                          <TableCell>{report.reportedUserName}</TableCell>
                          <TableCell>{report.reason}</TableCell>
                          <TableCell>
                            {formatDate(report.dateReported)}
                          </TableCell>
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
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="therapists">
              {isLoading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading reports...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Therapist</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports
                      .filter((r: any) => r.type === "therapist")
                      .map((report: any) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.reporterName}</TableCell>
                          <TableCell>{report.reportedUserName}</TableCell>
                          <TableCell>{report.reason}</TableCell>
                          <TableCell>
                            {formatDate(report.dateReported)}
                          </TableCell>
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
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Report Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Review the details of this report and take appropriate action
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Report Type
                  </h3>
                  <p className="mt-1 capitalize">{selectedReport.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="mt-1">
                    {getStatusBadge(selectedReport.status)}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Reported By
                  </h3>
                  <p className="mt-1">{selectedReport.reporterName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Reported User
                  </h3>
                  <p className="mt-1">
                    {selectedReport.reportedUserName}
                    {selectedReport.reportedUserIsTherapist && (
                      <Badge
                        variant="outline"
                        className="ml-2 bg-blue-50 text-blue-700"
                      >
                        Therapist
                      </Badge>
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reason</h3>
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
                  Description
                </h3>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">
                  {selectedReport.description}
                </p>
              </div>

              {selectedReport.content && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Reported Content
                  </h3>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                    {selectedReport.content}
                  </div>
                </div>
              )}

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
                          <Check className="h-4 w-4 mr-1" />
                          Dismiss Report
                        </Button>

                        {selectedReport.type === "therapist" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-amber-600 border-amber-200 hover:bg-amber-50"
                            onClick={() => handleReportAction("suspend")}
                            disabled={isActionLoading}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Suspend Therapist
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-amber-600 border-amber-200 hover:bg-amber-50"
                              onClick={() => handleReportAction("restrict")}
                              disabled={isActionLoading}
                            >
                              <ShieldAlert className="h-4 w-4 mr-1" />
                              Restrict User
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleReportAction("ban")}
                              disabled={isActionLoading}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Ban User
                            </Button>
                          </>
                        )}
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
              {actionType === "ban" && "Ban User"}
              {actionType === "restrict" && "Restrict User"}
              {actionType === "dismiss" && "Dismiss Report"}
              {actionType === "suspend" && "Suspend Therapist"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "ban" &&
                "This will permanently ban the user from using the platform. Their account will be deactivated and they will not be able to log in."}
              {actionType === "restrict" &&
                "This will restrict the user's ability to post or comment for 30 days."}
              {actionType === "dismiss" &&
                "This will dismiss the report and no action will be taken against the reported user."}
              {actionType === "suspend" &&
                "This will temporarily suspend the therapist's account pending further investigation."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={isActionLoading}
              className={
                actionType === "ban"
                  ? "bg-red-600 hover:bg-red-700"
                  : actionType === "restrict"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : actionType === "suspend"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : ""
              }
            >
              {isActionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
