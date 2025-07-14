import { z } from 'zod';
export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: Array<{
        path: (string | number)[];
        message: string;
        code: string;
    }>;
}
export declare function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T>;
export declare function validateWithCustomErrors<T>(schema: z.ZodSchema<T>, data: unknown, customErrors?: Record<string, string>): ValidationResult<T>;
export declare function validateSchemaAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<ValidationResult<T>>;
export declare function validatePartial<T extends Record<string, any>>(schema: z.ZodObject<any>, data: unknown): ValidationResult<Partial<T>>;
export declare function validateArray<T>(itemSchema: z.ZodSchema<T>, data: unknown[]): ValidationResult<T[]>;
export declare function validateAndTransform<T, U>(schema: z.ZodSchema<T>, data: unknown, transform: (data: T) => U): ValidationResult<U>;
export declare function formatValidationErrors(errors: ValidationResult<any>['errors']): string;
export declare function hasValidationErrors<T>(result: ValidationResult<T>): result is {
    success: false;
    errors: NonNullable<ValidationResult<T>['errors']>;
};
export declare function getFirstValidationError<T>(result: ValidationResult<T>): string | null;
export declare function createValidationMiddleware<T>(schema: z.ZodSchema<T>): (data: unknown) => NonNullable<T>;
export declare function validateWithCoercion<T>(schema: z.ZodSchema<T>, data: Record<string, string>): ValidationResult<T>;
export declare function validateForEnvironment<T>(schema: z.ZodSchema<T>, data: unknown, environment: 'development' | 'production' | 'test'): ValidationResult<T>;
//# sourceMappingURL=validation.d.ts.map