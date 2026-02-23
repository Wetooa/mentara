/**
 * Auth Validation Schemas - Zod schemas for runtime validation
 * Separated from type definitions to maintain clean architecture
 */

import { z } from "zod";

export const LoginDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  sessionId: z.string().optional(),
});

export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const LogoutDtoSchema = z.object({
  refreshToken: z.string().optional(),
});

export const RegisterUserDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.string(),
});

export const ChangePasswordDtoSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Password Reset Schemas
export const RequestPasswordResetDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const ResetPasswordDtoSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Email Verification Schemas
export const SendVerificationEmailDtoSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
});

export const ResendVerificationEmailDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const VerifyEmailDtoSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

// OTP Type Enum Schema
export const OtpTypeSchema = z.enum([
  "registration",
  "password_reset",
  "login_verification",
]);

// OTP Verification Schemas
export const SendOtpDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
  type: OtpTypeSchema.default("registration"),
});

export const VerifyOtpDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
  otpCode: z
    .string()
    .min(6, "OTP code must be 6 digits")
    .max(6, "OTP code must be 6 digits"),
  type: OtpTypeSchema.default("registration"),
});

export const ResendOtpDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
  type: OtpTypeSchema.default("registration"),
});

// Client Registration OTP Verification Schemas
export const VerifyRegistrationOtpDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
  otpCode: z
    .string()
    .min(6, "OTP code must be 6 digits")
    .max(6, "OTP code must be 6 digits"),
});

export const ResendRegistrationOtpDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const RegisterWithOtpDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
  otpCode: z
    .string()
    .min(6, "OTP code must be 6 digits")
    .max(6, "OTP code must be 6 digits"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.string(),
});

// Role-specific Registration Schemas
export const RegisterClientDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const RegisterAdminDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  permissions: z.array(z.string()).default([]),
});

export const RegisterModeratorDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  permissions: z.array(z.string()).default([]),
  assignedCommunities: z.array(z.string()).default([]),
});

export const RegisterTherapistDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  
  mobile: z.string().min(1, "Mobile number is required"),
  province: z.string().min(1, "Province is required"),
  timezone: z.string().optional(),
  providerType: z.string().min(1, "Provider type is required"),
  professionalLicenseType: z.string().min(1, "Professional license type is required"),
  professionalLicenseType_specify: z.string().optional(),
  isPRCLicensed: z.string().min(1, "PRC licensing status is required"),
  prcLicenseNumber: z.string().min(1, "PRC license number is required"),
  expirationDateOfLicense: z.string().min(1, "Expiration date of license is required"),
  practiceStartDate: z.string().min(1, "Practice start date is required"),
  
  certifications: z.any().optional(),
  certificateUrls: z.array(z.string()).optional(),
  certificateNames: z.array(z.string()).optional(),
  licenseUrls: z.array(z.string()).optional(),
  licenseNames: z.array(z.string()).optional(),
  documentUrls: z.array(z.string()).optional(),
  documentNames: z.array(z.string()).optional(),
  
  yearsOfExperience: z.number().min(0).optional(),
  educationBackground: z.string().optional(),
  specialCertifications: z.array(z.string()).optional(),
  practiceLocation: z.string().optional(),
  
  acceptsInsurance: z.boolean().optional(),
  acceptedInsuranceTypes: z.array(z.string()).optional(),
  
  areasOfExpertise: z.array(z.string()).optional(),
  assessmentTools: z.array(z.string()).optional(),
  therapeuticApproachesUsedList: z.array(z.string()).optional(),
  therapeuticApproachesUsedList_specify: z.array(z.string()).optional(),
  
  languagesOffered: z.array(z.string()).optional(),
  languagesOffered_specify: z.string().optional(),
  
  providedOnlineTherapyBefore: z.string().min(1, "This field is required"),
  comfortableUsingVideoConferencing: z.string().min(1, "This field is required"),
  
  preferredSessionLength: z.array(z.number()).min(1, "Preferred session length is required"),
  preferredSessionLength_specify: z.string().optional(),
  
  privateConfidentialSpace: z.string().optional(),
  compliesWithDataPrivacyAct: z.string().min(1, "Compliance with Data Privacy Act is required"),
  professionalLiabilityInsurance: z.string().optional(),
  complaintsOrDisciplinaryActions: z.string().optional(),
  willingToAbideByPlatformGuidelines: z.string().min(1, "Willingness to abide by guidelines is required"),
  
  expertise: z.array(z.string()).optional(),
  approaches: z.array(z.array(z.string())).optional().or(z.array(z.string()).optional()), // Flexible for now
  languages: z.array(z.string()).optional(),
  illnessSpecializations: z.array(z.string()).optional(),
  acceptTypes: z.array(z.string()).optional(),
  treatmentSuccessRates: z.any().optional(),
  sessionLength: z.string().min(1, "Session length is required"),
  hourlyRate: z.number().min(0, "Hourly rate is required"),
});

// Session Management Schemas
export const TerminateSessionDtoSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export const CheckUserExistsDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// Type extraction helpers (for intellisense and type safety)
export type LoginDtoType = z.infer<typeof LoginDtoSchema>;
export type RegisterUserDtoType = z.infer<typeof RegisterUserDtoSchema>;
export type RegisterClientDtoType = z.infer<typeof RegisterClientDtoSchema>;
export type RegisterTherapistDtoType = z.infer<typeof RegisterTherapistDtoSchema>;
export type RegisterAdminDtoType = z.infer<typeof RegisterAdminDtoSchema>;
export type RegisterModeratorDtoType = z.infer<typeof RegisterModeratorDtoSchema>;