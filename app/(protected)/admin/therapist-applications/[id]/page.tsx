"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  X,
  ArrowLeft,
  FileCheck,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Award,
  Briefcase,
  ShieldCheck,
  Languages,
  Clock,
  FileText,
  Download,
  ExternalLink,
  File,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Application status options
const APPLICATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Sample detailed therapist application data
const detailedApplicationData = {
  id: "1",
  firstName: "Tristan James",
  lastName: "Tolentino",
  mobile: "09472546834",
  email: "tristanjamestolentino56@gmail.com",
  province: "Cebu",
  providerType: "Psychologist",
  professionalLicenseType: "rpsy",
  isPRCLicensed: "yes",
  prcLicenseNumber: "9283945",
  expirationDateOfLicense: "2003-09-22",
  isLicenseActive: "yes",
  providedOnlineTherapyBefore: "yes",
  comfortableUsingVideoConferencing: "yes",
  privateConfidentialSpace: "yes",
  compliesWithDataPrivacyAct: "yes",
  areasOfExpertise: {
    stress: true,
  },
  assessmentTools: {
    pss: true,
  },
  yearsOfExperience: "6-10",
  languagesOffered: {
    ilocano: true,
  },
  therapeuticApproachesUsedList: {
    "solution-focused": true,
  },
  weeklyAvailability: "11-20",
  preferredSessionLength: "45",
  accepts: {
    "self-pay": true,
    hmo: false,
  },
  professionalLiabilityInsurance: "yes",
  complaintsOrDisciplinaryActions: "no",
  willingToAbideByPlatformGuidelines: "yes",
  status: APPLICATION_STATUS.PENDING,
  dateApplied: "2025-04-28T09:30:00.000Z",
};

export default function TherapistApplicationDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [application, setApplication] = useState(detailedApplicationData);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);

  // In a real app, you would fetch the application data using the ID from params
  // useEffect(() => {
  //   const fetchApplication = async () => {
  //     const response = await fetch(`/api/therapist-applications/${params.id}`);
  //     const data = await response.json();
  //     setApplication(data);
  //   };
  //   fetchApplication();
  // }, [params.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case APPLICATION_STATUS.PENDING:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case APPLICATION_STATUS.APPROVED:
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Approved
          </Badge>
        );
      case APPLICATION_STATUS.REJECTED:
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleApprove = async () => {
    // In a real app, you would update the application status in the database
    // await fetch(`/api/therapist-applications/${params.id}/approve`, { method: 'POST' });
    setApplication({ ...application, status: APPLICATION_STATUS.APPROVED });
    setShowApproveDialog(false);
  };

  const handleReject = async () => {
    // In a real app, you would update the application status in the database
    // await fetch(`/api/therapist-applications/${params.id}/reject`, { method: 'POST' });
    setApplication({ ...application, status: APPLICATION_STATUS.REJECTED });
    setShowRejectDialog(false);
  };

  // Helper functions to render object fields
  const renderObjectItems = (obj: Record<string, boolean>) => {
    const items = Object.entries(obj)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    return items.length > 0 ? (
      items.map((item) => (
        <Badge key={item} variant="secondary" className="mr-2 mb-2 capitalize">
          {item.replace(/-/g, " ")}
        </Badge>
      ))
    ) : (
      <span className="text-gray-500">None specified</span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/therapist-applications")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            Therapist Application
          </h1>
          {getStatusBadge(application.status)}
        </div>

        {application.status === APPLICATION_STATUS.PENDING && (
          <div className="flex items-center gap-2">
            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject Application
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Therapist Application</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to reject this therapist application?
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleReject}>
                    Reject
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog
              open={showApproveDialog}
              onOpenChange={setShowApproveDialog}
            >
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Check className="mr-2 h-4 w-4" />
                  Approve Application
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Approve Therapist Application</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to approve this therapist? They will
                    be added to the platform as an active therapist.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowApproveDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal and Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Personal & Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Full Name</p>
              <p className="text-gray-700">
                {application.firstName} {application.lastName}
              </p>
            </div>
            <div>
              <p className="font-medium">Email</p>
              <p className="text-gray-700">{application.email}</p>
            </div>
            <div>
              <p className="font-medium">Mobile Number</p>
              <p className="text-gray-700">{application.mobile}</p>
            </div>
            <div>
              <p className="font-medium">Province</p>
              <p className="text-gray-700">{application.province}</p>
            </div>
            <div>
              <p className="font-medium">Date Applied</p>
              <p className="text-gray-700">
                {formatDate(application.dateApplied)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Professional Qualifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Professional Qualifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Provider Type</p>
              <p className="text-gray-700">{application.providerType}</p>
            </div>
            <div>
              <p className="font-medium">Professional License Type</p>
              <p className="text-gray-700">
                {application.professionalLicenseType.toUpperCase()}
              </p>
            </div>
            {application.isPRCLicensed === "yes" && (
              <>
                <div>
                  <p className="font-medium">PRC License Number</p>
                  <p className="text-gray-700">
                    {application.prcLicenseNumber}
                  </p>
                </div>
                <div>
                  <p className="font-medium">License Expiration Date</p>
                  <p className="text-gray-700">
                    {formatDate(application.expirationDateOfLicense)}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Is License Active?</p>
                  <p className="text-gray-700">
                    {application.isLicenseActive === "yes" ? "Yes" : "No"}
                  </p>
                </div>
              </>
            )}
            <div>
              <p className="font-medium">Years of Experience</p>
              <p className="text-gray-700">
                {application.yearsOfExperience} years
              </p>
            </div>
            <div>
              <p className="font-medium">Professional Liability Insurance</p>
              <p className="text-gray-700">
                {application.professionalLiabilityInsurance === "yes"
                  ? "Yes"
                  : "No"}
              </p>
            </div>
            <div>
              <p className="font-medium">Complaints or Disciplinary Actions</p>
              <p className="text-gray-700">
                {application.complaintsOrDisciplinaryActions === "no"
                  ? "No"
                  : "Yes"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Practice Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Practice Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Areas of Expertise</p>
              <div className="mt-1">
                {renderObjectItems(application.areasOfExpertise)}
              </div>
            </div>
            <div>
              <p className="font-medium">Assessment Tools</p>
              <div className="mt-1">
                {renderObjectItems(application.assessmentTools)}
              </div>
            </div>
            <div>
              <p className="font-medium">Therapeutic Approaches</p>
              <div className="mt-1">
                {renderObjectItems(application.therapeuticApproachesUsedList)}
              </div>
            </div>
            <div>
              <p className="font-medium">Languages Offered</p>
              <div className="mt-1">
                {renderObjectItems(application.languagesOffered)}
              </div>
            </div>
            <div>
              <p className="font-medium">Weekly Availability (hours)</p>
              <p className="text-gray-700">
                {application.weeklyAvailability} hours
              </p>
            </div>
            <div>
              <p className="font-medium">Preferred Session Length</p>
              <p className="text-gray-700">
                {application.preferredSessionLength} minutes
              </p>
            </div>
            <div>
              <p className="font-medium">Payment Methods Accepted</p>
              <div className="mt-1">
                {renderObjectItems(application.accepts)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Online Therapy Capabilities */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Online Therapy Capabilities & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col p-4 border rounded-lg">
                <p className="font-medium mb-2">
                  Provided Online Therapy Before
                </p>
                <p className="text-gray-700">
                  {application.providedOnlineTherapyBefore === "yes"
                    ? "Yes"
                    : "No"}
                </p>
              </div>
              <div className="flex flex-col p-4 border rounded-lg">
                <p className="font-medium mb-2">
                  Comfortable Using Video Conferencing
                </p>
                <p className="text-gray-700">
                  {application.comfortableUsingVideoConferencing === "yes"
                    ? "Yes"
                    : "No"}
                </p>
              </div>
              <div className="flex flex-col p-4 border rounded-lg">
                <p className="font-medium mb-2">
                  Has Private Confidential Space
                </p>
                <p className="text-gray-700">
                  {application.privateConfidentialSpace === "yes"
                    ? "Yes"
                    : "No"}
                </p>
              </div>
              <div className="flex flex-col p-4 border rounded-lg">
                <p className="font-medium mb-2">
                  Complies With Data Privacy Act
                </p>
                <p className="text-gray-700">
                  {application.compliesWithDataPrivacyAct === "yes"
                    ? "Yes"
                    : "No"}
                </p>
              </div>
              <div className="flex flex-col p-4 border rounded-lg lg:col-span-4">
                <p className="font-medium mb-2">
                  Willing To Abide By Platform Guidelines
                </p>
                <p className="text-gray-700">
                  {application.willingToAbideByPlatformGuidelines === "yes"
                    ? "Yes"
                    : "No"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files Section */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submitted Documents
            </CardTitle>
            <CardDescription>
              Review all documents submitted by the therapist applicant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-medium flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-blue-500" />
                    PRC License
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-md p-2 text-xs text-gray-500">
                  license-document-123456.pdf
                </div>
              </div>

              <div className="flex flex-col p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-medium flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-blue-500" />
                    NBI Clearance
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-md p-2 text-xs text-gray-500">
                  nbi-clearance-789012.pdf
                </div>
              </div>

              <div className="flex flex-col p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-medium flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-blue-500" />
                    Resume/CV
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-md p-2 text-xs text-gray-500">
                  tristan-tolentino-resume.pdf
                </div>
              </div>

              <div className="flex flex-col p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-medium flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-blue-500" />
                    Liability Insurance
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-md p-2 text-xs text-gray-500">
                  insurance-certificate.pdf
                </div>
              </div>

              <div className="flex flex-col p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-medium flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-blue-500" />
                    BIR Form/Tax Documents
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-md p-2 text-xs text-gray-500">
                  bir-form-2307.pdf
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
