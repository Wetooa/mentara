import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/__tests__/setup/form-test-utils'
import { zodTestUtils } from '@/__tests__/setup/zod-test-utils'
import { userOnboardingMockData } from '@/__tests__/setup/form-mocks'
import ProfilePage from '@/app/(protected)/user/onboarding/profile/page'
import { z } from 'zod'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}))

jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'non-binary', 'other', 'prefer-not-to-say']),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(5, 'Zip code must be at least 5 characters'),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
  emergencyContactRelationship: z.string().min(2, 'Relationship is required'),
  medicalHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  allergies: z.string().optional(),
})

describe('User Onboarding Profile Form', () => {
  describe('Zod Schema Validation', () => {
    describe('Required Fields', () => {
      it('validates all required fields', () => {
        const { valid } = userOnboardingMockData.profile
        
        // Test valid data
        zodTestUtils.testValidData(profileSchema, valid)
        
        // Test each required field
        const requiredFields = [
          'firstName',
          'lastName',
          'dateOfBirth',
          'gender',
          'phoneNumber',
          'address',
          'city',
          'state',
          'zipCode',
          'emergencyContactName',
          'emergencyContactPhone',
          'emergencyContactRelationship',
        ]
        
        requiredFields.forEach(field => {
          zodTestUtils.testRequiredField(profileSchema, field, valid)
        })
      })
    })

    describe('String Length Validation', () => {
      it('validates minimum string lengths', () => {
        const stringFields = [
          { field: 'firstName', min: 2 },
          { field: 'lastName', min: 2 },
          { field: 'address', min: 5 },
          { field: 'city', min: 2 },
          { field: 'state', min: 2 },
          { field: 'zipCode', min: 5 },
          { field: 'emergencyContactName', min: 2 },
          { field: 'emergencyContactRelationship', min: 2 },
        ]
        
        stringFields.forEach(({ field, min }) => {
          zodTestUtils.testStringLength(
            profileSchema,
            field,
            min,
            undefined,
            userOnboardingMockData.profile.valid
          )
        })
      })

      it('validates phone number length', () => {
        zodTestUtils.testStringLength(
          profileSchema,
          'phoneNumber',
          10,
          undefined,
          userOnboardingMockData.profile.valid
        )
        
        zodTestUtils.testStringLength(
          profileSchema,
          'emergencyContactPhone',
          10,
          undefined,
          userOnboardingMockData.profile.valid
        )
      })
    })

    describe('Enum Validation', () => {
      it('validates gender enum values', () => {
        const validGenders = ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say']
        
        zodTestUtils.testEnumValidation(
          profileSchema,
          'gender',
          validGenders,
          'invalid-gender',
          userOnboardingMockData.profile.valid
        )
      })
    })

    describe('Optional Fields', () => {
      it('allows optional fields to be empty', () => {
        const dataWithoutOptional = {
          ...userOnboardingMockData.profile.valid,
          medicalHistory: undefined,
          currentMedications: undefined,
          allergies: undefined,
        }
        
        zodTestUtils.testValidData(profileSchema, dataWithoutOptional)
      })
    })
  })

  describe('Component Integration', () => {
    it('renders the profile form', () => {
      renderWithQueryClient(<ProfilePage />)
      
      expect(screen.getByText('Personal Information')).toBeInTheDocument()
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument()
    })

    it('displays all form fields', () => {
      renderWithQueryClient(<ProfilePage />)
      
      const expectedFields = [
        'First Name',
        'Last Name',
        'Date of Birth',
        'Gender',
        'Phone Number',
        'Address',
        'City',
        'State',
        'Zip Code',
        'Emergency Contact Name',
        'Emergency Contact Phone',
        'Emergency Contact Relationship',
        'Medical History',
        'Current Medications',
        'Allergies',
      ]
      
      expectedFields.forEach(field => {
        expect(screen.getByLabelText(new RegExp(field, 'i'))).toBeInTheDocument()
      })
    })

    it('has proper form structure', () => {
      renderWithQueryClient(<ProfilePage />)
      
      // Check for form sections
      expect(screen.getByText('Personal Information')).toBeInTheDocument()
      expect(screen.getByText('Contact Information')).toBeInTheDocument()
      expect(screen.getByText('Emergency Contact')).toBeInTheDocument()
      expect(screen.getByText('Medical Information')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('shows validation errors for required fields', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ProfilePage />)
      
      // Try to submit form without filling required fields
      const continueButton = screen.getByRole('button', { name: /continue/i })
      await user.click(continueButton)
      
      await waitFor(() => {
        expect(screen.getByText('First name must be at least 2 characters')).toBeInTheDocument()
        expect(screen.getByText('Last name must be at least 2 characters')).toBeInTheDocument()
        expect(screen.getByText('Date of birth is required')).toBeInTheDocument()
      })
    })

    it('validates first name length', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ProfilePage />)
      
      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.type(firstNameInput, 'J')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('First name must be at least 2 characters')).toBeInTheDocument()
      })
    })

    it('validates phone number length', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ProfilePage />)
      
      const phoneInput = screen.getByLabelText(/phone number/i)
      await user.type(phoneInput, '123456789')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Phone number must be at least 10 digits')).toBeInTheDocument()
      })
    })

    it('validates address length', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ProfilePage />)
      
      const addressInput = screen.getByLabelText(/address/i)
      await user.type(addressInput, '123')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Address must be at least 5 characters')).toBeInTheDocument()
      })
    })

    it('validates zip code length', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ProfilePage />)
      
      const zipInput = screen.getByLabelText(/zip code/i)
      await user.type(zipInput, '123')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Zip code must be at least 5 characters')).toBeInTheDocument()
      })
    })

    it('validates emergency contact fields', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ProfilePage />)
      
      const continueButton = screen.getByRole('button', { name: /continue/i })
      await user.click(continueButton)
      
      await waitFor(() => {
        expect(screen.getByText('Emergency contact name is required')).toBeInTheDocument()
        expect(screen.getByText('Emergency contact phone is required')).toBeInTheDocument()
        expect(screen.getByText('Relationship is required')).toBeInTheDocument()
      })
    })
  })

  describe('Form Interaction', () => {
    it('allows filling all form fields', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ProfilePage />)
      
      const { valid } = userOnboardingMockData.profile
      
      // Fill basic information
      await user.type(screen.getByLabelText(/first name/i), valid.firstName)
      await user.type(screen.getByLabelText(/last name/i), valid.lastName)
      await user.type(screen.getByLabelText(/date of birth/i), valid.dateOfBirth)
      
      // Select gender
      const genderSelect = screen.getByLabelText(/gender/i)
      await user.click(genderSelect)
      await user.click(screen.getByText('Male'))
      
      // Fill contact information
      await user.type(screen.getByLabelText(/phone number/i), valid.phoneNumber)
      await user.type(screen.getByLabelText(/address/i), valid.address)
      await user.type(screen.getByLabelText(/city/i), valid.city)
      await user.type(screen.getByLabelText(/state/i), valid.state)
      await user.type(screen.getByLabelText(/zip code/i), valid.zipCode)
      
      // Fill emergency contact
      await user.type(screen.getByLabelText(/emergency contact name/i), valid.emergencyContactName)
      await user.type(screen.getByLabelText(/emergency contact phone/i), valid.emergencyContactPhone)
      await user.type(screen.getByLabelText(/emergency contact relationship/i), valid.emergencyContactRelationship)
      
      // Fill optional medical information
      await user.type(screen.getByLabelText(/medical history/i), valid.medicalHistory!)
      await user.type(screen.getByLabelText(/current medications/i), valid.currentMedications!)
      await user.type(screen.getByLabelText(/allergies/i), valid.allergies!)
      
      // All fields should have values
      expect(screen.getByLabelText(/first name/i)).toHaveValue(valid.firstName)
      expect(screen.getByLabelText(/last name/i)).toHaveValue(valid.lastName)
      expect(screen.getByLabelText(/phone number/i)).toHaveValue(valid.phoneNumber)
    })

    it('clears validation errors when valid input is entered', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ProfilePage />)
      
      const firstNameInput = screen.getByLabelText(/first name/i)
      
      // Enter invalid input
      await user.type(firstNameInput, 'J')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('First name must be at least 2 characters')).toBeInTheDocument()
      })
      
      // Clear and enter valid input
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'John')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.queryByText('First name must be at least 2 characters')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ProfilePage />)
      
      const { valid } = userOnboardingMockData.profile
      
      // Fill required fields
      await user.type(screen.getByLabelText(/first name/i), valid.firstName)
      await user.type(screen.getByLabelText(/last name/i), valid.lastName)
      await user.type(screen.getByLabelText(/date of birth/i), valid.dateOfBirth)
      
      const genderSelect = screen.getByLabelText(/gender/i)
      await user.click(genderSelect)
      await user.click(screen.getByText('Male'))
      
      await user.type(screen.getByLabelText(/phone number/i), valid.phoneNumber)
      await user.type(screen.getByLabelText(/address/i), valid.address)
      await user.type(screen.getByLabelText(/city/i), valid.city)
      await user.type(screen.getByLabelText(/state/i), valid.state)
      await user.type(screen.getByLabelText(/zip code/i), valid.zipCode)
      
      await user.type(screen.getByLabelText(/emergency contact name/i), valid.emergencyContactName)
      await user.type(screen.getByLabelText(/emergency contact phone/i), valid.emergencyContactPhone)
      await user.type(screen.getByLabelText(/emergency contact relationship/i), valid.emergencyContactRelationship)
      
      const continueButton = screen.getByRole('button', { name: /continue/i })
      await user.click(continueButton)
      
      // Should not show validation errors
      await waitFor(() => {
        expect(screen.queryByText('First name must be at least 2 characters')).not.toBeInTheDocument()
      })
    })

    it('prevents submission with invalid data', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ProfilePage />)
      
      const { invalid } = userOnboardingMockData.profile
      
      // Fill with invalid data
      await user.type(screen.getByLabelText(/first name/i), invalid.firstName)
      await user.type(screen.getByLabelText(/phone number/i), invalid.phoneNumber)
      
      const continueButton = screen.getByRole('button', { name: /continue/i })
      await user.click(continueButton)
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('First name must be at least 2 characters')).toBeInTheDocument()
        expect(screen.getByText('Phone number must be at least 10 digits')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderWithQueryClient(<ProfilePage />)
      
      // Check for form role
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
      renderWithQueryClient(<ProfilePage />)
      
      const continueButton = screen.getByRole('button', { name: /continue/i })
      await user.click(continueButton)
      
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ProfilePage />)
      
      // Tab through form elements
      await user.tab()
      expect(document.activeElement).toBeInTheDocument()
      
      // Should be able to navigate to continue button
      const continueButton = screen.getByRole('button', { name: /continue/i })
      expect(continueButton).toBeInTheDocument()
    })
  })
})