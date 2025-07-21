"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useUpdateTherapistApplicationStatus,
} from "@/hooks/useTherapistApplications";
// Backend-specific type that matches actual API response
interface BackendTherapistApplication {
  id: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submissionDate: string;
  processingDate?: string;
  mobile: string;
  province: string;
  providerType: string;
  professionalLicenseType?: string;
  isPRCLicensed?: string;
  prcLicenseNumber?: string;
  expirationDateOfLicense?: string;
  isLicenseActive?: string;
  yearsOfExperience?: number;
  areasOfExpertise: string[];
  languagesOffered: string[];
  assessmentTools?: string[];
  therapeuticApproachesUsedList?: string[];
  providedOnlineTherapyBefore?: string;
  comfortableUsingVideoConferencing?: string;
  weeklyAvailability?: string;
  preferredSessionLength?: string;
  accepts?: string[];
  privateConfidentialSpace?: string;
  compliesWithDataPrivacyAct?: string;
  professionalLiabilityInsurance?: string;
  complaintsOrDisciplinaryActions?: string;
  willingToAbideByPlatformGuidelines?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  };
}
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

// Import icons
import {
  FileIcon,
  FileTextIcon,
  ImageIcon,
  FileArchiveIcon,
  ExternalLinkIcon,
  DownloadIcon,
  XIcon,
  CheckIcon,
} from "lucide-react";

interface ApplicationFile {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

interface TherapistApplicationDetailsProps {
  application: BackendTherapistApplication & {
    files?: ApplicationFile[];
    uploadedDocuments?: Array<{
      fileName: string;
      fileType: string;
      fileUrl: string;
    }>;
  };
  onStatusChange?: (
    id: string,
    status: "approved" | "rejected" | "pending"
  ) => void;
}

export function TherapistApplicationDetails({
  application,
  onStatusChange,
}: TherapistApplicationDetailsProps) {
  // const [selectedFile, setSelectedFile] = useState<{
  //   name: string;
  //   url: string;
  // } | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );


  // Use the React Query hook for updating application status
  const { mutate: updateStatus, isPending } = useUpdateTherapistApplicationStatus();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  // Helper function to render Yes/No responses with appropriate styling
  const renderYesNo = (value: string) => {
    if (value?.toLowerCase() === "yes") {
      return <span className="text-green-600 font-medium">Yes</span>;
    } else if (value?.toLowerCase() === "no") {
      return <span className="text-red-600 font-medium">No</span>;
    }
    return value || "N/A";
  };

  // Helper function to render object with boolean values or array of strings
  const renderObjectItems = (
    data: { [key: string]: boolean } | string[] | null | undefined
  ) => {
    if (!data) {
      return <span className="text-gray-500 italic">None</span>;
    }

    // Handle array of strings
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return <span className="text-gray-500 italic">None</span>;
      }

      return (
        <div className="flex flex-wrap gap-2">
          {data.map((item, index) => (
            <Badge key={index} variant="outline" className="capitalize">
              {item.replace(/-/g, " ")}
            </Badge>
          ))}
        </div>
      );
    }

    // Handle object with boolean values
    if (typeof data === "object") {
      const items = Object.entries(data)
        .filter(([, value]) => value)
        .map(([key]) => key.replace(/-/g, " "));

      if (items.length === 0) {
        return <span className="text-gray-500 italic">None</span>;
      }

      return (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge key={index} variant="outline" className="capitalize">
              {item}
            </Badge>
          ))}
        </div>
      );
    }

    return <span className="text-gray-500 italic">None</span>;
  };

  // Get appropriate icon for file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FileTextIcon className="w-5 h-5 text-red-500" />;
    } else if (fileType.includes("image")) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    } else if (fileType.includes("zip") || fileType.includes("archive")) {
      return <FileArchiveIcon className="w-5 h-5 text-yellow-500" />;
    } else {
      return <FileIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  // Handle protected file access with authentication
  const handleFileAccess = async (
    fileUrl: string,
    action: "view" | "download" = "view"
  ) => {
    try {
      // For protected file URLs, we need to handle authentication
      const response = await fetch(fileUrl, {
        credentials: "include", // Include auth cookies
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to access file");
      }

      // Create blob URL for viewing/downloading
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      if (action === "download") {
        // Trigger download
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileUrl.split("/").pop() || "file";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Open for viewing
        window.open(blobUrl, "_blank");
      }

      // Clean up blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error("Error accessing file:", error);
      toast.error("Failed to access file. Please try again.");
    }
  };

  // Render uploaded documents using both new files format and legacy uploadedDocuments
  const renderUploadedDocuments = () => {
    const files = application.files || [];
    const legacyDocs = application.uploadedDocuments || [];

    if (files.length === 0 && legacyDocs.length === 0) {
      return <p className="text-gray-500 italic">No documents uploaded</p>;
    }

    return (
      <div className="grid grid-cols-1 gap-2">
        {/* Render new files format */}
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {getFileIcon(file.fileName)}
              <div>
                <span className="block">{file.fileName}</span>
                <span className="text-sm text-gray-500">
                  Uploaded: {format(new Date(file.uploadedAt), "MMM dd, yyyy")}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleFileAccess(file.fileUrl, "view")}
              >
                <ExternalLinkIcon className="w-4 h-4" />
                <span>View</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleFileAccess(file.fileUrl, "download")}
              >
                <DownloadIcon className="w-4 h-4" />
                <span>Download</span>
              </Button>
            </div>
          </div>
        ))}

        {/* Render legacy uploadedDocuments format for backward compatibility */}
        {legacyDocs.map((file, index) => (
          <div
            key={`legacy-${index}`}
            className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {getFileIcon(file.fileType)}
              <span>{file.fileName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleFileAccess(file.fileUrl, "view")}
              >
                <ExternalLinkIcon className="w-4 h-4" />
                <span>View</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleFileAccess(file.fileUrl, "download")}
              >
                <DownloadIcon className="w-4 h-4" />
                <span>Download</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Handler for initiating approval/rejection
  const handleAction = (action: "approve" | "reject") => {
    setActionType(action);
    setConfirmationOpen(true);
  };

  // Handler for confirming action and updating status
  const confirmAction = async () => {
    if (!actionType || !onStatusChange) return;

    // Use the React Query hook to update application status
    updateStatus({
      applicationId: application.id,
      data: {
        status: actionType === "approve" ? "approved" : "rejected",
      },
    }, {
      onSuccess: () => {
        // Update the UI via the callback
        if (onStatusChange) {
          onStatusChange(
            application.id,
            actionType === "approve" ? "approved" : "rejected"
          );
        }
      },
      onSettled: () => {
        // Reset form state after mutation completes (success or error)
        setConfirmationOpen(false);
        setActionType(null);
      },
    });
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Application Details</CardTitle>
          <Badge
            className={
              application.status === "approved"
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : application.status === "rejected"
                  ? "bg-red-100 text-red-700 hover:bg-red-100"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
            }
          >
            {application.status?.charAt(0).toUpperCase() +
              application.status?.slice(1) || "Unknown"}
          </Badge>
        </div>
        <p className="text-sm text-gray-500">
          Submitted on {formatDate(application.createdAt)}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="personal">
          <TabsList className="w-full">
            <TabsTrigger value="personal" className="flex-1">
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex-1">
              Professional Info
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex-1">
              Practice Details
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex-1">
              Compliance
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex-1">
              Documents
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-450px)] mt-4 pr-4">
            <TabsContent value="personal" className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    First Name
                  </h3>
                  <p className="mt-1">{application.user.firstName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Last Name
                  </h3>
                  <p className="mt-1">{application.user.lastName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1">{application.user.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Mobile</h3>
                  <p className="mt-1">{application.mobile}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Province
                  </h3>
                  <p className="mt-1">{application.province}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="professional" className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Provider Type
                  </h3>
                  <p className="mt-1">{application.providerType || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Professional License Type
                  </h3>
                  <p className="mt-1">{application.professionalLicenseType || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    PRC Licensed
                  </h3>
                  <p className="mt-1">
                    {renderYesNo(application.isPRCLicensed)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    PRC License Number
                  </h3>
                  <p className="mt-1">{application.prcLicenseNumber || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    License Expiration Date
                  </h3>
                  <p className="mt-1">
                    {formatDate(application.expirationDateOfLicense)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    License Active
                  </h3>
                  <p className="mt-1">
                    {renderYesNo(application.isLicenseActive)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Years of Experience
                  </h3>
                  <p className="mt-1">{application.yearsOfExperience}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Areas of Expertise
                </h3>
                {renderObjectItems(application.areasOfExpertise)}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Assessment Tools
                </h3>
                {renderObjectItems(application.assessmentTools)}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Therapeutic Approaches
                </h3>
                {renderObjectItems(application.therapeuticApproachesUsedList)}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Languages Offered
                </h3>
                {renderObjectItems(application.languagesOffered)}
              </div>
            </TabsContent>

            <TabsContent value="practice" className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Provided Online Therapy Before
                  </h3>
                  <p className="mt-1">
                    {renderYesNo(application.providedOnlineTherapyBefore)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Comfortable Using Video Conferencing
                  </h3>
                  <p className="mt-1">
                    {renderYesNo(application.comfortableUsingVideoConferencing)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Weekly Availability (hours)
                  </h3>
                  <p className="mt-1">{application.weeklyAvailability}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Preferred Session Length (minutes)
                  </h3>
                  <p className="mt-1">{application.preferredSessionLength}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Accepts
                </h3>
                {renderObjectItems(application.accepts)}
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Has Private Confidential Space
                  </h3>
                  <p className="mt-1">
                    {renderYesNo(application.privateConfidentialSpace)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Complies With Data Privacy Act
                  </h3>
                  <p className="mt-1">
                    {renderYesNo(application.compliesWithDataPrivacyAct)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Professional Liability Insurance
                  </h3>
                  <p className="mt-1">
                    {renderYesNo(application.professionalLiabilityInsurance)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Complaints Or Disciplinary Actions
                  </h3>
                  <p className="mt-1">
                    {renderYesNo(application.complaintsOrDisciplinaryActions)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Willing To Abide By Platform Guidelines
                  </h3>
                  <p className="mt-1">
                    {renderYesNo(
                      application.willingToAbideByPlatformGuidelines
                    )}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-2">
              {renderUploadedDocuments()}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>

      {/* Add Card Footer with approval/rejection buttons */}
      {application.status === "pending" && onStatusChange && (
        <div className="border-t pt-4 px-6 pb-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <p>
                Please review the application carefully before making a
                decision.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => handleAction("reject")}
                disabled={isPending}
              >
                <XIcon className="w-4 h-4 mr-2" />
                Reject Application
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleAction("approve")}
                disabled={isPending}
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                Approve Application
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve"
                ? "Approve Application"
                : "Reject Application"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve"
                ? `Are you sure you want to approve ${application.user.firstName} ${application.user.lastName}'s application? This will allow them to start using the platform as a therapist.`
                : `Are you sure you want to reject ${application.user.firstName} ${application.user.lastName}'s application? They will be notified via email.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={isPending}
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isPending ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span>{actionType === "approve" ? "Approve" : "Reject"}</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
