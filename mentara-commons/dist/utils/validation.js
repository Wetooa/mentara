"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchema = validateSchema;
exports.validateWithCustomErrors = validateWithCustomErrors;
exports.validateSchemaAsync = validateSchemaAsync;
exports.validatePartial = validatePartial;
exports.validateArray = validateArray;
exports.validateAndTransform = validateAndTransform;
exports.formatValidationErrors = formatValidationErrors;
exports.hasValidationErrors = hasValidationErrors;
exports.getFirstValidationError = getFirstValidationError;
exports.createValidationMiddleware = createValidationMiddleware;
exports.validateWithCoercion = validateWithCoercion;
exports.validateForEnvironment = validateForEnvironment;
const zod_1 = require("zod");
// Generic validation function
function validateSchema(schema, data) {
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
function validateWithCustomErrors(schema, data, customErrors) {
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
async function validateSchemaAsync(schema, data) {
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
function validatePartial(schema, data) {
    const partialSchema = schema.partial();
    return validateSchema(partialSchema, data);
}
// Array validation with detailed error reporting
function validateArray(itemSchema, data) {
    const arraySchema = zod_1.z.array(itemSchema);
    return validateSchema(arraySchema, data);
}
// Validation with transformation
function validateAndTransform(schema, data, transform) {
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
function formatValidationErrors(errors) {
    if (!errors || errors.length === 0) {
        return 'Unknown validation error';
    }
    return errors
        .map(error => `${error.path.join('.')}: ${error.message}`)
        .join('; ');
}
// Check if validation result has errors
function hasValidationErrors(result) {
    return !result.success && Array.isArray(result.errors) && result.errors.length > 0;
}
// Extract first validation error
function getFirstValidationError(result) {
    if (hasValidationErrors(result)) {
        return result.errors[0]?.message || null;
    }
    return null;
}
// Create validation middleware for express-like frameworks
function createValidationMiddleware(schema) {
    return (data) => {
        const result = validateSchema(schema, data);
        if (!result.success) {
            const errorMessage = formatValidationErrors(result.errors);
            throw new Error(`Validation failed: ${errorMessage}`);
        }
        return result.data;
    };
}
// Validation with coercion for string inputs (useful for query parameters)
function validateWithCoercion(schema, data) {
    // Create a coerced version of the schema for common types
    const coercedData = {};
    Object.entries(data).forEach(([key, value]) => {
        // Try to coerce string values to appropriate types
        if (value === 'true') {
            coercedData[key] = true;
        }
        else if (value === 'false') {
            coercedData[key] = false;
        }
        else if (value === 'null') {
            coercedData[key] = null;
        }
        else if (value === 'undefined') {
            coercedData[key] = undefined;
        }
        else if (!isNaN(Number(value)) && value !== '') {
            coercedData[key] = Number(value);
        }
        else {
            coercedData[key] = value;
        }
    });
    return validateSchema(schema, coercedData);
}
// Validation with environment-specific rules
function validateForEnvironment(schema, data, environment) {
    // In development, we might want more lenient validation
    if (environment === 'development') {
        // Could implement more permissive validation here
        return validateSchema(schema, data);
    }
    // Production validation is strict
    return validateSchema(schema, data);
}
//# sourceMappingURL=validation.js.map