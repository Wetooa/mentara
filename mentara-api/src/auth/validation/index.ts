/**
 * Auth Validation - Central exports for authentication validation schemas
 */

// Export all validation schemas
export * from './auth.schemas';

// Export validation utilities
export * from './validation.utils';

// Re-export commonly used schemas for convenience
export {
  LoginDtoSchema,
  RegisterUserDtoSchema,
  RegisterClientDtoSchema,
  RegisterTherapistDtoSchema,
  RegisterAdminDtoSchema,
  RegisterModeratorDtoSchema,
  RequestPasswordResetDtoSchema,
  ResetPasswordDtoSchema,
  VerifyEmailDtoSchema,
  ResendVerificationEmailDtoSchema,
  SendOtpDtoSchema,
  VerifyOtpDtoSchema,
  ResendOtpDtoSchema,
  VerifyRegistrationOtpDtoSchema,
  ResendRegistrationOtpDtoSchema,
  TerminateSessionDtoSchema,
  CheckUserExistsDtoSchema,
} from './auth.schemas';