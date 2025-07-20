import { z } from 'zod'

// Zod schema testing utilities
export const zodTestUtils = {
  // Test schema validation success
  testValidData<T>(schema: z.ZodSchema<T>, validData: T) {
    const result = schema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  },

  // Test schema validation failure
  testInvalidData<T>(schema: z.ZodSchema<T>, invalidData: any, expectedErrors: string[]) {
    const result = schema.safeParse(invalidData)
    expect(result.success).toBe(false)
    
    if (!result.success) {
      const errorMessages = result.error.errors.map(err => err.message)
      expectedErrors.forEach(expectedError => {
        expect(errorMessages).toContain(expectedError)
      })
    }
  },

  // Test field-specific validation
  testFieldValidation<T>(schema: z.ZodSchema<T>, fieldName: string, validValue: any, invalidValue: any, expectedError: string) {
    const baseData = {} as any
    
    // Test valid value
    baseData[fieldName] = validValue
    const validResult = schema.safeParse(baseData)
    expect(validResult.success).toBe(true)
    
    // Test invalid value
    baseData[fieldName] = invalidValue
    const invalidResult = schema.safeParse(baseData)
    expect(invalidResult.success).toBe(false)
    
    if (!invalidResult.success) {
      const fieldError = invalidResult.error.errors.find(err => err.path.includes(fieldName))
      expect(fieldError?.message).toBe(expectedError)
    }
  },

  // Test required field validation
  testRequiredField<T>(schema: z.ZodSchema<T>, fieldName: string, baseData: Partial<T>) {
    const dataWithoutField = { ...baseData }
    delete dataWithoutField[fieldName as keyof T]
    
    const result = schema.safeParse(dataWithoutField)
    expect(result.success).toBe(false)
    
    if (!result.success) {
      const fieldError = result.error.errors.find(err => err.path.includes(fieldName))
      expect(fieldError?.code).toBe('invalid_type')
    }
  },

  // Test conditional validation (superRefine)
  testConditionalValidation<T>(
    schema: z.ZodSchema<T>,
    conditionField: string,
    conditionValue: any,
    dependentField: string,
    validDependentValue: any,
    invalidDependentValue: any,
    expectedError: string
  ) {
    const baseData = {} as any
    
    // Test without condition - should pass
    baseData[dependentField] = invalidDependentValue
    let result = schema.safeParse(baseData)
    expect(result.success).toBe(true)
    
    // Test with condition and valid dependent value - should pass
    baseData[conditionField] = conditionValue
    baseData[dependentField] = validDependentValue
    result = schema.safeParse(baseData)
    expect(result.success).toBe(true)
    
    // Test with condition and invalid dependent value - should fail
    baseData[conditionField] = conditionValue
    baseData[dependentField] = invalidDependentValue
    result = schema.safeParse(baseData)
    expect(result.success).toBe(false)
    
    if (!result.success) {
      const fieldError = result.error.errors.find(err => err.path.includes(dependentField))
      expect(fieldError?.message).toBe(expectedError)
    }
  },

  // Test array validation
  testArrayValidation<T>(schema: z.ZodSchema<T>, fieldName: string, validArray: any[], invalidArray: any[], expectedError: string) {
    const baseData = {} as any
    
    // Test valid array
    baseData[fieldName] = validArray
    let result = schema.safeParse(baseData)
    expect(result.success).toBe(true)
    
    // Test invalid array
    baseData[fieldName] = invalidArray
    result = schema.safeParse(baseData)
    expect(result.success).toBe(false)
    
    if (!result.success) {
      const fieldError = result.error.errors.find(err => err.path.includes(fieldName))
      expect(fieldError?.message).toBe(expectedError)
    }
  },

  // Test minimum array length
  testMinArrayLength<T>(schema: z.ZodSchema<T>, fieldName: string, minLength: number, baseData: Partial<T>) {
    const testData = { ...baseData } as any
    
    // Test array with insufficient length
    testData[fieldName] = new Array(minLength - 1).fill('item')
    let result = schema.safeParse(testData)
    expect(result.success).toBe(false)
    
    // Test array with sufficient length
    testData[fieldName] = new Array(minLength).fill('item')
    result = schema.safeParse(testData)
    expect(result.success).toBe(true)
  },

  // Test string length validation
  testStringLength<T>(schema: z.ZodSchema<T>, fieldName: string, minLength?: number, maxLength?: number, baseData: Partial<T> = {}) {
    const testData = { ...baseData } as any
    
    if (minLength) {
      // Test string too short
      testData[fieldName] = 'a'.repeat(minLength - 1)
      let result = schema.safeParse(testData)
      expect(result.success).toBe(false)
      
      // Test string at minimum length
      testData[fieldName] = 'a'.repeat(minLength)
      result = schema.safeParse(testData)
      expect(result.success).toBe(true)
    }
    
    if (maxLength) {
      // Test string too long
      testData[fieldName] = 'a'.repeat(maxLength + 1)
      let result = schema.safeParse(testData)
      expect(result.success).toBe(false)
      
      // Test string at maximum length
      testData[fieldName] = 'a'.repeat(maxLength)
      result = schema.safeParse(testData)
      expect(result.success).toBe(true)
    }
  },

  // Test email validation
  testEmailValidation<T>(schema: z.ZodSchema<T>, fieldName: string, baseData: Partial<T> = {}) {
    const testData = { ...baseData } as any
    
    // Test invalid emails
    const invalidEmails = ['invalid', 'test@', '@test.com', 'test@test']
    invalidEmails.forEach(email => {
      testData[fieldName] = email
      const result = schema.safeParse(testData)
      expect(result.success).toBe(false)
    })
    
    // Test valid email
    testData[fieldName] = 'test@example.com'
    const result = schema.safeParse(testData)
    expect(result.success).toBe(true)
  },

  // Test phone number validation (Philippine format)
  testPhoneValidation<T>(schema: z.ZodSchema<T>, fieldName: string, baseData: Partial<T> = {}) {
    const testData = { ...baseData } as any
    
    // Test invalid phone numbers
    const invalidPhones = ['123', '09123456', '+63123456789012', 'abcdefghijk']
    invalidPhones.forEach(phone => {
      testData[fieldName] = phone
      const result = schema.safeParse(testData)
      expect(result.success).toBe(false)
    })
    
    // Test valid phone numbers
    const validPhones = ['09123456789', '+639123456789']
    validPhones.forEach(phone => {
      testData[fieldName] = phone
      const result = schema.safeParse(testData)
      expect(result.success).toBe(true)
    })
  },

  // Test enum validation
  testEnumValidation<T>(schema: z.ZodSchema<T>, fieldName: string, validValues: any[], invalidValue: any, baseData: Partial<T> = {}) {
    const testData = { ...baseData } as any
    
    // Test valid enum values
    validValues.forEach(value => {
      testData[fieldName] = value
      const result = schema.safeParse(testData)
      expect(result.success).toBe(true)
    })
    
    // Test invalid enum value
    testData[fieldName] = invalidValue
    const result = schema.safeParse(testData)
    expect(result.success).toBe(false)
  },

  // Test regex validation
  testRegexValidation<T>(schema: z.ZodSchema<T>, fieldName: string, validPattern: string, invalidPattern: string, baseData: Partial<T> = {}) {
    const testData = { ...baseData } as any
    
    // Test valid pattern
    testData[fieldName] = validPattern
    let result = schema.safeParse(testData)
    expect(result.success).toBe(true)
    
    // Test invalid pattern
    testData[fieldName] = invalidPattern
    result = schema.safeParse(testData)
    expect(result.success).toBe(false)
  },

  // Test number validation
  testNumberValidation<T>(schema: z.ZodSchema<T>, fieldName: string, validNumber: number, invalidNumber: any, baseData: Partial<T> = {}) {
    const testData = { ...baseData } as any
    
    // Test valid number
    testData[fieldName] = validNumber
    let result = schema.safeParse(testData)
    expect(result.success).toBe(true)
    
    // Test invalid number
    testData[fieldName] = invalidNumber
    result = schema.safeParse(testData)
    expect(result.success).toBe(false)
  },

  // Test boolean validation
  testBooleanValidation<T>(schema: z.ZodSchema<T>, fieldName: string, requiredValue: boolean, baseData: Partial<T> = {}) {
    const testData = { ...baseData } as any
    
    // Test required boolean value
    testData[fieldName] = requiredValue
    let result = schema.safeParse(testData)
    expect(result.success).toBe(true)
    
    // Test opposite boolean value
    testData[fieldName] = !requiredValue
    result = schema.safeParse(testData)
    expect(result.success).toBe(false)
  },

  // Test cross-field validation (e.g., password confirmation)
  testCrossFieldValidation<T>(
    schema: z.ZodSchema<T>,
    field1: string,
    field2: string,
    matchingValues: any,
    nonMatchingValues: [any, any],
    baseData: Partial<T> = {}
  ) {
    const testData = { ...baseData } as any
    
    // Test matching values - should pass
    testData[field1] = matchingValues
    testData[field2] = matchingValues
    let result = schema.safeParse(testData)
    expect(result.success).toBe(true)
    
    // Test non-matching values - should fail
    testData[field1] = nonMatchingValues[0]
    testData[field2] = nonMatchingValues[1]
    result = schema.safeParse(testData)
    expect(result.success).toBe(false)
  },
}

// Schema testing helper functions
export const schemaTestHelpers = {
  // Create base test data for a schema
  createBaseTestData<T>(overrides: Partial<T> = {}): T {
    return {
      // Default values that should pass basic validation
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '09123456789',
      ...overrides,
    } as T
  },

  // Generate test cases for field validation
  generateFieldTestCases(fieldName: string, validValues: any[], invalidValues: any[]) {
    return {
      valid: validValues.map(value => ({ [fieldName]: value })),
      invalid: invalidValues.map(value => ({ [fieldName]: value })),
    }
  },

  // Create test suite for schema validation
  createSchemaTestSuite<T>(schema: z.ZodSchema<T>, fieldTests: Record<string, { valid: any[], invalid: any[] }>) {
    return {
      schema,
      testRequired: (fieldName: string, baseData: Partial<T>) => {
        zodTestUtils.testRequiredField(schema, fieldName, baseData)
      },
      testField: (fieldName: string) => {
        const tests = fieldTests[fieldName]
        if (!tests) return
        
        tests.valid.forEach(value => {
          const data = { [fieldName]: value } as any
          zodTestUtils.testValidData(schema, data)
        })
        
        tests.invalid.forEach(value => {
          const data = { [fieldName]: value } as any
          const result = schema.safeParse(data)
          expect(result.success).toBe(false)
        })
      },
    }
  },
}

export default {
  zodTestUtils,
  schemaTestHelpers,
}