import { z } from 'zod';

// Validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Array<{
    path: (string | number)[];
    message: string;
    code: string;
  }>;
}

// Generic validation function
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  }
  
  return {
    success: false,
    errors: result.error.errors.map(error => ({
      path: error.path,
      message: error.message,
      code: error.code
    }))
  };
}

// Validation with custom error formatting
export function validateWithCustomErrors<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  customErrors?: Record<string, string>
): ValidationResult<T> {
  const result = validateSchema(schema, data);
  
  if (!result.success && customErrors && result.errors) {
    result.errors = result.errors.map(error => ({
      ...error,
      message: customErrors[error.path.join('.')] || error.message
    }));
  }
  
  return result;
}

// Async validation function
export async function validateSchemaAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<ValidationResult<T>> {
  const result = await schema.safeParseAsync(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  }
  
  return {
    success: false,
    errors: result.error.errors.map(error => ({
      path: error.path,
      message: error.message,
      code: error.code
    }))
  };
}

// Partial validation - only validate provided fields
export function validatePartial<T extends Record<string, any>>(
  schema: z.ZodObject<any>,
  data: unknown
): ValidationResult<Partial<T>> {
  const partialSchema = schema.partial();
  return validateSchema(partialSchema, data) as ValidationResult<Partial<T>>;
}

// Array validation with detailed error reporting
export function validateArray<T>(
  itemSchema: z.ZodSchema<T>,
  data: unknown[]
): ValidationResult<T[]> {
  const arraySchema = z.array(itemSchema);
  return validateSchema(arraySchema, data);
}

// Validation with transformation
export function validateAndTransform<T, U>(
  schema: z.ZodSchema<T>,
  data: unknown,
  transform: (data: T) => U
): ValidationResult<U> {
  const result = validateSchema(schema, data);
  
  if (result.success && result.data) {
    return {
      success: true,
      data: transform(result.data)
    };
  }
  
  return {
    success: false,
    errors: result.errors || []
  };
}

// Validation error formatter for API responses
export function formatValidationErrors(errors: ValidationResult<any>['errors']): string {
  if (!errors || errors.length === 0) {
    return 'Unknown validation error';
  }
  
  return errors
    .map(error => `${error.path.join('.')}: ${error.message}`)
    .join('; ');
}

// Check if validation result has errors
export function hasValidationErrors<T>(result: ValidationResult<T>): result is { success: false; errors: NonNullable<ValidationResult<T>['errors']> } {
  return !result.success && Array.isArray(result.errors) && result.errors.length > 0;
}

// Extract first validation error
export function getFirstValidationError<T>(result: ValidationResult<T>): string | null {
  if (hasValidationErrors(result)) {
    return result.errors[0]?.message || null;
  }
  return null;
}

// Create validation middleware for express-like frameworks
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => {
    const result = validateSchema(schema, data);
    if (!result.success) {
      const errorMessage = formatValidationErrors(result.errors);
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    return result.data!;
  };
}

// Validation with coercion for string inputs (useful for query parameters)
export function validateWithCoercion<T>(
  schema: z.ZodSchema<T>,
  data: Record<string, string>
): ValidationResult<T> {
  // Create a coerced version of the schema for common types
  const coercedData: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    // Try to coerce string values to appropriate types
    if (value === 'true') {
      coercedData[key] = true;
    } else if (value === 'false') {
      coercedData[key] = false;
    } else if (value === 'null') {
      coercedData[key] = null;
    } else if (value === 'undefined') {
      coercedData[key] = undefined;
    } else if (!isNaN(Number(value)) && value !== '') {
      coercedData[key] = Number(value);
    } else {
      coercedData[key] = value;
    }
  });
  
  return validateSchema(schema, coercedData);
}

// Validation with environment-specific rules
export function validateForEnvironment<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  environment: 'development' | 'production' | 'test'
): ValidationResult<T> {
  // In development, we might want more lenient validation
  if (environment === 'development') {
    // Could implement more permissive validation here
    return validateSchema(schema, data);
  }
  
  // Production validation is strict
  return validateSchema(schema, data);
}