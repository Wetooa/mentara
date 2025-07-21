/**
 * Auth module types - Central exports for authentication-related types
 */

// Export all DTOs
export * from './auth.dto';

// Export all response types
export * from './auth.response';

// Export all constants
export * from './auth.constants';

// Re-export commonly used types for convenience
export type {
  LoginDto,
  RegisterUserDto,
  RegisterClientDto,
  RegisterTherapistDto,
  RegisterAdminDto,
  RegisterModeratorDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationEmailDto,
  SendOtpDto,
  VerifyOtpDto,
  ResendOtpDto,
} from './auth.dto';

export type {
  AuthResponse,
  ClientAuthResponse,
  TherapistAuthResponse,
  AdminAuthResponse,
  ModeratorAuthResponse,
  EmailResponse,
  SuccessResponse,
  UserResponse,
  TokenPair,
  AuthUser,
} from './auth.response';