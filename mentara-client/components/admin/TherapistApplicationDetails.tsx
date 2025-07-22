"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUpdateTherapistApplicationStatus } from "@/hooks/useTherapistApplications";
import { FilePreviewModal } from "./FilePreviewModal";
// Backend-specific type that matches actual API response
export interface TherapistApplicationResponse {
  id: string;
  status: "APPROVED" | "REJECTED" | "PENDING";
  submittedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    birthDate: string | null;
    address: string | null;
    role: string;
    createdAt: string;
    updatedAt: string;
    password: string;
    emailVerified: boolean;
    emailVerifyToken: string | null;
    emailVerifyTokenExp: string | null;
    resetToken: string | null;
    resetTokenExpiry: string | null;
    isActive: boolean;
    isVerified: boolean;
    failedLoginCount: number;
    avatarUrl: string | null;
    coverImageUrl: string | null;
    bio: string | null;
    suspendedAt: string | null;
    suspendedBy: string | null;
    suspensionReason: string | null;
    deactivatedAt: string | null;
    deactivatedBy: string | null;
    deactivationReason: string | null;
    lastLoginAt: string | null;
    lockoutUntil: string | null;
    client: any | null;
  };
  application: {
    userId: string;
    mobile: string;
    province: string;
    timezone: string;
    status: "APPROVED" | "REJECTED" | "PENDING";
    submissionDate: string;
    processingDate: string | null;
    processedByAdminId: string | null;
    providerType: string;
    professionalLicenseType: string;
    isPRCLicensed: "Yes" | "No";
    prcLicenseNumber: string;
    expirationDateOfLicense: string;
    practiceStartDate: string;
    licenseVerified: boolean;
    licenseVerifiedAt: string | null;
    licenseVerifiedBy: string | null;
    certifications: string | null;
    certificateUrls: string[];
    certificateNames: string[];
    licenseUrls: string[];
    licenseNames: string[];
    documentUrls: string[];
    documentNames: string[];
    yearsOfExperience: number | null;
    educationBackground: string | null;
    specialCertifications: string[];
    practiceLocation: string | null;
    acceptsInsurance: boolean;
    acceptedInsuranceTypes: string[];
    areasOfExpertise: string[];
    assessmentTools: string[];
    therapeuticApproachesUsedList: string[];
    languagesOffered: string[];
    providedOnlineTherapyBefore: boolean;
    comfortableUsingVideoConferencing: boolean;
    preferredSessionLength: number[];
    privateConfidentialSpace: string | null;
    compliesWithDataPrivacyAct: boolean;
    professionalLiabilityInsurance: string | null;
    complaintsOrDisciplinaryActions: string | null;
    willingToAbideByPlatformGuidelines: boolean;
    expertise: string[];
    approaches: string[];
    languages: string[];
    illnessSpecializations: string[];
    acceptTypes: string[];
    treatmentSuccessRates: Record<string, any>;
    sessionLength: string;
    hourlyRate: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      middleName: string | null;
      lastName: string;
      birthDate: string | null;
      address: string | null;
      role: string;
      createdAt: string;
      updatedAt: string;
      password: string;
      emailVerified: boolean;
      emailVerifyToken: string | null;
      emailVerifyTokenExp: string | null;
      resetToken: string | null;
      resetTokenExpiry: string | null;
      isActive: boolean;
      isVerified: boolean;
      failedLoginCount: number;
      avatarUrl: string | null;
      coverImageUrl: string | null;
      bio: string | null;
      suspendedAt: string | null;
      suspendedBy: string | null;
      suspensionReason: string | null;
      deactivatedAt: string | null;
      deactivatedBy: string | null;
      deactivationReason: string | null;
      lastLoginAt: string | null;
      lockoutUntil: string | null;
      client: any | null;
    };
    processedByAdmin: any | null;
    assignedClients: any[];
    reviews: any[];
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
import { useRouter } from "next/navigation";

interface ApplicationFile {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

interface TherapistApplicationDetailsProps {
  application: TherapistApplicationResponse & {
    files?: ApplicationFile[];
    uploadedDocuments?: Array<{
      fileName: string;
      fileType: string;
      fileUrl: string;
    }>;
  };
  onStatusChange?: (
    id: string,
    status: "APPROVED" | "REJECTED" | "PENDING"
  ) => void;
}

export function TherapistApplicationDetails({
  application,
  onStatusChange,
}: TherapistApplicationDetailsProps) {
  console.log("TherapistApplicationDetails", application);

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [previewFile, setPreviewFile] = useState<{
    id: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  } | null>(null);

  // Use the React Query hook for updating application status
  const { mutate: updateStatus, isPending } =
    useUpdateTherapistApplicationStatus();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  // Helper function to render Yes/No responses with appropriate styling
  const renderYesNo = (value: boolean) => {
    if (value === true) {
      return <span className="text-green-600 font-medium">Yes</span>;
    } else {
      return <span className="text-red-600 font-medium">No</span>;
    }
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

  // Render uploaded documents using both new files format and legacy uploadedDocuments
  const renderUploadedDocuments = () => {
    const fileNames = application.application.documentNames || [];
    const fileLinks = application.application.documentUrls || [];

    if (fileNames.length === 0 && fileLinks.length === 0) {
      return <p className="text-gray-500 italic">No documents uploaded</p>;
    }

    // Combine the arrays into file objects
    const files = fileNames.map((fileName, index) => ({
      id: `doc-${index}`,
      fileName: fileName,
      fileUrl: fileLinks[index] || "",
      uploadedAt: application.application.createdAt, // Use application creation date as fallback
    }));

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
                onClick={() => window.open(file.fileUrl)}
              >
                <ExternalLinkIcon className="w-4 h-4" />
                <span>View</span>
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
    updateStatus(
      {
        applicationId: application.id,
        data: {
          status: actionType === "approve" ? "APPROVED" : "REJECTED",
        },
      },
      {
        onSuccess: () => {
          // Update the UI via the callback
          if (onStatusChange) {
            onStatusChange(
              application.id,
              actionType === "approve" ? "APPROVED" : "REJECTED"
            );
          }
        },
        onSettled: () => {
          // Reset form state after mutation completes (success or error)
          setConfirmationOpen(false);
          setActionType(null);
        },
      }
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <Badge
          className={
            application.status === "APPROVED"
              ? "bg-green-100 text-green-700 hover:bg-green-100"
              : application.status === "REJECTED"
                ? "bg-red-100 text-red-700 hover:bg-red-100"
                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
          }
        >
          {application.status?.charAt(0).toUpperCase() +
            application.status?.slice(1) || "Unknown"}
        </Badge>
        <p className="text-sm text-gray-500">
          Submitted on {formatDate(application.application.submissionDate)}
        </p>
      </div>
      <div>
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
                  <p className="mt-1">
                    {application.application.mobile || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Province
                  </h3>
                  <p className="mt-1">{application.application.province}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="professional" className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Provider Type
                  </h3>
                  <p className="mt-1">
                    {application.application.providerType || "Not specified"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Professional License Type
                  </h3>
                  <p className="mt-1">
                    {application.application.professionalLicenseType ||
                      "Not specified"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    PRC Licensed
                  </h3>
                  <p className="mt-1">
                    {application.application.isPRCLicensed}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    PRC License Number
                  </h3>
                  <p className="mt-1">
                    {application.application.prcLicenseNumber || "Not provided"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    License Expiration Date
                  </h3>
                  <p className="mt-1">
                    {formatDate(
                      application.application.expirationDateOfLicense
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    License Active
                  </h3>
                  <p className="mt-1">
                    {renderYesNo(application.application.licenseVerified)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Years of Experience
                  </h3>
                  <p className="mt-1">
                    {application.application.yearsOfExperience}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Areas of Expertise
                </h3>
                {renderObjectItems(application.application.areasOfExpertise)}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Assessment Tools
                </h3>
                {renderObjectItems(application.application.assessmentTools)}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Therapeutic Approaches
                </h3>
                {renderObjectItems(
                  application.application.therapeuticApproachesUsedList
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Languages Offered
                </h3>
                {renderObjectItems(application.application.languagesOffered)}
              </div>
            </TabsContent>

            <TabsContent value="practice" className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Provided Online Therapy Before
                  </h3>
                  <p className="mt-1">
                    {renderYesNo(
                      application.application.providedOnlineTherapyBefore
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Comfortable Using Video Conferencing
                  </h3>
                  <p className="mt-1">
                    {renderYesNo(
                      application.application.comfortableUsingVideoConferencing
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Weekly Availability (hours)
                  </h3>
                  <p className="mt-1">
                    {application.application.preferredSessionLength}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Preferred Session Length (minutes)
                  </h3>
                  <p className="mt-1">
                    {application.application.preferredSessionLength}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Accepts
                </h3>
                {renderObjectItems(application.acce)}
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Has Private Confidential Space
                  </h3>
                  <p className="mt-1">
                    {application.application.privateConfidentialSpace}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Complies With Data Privacy Act
                  </h3>
                  <p className="mt-1">
                    {renderYesNo(
                      application.application.compliesWithDataPrivacyAct
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Professional Liability Insurance
                  </h3>
                  <p className="mt-1">
                    {application.application.professionalLiabilityInsurance}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Complaints Or Disciplinary Actions
                  </h3>
                  <p className="mt-1">
                    {application.application.complaintsOrDisciplinaryActions}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Willing To Abide By Platform Guidelines
                  </h3>
                  <p className="mt-1">
                    {application.application.willingToAbideByPlatformGuidelines}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-2">
              {renderUploadedDocuments()}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Add Footer with approval/rejection buttons */}
      {application.status === "PENDING" && onStatusChange && (
        <div className="border-t pt-4 mt-6">
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
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
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

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
