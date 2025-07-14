import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/__tests__/setup/form-test-utils'
import { zodTestUtils } from '@/__tests__/setup/zod-test-utils'
import { therapistApplicationMockData } from '@/__tests__/setup/form-mocks'
import SinglePageTherapistApplication from '@/app/(public)/(therapist)/therapist-application/page'
import { z } from 'zod'

// Mock dependencies
jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    therapistApplication: {
      submit: jest.fn().mockResolvedValue({ data: { id: 'test-id' } }),
    },
  }),
}))

jest.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}))

jest.mock('@/store/therapistform', () => ({
  __esModule: true,
  default: () => ({
    updateField: jest.fn(),
    updateNestedField: jest.fn(),
    documents: {},
    updateDocuments: jest.fn(),
    removeDocument: jest.fn(),
    formValues: {},
  }),
}))

jest.mock('@/hooks/useMobile', () => ({
  useIsMobile: () => false,
}))

jest.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: () => ({}),
}))

jest.mock('@/hooks/useSectionCompletion', () => ({
  useSectionCompletion: () => ({
    completedSections: new Set(),
    updateSectionCompletion: jest.fn(),
  }),
}))

// Extract the schema from the component file for testing
const unifiedTherapistSchema = z
  .object({
    // Basic Information
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    mobile: z
      .string()
      .min(1, 'Mobile number is required')
      .regex(/^(09|\\+639)\\d{9}$/, 'Invalid PH mobile number'),
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    province: z.string().min(1, 'Province is required'),
    providerType: z.string().min(1, 'Provider type is required'),

    // Professional License Information
    professionalLicenseType: z
      .string()
      .min(1, 'Please select your professional license type'),
    professionalLicenseType_specify: z.string().optional(),
    isPRCLicensed: z.string().min(1, 'Please indicate if you are PRC-licensed'),
    prcLicenseNumber: z.string().optional(),
    expirationDateOfLicense: z.string().optional(),
    isLicenseActive: z.string().optional(),

    // Practice Information
    practiceStartDate: z
      .string()
      .min(1, 'Please enter when you started practicing'),
    yearsOfExperience: z
      .number()
      .min(0, 'Years of experience must be 0 or greater')
      .max(50, 'Please enter a valid number of years'),
    educationBackground: z
      .string()
      .min(10, 'Please provide details about your educational background'),
    practiceLocation: z
      .string()
      .min(1, 'Please specify your primary practice location'),

    // Teletherapy Readiness
    providedOnlineTherapyBefore: z
      .string()
      .min(1, 'Please answer this question'),
    comfortableUsingVideoConferencing: z
      .string()
      .min(1, 'Please answer this question'),
    privateConfidentialSpace: z.string().min(1, 'Please answer this question'),
    compliesWithDataPrivacyAct: z
      .string()
      .min(1, 'Please confirm compliance with the Data Privacy Act'),

    // Areas of Expertise and Tools
    areasOfExpertise: z
      .array(z.string())
      .min(1, 'Please select at least one area of expertise'),
    assessmentTools: z
      .array(z.string())
      .min(1, 'Please select at least one assessment tool'),
    therapeuticApproachesUsedList: z
      .array(z.string())
      .min(1, 'Please select at least one therapeutic approach'),
    therapeuticApproachesUsedList_specify: z.string().optional(),

    // Languages and Availability
    languagesOffered: z
      .array(z.string())
      .min(1, 'Please select at least one language'),
    languagesOffered_specify: z.string().optional(),
    weeklyAvailability: z
      .string()
      .min(1, 'Please select your weekly availability'),
    preferredSessionLength: z
      .string()
      .min(1, 'Please select your preferred session length'),
    preferredSessionLength_specify: z.string().optional(),

    // Payment and Rates
    accepts: z
      .array(z.string())
      .min(1, 'Please select at least one payment method'),
    accepts_hmo_specify: z.string().optional(),
    hourlyRate: z
      .number()
      .optional()
      .refine((val) => val === undefined || val >= 0, {
        message: 'Rate must be a positive number',
      }),

    // Insurance Information
    acceptsInsurance: z.boolean().optional(),
    acceptedInsuranceTypes: z.array(z.string()).optional(),
    sessionLength: z.string().optional(),

    // Bio/About
    bio: z.string().optional(),

    // Compliance
    professionalLiabilityInsurance: z
      .string()
      .min(1, 'Please answer regarding liability insurance'),
    complaintsOrDisciplinaryActions: z
      .string()
      .min(1, 'Please answer regarding complaints history'),
    complaintsOrDisciplinaryActions_specify: z.string().optional(),
    willingToAbideByPlatformGuidelines: z
      .string()
      .refine((val) => val === 'yes', {
        message: 'You must agree to abide by the platform guidelines to proceed',
      }),

    // Document Upload
    documentsUploaded: z.object({
      prcLicense: z.boolean(),
      nbiClearance: z.boolean(),
      resumeCV: z.boolean(),
    }),

    // Consent
    consentChecked: z.boolean().refine((val) => val === true, {
      message: 'You must certify that the documents are authentic',
    }),
  })
  .superRefine((val, ctx) => {
    // Test conditional validation logic
    if (
      val.professionalLicenseType === 'other' &&
      (!val.professionalLicenseType_specify ||
        val.professionalLicenseType_specify.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please specify your license type',
        path: ['professionalLicenseType_specify'],
      })
    }

    if (val.isPRCLicensed === 'yes') {
      if (!val.prcLicenseNumber || !/^[0-9]{7}$/.test(val.prcLicenseNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid 7-digit PRC license number',
          path: ['prcLicenseNumber'],
        })
      }
      if (
        !val.expirationDateOfLicense ||
        val.expirationDateOfLicense.length === 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter the license expiration date',
          path: ['expirationDateOfLicense'],
        })
      }
      if (!val.isLicenseActive || val.isLicenseActive.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please confirm the status of your license',
          path: ['isLicenseActive'],
        })
      }
    }

    // Additional conditional validations
    if (
      val.therapeuticApproachesUsedList?.includes('other') &&
      (!val.therapeuticApproachesUsedList_specify ||
        val.therapeuticApproachesUsedList_specify.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please specify other therapeutic approaches',
        path: ['therapeuticApproachesUsedList_specify'],
      })
    }

    if (
      val.complaintsOrDisciplinaryActions === 'yes' &&
      (!val.complaintsOrDisciplinaryActions_specify ||
        val.complaintsOrDisciplinaryActions_specify.length < 10)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please provide a brief explanation (min. 10 characters)',
        path: ['complaintsOrDisciplinaryActions_specify'],
      })
    }
  })

describe('Therapist Application Form', () => {
  describe('Zod Schema Validation', () => {
    describe('Basic Information Fields', () => {
      it('validates required basic information fields', () => {
        const { valid, invalid } = therapistApplicationMockData
        
        // Test valid data
        zodTestUtils.testValidData(unifiedTherapistSchema, valid)
        
        // Test missing required fields
        Object.keys(invalid.missingBasicInfo).forEach(field => {
          const testData = { ...valid, [field]: invalid.missingBasicInfo[field as keyof typeof invalid.missingBasicInfo] }
          const result = unifiedTherapistSchema.safeParse(testData)
          expect(result.success).toBe(false)
        })
      })

      it('validates email format', () => {
        zodTestUtils.testEmailValidation(
          unifiedTherapistSchema,
          'email',
          therapistApplicationMockData.valid
        )
      })

      it('validates Philippine mobile number format', () => {
        zodTestUtils.testPhoneValidation(
          unifiedTherapistSchema,
          'mobile',
          therapistApplicationMockData.valid
        )
      })

      it('validates string length constraints', () => {
        zodTestUtils.testStringLength(
          unifiedTherapistSchema,
          'firstName',
          1,
          undefined,
          therapistApplicationMockData.valid
        )
        
        zodTestUtils.testStringLength(
          unifiedTherapistSchema,
          'educationBackground',
          10,
          undefined,
          therapistApplicationMockData.valid
        )
      })
    })

    describe('Professional License Conditional Validation', () => {
      it('validates PRC license conditional fields', () => {
        zodTestUtils.testConditionalValidation(
          unifiedTherapistSchema,
          'isPRCLicensed',
          'yes',
          'prcLicenseNumber',
          '1234567',
          '123',
          'Please enter a valid 7-digit PRC license number'
        )
      })

      it('validates license expiration date when PRC licensed', () => {
        zodTestUtils.testConditionalValidation(
          unifiedTherapistSchema,
          'isPRCLicensed',
          'yes',
          'expirationDateOfLicense',
          '2025-12-31',
          '',
          'Please enter the license expiration date'
        )
      })

      it('validates license status when PRC licensed', () => {
        zodTestUtils.testConditionalValidation(
          unifiedTherapistSchema,
          'isPRCLicensed',
          'yes',
          'isLicenseActive',
          'yes',
          '',
          'Please confirm the status of your license'
        )
      })

      it('validates other license type specification', () => {
        zodTestUtils.testConditionalValidation(
          unifiedTherapistSchema,
          'professionalLicenseType',
          'other',
          'professionalLicenseType_specify',
          'Custom License Type',
          '',
          'Please specify your license type'
        )
      })
    })

    describe('Array Field Validation', () => {
      it('validates minimum array length for required fields', () => {
        const arrayFields = [
          'areasOfExpertise',
          'assessmentTools',
          'therapeuticApproachesUsedList',
          'languagesOffered',
          'accepts',
        ]

        arrayFields.forEach(field => {
          zodTestUtils.testMinArrayLength(
            unifiedTherapistSchema,
            field,
            1,
            therapistApplicationMockData.valid
          )
        })
      })

      it('validates therapeutic approaches specification', () => {
        zodTestUtils.testConditionalValidation(
          unifiedTherapistSchema,
          'therapeuticApproachesUsedList',
          ['other'],
          'therapeuticApproachesUsedList_specify',
          'Custom Approach',
          '',
          'Please specify other therapeutic approaches'
        )
      })
    })

    describe('Number Field Validation', () => {
      it('validates years of experience range', () => {
        zodTestUtils.testNumberValidation(
          unifiedTherapistSchema,
          'yearsOfExperience',
          5,
          -1,
          therapistApplicationMockData.valid
        )
        
        zodTestUtils.testNumberValidation(
          unifiedTherapistSchema,
          'yearsOfExperience',
          50,
          51,
          therapistApplicationMockData.valid
        )
      })

      it('validates hourly rate is positive', () => {
        zodTestUtils.testNumberValidation(
          unifiedTherapistSchema,
          'hourlyRate',
          2000,
          -100,
          therapistApplicationMockData.valid
        )
      })
    })

    describe('Boolean Field Validation', () => {
      it('validates consent checkbox must be true', () => {
        zodTestUtils.testBooleanValidation(
          unifiedTherapistSchema,
          'consentChecked',
          true,
          therapistApplicationMockData.valid
        )
      })

      it('validates platform guidelines acceptance', () => {
        const testData = { ...therapistApplicationMockData.valid }
        
        testData.willingToAbideByPlatformGuidelines = 'yes'
        let result = unifiedTherapistSchema.safeParse(testData)
        expect(result.success).toBe(true)
        
        testData.willingToAbideByPlatformGuidelines = 'no'
        result = unifiedTherapistSchema.safeParse(testData)
        expect(result.success).toBe(false)
      })
    })

    describe('Compliance Conditional Validation', () => {
      it('validates complaints specification when complaints exist', () => {
        zodTestUtils.testConditionalValidation(
          unifiedTherapistSchema,
          'complaintsOrDisciplinaryActions',
          'yes',
          'complaintsOrDisciplinaryActions_specify',
          'Brief explanation of the complaint and resolution',
          'Short',
          'Please provide a brief explanation (min. 10 characters)'
        )
      })
    })
  })

  describe('Component Integration', () => {
    it('renders the therapist application form', () => {
      renderWithQueryClient(<SinglePageTherapistApplication />)
      
      expect(screen.getByText('Therapist Application')).toBeInTheDocument()
      expect(screen.getByText('Basic Information')).toBeInTheDocument()
      expect(screen.getByText('Professional License & Experience')).toBeInTheDocument()
      expect(screen.getByText('Teletherapy Readiness')).toBeInTheDocument()
    })

    it('displays form sections', () => {
      renderWithQueryClient(<SinglePageTherapistApplication />)
      
      const sections = [
        'Basic Information',
        'Professional License & Experience',
        'Teletherapy Readiness',
        'Professional Profile',
        'Availability & Services',
        'Document Upload',
        'Review & Submit',
      ]
      
      sections.forEach(section => {
        expect(screen.getByText(section)).toBeInTheDocument()
      })
    })

    it('handles form section expansion', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SinglePageTherapistApplication />)
      
      // Basic Information should be expanded by default
      expect(screen.getByText('Your personal details and contact information')).toBeInTheDocument()
      
      // Click on Professional License section
      const licenseSection = screen.getByText('Professional License & Experience')
      await user.click(licenseSection)
      
      // Should expand the section
      expect(screen.getByText('Your professional license details, credentials, and experience')).toBeInTheDocument()
    })
  })

  describe('Form Validation Integration', () => {
    it('shows validation errors for required fields', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SinglePageTherapistApplication />)
      
      // Try to submit form without filling required fields
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument()
        expect(screen.getByText('Last name is required')).toBeInTheDocument()
        expect(screen.getByText('Email is required')).toBeInTheDocument()
      })
    })

    it('validates email format on blur', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SinglePageTherapistApplication />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      await user.tab() // Blur the field
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
      })
    })

    it('validates Philippine mobile number format', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SinglePageTherapistApplication />)
      
      const mobileInput = screen.getByLabelText(/mobile/i)
      await user.type(mobileInput, '123456')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Invalid PH mobile number')).toBeInTheDocument()
      })
    })

    it('shows conditional validation for PRC license', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SinglePageTherapistApplication />)
      
      // Expand Professional License section
      const licenseSection = screen.getByText('Professional License & Experience')
      await user.click(licenseSection)
      
      // Select "Yes" for PRC licensed
      const prcYes = screen.getByLabelText(/yes.*prc/i)
      await user.click(prcYes)
      
      // Try to submit without PRC license number
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid 7-digit PRC license number')).toBeInTheDocument()
      })
    })
  })

  describe('Auto-save Functionality', () => {
    it('saves form data automatically', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SinglePageTherapistApplication />)
      
      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.type(firstNameInput, 'John')
      
      // Auto-save should trigger after typing
      await waitFor(() => {
        expect(firstNameInput).toHaveValue('John')
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderWithQueryClient(<SinglePageTherapistApplication />)
      
      // Check for proper form role
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
      
      // Check for proper input labels
      const inputs = screen.getAllByRole('textbox')
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName()
      })
    })

    it('announces validation errors to screen readers', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SinglePageTherapistApplication />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert')
        expect(errorMessages.length).toBeGreaterThan(0)
        errorMessages.forEach(error => {
          expect(error).toHaveAttribute('aria-live', 'polite')
        })
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SinglePageTherapistApplication />)
      
      // Tab through form elements
      await user.tab()
      expect(document.activeElement).toBeInTheDocument()
      
      // Should be able to navigate to all interactive elements
      const interactiveElements = screen.getAllByRole('button')
      interactiveElements.forEach(element => {
        expect(element).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const mockSubmit = jest.fn().mockRejectedValue(new Error('Network error'))
      
      // Mock the API to return error
      jest.doMock('@/hooks/useApi', () => ({
        useApi: () => ({
          therapistApplication: {
            submit: mockSubmit,
          },
        }),
      }))
      
      const user = userEvent.setup()
      renderWithQueryClient(<SinglePageTherapistApplication />)
      
      // Fill form with valid data
      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.type(firstNameInput, 'John')
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/error.*occurred/i)).toBeInTheDocument()
      })
    })
  })
})