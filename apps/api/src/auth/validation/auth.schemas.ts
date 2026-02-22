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
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  specializations: z.array(z.string()).min(1, "At least one specialization is required"),
  credentials: z.array(z.string()).min(1, "At least one credential is required"),
  experience: z.number().min(0, "Experience cannot be negative"),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  hourlyRate: z.number().min(0, "Hourly rate cannot be negative").optional(),
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