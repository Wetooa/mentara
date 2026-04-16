"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm, useWatch, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { unifiedTherapistSchema, type UnifiedTherapistForm } from "@/lib/therapist-application/schema";
import { therapistApplicationSections } from "@/lib/therapist-application/sections";
import useTherapistForm from "@/store/therapistform";
import { useSectionCompletion } from "@/hooks/user/useSectionCompletion";
import { useApi } from "@/lib/api";
import type { UseFormReturn } from "react-hook-form";
import type { ApplicationSection } from "@/types/therapist-application";
import type { CompletionStatus } from "@/types/therapist-application";

export interface UseTherapistApplicationFormReturn {
  // Form instance
  form: ReturnType<typeof useForm<UnifiedTherapistForm>>;
  
  // Form state
  watchedValues: Partial<UnifiedTherapistForm>;
  isSubmitting: boolean;
  
  // Section state
  sections: ApplicationSection[];
  sectionCompletions: Record<string, CompletionStatus>;
  openSections: Set<string>;
  overallProgress: number;
  displayProgress: number;
  
  // Document state
  documents: {
    prcLicense: File[];
    nbiClearance: File[];
    resumeCV: File[];
  };
  
  // Handlers
  toggleSection: (sectionId: string) => void;
  handleSubmit: (values: UnifiedTherapistForm) => Promise<void>;
  handleRestartForm: () => void;
  updateDocuments: (docType: string, files: File[]) => void;
  removeDocument: (docType: string, index: number) => void;
  
  // Mobile navigation
  currentSectionIndex: number;
  goToNextSection: () => void;
  goToPreviousSection: () => void;
}

/**
 * Custom hook for therapist application form logic
 * Handles form initialization, submission, section management, and document uploads
 */
export function useTherapistApplicationForm(): UseTherapistApplicationFormReturn {
  const router = useRouter();
  const api = useApi();
  const {
    updateField,
    documents,
    updateDocuments: updateDocumentsStore,
    removeDocument: removeDocumentStore,
    formValues,
  } = useTherapistForm();

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["basicInfo"])
  );
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Form setup with persisted values
  const form = useForm<UnifiedTherapistForm>({
    resolver: zodResolver(
      unifiedTherapistSchema
    ) as unknown as Resolver<UnifiedTherapistForm>,
    defaultValues: {
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
      sessionDuration: formValues.sessionDuration || undefined,
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

  // Watch form values for conditional rendering and progress calculation
  const watchedValues = useWatch({ control: form.control });

  // Use optimized section completion hook
  const sectionCompletions = useSectionCompletion(
    watchedValues,
    documents,
    therapistApplicationSections
  );

  // Overall progress calculation - only count required sections for submission eligibility
  const overallProgress = useMemo(() => {
    const requiredSections = therapistApplicationSections.filter(
      (section) => section.isRequired
    );
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
    const totalCompleted = therapistApplicationSections.reduce(
      (sum, section) => sum + sectionCompletions[section.id].completed,
      0
    );
    const totalFields = therapistApplicationSections.reduce(
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
  const goToNextSection = useCallback(() => {
    if (currentSectionIndex < therapistApplicationSections.length - 1) {
      const nextIndex = currentSectionIndex + 1;
      const nextSection = therapistApplicationSections[nextIndex];
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
      const prevSection = therapistApplicationSections[prevIndex];
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

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });

      toast.success("Form restarted successfully");
    } catch (error) {
      console.error("Error restarting form:", error);
      toast.error("Failed to restart form");
    }
  }, [form]);

  // Transform form data to match backend DTO format
  const transformFormData = useCallback(
    (values: UnifiedTherapistForm) => {
      return {
        // Basic information + password required for registration
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`, // Temporary password - will be replaced by backend
        mobile: values.mobile,
        province: values.province,
        providerType: values.providerType,

        // Professional license information
        professionalLicenseType:
          values.professionalLicenseType_specify ||
          values.professionalLicenseType,
        professionalLicenseType_specify:
          values.professionalLicenseType_specify,
        isPRCLicensed: values.isPRCLicensed,
        prcLicenseNumber: values.prcLicenseNumber || "",
        isLicenseActive: values.isLicenseActive || "",
        expirationDateOfLicense: values.expirationDateOfLicense,
        practiceStartDate: values.practiceStartDate,

        // New fields from registration schema
        yearsOfExperience: values.yearsOfExperience,
        educationBackground: values.educationBackground,
        practiceLocation: values.practiceLocation,

        // Areas and tools
        areasOfExpertise: values.areasOfExpertise,
        assessmentTools: values.assessmentTools,
        therapeuticApproachesUsedList: values.therapeuticApproachesUsedList,
        therapeuticApproachesUsedList_specify:
          values.therapeuticApproachesUsedList_specify,
        languagesOffered: values.languagesOffered,
        languagesOffered_specify: values.languagesOffered_specify,

        // Teletherapy readiness (keep as strings for unified registration)
        providedOnlineTherapyBefore: values.providedOnlineTherapyBefore,
        comfortableUsingVideoConferencing:
          values.comfortableUsingVideoConferencing,
        privateConfidentialSpace: values.privateConfidentialSpace,
        compliesWithDataPrivacyAct: values.compliesWithDataPrivacyAct,

        // Compliance (keep as strings for unified registration)
        professionalLiabilityInsurance: values.professionalLiabilityInsurance,
        complaintsOrDisciplinaryActions:
          values.complaintsOrDisciplinaryActions,
        complaintsOrDisciplinaryActions_specify:
          values.complaintsOrDisciplinaryActions_specify,
        willingToAbideByPlatformGuidelines:
          values.willingToAbideByPlatformGuidelines,

        // Availability and payment
        weeklyAvailability: values.weeklyAvailability,
        preferredSessionLength: values.preferredSessionLength,
        preferredSessionLength_specify: values.preferredSessionLength_specify,
        accepts: values.accepts,
        accepts_hmo_specify: values.accepts_hmo_specify,

        // Optional fields
        bio: values.bio || "",
        hourlyRate: values.hourlyRate || 0,
        acceptsInsurance: values.acceptsInsurance,
        acceptedInsuranceTypes: values.acceptedInsuranceTypes,
        sessionDuration: values.sessionDuration,

        // Document upload tracking
        documentsUploaded: values.documentsUploaded,
        consentChecked: values.consentChecked,
      };
    },
    []
  );

  // Prepare FormData for submission with documents
  const prepareFormData = useCallback(
    (transformedData: ReturnType<typeof transformFormData>) => {
      const formData = new FormData();

      // Add application data as JSON string (required by backend)
      formData.append("applicationDataJson", JSON.stringify(transformedData));

      // Prepare documents for upload - filter out deleted/missing files
      const allFiles = Object.entries(documents)
        .filter(([, files]) => files && files.length > 0) // Only include document types with actual files
        .flatMap(([type, files]) =>
          files
            .filter((file) => file && file instanceof File) // Ensure file exists and is valid
            .map((file) => ({ file, type }))
        );

      const fileTypeMap: Record<string, string> = {};

      allFiles.forEach(({ file, type }) => {
        // Additional safety check to ensure file is valid before processing
        if (file && file instanceof File && file.name) {
          formData.append("files", file);
          fileTypeMap[file.name] = type; // Use frontend document type directly
        }
      });

      // Add file type mapping as JSON string
      if (Object.keys(fileTypeMap).length > 0) {
        formData.append("fileTypes", JSON.stringify(fileTypeMap));
      }

      return formData;
    },
    [documents]
  );

  // Validate required documents
  const validateDocuments = useCallback(() => {
    const requiredDocs = ["prcLicense", "nbiClearance", "resumeCV"] as const;
    const missingDocs = requiredDocs.filter(
      (doc) =>
        !documents[doc] || documents[doc].length === 0
    );

    if (missingDocs.length > 0) {
      const docNames: Record<string, string> = {
        prcLicense: "PRC License",
        nbiClearance: "NBI Clearance",
        resumeCV: "Resume/CV",
      };
      const missingNames = missingDocs
        .map((doc) => docNames[doc])
        .join(", ");

      toast.error(`Please upload all required documents: ${missingNames}`);
      return false;
    }
    return true;
  }, [documents]);

  // Handle error and redirect
  const handleErrorRedirect = useCallback(
    (error: Error) => {
      const message = error.message.toLowerCase();

      if (message.includes("email already exists") || message.includes("an application with this email")) {
        router.push(
          `/therapist-application/error?type=email_exists&message=${encodeURIComponent(error.message)}`
        );
        return;
      }

      if (
        message.includes("validation") ||
        message.includes("required") ||
        message.includes("check all required fields")
      ) {
        router.push(
          `/therapist-application/error?type=validation_error&message=${encodeURIComponent(error.message)}`
        );
        return;
      }

      if (
        message.includes("file") ||
        message.includes("upload") ||
        message.includes("document")
      ) {
        router.push(
          `/therapist-application/error?type=upload_error&message=${encodeURIComponent(error.message)}`
        );
        return;
      }

      if (
        message.includes("server") ||
        message.includes("500") ||
        message.includes("contact support")
      ) {
        router.push(
          `/therapist-application/error?type=server_error&message=${encodeURIComponent(error.message)}`
        );
        return;
      }

      // Generic error fallback
      router.push(
        `/therapist-application/error?type=unknown&message=${encodeURIComponent(error.message)}`
      );
    },
    [router]
  );

  // Submit handler
  const handleSubmit = useCallback(
    async (values: UnifiedTherapistForm) => {
      setIsSubmitting(true);
      try {
        // Save to Zustand store for persistence
        Object.entries(values).forEach(([key, value]) => {
          updateField(key, value);
        });

        // Validate documents
        if (!validateDocuments()) {
          setIsSubmitting(false);
          return;
        }

        // Transform form data
        const transformedData = transformFormData(values);

        // Prepare FormData
        const formData = prepareFormData(transformedData);

        toast.info("Registering therapist account with documents...");

        // Use unified therapist registration endpoint
        const result = await api.auth.therapist.register(formData);

        console.log(
          "Therapist registration with documents successful:",
          result
        );

        toast.success(
          "Successfully registered therapist account with documents"
        );

        // Navigate to success page after successful registration
        setTimeout(() => {
          router.push(
            `/therapist-application/success?id=${result.user?.id || "success"}`
          );
        }, 1500);
      } catch (error) {
        console.error("Error submitting application:", error);
        if (error instanceof Error) {
          handleErrorRedirect(error);
        } else {
          router.push(
            `/therapist-application/error?type=unknown&message=${encodeURIComponent("Unknown error occurred")}`
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      router,
      api,
      updateField,
      transformFormData,
      prepareFormData,
      validateDocuments,
      handleErrorRedirect,
    ]
  );

  // Document handlers
  const updateDocuments = useCallback(
    (docType: string, files: File[]) => {
      updateDocumentsStore(
        docType as keyof typeof documents,
        files
      );
    },
    [updateDocumentsStore, documents]
  );

  const removeDocument = useCallback(
    (docType: string, index: number) => {
      removeDocumentStore(
        docType as keyof typeof documents,
        index
      );
    },
    [removeDocumentStore, documents]
  );

  return {
    form,
    watchedValues,
    isSubmitting,
    sections: therapistApplicationSections,
    sectionCompletions,
    openSections,
    overallProgress,
    displayProgress,
    documents: {
      prcLicense: documents.prcLicense || [],
      nbiClearance: documents.nbiClearance || [],
      resumeCV: documents.resumeCV || [],
    },
    toggleSection,
    handleSubmit,
    handleRestartForm,
    updateDocuments,
    removeDocument,
    currentSectionIndex,
    goToNextSection,
    goToPreviousSection,
  };
}

