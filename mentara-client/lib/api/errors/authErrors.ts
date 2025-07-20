import { MentaraApiError } from "@/lib/api/errorHandler";

/**
 * Enhanced authentication-specific error classes
 */

export class AuthenticationError extends MentaraApiError {
  public readonly operation: string;
  public readonly userEmail?: string;
  public readonly timestamp: Date;

  constructor(options: {
    originalError: Error;
    operation: string;
    userEmail?: string;
    timestamp: Date;
  }) {
    super(
      options.originalError.message,
      'AUTHENTICATION_ERROR',
      options.originalError instanceof MentaraApiError ? options.originalError.status : 401
    );
    
    this.operation = options.operation;
    this.userEmail = options.userEmail;
    this.timestamp = options.timestamp;
    this.name = 'AuthenticationError';
  }

  getUserFriendlyMessage(): string {
    switch (this.operation) {
      case 'login':
        return this.status === 401 
          ? 'Invalid email or password. Please check your credentials and try again.'
          : 'Unable to sign in at this time. Please try again later.';
      
      case 'register':
        return this.status === 409
          ? 'An account with this email already exists. Please try signing in instead.'
          : 'Unable to create account at this time. Please try again later.';
      
      case 'refresh':
        return 'Your session has expired. Please sign in again.';
      
      case 'resetPassword':
        return 'Unable to send password reset email. Please try again later.';
      
      default:
        return 'Authentication failed. Please try again.';
    }
  }
}

export class TokenExpiredError extends MentaraApiError {
  constructor(message: string = 'Token has expired') {
    super(message, 'TOKEN_EXPIRED', 401);
    this.name = 'TokenExpiredError';
  }

  getUserFriendlyMessage(): string {
    return 'Your session has expired. Please sign in again to continue.';
  }
}

export class InvalidCredentialsError extends MentaraApiError {
  public readonly email?: string;
  public readonly attemptCount?: number;

  constructor(email?: string, attemptCount?: number) {
    super('Invalid credentials provided', 'INVALID_CREDENTIALS', 401);
    this.email = email;
    this.attemptCount = attemptCount;
    this.name = 'InvalidCredentialsError';
  }

  getUserFriendlyMessage(): string {
    if (this.attemptCount && this.attemptCount >= 3) {
      return 'Multiple failed login attempts detected. Please reset your password or try again later.';
    }
    return 'The email or password you entered is incorrect. Please try again.';
  }
}

export class AccountNotFoundError extends MentaraApiError {
  public readonly email?: string;

  constructor(email?: string) {
    super('Account not found', 'ACCOUNT_NOT_FOUND', 404);
    this.email = email;
    this.name = 'AccountNotFoundError';
  }

  getUserFriendlyMessage(): string {
    return "We couldn't find an account with that email address. Please check the email or sign up for a new account.";
  }
}

export class AccountLockedError extends MentaraApiError {
  public readonly lockDuration?: number; // in minutes
  public readonly reason?: string;

  constructor(lockDuration?: number, reason?: string) {
    super('Account is temporarily locked', 'ACCOUNT_LOCKED', 423);
    this.lockDuration = lockDuration;
    this.reason = reason;
    this.name = 'AccountLockedError';
  }

  getUserFriendlyMessage(): string {
    if (this.lockDuration) {
      return `Your account has been temporarily locked due to multiple failed login attempts. Please try again in ${this.lockDuration} minutes.`;
    }
    return 'Your account has been temporarily locked. Please contact support for assistance.';
  }
}

export class EmailNotVerifiedError extends MentaraApiError {
  public readonly email?: string;

  constructor(email?: string) {
    super('Email address not verified', 'EMAIL_NOT_VERIFIED', 403);
    this.email = email;
    this.name = 'EmailNotVerifiedError';
  }

  getUserFriendlyMessage(): string {
    return 'Please verify your email address before signing in. Check your inbox for a verification link.';
  }
}

export class OAuthError extends MentaraApiError {
  public readonly provider: string;
  public readonly oauthErrorCode?: string;

  constructor(provider: string, message: string, oauthErrorCode?: string) {
    super(message, 'OAUTH_ERROR', 400);
    this.provider = provider;
    this.oauthErrorCode = oauthErrorCode;
    this.name = 'OAuthError';
  }

  getUserFriendlyMessage(): string {
    switch (this.provider.toLowerCase()) {
      case 'google':
        return 'Unable to sign in with Google. Please try again or use email and password.';
      case 'microsoft':
        return 'Unable to sign in with Microsoft. Please try again or use email and password.';
      default:
        return `Unable to sign in with ${this.provider}. Please try again or use email and password.`;
    }
  }
}

export class RateLimitError extends MentaraApiError {
  public readonly retryAfter: number; // seconds
  public readonly operation: string;

  constructor(operation: string, retryAfter: number = 60) {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
    this.operation = operation;
    this.retryAfter = retryAfter;
    this.name = 'RateLimitError';
  }

  getUserFriendlyMessage(): string {
    const minutes = Math.ceil(this.retryAfter / 60);
    return `Too many ${this.operation} attempts. Please wait ${minutes} minute${minutes !== 1 ? 's' : ''} before trying again.`;
  }
}

export class NetworkConnectionError extends Error {
  public readonly isOffline: boolean;
  public readonly timestamp: Date;

  constructor(isOffline: boolean = false) {
    super('Network connection error');
    this.isOffline = isOffline;
    this.timestamp = new Date();
    this.name = 'NetworkConnectionError';
  }

  getUserFriendlyMessage(): string {
    if (this.isOffline) {
      return 'You appear to be offline. Please check your internet connection and try again.';
    }
    return 'Unable to connect to our servers. Please check your internet connection and try again.';
  }
}

/**
 * Factory function to create appropriate auth error from generic error
 */
export function createAuthError(
  error: unknown,
  context: { operation: string; userEmail?: string }
): Error {
  // If it's already an auth error, return as-is
  if (error instanceof AuthenticationError ||
      error instanceof TokenExpiredError ||
      error instanceof InvalidCredentialsError ||
      error instanceof AccountNotFoundError ||
      error instanceof AccountLockedError ||
      error instanceof EmailNotVerifiedError ||
      error instanceof OAuthError ||
      error instanceof RateLimitError) {
    return error;
  }

  // Handle MentaraApiError instances
  if (error instanceof MentaraApiError) {
    switch (error.status) {
      case 401:
        if (error.code === 'TOKEN_EXPIRED') {
          return new TokenExpiredError();
        }
        if (error.code === 'INVALID_CREDENTIALS') {
          return new InvalidCredentialsError(context.userEmail);
        }
        return new AuthenticationError({
          originalError: error,
          operation: context.operation,
          userEmail: context.userEmail,
          timestamp: new Date()
        });

      case 403:
        if (error.code === 'EMAIL_NOT_VERIFIED') {
          return new EmailNotVerifiedError(context.userEmail);
        }
        break;

      case 404:
        if (context.operation === 'login' || context.operation === 'resetPassword') {
          return new AccountNotFoundError(context.userEmail);
        }
        break;

      case 423:
        return new AccountLockedError();

      case 429:
        return new RateLimitError(context.operation);
    }
  }

  // Handle network errors
  if (error instanceof Error && 
      (error.name === 'NetworkError' || 
       error.message.includes('fetch') || 
       error.message.includes('network'))) {
    return new NetworkConnectionError();
  }

  // Fallback to generic authentication error
  return new AuthenticationError({
    originalError: error instanceof Error ? error : new Error('Unknown error'),
    operation: context.operation,
    userEmail: context.userEmail,
    timestamp: new Date()
  });
}