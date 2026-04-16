import React from "react";
import {
  CheckCircle,
  FileText,
  Clock,
  Shield,
  Upload,
  User,
} from "lucide-react";
import type { ApplicationSection } from "@/types/therapist-application";

/**
 * Section configuration for therapist application
 * Defines all sections with their metadata and field mappings
 */
export const therapistApplicationSections: ApplicationSection[] = [
  {
    id: "basicInfo",
    title: "Basic Information",
    icon: <User className="w-5 h-5" />,
    description: "Your personal details and contact information",
    estimatedTime: "2-3 minutes",
    fields: [
      "firstName",
      "lastName",
      "mobile",
      "email",
      "province",
      "providerType",
    ],
    isRequired: true,
  },
  {
    id: "licenseInfo",
    title: "Professional License & Experience",
    icon: <Shield className="w-5 h-5" />,
    description:
      "Your professional license details, credentials, and experience",
    estimatedTime: "4-5 minutes",
    fields: [
      "professionalLicenseType",
      "isPRCLicensed",
      "practiceStartDate",
      "yearsOfExperience",
      "educationBackground",
      "practiceLocation",
    ],
    isRequired: true,
  },
  {
    id: "teletherapy",
    title: "Teletherapy Readiness",
    icon: <Clock className="w-5 h-5" />,
    description: "Your readiness and capability for online therapy delivery",
    estimatedTime: "2-3 minutes",
    fields: [
      "providedOnlineTherapyBefore",
      "comfortableUsingVideoConferencing",
      "privateConfidentialSpace",
      "compliesWithDataPrivacyAct",
    ],
    isRequired: true,
  },
  {
    id: "professionalProfile",
    title: "Professional Profile",
    icon: <FileText className="w-5 h-5" />,
    description: "Your professional experience and specializations",
    estimatedTime: "3-5 minutes",
    fields: [
      "areasOfExpertise",
      "assessmentTools",
      "therapeuticApproachesUsedList",
      "languagesOffered",
      "professionalLiabilityInsurance",
      "complaintsOrDisciplinaryActions",
      "willingToAbideByPlatformGuidelines",
    ],
    isRequired: true,
  },
  {
    id: "availability",
    title: "Availability & Services",
    icon: <Clock className="w-5 h-5" />,
    description:
      "Your availability, session preferences, and service information",
    estimatedTime: "3-5 minutes",
    fields: [
      "weeklyAvailability",
      "preferredSessionLength",
      "accepts",
      // Note: hourlyRate and bio are optional fields
    ],
    isRequired: true,
  },
  {
    id: "documents",
    title: "Document Upload",
    icon: <Upload className="w-5 h-5" />,
    description:
      "Upload professional documents and certifications (required for application)",
    estimatedTime: "3-5 minutes",
    fields: ["documentsUploaded"],
    isRequired: true, // Documents are required for submission
  },
  {
    id: "review",
    title: "Review & Submit",
    icon: <CheckCircle className="w-5 h-5" />,
    description: "Review your application and submit for verification",
    estimatedTime: "2-3 minutes",
    fields: ["consentChecked"],
    isRequired: true,
  },
];

/**
 * Get section by ID
 */
export const getSectionById = (id: string): ApplicationSection | undefined => {
  return therapistApplicationSections.find((section) => section.id === id);
};

/**
 * Get all required sections
 */
export const getRequiredSections = (): ApplicationSection[] => {
  return therapistApplicationSections.filter((section) => section.isRequired);
};

/**
 * Get section field count
 */
export const getSectionFieldCount = (section: ApplicationSection): number => {
  return section.fields.length;
};

/**
 * Get total field count across all sections
 */
export const getTotalFieldCount = (): number => {
  return therapistApplicationSections.reduce(
    (total, section) => total + section.fields.length,
    0
  );
};

