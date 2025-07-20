/**
 * Auth-specific error types and handlers
 * Temporary implementation for Module 1
 */

export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',
  OTP_INVALID = 'OTP_INVALID',
  OTP_EXPIRED = 'OTP_EXPIRED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class AuthError extends Error {
  public type: AuthErrorType;
  public details?: any;

  constructor(type: AuthErrorType, message: string, details?: any) {
    super(message);
    this.name = 'AuthError';
    this.type = type;
    this.details = details;
  }
}

// Helper functions for creating specific auth errors
export const createAuthError = {
  invalidCredentials: (details?: any) => 
    new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid email or password', details),
  
  accountLocked: (details?: any) => 
    new AuthError(AuthErrorType.ACCOUNT_LOCKED, 'Account is locked', details),
  
  emailNotVerified: (details?: any) => 
    new AuthError(AuthErrorType.EMAIL_NOT_VERIFIED, 'Email address not verified', details),
  
  tokenExpired: (details?: any) => 
    new AuthError(AuthErrorType.TOKEN_EXPIRED, 'Token has expired', details),
  
  invalidToken: (details?: any) => 
    new AuthError(AuthErrorType.INVALID_TOKEN, 'Invalid token', details),
  
  registrationFailed: (details?: any) => 
    new AuthError(AuthErrorType.REGISTRATION_FAILED, 'Registration failed', details),
  
  otpInvalid: (details?: any) => 
    new AuthError(AuthErrorType.OTP_INVALID, 'Invalid OTP code', details),
  
  otpExpired: (details?: any) => 
    new AuthError(AuthErrorType.OTP_EXPIRED, 'OTP code has expired', details),
  
  unknown: (message: string = 'An unknown error occurred', details?: any) => 
    new AuthError(AuthErrorType.UNKNOWN_ERROR, message, details),
};