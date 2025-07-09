"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  FileText,
  Clock,
  Shield,
  Upload,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MobileDrawer } from "@/components/ui/mobile-drawer";
import { MobileProgressHeader } from "@/components/ui/mobile-progress-header";
import { Form } from "@/components/ui/form";

// Extracted Section Components
import { SectionComponent } from "@/components/therapist-application/SectionComponent";
import { SidebarContent } from "@/components/therapist-application/SidebarContent";

// Store and API
import useTherapistForm from "@/store/therapistform";
import { useToast } from "@/contexts/ToastContext";
import { useIsMobile } from "@/hooks/useMobile";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useSectionCompletion } from "@/hooks/useSectionCompletion";
import { submitApplicationWithDocuments } from "@/lib/api/therapist-application";

// Comprehensive Zod Schema for all form sections - Updated to match backend DTO
const unifiedTherapistSchema = z
  .object({
    // Basic Information (from signup page)
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    mobile: z
      .string()
      .min(1, "Mobile number is required")
      .regex(/^(09|\+639)\d{9}$/, "Invalid PH mobile number"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    province: z.string().min(1, "Province is required"),
    providerType: z.string().min(1, "Provider type is required"),

    // Professional License Information
    professionalLicenseType: z
      .string()
      .min(1, "Please select your professional license type"),
    professionalLicenseType_specify: z.string().optional(),
    isPRCLicensed: z.string().min(1, "Please indicate if you are PRC-licensed"),
    prcLicenseNumber: z.string().optional(),
    expirationDateOfLicense: z.string().optional(),
    isLicenseActive: z.string().optional(),

    // Practice Information - NEW REQUIRED FIELDS
    practiceStartDate: z
      .string()
      .min(1, "Please enter when you started practicing"),

    // Professional Experience
    yearsOfExperience: z
      .number()
      .min(0, "Years of experience must be 0 or greater")
      .max(50, "Please enter a valid number of years"),
    educationBackground: z
      .string()
      .min(10, "Please provide details about your educational background"),
    practiceLocation: z
      .string()
      .min(1, "Please specify your primary practice location"),

    // Teletherapy Readiness - Flattened for backend compatibility
    providedOnlineTherapyBefore: z
      .string()
      .min(1, "Please answer this question"),
    comfortableUsingVideoConferencing: z
      .string()
      .min(1, "Please answer this question"),
    privateConfidentialSpace: z.string().min(1, "Please answer this question"),
    compliesWithDataPrivacyAct: z
      .string()
      .min(1, "Please confirm compliance with the Data Privacy Act"),

    // Areas of Expertise and Tools
    areasOfExpertise: z
      .array(z.string())
      .min(1, "Please select at least one area of expertise"),
    assessmentTools: z
      .array(z.string())
      .min(1, "Please select at least one assessment tool"),
    therapeuticApproachesUsedList: z
      .array(z.string())
      .min(1, "Please select at least one therapeutic approach"),
    therapeuticApproachesUsedList_specify: z.string().optional(),

    // Languages and Availability
    languagesOffered: z
      .array(z.string())
      .min(1, "Please select at least one language"),
    languagesOffered_specify: z.string().optional(),
    weeklyAvailability: z
      .string()
      .min(1, "Please select your weekly availability"),
    preferredSessionLength: z
      .string()
      .min(1, "Please select your preferred session length"),
    preferredSessionLength_specify: z.string().optional(),

    // Payment and Rates
    accepts: z
      .array(z.string())
      .min(1, "Please select at least one payment method"),
    accepts_hmo_specify: z.string().optional(),
    hourlyRate: z
      .number()
      .optional()
      .refine((val) => val === undefined || val >= 0, {
        message: "Rate must be a positive number",
      }),

    // Insurance Information (optional - not implemented in UI yet)
    acceptsInsurance: z.boolean().optional(),
    acceptedInsuranceTypes: z.array(z.string()).optional(),
    sessionLength: z.string().optional(),

    // Bio/About
    bio: z.string().optional(),

    // Compliance - Flattened for backend compatibility
    professionalLiabilityInsurance: z
      .string()
      .min(1, "Please answer regarding liability insurance"),
    complaintsOrDisciplinaryActions: z
      .string()
      .min(1, "Please answer regarding complaints history"),
    complaintsOrDisciplinaryActions_specify: z.string().optional(),
    willingToAbideByPlatformGuidelines: z
      .string()
      .refine((val) => val === "yes", {
        message:
          "You must agree to abide by the platform guidelines to proceed",
      }),

    // Document Upload flags (documents themselves handled separately)
    documentsUploaded: z.object({
      prcLicense: z.boolean(),
      nbiClearance: z.boolean(),
      resumeCV: z.boolean(),
    }),

    // Consent
    consentChecked: z.boolean().refine((val) => val === true, {
      message: "You must certify that the documents are authentic",
    }),
  })
  .superRefine((val, ctx) => {
    // Conditional validation for dependent fields
    if (
      val.professionalLicenseType === "other" &&
      (!val.professionalLicenseType_specify ||
        val.professionalLicenseType_specify.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your license type",
        path: ["professionalLicenseType_specify"],
      });
    }

    if (val.isPRCLicensed === "yes") {
      if (!val.prcLicenseNumber || !/^[0-9]{7}$/.test(val.prcLicenseNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid 7-digit PRC license number",
          path: ["prcLicenseNumber"],
        });
      }
      if (
        !val.expirationDateOfLicense ||
        val.expirationDateOfLicense.length === 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter the license expiration date",
          path: ["expirationDateOfLicense"],
        });
      }
      if (!val.isLicenseActive || val.isLicenseActive.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please confirm the status of your license",
          path: ["isLicenseActive"],
        });
      }
    }

    if (
      val.therapeuticApproachesUsedList?.includes("other") &&
      (!val.therapeuticApproachesUsedList_specify ||
        val.therapeuticApproachesUsedList_specify.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify other therapeutic approaches",
        path: ["therapeuticApproachesUsedList_specify"],
      });
    }

    if (
      val.languagesOffered?.includes("other") &&
      (!val.languagesOffered_specify ||
        val.languagesOffered_specify.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify other languages",
        path: ["languagesOffered_specify"],
      });
    }

    if (
      val.preferredSessionLength === "other" &&
      (!val.preferredSessionLength_specify ||
        val.preferredSessionLength_specify.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your preferred session length",
        path: ["preferredSessionLength_specify"],
      });
    }

    if (
      val.accepts?.includes("hmo") &&
      (!val.accepts_hmo_specify || val.accepts_hmo_specify.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify HMO providers",
        path: ["accepts_hmo_specify"],
      });
    }

    if (
      val.complaintsOrDisciplinaryActions === "yes" &&
      (!val.complaintsOrDisciplinaryActions_specify ||
        val.complaintsOrDisciplinaryActions_specify.length < 10)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please provide a brief explanation (min. 10 characters)",
        path: ["complaintsOrDisciplinaryActions_specify"],
      });
    }
  });

type UnifiedTherapistForm = z.infer<typeof unifiedTherapistSchema>;

// Section completion tracking
interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  estimatedTime: string;
  fields: string[];
  isRequired: boolean;
}

const sections: Section[] = [
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

export default function SinglePageTherapistApplication() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    updateField,
    updateNestedField,
    documents,
    updateDocuments,
    removeDocument,
    formValues,
  } = useTherapistForm();
  const isMobile = useIsMobile();

  // Section state management
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["basicInfo"])
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mobile navigation state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Restart form modal state
  const [showRestartModal, setShowRestartModal] = useState(false);

  // Form setup with persisted values
  const form = useForm<UnifiedTherapistForm>({
    resolver: zodResolver(unifiedTherapistSchema),
    values: {
      firstName: formValues.firstName || "",
      lastName: formValues.lastName || "",
      mobile: formValues.mobile || "",
      email: formValues.email || "",
      province: formValues.province || "",
      providerType: formValues.providerType || "",
      professionalLicenseType: formValues.professionalLicenseType || "",
      professionalLicenseType_specify:
        formValues.professionalLicenseType_specify || "",
      isPRCLicensed: formValues.isPRCLicensed || "",
      prcLicenseNumber: formValues.prcLicenseNumber || "",
      expirationDateOfLicense: formValues.expirationDateOfLicense || "",
      isLicenseActive: formValues.isLicenseActive || "",
      practiceStartDate: formValues.practiceStartDate || "",
      yearsOfExperience: formValues.yearsOfExperience || undefined,
      educationBackground: formValues.educationBackground || "",
      practiceLocation: formValues.practiceLocation || "",
      providedOnlineTherapyBefore: formValues.providedOnlineTherapyBefore || "",
      comfortableUsingVideoConferencing:
        formValues.comfortableUsingVideoConferencing || "",
      privateConfidentialSpace: formValues.privateConfidentialSpace || "",
      compliesWithDataPrivacyAct: formValues.compliesWithDataPrivacyAct || "",
      areasOfExpertise: formValues.areasOfExpertise || [],
      assessmentTools: formValues.assessmentTools || [],
      therapeuticApproachesUsedList:
        formValues.therapeuticApproachesUsedList || [],
      therapeuticApproachesUsedList_specify:
        formValues.therapeuticApproachesUsedList_specify || "",
      languagesOffered: formValues.languagesOffered || [],
      languagesOffered_specify: formValues.languagesOffered_specify || "",
      weeklyAvailability: formValues.weeklyAvailability || "",
      preferredSessionLength: formValues.preferredSessionLength || "",
      preferredSessionLength_specify:
        formValues.preferredSessionLength_specify || "",
      accepts: formValues.accepts || [],
      accepts_hmo_specify: formValues.accepts_hmo_specify || "",
      hourlyRate: formValues.hourlyRate || undefined,
      acceptsInsurance: formValues.acceptsInsurance || undefined,
      acceptedInsuranceTypes: formValues.acceptedInsuranceTypes || undefined,
      sessionLength: formValues.sessionLength || undefined,
      bio: formValues.bio || "",
      professionalLiabilityInsurance:
        formValues.professionalLiabilityInsurance || "",
      complaintsOrDisciplinaryActions:
        formValues.complaintsOrDisciplinaryActions || "",
      complaintsOrDisciplinaryActions_specify:
        formValues.complaintsOrDisciplinaryActions_specify || "",
      willingToAbideByPlatformGuidelines:
        formValues.willingToAbideByPlatformGuidelines || "",
      documentsUploaded: formValues.documentsUploaded || {
        prcLicense: false,
        nbiClearance: false,
        resumeCV: false,
      },
      consentChecked: formValues.consentChecked || false,
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Auto-save integration
  useAutoSave({
    control: form.control,
    interval: 30000, // 30 seconds
    debounceMs: 2000, // 2 seconds
  });

  // Watch form values for conditional rendering and progress calculation
  const watchedValues = useWatch({ control: form.control });

  // Use optimized section completion hook
  const sectionCompletions = useSectionCompletion(
    watchedValues,
    documents,
    sections
  );

  // Section completion logic has been moved to the useSectionCompletion hook for better performance
  // and to avoid unnecessary re-renders. The previous getSectionCompletion_UNUSED function
  // has been replaced by the optimized hook implementation.

  // Section completions now handled by optimized hook above

  // Overall progress calculation - only count required sections for submission eligibility
  const overallProgress = useMemo(() => {
    const requiredSections = sections.filter((section) => section.isRequired);
    const totalCompleted = requiredSections.reduce(
      (sum, section) => sum + sectionCompletions[section.id].completed,
      0
    );
    const totalFields = requiredSections.reduce(
      (sum, section) => sum + sectionCompletions[section.id].total,
      0
    );
    return totalFields > 0
      ? Math.round((totalCompleted / totalFields) * 100)
      : 0;
  }, [sectionCompletions]);

  // Separate progress for display that includes all sections
  const displayProgress = useMemo(() => {
    const totalCompleted = sections.reduce(
      (sum, section) => sum + sectionCompletions[section.id].completed,
      0
    );
    const totalFields = sections.reduce(
      (sum, section) => sum + sectionCompletions[section.id].total,
      0
    );
    return totalFields > 0
      ? Math.round((totalCompleted / totalFields) * 100)
      : 0;
  }, [sectionCompletions]);

  // Section toggle handler
  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // Mobile navigation handlers
  const handleMobileMenuClick = useCallback(() => {
    setMobileDrawerOpen(true);
  }, []);

  const handleMobileDrawerClose = useCallback(() => {
    setMobileDrawerOpen(false);
  }, []);

  const goToNextSection = useCallback(() => {
    if (currentSectionIndex < sections.length - 1) {
      const nextIndex = currentSectionIndex + 1;
      const nextSection = sections[nextIndex];
      setCurrentSectionIndex(nextIndex);
      setOpenSections((prev) => new Set([...prev, nextSection.id]));

      // Scroll to next section
      setTimeout(() => {
        const element = document.getElementById(`section-${nextSection.id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [currentSectionIndex]);

  const goToPreviousSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      const prevIndex = currentSectionIndex - 1;
      const prevSection = sections[prevIndex];
      setCurrentSectionIndex(prevIndex);
      setOpenSections((prev) => new Set([...prev, prevSection.id]));

      // Scroll to previous section
      setTimeout(() => {
        const element = document.getElementById(`section-${prevSection.id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [currentSectionIndex]);

  const currentSection = sections[currentSectionIndex];

  // Auto-save functionality
  const autoSave = useCallback(
    (values: UnifiedTherapistForm) => {
      try {
        // Save to Zustand store
        Object.entries(values).forEach(([key, value]) => {
          if (key === "teletherapyReadiness" || key === "compliance") {
            Object.entries(value).forEach(([subKey, subValue]) => {
              updateNestedField(key, subKey, subValue);
            });
          } else {
            updateField(key, value);
          }
        });

        // Update last saved time in Zustand store
        const { saveFormData } = useTherapistForm.getState();
        saveFormData();
      } catch (error) {
        console.error("Error auto-saving:", error);
      }
    },
    [updateField, updateNestedField]
  );

  // Restart form handler
  const handleRestartForm = useCallback(() => {
    try {
      // Clear form data
      form.reset();

      // Clear Zustand store
      const { resetForm } = useTherapistForm.getState();
      resetForm();

      // Reset UI state
      setOpenSections(new Set(["basicInfo"]));
      setCurrentSectionIndex(0);
      setShowRestartModal(false);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });

      showToast("Form restarted successfully", "success");
    } catch (error) {
      console.error("Error restarting form:", error);
      showToast("Failed to restart form", "error");
    }
  }, [form, showToast]);

  // Submit handler
  const onSubmit = useCallback(
    async (values: UnifiedTherapistForm) => {
      setIsSubmitting(true);
      try {
        // First, save the data locally
        autoSave(values);

        // Transform form data to match backend DTO format
        const transformedData = {
          // Basic information
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          mobile: values.mobile,
          province: values.province,
          providerType: values.providerType,

          // Professional license information
          professionalLicenseType:
            values.professionalLicenseType_specify ||
            values.professionalLicenseType,
          isPRCLicensed: values.isPRCLicensed,
          prcLicenseNumber: values.prcLicenseNumber || "",
          isLicenseActive: values.isLicenseActive || "",
          practiceStartDate: values.practiceStartDate,

          // Areas and tools
          areasOfExpertise: values.areasOfExpertise,
          assessmentTools: values.assessmentTools,
          therapeuticApproachesUsedList:
            values.therapeuticApproachesUsedList_specify
              ? [
                  ...values.therapeuticApproachesUsedList.filter(
                    (t) => t !== "other"
                  ),
                  values.therapeuticApproachesUsedList_specify,
                ]
              : values.therapeuticApproachesUsedList,
          languagesOffered: values.languagesOffered_specify
            ? [
                ...values.languagesOffered.filter((l) => l !== "other"),
                values.languagesOffered_specify,
              ]
            : values.languagesOffered,

          // Teletherapy readiness (flattened) - Convert strings to booleans
          providedOnlineTherapyBefore:
            values.providedOnlineTherapyBefore === "yes",
          comfortableUsingVideoConferencing:
            values.comfortableUsingVideoConferencing === "yes",
          privateConfidentialSpace: values.privateConfidentialSpace === "yes",
          compliesWithDataPrivacyAct:
            values.compliesWithDataPrivacyAct === "yes",

          // Compliance (flattened) - Convert strings to booleans
          professionalLiabilityInsurance: values.professionalLiabilityInsurance,
          complaintsOrDisciplinaryActions:
            values.complaintsOrDisciplinaryActions,
          willingToAbideByPlatformGuidelines:
            values.willingToAbideByPlatformGuidelines === "yes",

          // Availability and payment
          weeklyAvailability: values.weeklyAvailability,
          preferredSessionLength:
            values.preferredSessionLength_specify ||
            values.preferredSessionLength,
          accepts: values.accepts,

          // Optional fields
          bio: values.bio || "",
          hourlyRate: values.hourlyRate || 0,
        };

        // Validate that all required documents are uploaded
        const requiredDocs = ["prcLicense", "nbiClearance", "resumeCV"];
        const missingDocs = requiredDocs.filter(
          (doc) => !documents[doc] || documents[doc].length === 0
        );

        if (missingDocs.length > 0) {
          const missingNames = missingDocs
            .map((doc) => {
              const docNames = {
                prcLicense: "PRC License",
                nbiClearance: "NBI Clearance",
                resumeCV: "Resume/CV",
              };
              return docNames[doc as keyof typeof docNames];
            })
            .join(", ");

          showToast(
            `Please upload all required documents: ${missingNames}`,
            "error",
            5000
          );
          return;
        }

        console.log(
          "Submitting therapist application with documents:",
          transformedData
        );

        // Prepare documents for upload - filter out deleted/missing files
        const allFiles = Object.entries(documents)
          .filter(([, files]) => files && files.length > 0) // Only include document types with actual files
          .flatMap(([type, files]) =>
            files
              .filter((file) => file && file instanceof File) // Ensure file exists and is valid
              .map((file) => ({ file, type }))
          );

        const fileTypeMap: Record<string, string> = {};
        const filesToUpload: File[] = [];

        // Map document types to backend categories
        const docTypeMapping = {
          prcLicense: "license",
          nbiClearance: "certificate",
          resumeCV: "resume",
          liabilityInsurance: "certificate",
          birForm: "document",
        };

        allFiles.forEach(({ file, type }) => {
          // Additional safety check to ensure file is valid before processing
          if (file && file instanceof File && file.name) {
            filesToUpload.push(file);
            fileTypeMap[file.name] =
              docTypeMapping[type as keyof typeof docTypeMapping] || "document";
          }
        });

        showToast("Submitting application with documents...", "info");

        // Use consolidated API to submit application and upload documents in one atomic operation
        const result = await submitApplicationWithDocuments(
          transformedData,
          filesToUpload,
          fileTypeMap
        );

        console.log(
          "Application and documents submitted successfully:",
          result
        );

        showToast(
          `Successfully submitted application with ${result.uploadedFiles.length} document(s)`,
          "success",
          3000
        );

        showToast("Application submitted successfully!", "success");

        // Navigate to success page after successful submission
        setTimeout(() => {
          router.push(
            `/therapist-application/success?id=${result.applicationId}`
          );
        }, 1500);
      } catch (error) {
        console.error("Error submitting application:", error);

        // Handle specific error types from consolidated submission
        if (error instanceof Error) {
          if (
            error.message.includes("email already exists") ||
            error.message.includes("An application with this email")
          ) {
            router.push(
              `/therapist-application/error?type=email_exists&message=${encodeURIComponent(error.message)}`
            );
            return;
          }

          if (
            error.message.includes("validation") ||
            error.message.includes("required") ||
            error.message.includes("check all required fields")
          ) {
            router.push(
              `/therapist-application/error?type=validation_error&message=${encodeURIComponent(error.message)}`
            );
            return;
          }

          if (
            error.message.includes("file") ||
            error.message.includes("upload") ||
            error.message.includes("document")
          ) {
            router.push(
              `/therapist-application/error?type=upload_error&message=${encodeURIComponent(error.message)}`
            );
            return;
          }

          if (
            error.message.includes("server") ||
            error.message.includes("500") ||
            error.message.includes("contact support")
          ) {
            router.push(
              `/therapist-application/error?type=server_error&message=${encodeURIComponent(error.message)}`
            );
            return;
          }
        }

        // Generic error fallback
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        router.push(
          `/therapist-application/error?type=unknown&message=${encodeURIComponent(errorMessage)}`
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [autoSave, router, showToast, documents]
  );

  // Memoized sidebar content props to prevent unnecessary re-renders
  const sidebarContentProps = useMemo(
    () => ({
      displayProgress,
      sections,
      sectionCompletions,
      openSections,
      toggleSection,
      isMobile,
      setMobileDrawerOpen,
      setShowRestartModal,
    }),
    [
      displayProgress,
      sectionCompletions,
      openSections,
      toggleSection,
      isMobile,
      setMobileDrawerOpen,
      setShowRestartModal,
    ]
  );

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Mobile Header - Only shown on mobile */}
      {isMobile && (
        <MobileProgressHeader
          title="Therapist Application"
          progress={displayProgress}
          currentSection={currentSection?.title || ""}
          onMenuClick={handleMobileMenuClick}
          onPreviousSection={goToPreviousSection}
          onNextSection={goToNextSection}
          hasPrevious={currentSectionIndex > 0}
          hasNext={currentSectionIndex < sections.length - 1}
        />
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <MobileDrawer
          isOpen={mobileDrawerOpen}
          onClose={handleMobileDrawerClose}
          title="Application Progress"
        >
          <SidebarContent {...sidebarContentProps} />
        </MobileDrawer>
      )}

      <div className={`flex ${isMobile ? "flex-col" : "flex-row"}`}>
        {/* Desktop Sidebar - Only shown on desktop */}
        {!isMobile && (
          <div
            className="w-1/5 bg-gradient-to-b from-green-100 via-green-50 to-gray-50 p-6 flex flex-col sticky top-0 h-screen shadow-sm"
            data-testid="sidebar"
          >
            <SidebarContent {...sidebarContentProps} />
          </div>
        )}

        {/* Main Content */}
        <div
          className={`${isMobile ? "w-full" : "w-4/5"} flex justify-center ${isMobile ? "p-4" : "p-8"}`}
          data-testid="main-content"
        >
          <div className="w-full max-w-4xl">
            {/* Desktop Header - Hidden on mobile since we have mobile header */}
            {!isMobile && (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Therapist Application
                </h1>
                <p className="text-gray-600">
                  Complete all sections below to submit your application to join
                  the Mentara therapist network.
                </p>
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Render each section as collapsible */}
                {sections.map((section) => (
                  <SectionComponent
                    key={section.id}
                    section={section}
                    isOpen={openSections.has(section.id)}
                    onToggle={() => toggleSection(section.id)}
                    completion={sectionCompletions[section.id]}
                    form={form}
                    watchedValues={watchedValues}
                    documents={documents}
                    updateDocuments={updateDocuments}
                    removeDocument={removeDocument}
                  />
                ))}

                {/* Submit Button */}
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2 text-green-800 mb-4">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Ready to Submit?</span>
                      </div>
                      <p className="text-sm text-green-700 mb-6">
                        Please review your information above before submitting
                        your application.
                      </p>
                      <div className="flex justify-center">
                        <Button
                          type="submit"
                          disabled={isSubmitting || overallProgress < 100}
                          className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold text-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Submitting Application...
                            </>
                          ) : (
                            <>Submit Application</>
                          )}
                        </Button>
                      </div>
                      {overallProgress < 100 && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800 font-medium mb-2">
                            <AlertCircle className="w-4 h-4 inline mr-2" />
                            Please complete the following sections before
                            submitting:
                          </p>
                          <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                            {sections
                              .filter((section) => section.isRequired)
                              .map((section) => {
                                const completion =
                                  sectionCompletions[section.id];
                                if (completion.percentage < 100) {
                                  return (
                                    <li key={section.id}>
                                      <button
                                        type="button"
                                        className="text-yellow-800 hover:text-yellow-900 underline"
                                        onClick={() => {
                                          setOpenSections(
                                            (prev) =>
                                              new Set([...prev, section.id])
                                          );
                                          const element =
                                            document.getElementById(
                                              `section-${section.id}`
                                            );
                                          if (element) {
                                            element.scrollIntoView({
                                              behavior: "smooth",
                                              block: "start",
                                            });
                                          }
                                        }}
                                      >
                                        {section.title}
                                      </button>
                                      {` (${completion.completed}/${completion.total} complete)`}
                                    </li>
                                  );
                                }
                                return null;
                              })}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Restart Form Confirmation Modal */}
      {showRestartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Restart Form
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to restart the form? All your current
              progress will be lost permanently.
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRestartModal(false)}
                className="min-h-[44px] px-4 py-2 touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleRestartForm}
                className="min-h-[44px] px-4 py-2 touch-manipulation"
              >
                Yes, Restart Form
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
