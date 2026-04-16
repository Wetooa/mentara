/**
 * Auth module constants
 */

// Allowed MIME types for document uploads (therapy applications, etc.)
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg', 
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const;

// Maximum file size for document uploads (in bytes) - 10MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

// Required document types for therapist applications
export const REQUIRED_DOCUMENT_TYPES = [
  'license',
  'diploma'
] as const;

// Optional document types for therapist applications
export const OPTIONAL_DOCUMENT_TYPES = [
  'certification',
  'insurance',
  'reference_letter'
] as const;

// All document types
export const ALL_DOCUMENT_TYPES = [
  ...REQUIRED_DOCUMENT_TYPES,
  ...OPTIONAL_DOCUMENT_TYPES
] as const;

// Document type mapping for display names
export const DOCUMENT_TYPE_MAPPING = {
  license: 'Professional License',
  diploma: 'Degree/Diploma',
  certification: 'Professional Certification',
  insurance: 'Malpractice Insurance',
  reference_letter: 'Reference Letter'
} as const;

// Auth-related error codes
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_INVALID: 'OTP_INVALID',
  PASSWORD_TOO_WEAK: 'PASSWORD_TOO_WEAK',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
} as const;

// Session constants
export const SESSION_CONSTANTS = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d', 
  OTP_EXPIRY_MINUTES: 10,
  PASSWORD_RESET_TOKEN_EXPIRY: '1h',
  EMAIL_VERIFICATION_TOKEN_EXPIRY: '24h',
} as const;

// Rate limiting constants  
export const RATE_LIMIT_CONSTANTS = {
  LOGIN_ATTEMPTS: 5,
  OTP_REQUESTS: 3,
  PASSWORD_RESET_REQUESTS: 3,
} as const;