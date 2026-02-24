import { z } from "zod";

/**
 * Comprehensive Zod Schema for all therapist application form sections
 * Updated to match backend DTO structure
 */
export const unifiedTherapistSchema = z
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
    prcLicenseNumber: z.string().min(1, "PRC license number is required"),
    expirationDateOfLicense: z.string().min(1, "Expiration date is required"),

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
    otherAreaOfExpertise: z.string().optional(),
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
      .array(z.string())
      .min(1, "Please select at least one preferred session length"),
    preferredSessionLength_specify: z.string().optional(),

    preferOnlineOrOffline: z.string().min(1, "Please select your preference"),
    willingToCaterOutsideCebu: z.string().min(1, "Please indicate your willingness"),

    // Payment and Rates
    preferredPayrollAccount: z
      .string()
      .min(1, "Please provide your preferred payroll account"),
    hourlyRate: z
      .number()
      .optional()
      .refine((val) => val === undefined || val >= 0, {
        message: "Rate must be a positive number",
      }),

    // Insurance Information (optional - not implemented in UI yet)
    acceptsInsurance: z.boolean().optional(),
    acceptedInsuranceTypes: z.array(z.string()).optional(),
    sessionDuration: z.number().optional(),

    // Bio/About
    bio: z.string().optional(),

    // Compliance - Flattened for backend compatibility
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
      val.preferredSessionLength?.includes("other") &&
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

/**
 * Type inferred from the unified therapist schema
 */
export type UnifiedTherapistForm = z.infer<typeof unifiedTherapistSchema>;

/**
 * Schema validation utilities
 */
export const validateTherapistForm = (data: unknown) => {
  return unifiedTherapistSchema.safeParse(data);
};

export const validateTherapistFormAsync = (data: unknown) => {
  return unifiedTherapistSchema.safeParseAsync(data);
};

