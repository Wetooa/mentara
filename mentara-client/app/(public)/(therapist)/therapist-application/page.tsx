"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Circle,
  FileText,
  Users,
  Clock,
  Shield,
  Upload,
  User,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { MobileDrawer } from "@/components/ui/mobile-drawer";
import { MobileProgressHeader } from "@/components/ui/mobile-progress-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

// Store and API
import useTherapistForm from "@/store/therapistform";
import { useToast } from "@/contexts/ToastContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAutoSave } from "@/hooks/use-auto-save";
import { BasicInfoSection } from "@/components/therapist-application/BasicInfoSection";
import { LicenseInfoSection } from "@/components/therapist-application/LicenseInfoSection";
import { TeletherapySection } from "@/components/therapist-application/TeletherapySection";
import { therapistProfileFormFields } from "@/constants/therapist_application";
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
      .min(10, "Please provide details about your educational background")
      .optional(),
    practiceLocation: z
      .string()
      .min(1, "Please specify your primary practice location")
      .optional(),

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
    description: "Your professional license details, credentials, and experience",
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
      professionalLicenseType_specify: formValues.professionalLicenseType_specify || "",
      isPRCLicensed: formValues.isPRCLicensed || "",
      prcLicenseNumber: formValues.prcLicenseNumber || "",
      expirationDateOfLicense: formValues.expirationDateOfLicense || "",
      isLicenseActive: formValues.isLicenseActive || "",
      practiceStartDate: formValues.practiceStartDate || "",
      yearsOfExperience: formValues.yearsOfExperience || undefined,
      educationBackground: formValues.educationBackground || "",
      practiceLocation: formValues.practiceLocation || "",
      providedOnlineTherapyBefore: formValues.providedOnlineTherapyBefore || "",
      comfortableUsingVideoConferencing: formValues.comfortableUsingVideoConferencing || "",
      privateConfidentialSpace: formValues.privateConfidentialSpace || "",
      compliesWithDataPrivacyAct: formValues.compliesWithDataPrivacyAct || "",
      areasOfExpertise: formValues.areasOfExpertise || [],
      assessmentTools: formValues.assessmentTools || [],
      therapeuticApproachesUsedList: formValues.therapeuticApproachesUsedList || [],
      therapeuticApproachesUsedList_specify: formValues.therapeuticApproachesUsedList_specify || "",
      languagesOffered: formValues.languagesOffered || [],
      languagesOffered_specify: formValues.languagesOffered_specify || "",
      weeklyAvailability: formValues.weeklyAvailability || "",
      preferredSessionLength: formValues.preferredSessionLength || "",
      preferredSessionLength_specify: formValues.preferredSessionLength_specify || "",
      accepts: formValues.accepts || [],
      accepts_hmo_specify: formValues.accepts_hmo_specify || "",
      hourlyRate: formValues.hourlyRate || undefined,
      acceptsInsurance: formValues.acceptsInsurance || undefined,
      acceptedInsuranceTypes: formValues.acceptedInsuranceTypes || undefined,
      sessionLength: formValues.sessionLength || undefined,
      bio: formValues.bio || "",
      professionalLiabilityInsurance: formValues.professionalLiabilityInsurance || "",
      complaintsOrDisciplinaryActions: formValues.complaintsOrDisciplinaryActions || "",
      complaintsOrDisciplinaryActions_specify: formValues.complaintsOrDisciplinaryActions_specify || "",
      willingToAbideByPlatformGuidelines: formValues.willingToAbideByPlatformGuidelines || "",
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

  // Watch form values for conditional rendering
  const watchedValues = useWatch({ control: form.control });

  // Calculate completion status
  const getSectionCompletion = useCallback(
    (sectionId: string) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return { completed: 0, total: 0, percentage: 0 };

      const values = form.getValues();
      let completed = 0;
      let total = section.fields.length;

      // Custom completion logic for each section
      switch (sectionId) {
        case "basicInfo":
          const basicFields = [
            "firstName",
            "lastName",
            "mobile",
            "email",
            "province",
            "providerType",
          ];
          completed = basicFields.filter(
            (field) => values[field] && values[field] !== ""
          ).length;
          total = basicFields.length;
          break;

        case "licenseInfo":
          const licenseFields = [
            "professionalLicenseType",
            "isPRCLicensed",
            "practiceStartDate",
            "yearsOfExperience",
          ];
          let licenseCompleted = 0;

          licenseFields.forEach((field) => {
            if (field === "yearsOfExperience") {
              if (values[field] !== undefined && values[field] !== null) licenseCompleted++;
            } else if (values[field] && values[field] !== "") {
              licenseCompleted++;
            }
          });

          // Add conditional fields for PRC licensed professionals
          if (values.isPRCLicensed === "yes") {
            const prcFields = ["prcLicenseNumber", "expirationDateOfLicense", "isLicenseActive"];
            prcFields.forEach((field) => {
              if (values[field] && values[field] !== "") licenseCompleted++;
            });
            total = licenseFields.length + prcFields.length;
          } else {
            total = licenseFields.length;
          }

          // Add conditional field for other license types
          if (values.professionalLicenseType === "other" && values.professionalLicenseType_specify) {
            licenseCompleted++;
            total += 1;
          }

          // Optional fields (educationBackground, practiceLocation) - don't count toward completion
          completed = licenseCompleted;
          break;

        case "teletherapy":
          const teletherapyFields = [
            "providedOnlineTherapyBefore",
            "comfortableUsingVideoConferencing",
            "privateConfidentialSpace",
            "compliesWithDataPrivacyAct",
          ];
          completed = teletherapyFields.filter(
            (field) => values[field] && values[field] !== ""
          ).length;
          total = teletherapyFields.length;
          break;

        case "professionalProfile":
          // Define required fields for professional profile (license and teletherapy fields moved to separate sections)
          const professionalRequiredFields = [
            "areasOfExpertise",
            "assessmentTools",
            "therapeuticApproachesUsedList",
            "languagesOffered",
            "professionalLiabilityInsurance",
            "complaintsOrDisciplinaryActions",
            "willingToAbideByPlatformGuidelines",
          ];

          let profCompleted = 0;

          professionalRequiredFields.forEach((field) => {
            if (
              field === "areasOfExpertise" ||
              field === "assessmentTools" ||
              field === "therapeuticApproachesUsedList" ||
              field === "languagesOffered"
            ) {
              if (values[field]?.length > 0) profCompleted++;
            } else if (field === "willingToAbideByPlatformGuidelines") {
              if (values[field] === "yes") profCompleted++;
            } else {
              if (values[field] && values[field] !== "") profCompleted++;
            }
          });

          completed = profCompleted;
          total = professionalRequiredFields.length;
          break;

        case "availability":
          // Only count fields that are actually implemented in the UI
          // hourlyRate and bio are optional fields
          const availabilityRequiredFields = [
            "weeklyAvailability",
            "preferredSessionLength", 
            "accepts",
          ];

          let availCompleted = 0;

          availabilityRequiredFields.forEach((field) => {
            if (field === "accepts") {
              if (values[field]?.length > 0) availCompleted++;
            } else {
              if (values[field] && values[field] !== "") availCompleted++;
            }
          });

          completed = availCompleted;
          total = availabilityRequiredFields.length;
          break;

        case "documents":
          // Documents are required for submission
          const requiredDocs = ["prcLicense", "nbiClearance", "resumeCV"];
          const uploadedDocs = requiredDocs.filter(
            (doc) => documents[doc]?.length > 0
          ).length;

          completed = uploadedDocs;
          total = requiredDocs.length;
          break;

        case "review":
          completed = values.consentChecked ? 1 : 0;
          total = 1;
          break;
      }

      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { completed, total, percentage };
    },
    [form, documents]
  );

  // Overall progress calculation - only count required sections for submission eligibility
  const overallProgress = useMemo(() => {
    const requiredSections = sections.filter((section) => section.isRequired);
    const sectionProgresses = requiredSections.map((section) =>
      getSectionCompletion(section.id)
    );
    const totalCompleted = sectionProgresses.reduce(
      (sum, prog) => sum + prog.completed,
      0
    );
    const totalFields = sectionProgresses.reduce(
      (sum, prog) => sum + prog.total,
      0
    );
    return totalFields > 0
      ? Math.round((totalCompleted / totalFields) * 100)
      : 0;
  }, [getSectionCompletion]);

  // Separate progress for display that includes all sections
  const displayProgress = useMemo(() => {
    const sectionProgresses = sections.map((section) =>
      getSectionCompletion(section.id)
    );
    const totalCompleted = sectionProgresses.reduce(
      (sum, prog) => sum + prog.completed,
      0
    );
    const totalFields = sectionProgresses.reduce(
      (sum, prog) => sum + prog.total,
      0
    );
    return totalFields > 0
      ? Math.round((totalCompleted / totalFields) * 100)
      : 0;
  }, [getSectionCompletion]);

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

        // Prepare documents for upload
        const allFiles = Object.entries(documents).flatMap(([type, files]) =>
          files.map((file) => ({ file, type }))
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
          filesToUpload.push(file);
          fileTypeMap[file.name] =
            docTypeMapping[type as keyof typeof docTypeMapping] || "document";
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
    [autoSave, router, showToast]
  );

  // Sidebar content component for reuse between desktop and mobile
  const SidebarContent = () => (
    <>
      <div className="mb-8">
        <Image
          src="/icons/mentara/mentara-landscape.png"
          alt="Mentara logo"
          width={250}
          height={100}
        />
      </div>

      <div className="mt-4 mb-8">
        <p className="text-sm text-gray-600 mb-1">You're working on</p>
        <h1 className="text-2xl font-bold text-green-900">Application</h1>
      </div>

      {/* Overall Progress */}
      <div className="mb-6" data-testid="overall-progress">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm text-gray-600">{displayProgress}%</span>
        </div>
        <Progress value={displayProgress} className="h-2" />
      </div>

      {/* Section List */}
      <div className="space-y-3 flex-1">
        {sections.map((section) => {
          const completion = getSectionCompletion(section.id);
          const isOpen = openSections.has(section.id);
          const isCompleted = completion.percentage === 100;

          return (
            <div
              key={section.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isOpen
                  ? "bg-green-100 border-green-300"
                  : isCompleted
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => {
                // Open the section if it's not already open
                if (!isOpen) {
                  toggleSection(section.id);
                }
                // Close mobile drawer when clicking on section
                if (isMobile) {
                  setMobileDrawerOpen(false);
                }
                // Smooth scroll to the section
                setTimeout(() => {
                  const element = document.getElementById(
                    `section-${section.id}`
                  );
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }, 100); // Small delay to allow section to open
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 ${isCompleted ? "text-green-600" : "text-gray-400"}`}
                >
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm text-gray-900 truncate">
                      {section.title}
                    </h3>
                    {isCompleted && (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {completion.completed}/{completion.total} complete
                    </span>
                    <span className="text-xs text-gray-500">
                      {completion.percentage}%
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-auto space-y-3">
        {/* Restart Form Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowRestartModal(true)}
          className="w-full min-h-[44px] h-auto px-3 py-2 text-xs border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 touch-manipulation"
        >
          <X className="w-4 h-4 mr-2" />
          Restart Form
        </Button>
        
        <div className="text-xs text-gray-500">
          Form saves automatically as you type
        </div>
        
        <div className="text-xs text-gray-500">
          © {new Date().getFullYear()} Mentara. All rights reserved.
        </div>
      </div>
    </>
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
          <SidebarContent />
        </MobileDrawer>
      )}

      <div className={`flex ${isMobile ? "flex-col" : "flex-row"}`}>
        {/* Desktop Sidebar - Only shown on desktop */}
        {!isMobile && (
          <div
            className="w-1/5 bg-gradient-to-b from-green-100 via-green-50 to-gray-50 p-6 flex flex-col sticky top-0 h-screen shadow-sm"
            data-testid="sidebar"
          >
            <SidebarContent />
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
                    completion={getSectionCompletion(section.id)}
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
                                const completion = getSectionCompletion(
                                  section.id
                                );
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
              Are you sure you want to restart the form? All your current progress will be lost permanently.
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

// Individual Section Component with full form implementations
function SectionComponent({
  section,
  isOpen,
  onToggle,
  completion,
  form,
  watchedValues,
  documents,
  updateDocuments,
  removeDocument,
}) {
  const { showToast } = useToast();

  const handleFileChange = useCallback(
    (docType: string, files: FileList | null) => {
      if (!files || files.length === 0) return;

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const maxSizeMB = 10;
      const validFiles = Array.from(files).filter(
        (file) =>
          allowedTypes.includes(file.type) &&
          file.size <= maxSizeMB * 1024 * 1024
      );

      if (validFiles.length !== files.length) {
        showToast(
          "Some files were invalid (type or size) and were not added",
          "warning"
        );
      }

      updateDocuments(docType, [...documents[docType], ...validFiles]);
    },
    [documents, updateDocuments, showToast]
  );

  const handleRemoveFile = useCallback(
    (docType: string, index: number) => {
      removeDocument(docType, index);
    },
    [removeDocument]
  );

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card
        id={`section-${section.id}`}
        className="border-2 border-gray-200 hover:border-green-300 transition-colors"
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`${completion.percentage === 100 ? "text-green-600" : "text-gray-400"}`}
                >
                  {section.icon}
                </div>
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {section.title}
                    {section.isRequired && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {section.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {completion.completed}/{completion.total} complete
                  </div>
                  <div className="text-xs text-gray-500">
                    {section.estimatedTime}
                  </div>
                </div>
                {completion.percentage === 100 ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300" />
                )}
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {section.id === "basicInfo" && (
              <BasicInfoSection control={form.control} />
            )}
            {section.id === "licenseInfo" && (
              <LicenseInfoSection 
                control={form.control} 
                watchedValues={watchedValues}
              />
            )}
            {section.id === "teletherapy" && (
              <TeletherapySection control={form.control} />
            )}
            {section.id === "professionalProfile" && (
              <ProfessionalProfileSection
                form={form}
                watchedValues={watchedValues}
              />
            )}
            {section.id === "availability" && (
              <AvailabilityServicesSection
                form={form}
                watchedValues={watchedValues}
              />
            )}
            {section.id === "documents" && (
              <DocumentUploadSection
                documents={documents}
                onFileChange={handleFileChange}
                onRemoveFile={handleRemoveFile}
              />
            )}
            {section.id === "review" && (
              <ReviewSection
                form={form}
                watchedValues={watchedValues}
                documents={documents}
              />
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}


// Professional Profile Section Component
function ProfessionalProfileSection({
  form,
  watchedValues,
}: {
  form: any;
  watchedValues: any;
}) {
  const {
    therapeuticApproachesUsedList,
    languagesOffered,
    complaintsOrDisciplinaryActions,
  } = watchedValues;

  return (
    <div className="space-y-8">
      {/* Areas of Expertise */}
      <Card className="border border-orange-200 bg-orange-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-orange-600" />
            Areas of Expertise
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Select all areas where you have professional experience and
            training. You must select at least one area.
          </p>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="areasOfExpertise"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {therapistProfileFormFields.areasOfExpertise.options.map(
                    (option) => (
                      <Label
                        key={option.value}
                        className="flex items-center gap-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 cursor-pointer transition-colors group"
                      >
                        <Checkbox
                          checked={field.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, option.value]);
                            } else {
                              field.onChange(
                                field.value.filter((v) => v !== option.value)
                              );
                            }
                          }}
                        />
                        <span className="text-sm font-medium group-hover:text-orange-700 transition-colors">
                          {option.label}
                        </span>
                        {field.value?.includes(option.value) && (
                          <CheckCircle className="w-4 h-4 text-orange-600 ml-auto" />
                        )}
                      </Label>
                    )
                  )}
                </div>
                <div className="mt-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Selected:</strong> {field.value?.length || 0} area
                    {field.value?.length !== 1 ? "s" : ""}
                    {field.value?.length > 0 && (
                      <span className="ml-2 text-orange-600">
                        (
                        {field.value
                          .map(
                            (val) =>
                              therapistProfileFormFields.areasOfExpertise.options.find(
                                (opt) => opt.value === val
                              )?.label
                          )
                          .join(", ")}
                        )
                      </span>
                    )}
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Assessment Tools */}
      <Card className="border border-indigo-200 bg-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-indigo-600" />
            Assessment Tools & Approaches
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Select all assessment tools and approaches you use. You must select
            at least one.
          </p>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="assessmentTools"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {therapistProfileFormFields.assessmentTools.options.map(
                    (option) => (
                      <Label
                        key={option.value}
                        className="flex items-center gap-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 cursor-pointer transition-colors group"
                      >
                        <Checkbox
                          checked={field.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, option.value]);
                            } else {
                              field.onChange(
                                field.value.filter((v) => v !== option.value)
                              );
                            }
                          }}
                        />
                        <span className="text-sm font-medium group-hover:text-indigo-700 transition-colors">
                          {option.label}
                        </span>
                        {field.value?.includes(option.value) && (
                          <CheckCircle className="w-4 h-4 text-indigo-600 ml-auto" />
                        )}
                      </Label>
                    )
                  )}
                </div>
                <div className="mt-4 p-3 bg-indigo-100 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-indigo-800">
                    <strong>Selected:</strong> {field.value?.length || 0} tool
                    {field.value?.length !== 1 ? "s" : ""}
                    {field.value?.length > 0 && (
                      <span className="ml-2 text-indigo-600">
                        (
                        {field.value
                          .map(
                            (val) =>
                              therapistProfileFormFields.assessmentTools.options.find(
                                (opt) => opt.value === val
                              )?.label
                          )
                          .join(", ")}
                        )
                      </span>
                    )}
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Therapeutic Approaches */}
      <Card className="border border-teal-200 bg-teal-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-teal-600" />
            Therapeutic Approaches
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Select all therapeutic approaches you use in your practice.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="therapeuticApproachesUsedList"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {therapistProfileFormFields.therapeuticApproachesUsedList.options.map(
                    (option) => (
                      <Label
                        key={option.value}
                        className="flex items-center gap-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-teal-100 hover:border-teal-300 cursor-pointer transition-colors group"
                      >
                        <Checkbox
                          checked={field.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, option.value]);
                            } else {
                              field.onChange(
                                field.value.filter((v) => v !== option.value)
                              );
                            }
                          }}
                        />
                        <span className="text-sm font-medium group-hover:text-teal-700 transition-colors">
                          {option.label}
                        </span>
                        {field.value?.includes(option.value) && (
                          <CheckCircle className="w-4 h-4 text-teal-600 ml-auto" />
                        )}
                      </Label>
                    )
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {therapeuticApproachesUsedList?.includes("other") && (
            <FormField
              control={form.control}
              name="therapeuticApproachesUsedList_specify"
              render={({ field }) => (
                <FormItem className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <FormLabel className="text-base font-semibold">
                    Please specify other therapeutic approaches{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Please describe the other therapeutic approaches you use..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Languages Offered */}
      <Card className="border border-green-200 bg-green-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-green-600" />
            Languages Offered
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Select all languages you can offer therapy sessions in.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="languagesOffered"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {therapistProfileFormFields.languagesOffered.options.map(
                    (option) => (
                      <Label
                        key={option.value}
                        className="flex items-center gap-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-green-100 hover:border-green-300 cursor-pointer transition-colors group"
                      >
                        <Checkbox
                          checked={field.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, option.value]);
                            } else {
                              field.onChange(
                                field.value.filter((v) => v !== option.value)
                              );
                            }
                          }}
                        />
                        <span className="text-sm font-medium group-hover:text-green-700 transition-colors">
                          {option.label}
                        </span>
                        {field.value?.includes(option.value) && (
                          <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                        )}
                      </Label>
                    )
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {languagesOffered?.includes("other") && (
            <FormField
              control={form.control}
              name="languagesOffered_specify"
              render={({ field }) => (
                <FormItem className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <FormLabel className="text-base font-semibold">
                    Please specify other languages{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Tagalog, Kapampangan, etc."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Compliance & Professional Standards */}
      <Card className="border border-red-200 bg-red-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-red-600" />
            Compliance & Professional Standards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="professionalLiabilityInsurance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Do you have professional liability insurance for online
                  practice? <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-3"
                  >
                    {[
                      {
                        value: "yes",
                        label: "Yes",
                        description:
                          "I have active professional liability insurance",
                      },
                      {
                        value: "no",
                        label: "No",
                        description: "I do not have liability insurance",
                      },
                      {
                        value: "willing",
                        label: "Not yet, but willing to secure",
                        description:
                          "I am willing to obtain insurance before starting practice",
                      },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`liability-${option.value}`}
                        />
                        <Label
                          htmlFor={`liability-${option.value}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">
                            {option.description}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="complaintsOrDisciplinaryActions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Have you ever had complaints or disciplinary actions against
                  your PRC license? <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-3"
                  >
                    <div className="flex items-center space-x-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-gray-50 touch-manipulation">
                      <RadioGroupItem value="no" id="complaints-no" />
                      <Label
                        htmlFor="complaints-no"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">No</div>
                        <div className="text-sm text-gray-500">
                          No complaints or disciplinary actions
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-gray-50 touch-manipulation">
                      <RadioGroupItem value="yes" id="complaints-yes" />
                      <Label
                        htmlFor="complaints-yes"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">
                          Yes (please briefly explain)
                        </div>
                        <div className="text-sm text-gray-500">
                          I will provide details below
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {complaintsOrDisciplinaryActions === "yes" && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <FormField
                control={form.control}
                name="complaintsOrDisciplinaryActions_specify"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Please briefly explain the nature and resolution{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Please provide details about the complaint or disciplinary action and how it was resolved..."
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <FormField
              control={form.control}
              name="willingToAbideByPlatformGuidelines"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Are you willing to abide by our platform's ethical
                    guidelines, privacy policies, and patient safety standards?{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-1 gap-3"
                    >
                      <div className="flex items-center space-x-3 p-4 border-2 border-green-200 bg-green-50 rounded-lg hover:bg-green-100">
                        <RadioGroupItem value="yes" id="guidelines-yes" />
                        <Label
                          htmlFor="guidelines-yes"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium text-green-900">
                            Yes, I agree
                          </div>
                          <div className="text-sm text-green-700">
                            I commit to following all platform guidelines and
                            standards
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100">
                        <RadioGroupItem value="no" id="guidelines-no" />
                        <Label
                          htmlFor="guidelines-no"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium text-red-900">No</div>
                          <div className="text-sm text-red-700">
                            I do not agree to abide by the guidelines
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Availability & Services Section Component
function AvailabilityServicesSection({
  form,
  watchedValues,
}: {
  form: any;
  watchedValues: any;
}) {
  const { preferredSessionLength, accepts } = watchedValues;

  return (
    <div className="space-y-8">
      {/* Weekly Availability */}
      <Card className="border border-cyan-200 bg-cyan-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-cyan-600" />
            Weekly Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="weeklyAvailability"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Weekly availability for online sessions:{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-3"
                  >
                    {therapistProfileFormFields.availabilityAndPayment.weeklyAvailability.options.map(
                      (option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-cyan-100"
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={`weekly-${option.value}`}
                          />
                          <Label
                            htmlFor={`weekly-${option.value}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">{option.label}</div>
                          </Label>
                        </div>
                      )
                    )}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Session Length */}
      <Card className="border border-blue-200 bg-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-blue-600" />
            Session Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="preferredSessionLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Preferred session length:{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-3"
                  >
                    {therapistProfileFormFields.availabilityAndPayment.preferredSessionLength.options.map(
                      (option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-100"
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={`session-${option.value}`}
                          />
                          <Label
                            htmlFor={`session-${option.value}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">{option.label}</div>
                          </Label>
                        </div>
                      )
                    )}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {preferredSessionLength === "other" && (
            <FormField
              control={form.control}
              name="preferredSessionLength_specify"
              render={({ field }) => (
                <FormItem className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <FormLabel className="text-base font-semibold">
                    Please specify your preferred session length{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., 50 minutes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="border border-green-200 bg-green-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-green-600" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="accepts"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Payment Methods Accepted:{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <div className="grid grid-cols-1 gap-3">
                  {therapistProfileFormFields.availabilityAndPayment.accepts.options.map(
                    (option) => (
                      <Label
                        key={option.value}
                        className="flex items-center gap-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-green-100 hover:border-green-300 cursor-pointer transition-colors group"
                      >
                        <Checkbox
                          checked={field.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, option.value]);
                            } else {
                              field.onChange(
                                field.value.filter((v) => v !== option.value)
                              );
                            }
                          }}
                        />
                        <span className="text-sm font-medium group-hover:text-green-700 transition-colors">
                          {option.label}
                        </span>
                        {field.value?.includes(option.value) && (
                          <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                        )}
                      </Label>
                    )
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {accepts?.includes("hmo") && (
            <FormField
              control={form.control}
              name="accepts_hmo_specify"
              render={({ field }) => (
                <FormItem className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <FormLabel className="text-base font-semibold">
                    Please specify HMO providers{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Please list the HMO providers you accept..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Rate and Bio */}
      <Card className="border border-purple-200 bg-purple-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-purple-600" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Standard session rate (PHP, optional):
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="e.g., 1500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Professional Bio (optional):
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Brief description of your background, specializations, and approach to therapy..."
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Document Upload Section Component
function DocumentUploadSection({
  documents,
  onFileChange,
  onRemoveFile,
}: {
  documents: any;
  onFileChange: any;
  onRemoveFile: any;
}) {
  const requiredDocs = [
    {
      key: "prcLicense",
      title: "PRC License",
      description: "Upload a clear copy of your valid PRC license",
    },
    {
      key: "nbiClearance",
      title: "NBI Clearance",
      description:
        "Upload your NBI clearance (issued within the last 6 months)",
    },
    {
      key: "resumeCV",
      title: "Resume/CV",
      description: "Upload your professional resume or curriculum vitae",
    },
  ];

  const optionalDocs = [
    {
      key: "liabilityInsurance",
      title: "Professional Liability Insurance",
      description:
        "If applicable, upload a copy of your professional liability insurance",
    },
    {
      key: "birForm",
      title: "BIR Form 2303 / Certificate of Registration",
      description: "Optional: Upload for tax reporting and payment processing",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Required Documents
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Please upload the following documents to complete your application.
          All documents must be clear and legible. Accepted formats: PDF, JPG,
          PNG, DOCX (Max 10MB each).
        </p>

        <div className="space-y-6">
          {requiredDocs.map((doc) => (
            <DocumentUploadCard
              key={doc.key}
              title={doc.title}
              description={doc.description}
              required={true}
              files={documents[doc.key] || []}
              onFileChange={(files) => onFileChange(doc.key, files)}
              onRemoveFile={(index) => onRemoveFile(doc.key, index)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Additional Documents (Optional)
        </h3>
        <div className="space-y-6">
          {optionalDocs.map((doc) => (
            <DocumentUploadCard
              key={doc.key}
              title={doc.title}
              description={doc.description}
              required={false}
              files={documents[doc.key] || []}
              onFileChange={(files) => onFileChange(doc.key, files)}
              onRemoveFile={(index) => onRemoveFile(doc.key, index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Document Upload Card Component
function DocumentUploadCard({
  title,
  description,
  required,
  files,
  onFileChange,
  onRemoveFile,
}: {
  title: string;
  description: string;
  required: boolean;
  files: any;
  onFileChange: any;
  onRemoveFile: any;
}) {
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileChange(e.dataTransfer.files);
      }
    },
    [onFileChange]
  );

  return (
    <Card
      className={`border ${files.length > 0 ? "border-green-300 bg-green-50" : "border-gray-200"}`}
    >
      <CardContent className="p-0">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {required && (
              <Badge variant="destructive" className="text-xs">
                Required
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>

        <div className="p-5">
          {files && files.length > 0 ? (
            <div className="space-y-3">
              {Array.from(files).map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center min-w-0">
                    <FileText className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 ml-2"
                    onClick={() => onRemoveFile(index)}
                  >
                    <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                type="button"
                className="w-full mt-3 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                onClick={() =>
                  document.getElementById(`file-input-${title}`).click()
                }
              >
                <Upload className="w-4 h-4 mr-2" /> Upload Additional File(s)
              </Button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors cursor-pointer hover:border-green-400 bg-white"
              onClick={() =>
                document.getElementById(`file-input-${title}`).click()
              }
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700">
                  Drag and drop your file(s) here, or
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, JPG, PNG or DOCX up to 10MB each
                </p>
              </div>
              <Button type="button" variant="outline" className="mt-4">
                Browse Files
              </Button>
            </div>
          )}
          <input
            id={`file-input-${title}`}
            type="file"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files)}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            multiple
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Review Section Component
function ReviewSection({
  form,
  watchedValues,
  documents,
}: {
  form: any;
  watchedValues: any;
  documents: any;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          Application Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <strong>Name:</strong> {watchedValues.firstName}{" "}
              {watchedValues.lastName}
            </p>
            <p>
              <strong>Email:</strong> {watchedValues.email}
            </p>
            <p>
              <strong>Mobile:</strong> {watchedValues.mobile}
            </p>
            <p>
              <strong>Province:</strong> {watchedValues.province}
            </p>
          </div>
          <div>
            <p>
              <strong>License Type:</strong>{" "}
              {watchedValues.professionalLicenseType}
            </p>
            <p>
              <strong>PRC Licensed:</strong> {watchedValues.isPRCLicensed}
            </p>
            <p>
              <strong>Expertise Areas:</strong>{" "}
              {watchedValues.areasOfExpertise?.length || 0} selected
            </p>
            <p>
              <strong>Documents:</strong>{" "}
              {Object.values(documents).reduce(
                (sum: number, docs) => sum + (docs as File[]).length,
                0
              )}{" "}
              files uploaded
            </p>
          </div>
        </div>
      </div>

      <FormField
        control={form.control}
        name="consentChecked"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-gray-200 rounded-lg">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                I certify that all documents uploaded are authentic and valid. I
                understand that providing false information may result in the
                rejection of my application.
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
