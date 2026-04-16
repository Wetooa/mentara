/**
 * Validation utilities for auth module
 * Simple validation functions for auth operations
 */

import { z } from 'zod';

// Validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Array<{
    path: PropertyKey[];
    message: string;
    code: string;
  }>;
}

// Generic validation function
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: result.error.issues.map((error) => ({
      path: error.path,
      message: error.message,
      code: error.code,
    })),
  };
}

// Format validation errors for display
export function formatValidationErrors(
  errors?: Array<{
    path: PropertyKey[];
    message: string;
    code: string;
  }>,
): string {
  if (!errors || errors.length === 0) {
    return 'Validation failed';
  }

  return errors
    .map((error) => {
      const path = error.path.map((p) => String(p)).join('.');
      return path ? `${path}: ${error.message}` : error.message;
    })
    .join(', ');
}

// Check if validation has errors
export function hasValidationErrors<T>(result: ValidationResult<T>): boolean {
  return !result.success && !!result.errors && result.errors.length > 0;
}

// Get first validation error message
export function getFirstValidationError<T>(
  result: ValidationResult<T>,
): string | undefined {
  if (!result.errors || result.errors.length === 0) {
    return undefined;
  }

  return result.errors[0].message;
}
