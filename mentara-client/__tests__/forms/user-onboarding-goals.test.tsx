import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/__tests__/setup/form-test-utils'
import { zodTestUtils } from '@/__tests__/setup/zod-test-utils'
import { userOnboardingMockData } from '@/__tests__/setup/form-mocks'
import GoalsPage from '@/app/(protected)/user/onboarding/goals/page'
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

const goalsSchema = z.object({
  treatmentGoals: z.array(z.string()).min(1, 'Please select at least one treatment goal'),
  specificConcerns: z.string().optional(),
  previousTreatment: z.boolean().default(false),
  previousTreatmentDetails: z.string().optional(),
  urgencyLevel: z.enum(['low', 'moderate', 'high', 'crisis']),
  preferredOutcome: z.string().min(10, 'Please describe your preferred outcome'),
  additionalNotes: z.string().optional(),
})

describe('User Onboarding Goals Form', () => {
  describe('Zod Schema Validation', () => {
    describe('Required Fields', () => {
      it('validates treatment goals array', () => {
        zodTestUtils.testMinArrayLength(
          goalsSchema,
          'treatmentGoals',
          1,
          userOnboardingMockData.goals.valid
        )
      })

      it('validates urgency level enum', () => {
        const validLevels = ['low', 'moderate', 'high', 'crisis']
        
        zodTestUtils.testEnumValidation(
          goalsSchema,
          'urgencyLevel',
          validLevels,
          'invalid-level',
          userOnboardingMockData.goals.valid
        )
      })

      it('validates preferred outcome minimum length', () => {
        zodTestUtils.testStringLength(
          goalsSchema,
          'preferredOutcome',
          10,
          undefined,
          userOnboardingMockData.goals.valid
        )
      })
    })

    describe('Optional Fields', () => {
      it('allows optional fields to be empty', () => {
        const dataWithoutOptional = {
          ...userOnboardingMockData.goals.valid,
          specificConcerns: undefined,
          previousTreatmentDetails: undefined,
          additionalNotes: undefined,
        }
        
        zodTestUtils.testValidData(goalsSchema, dataWithoutOptional)
      })

      it('validates boolean fields', () => {
        const testData = {
          ...userOnboardingMockData.goals.valid,
          previousTreatment: true,
        }
        
        zodTestUtils.testValidData(goalsSchema, testData)
        
        testData.previousTreatment = false
        zodTestUtils.testValidData(goalsSchema, testData)
      })
    })

    describe('Complete Valid Data', () => {
      it('validates complete valid form data', () => {
        zodTestUtils.testValidData(goalsSchema, userOnboardingMockData.goals.valid)
      })

      it('validates invalid form data', () => {
        const { invalid } = userOnboardingMockData.goals
        
        zodTestUtils.testInvalidData(goalsSchema, invalid, [
          'Please select at least one treatment goal',
          'Please describe your preferred outcome',
        ])
      })
    })
  })

  describe('Component Integration', () => {
    it('renders the goals form', () => {
      renderWithQueryClient(<GoalsPage />)
      
      expect(screen.getByText('Treatment Goals')).toBeInTheDocument()
      expect(screen.getByText('What would you like to work on?')).toBeInTheDocument()
    })

    it('displays treatment goal options', () => {
      renderWithQueryClient(<GoalsPage />)
      
      const treatmentGoals = [
        'Manage Anxiety',
        'Address Depression',
        'Improve Relationships',
        'Reduce Stress',
        'Better Sleep',
        'Build Self-Esteem',
        'Substance Use Issues',
        'Process Trauma',
        'Grief & Loss',
        'Life Transitions',
        'Work-Related Stress',
        'Family Issues',
      ]
      
      treatmentGoals.forEach(goal => {
        expect(screen.getByText(goal)).toBeInTheDocument()
      })
    })

    it('displays urgency level options', () => {
      renderWithQueryClient(<GoalsPage />)
      
      const urgencyLevels = ['Low', 'Moderate', 'High', 'Crisis']
      
      urgencyLevels.forEach(level => {
        expect(screen.getByText(level)).toBeInTheDocument()
      })
    })

    it('has proper form structure', () => {
      renderWithQueryClient(<GoalsPage />)
      
      // Check for form sections
      expect(screen.getByText('Treatment Goals')).toBeInTheDocument()
      expect(screen.getByText('Additional Information')).toBeInTheDocument()
      expect(screen.getByText('Previous Treatment')).toBeInTheDocument()
      expect(screen.getByText('Urgency Level')).toBeInTheDocument()
      expect(screen.getByText('Preferred Outcome')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('shows validation errors for required fields', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<GoalsPage />)
      
      // Try to submit form without filling required fields
      const continueButton = screen.getByRole('button', { name: /continue/i })
      await user.click(continueButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please select at least one treatment goal')).toBeInTheDocument()
        expect(screen.getByText('Please describe your preferred outcome')).toBeInTheDocument()
      })
    })

    it('validates minimum treatment goals selection', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<GoalsPage />)
      
      // Submit without selecting any goals
      const continueButton = screen.getByRole('button', { name: /continue/i })
      await user.click(continueButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please select at least one treatment goal')).toBeInTheDocument()
      })
    })

    it('validates preferred outcome minimum length', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<GoalsPage />)
      
      const outcomeTextarea = screen.getByLabelText(/preferred outcome/i)
      await user.type(outcomeTextarea, 'Short')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Please describe your preferred outcome')).toBeInTheDocument()
      })
    })

    it('requires urgency level selection', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<GoalsPage />)
      
      const continueButton = screen.getByRole('button', { name: /continue/i })
      await user.click(continueButton)
      
      await waitFor(() => {
        expect(screen.getByText(/urgency level/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Interaction', () => {
    it('allows selecting multiple treatment goals', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<GoalsPage />)
      
      // Select multiple goals
      const anxietyGoal = screen.getByLabelText(/manage anxiety/i)
      const depressionGoal = screen.getByLabelText(/address depression/i)
      const stressGoal = screen.getByLabelText(/reduce stress/i)
      
      await user.click(anxietyGoal)
      await user.click(depressionGoal)
      await user.click(stressGoal)
      
      expect(anxietyGoal).toBeChecked()
      expect(depressionGoal).toBeChecked()
      expect(stressGoal).toBeChecked()
    })

    it('allows selecting urgency level', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<GoalsPage />)
      
      const moderateLevel = screen.getByLabelText(/moderate/i)
      await user.click(moderateLevel)
      
      expect(moderateLevel).toBeChecked()
    })

    it('allows toggling previous treatment', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<GoalsPage />)
      
      const previousTreatmentCheckbox = screen.getByLabelText(/previous treatment/i)
      await user.click(previousTreatmentCheckbox)
      
      expect(previousTreatmentCheckbox).toBeChecked()
      
      // Should show details field when checked
      expect(screen.getByLabelText(/treatment details/i)).toBeInTheDocument()
    })

    it('allows filling text areas', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<GoalsPage />)
      
      const { valid } = userOnboardingMockData.goals
      
      const specificConcerns = screen.getByLabelText(/specific concerns/i)
      await user.type(specificConcerns, valid.specificConcerns!)
      
      const preferredOutcome = screen.getByLabelText(/preferred outcome/i)
      await user.type(preferredOutcome, valid.preferredOutcome)
      
      const additionalNotes = screen.getByLabelText(/additional notes/i)
      await user.type(additionalNotes, valid.additionalNotes!)
      
      expect(specificConcerns).toHaveValue(valid.specificConcerns)
      expect(preferredOutcome).toHaveValue(valid.preferredOutcome)
      expect(additionalNotes).toHaveValue(valid.additionalNotes)
    })

    it('clears validation errors when valid input is entered', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<GoalsPage />)
      
      // Submit to trigger validation errors
      const continueButton = screen.getByRole('button', { name: /continue/i })
      await user.click(continueButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please select at least one treatment goal')).toBeInTheDocument()
      })
      
      // Select a goal to clear the error
      const anxietyGoal = screen.getByLabelText(/manage anxiety/i)
      await user.click(anxietyGoal)
      
      await waitFor(() => {
        expect(screen.queryByText('Please select at least one treatment goal')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<GoalsPage />)
      
      const { valid } = userOnboardingMockData.goals
      
      // Select treatment goals
      const anxietyGoal = screen.getByLabelText(/manage anxiety/i)
      const depressionGoal = screen.getByLabelText(/address depression/i)
      await user.click(anxietyGoal)
      await user.click(depressionGoal)
      
      // Fill specific concerns
      const specificConcerns = screen.getByLabelText(/specific concerns/i)
      await user.type(specificConcerns, valid.specificConcerns!)
      
      // Select previous treatment
      const previousTreatmentCheckbox = screen.getByLabelText(/previous treatment/i)
      await user.click(previousTreatmentCheckbox)
      
      // Fill treatment details
      const treatmentDetails = screen.getByLabelText(/treatment details/i)
      await user.type(treatmentDetails, valid.previousTreatmentDetails!)
      
      // Select urgency level
      const moderateLevel = screen.getByLabelText(/moderate/i)
      await user.click(moderateLevel)
      
      // Fill preferred outcome
      const preferredOutcome = screen.getByLabelText(/preferred outcome/i)
      await user.type(preferredOutcome, valid.preferredOutcome)
      
      // Fill additional notes
      const additionalNotes = screen.getByLabelText(/additional notes/i)
      await user.type(additionalNotes, valid.additionalNotes!)
      
      const continueButton = screen.getByRole('button', { name: /continue/i })
      await user.click(continueButton)
      
      // Should not show validation errors
      await waitFor(() => {
        expect(screen.queryByText('Please select at least one treatment goal')).not.toBeInTheDocument()
        expect(screen.queryByText('Please describe your preferred outcome')).not.toBeInTheDocument()
      })
    })

    it('prevents submission with invalid data', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<GoalsPage />)
      
      // Fill with invalid data
      const preferredOutcome = screen.getByLabelText(/preferred outcome/i)
      await user.type(preferredOutcome, 'Short')
      
      const continueButton = screen.getByRole('button', { name: /continue/i })
      await user.click(continueButton)
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('Please select at least one treatment goal')).toBeInTheDocument()
        expect(screen.getByText('Please describe your preferred outcome')).toBeInTheDocument()
      })
    })
  })

  describe('Conditional Fields', () => {
    it('shows treatment details when previous treatment is selected', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<GoalsPage />)
      
      const previousTreatmentCheckbox = screen.getByLabelText(/previous treatment/i)
      
      // Initially, treatment details should not be visible
      expect(screen.queryByLabelText(/treatment details/i)).not.toBeInTheDocument()
      
      // Select previous treatment
      await user.click(previousTreatmentCheckbox)
      
      // Treatment details should now be visible
      expect(screen.getByLabelText(/treatment details/i)).toBeInTheDocument()
    })

    it('hides treatment details when previous treatment is deselected', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<GoalsPage />)
      
      const previousTreatmentCheckbox = screen.getByLabelText(/previous treatment/i)
      
      // Select previous treatment
      await user.click(previousTreatmentCheckbox)
      expect(screen.getByLabelText(/treatment details/i)).toBeInTheDocument()
      
      // Deselect previous treatment
      await user.click(previousTreatmentCheckbox)
      expect(screen.queryByLabelText(/treatment details/i)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderWithQueryClient(<GoalsPage />)
      
      // Check for form role
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
      
      // Check for proper checkbox labels
      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAccessibleName()
      })
      
      // Check for proper radio button labels
      const radios = screen.getAllByRole('radio')
      radios.forEach(radio => {
        expect(radio).toHaveAccessibleName()
      })
    })

    it('announces validation errors to screen readers', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<GoalsPage />)
      
      const continueButton = screen.getByRole('button', { name: /continue/i })
      await user.click(continueButton)
      
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<GoalsPage />)
      
      // Tab through form elements
      await user.tab()
      expect(document.activeElement).toBeInTheDocument()
      
      // Should be able to navigate to continue button
      const continueButton = screen.getByRole('button', { name: /continue/i })
      expect(continueButton).toBeInTheDocument()
    })
  })
})