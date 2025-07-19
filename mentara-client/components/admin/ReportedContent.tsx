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

// Mock data for reported content
const mockReports = [
  {
    id: "rep1",
    type: "post",
    reportedItemId: "post123",
    reporterName: "John Doe",
    reporterId: "user123",
    reportedUserName: "Sarah Miller",
    reportedUserId: "user456",
    reason: "Harassment",
    description:
      "This post contains targeted harassment against a community member.",
    dateReported: "2025-04-29T14:22:00Z",
    status: "pending",
    content:
      "This is the content of the reported post which contains some harmful text that was reported by a user.",
    reportedUserIsTherapist: false,
  },
  {
    id: "rep2",
    type: "comment",
    reportedItemId: "comment456",
    reporterName: "Emily Chen",
    reporterId: "user789",
    reportedUserName: "Mark Johnson",
    reportedUserId: "user101",
    reason: "Inappropriate content",
    description:
      "Comment contains inappropriate language not suitable for the platform.",
    dateReported: "2025-04-28T09:15:00Z",
    status: "resolved",
    content:
      "This is the reported comment content that was flagged for inappropriate language.",
    reportedUserIsTherapist: false,
  },
  {
    id: "rep3",
    type: "user",
    reportedItemId: "user555",
    reporterName: "Amanda Wilson",
    reporterId: "user222",
    reportedUserName: "Kevin Smith",
    reportedUserId: "user555",
    reason: "Impersonation",
    description: "This user is impersonating a licensed therapist.",
    dateReported: "2025-04-30T11:30:00Z",
    status: "pending",
    content: "",
    reportedUserIsTherapist: false,
  },
  {
    id: "rep4",
    type: "therapist",
    reportedItemId: "therapist789",
    reporterName: "Lisa Park",
    reporterId: "user333",
    reportedUserName: "Dr. Robert Thompson",
    reportedUserId: "therapist789",
    reason: "Unprofessional conduct",
    description: "The therapist was rude and dismissive during our session.",
    dateReported: "2025-04-27T16:45:00Z",
    status: "pending",
    content: "",
    reportedUserIsTherapist: true,
  },
  {
    id: "rep5",
    type: "post",
    reportedItemId: "post789",
    reporterName: "Michael Brown",
    reporterId: "user444",
    reportedUserName: "Jennifer Lee",
    reportedUserId: "user777",
    reason: "Misinformation",
    description: "This post contains dangerous health misinformation.",
    dateReported: "2025-04-26T13:10:00Z",
    status: "pending",
    content:
      "This is the content of the post that contains potentially misleading health information.",
    reportedUserIsTherapist: false,
  },
];

export function ReportedContent() {
  const [reports, setReports] = useState(mockReports);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<{
    id: string;
    type: string;
    reportedItemId: string;
    reporterName: string;
    reporterId: string;
    reportedUserName: string;
    reportedUserId: string;
    reason: string;
    description: string;
    dateReported: string;
    status: string;
    content: string;
    reportedUserIsTherapist: boolean;
  } | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "ban" | "restrict" | "dismiss" | "suspend" | null
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
      report.reportedUserName.toLowerCase().includes(searchLower) ||
      report.reporterName.toLowerCase().includes(searchLower) ||
      report.reason.toLowerCase().includes(searchLower) ||
      report.type.toLowerCase().includes(searchLower)
    );
  });

  const handleReportAction = (
    type: "ban" | "restrict" | "dismiss" | "suspend"
  ) => {
    setActionType(type);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedReport || !actionType) return;

    // In a real application, you would make API calls to perform these actions
    const updatedReports = [...reports];
    const index = updatedReports.findIndex((r) => r.id === selectedReport.id);

    if (index !== -1) {
      updatedReports[index] = {
        ...updatedReports[index],
        status: "resolved",
      };

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
        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-red-600">Critical</p>
            <h3 className="text-2xl font-bold mt-1">
              {
                reports.filter(
                  (r) =>
                    r.reason.toLowerCase().includes("harassment") ||
                    r.reason.toLowerCase().includes("impersonation")
                ).length
              }
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
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
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
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="posts">
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
                    .filter((r) => r.type === "post")
                    .map((report) => (
                      <TableRow key={report.id}>
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
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="comments">
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
                    .filter((r) => r.type === "comment")
                    .map((report) => (
                      <TableRow key={report.id}>
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
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="users">
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
                    .filter((r) => r.type === "user")
                    .map((report) => (
                      <TableRow key={report.id}>
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
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="therapists">
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
                    .filter((r) => r.type === "therapist")
                    .map((report) => (
                      <TableRow key={report.id}>
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
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
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
                            >
                              <ShieldAlert className="h-4 w-4 mr-1" />
                              Restrict User
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
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
