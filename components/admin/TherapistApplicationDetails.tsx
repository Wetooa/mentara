"use client";

import React, { useState } from "react";
import { TherapistApplication } from "@/data/mockTherapistApplicationData";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Import icons
import {
  FileIcon,
  FileTextIcon,
  ImageIcon,
  FileArchiveIcon,
  ExternalLinkIcon,
  DownloadIcon,
} from "lucide-react";

interface TherapistApplicationDetailsProps {
  application: TherapistApplication;
}

export function TherapistApplicationDetails({
  application,
}: TherapistApplicationDetailsProps) {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    url: string;
  } | null>(null);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  // Helper function to render Yes/No responses with appropriate styling
  const renderYesNo = (value: string) => {
    if (value.toLowerCase() === "yes") {
      return <span className="text-green-600 font-medium">Yes</span>;
    } else if (value.toLowerCase() === "no") {
      return <span className="text-red-600 font-medium">No</span>;
    }
    return value;
  };

  // Helper function to render object with boolean values
  const renderObjectItems = (obj: { [key: string]: boolean }) => {
    const items = Object.entries(obj)
      .filter(([, value]) => value)
      .map(([key]) => key.replace(/-/g, " "));

    if (items.length === 0)
      return <span className="text-gray-500 italic">None</span>;

    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={index} variant="outline" className="capitalize">
            {item}
          </Badge>
        ))}
      </div>
    );
  };

  // Mock uploaded files (in a real app, these would come from your database)
  const uploadedFiles = [
    { name: "License Certificate.pdf", url: "#", type: "pdf" },
    { name: "Professional ID Card.jpg", url: "#", type: "image" },
    { name: "CV Resume.pdf", url: "#", type: "pdf" },
    { name: "Certification Documents.zip", url: "#", type: "archive" },
    { name: "Professional Insurance Certificate.pdf", url: "#", type: "pdf" },
  ];

  // Get appropriate icon for file type
  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileTextIcon className="w-5 h-5 text-red-500" />;
      case "image":
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case "archive":
        return <FileArchiveIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <FileIcon className="w-5 h-5 text-gray-500" />;
    }
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
            {application.status.charAt(0).toUpperCase() +
              application.status.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-gray-500">
          Submitted on {formatDate(application.submissionDate)}
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

          <ScrollArea className="h-[calc(100vh-380px)] mt-4 pr-4">
            <TabsContent value="personal" className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    First Name
                  </h3>
                  <p className="mt-1">{application.firstName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Last Name
                  </h3>
                  <p className="mt-1">{application.lastName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1">{application.email}</p>
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
                  <p className="mt-1">{application.providerType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Professional License Type
                  </h3>
                  <p className="mt-1">{application.professionalLicenseType}</p>
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
                  <p className="mt-1">{application.prcLicenseNumber}</p>
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
              <div className="grid grid-cols-1 gap-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Uploaded Documents
                </h3>

                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <span>{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => setSelectedFile(file)}
                          >
                            <ExternalLinkIcon className="w-4 h-4" />
                            <span>View</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
                          <DialogTitle>
                            {selectedFile?.name || "Document Preview"}
                          </DialogTitle>
                          <div className="mt-4 flex flex-col items-center justify-center bg-gray-100 border rounded-md p-6 min-h-[400px]">
                            {/* This would be replaced with an actual document viewer in production */}
                            {getFileIcon(file.type)}
                            <p className="mt-4 text-center">
                              Document preview would appear here.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              In a production environment, this would display
                              the actual file.
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                ))}

                {uploadedFiles.length === 0 && (
                  <p className="text-gray-500 italic">No documents uploaded</p>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
