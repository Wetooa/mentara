import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/__tests__/setup/form-test-utils'
import { zodTestUtils } from '@/__tests__/setup/zod-test-utils'
import { authMockData } from '@/__tests__/setup/form-mocks'
import PreAssessmentSignUp from '@/components/auth/SignUp'
import { z } from 'zod'

// Mock dependencies
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signUpWithEmail: jest.fn().mockResolvedValue({}),
    signUpWithOAuth: jest.fn().mockResolvedValue({}),
    isLoading: false,
  }),
}))

jest.mock('@/store/pre-assessment', () => ({
  usePreAssessmentChecklistStore: () => ({
    questionnaires: [],
    answers: {},
  }),
  useSignUpStore: () => ({
    setDetails: jest.fn(),
  }),
}))

const formSchema = z
  .object({
    nickname: z.string().min(2, {
      message: 'Name must be at least 2 characters.',
    }),
    email: z.string().email({
      message: 'Please enter a valid email address.',
    }),
    confirmEmail: z.string().email({
      message: 'Please enter a valid email address.',
    }),
    password: z.string().min(8, {
      message: 'Password must be at least 8 characters.',
    }),
    confirmPassword: z.string().min(8, {
      message: 'Password must be at least 8 characters.',
    }),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: 'Emails do not match',
    path: ['confirmEmail'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const mockHandleNext = jest.fn()

describe('Sign Up Form', () => {
  describe('Zod Schema Validation', () => {
    it('validates valid form data', () => {
      zodTestUtils.testValidData(formSchema, authMockData.signUp.valid)
    })

    it('validates invalid form data', () => {
      zodTestUtils.testInvalidData(formSchema, authMockData.signUp.invalid, [
        'Name must be at least 2 characters.',
        'Please enter a valid email address.',
        'Emails do not match',
        'Password must be at least 8 characters.',
        'Passwords do not match',
      ])
    })

    it('validates email format', () => {
      zodTestUtils.testEmailValidation(formSchema, 'email', {
        nickname: 'John',
        confirmEmail: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
    })

    it('validates password length', () => {
      zodTestUtils.testStringLength(
        formSchema,
        'password',
        8,
        undefined,
        {
          nickname: 'John',
          email: 'test@example.com',
          confirmEmail: 'test@example.com',
          confirmPassword: 'password123',
        }
      )
    })

    it('validates nickname length', () => {
      zodTestUtils.testStringLength(
        formSchema,
        'nickname',
        2,
        undefined,
        {
          email: 'test@example.com',
          confirmEmail: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        }
      )
    })

    it('validates email confirmation', () => {
      zodTestUtils.testCrossFieldValidation(
        formSchema,
        'email',
        'confirmEmail',
        'test@example.com',
        ['test@example.com', 'different@example.com'],
        {
          nickname: 'John',
          password: 'password123',
          confirmPassword: 'password123',
        }
      )
    })

    it('validates password confirmation', () => {
      zodTestUtils.testCrossFieldValidation(
        formSchema,
        'password',
        'confirmPassword',
        'password123',
        ['password123', 'different123'],
        {
          nickname: 'John',
          email: 'test@example.com',
          confirmEmail: 'test@example.com',
        }
      )
    })
  })

  describe('Component Integration', () => {
    it('renders the sign up form', () => {
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      expect(screen.getByText('Create your account')).toBeInTheDocument()
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it('displays OAuth options', () => {
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      expect(screen.getByText('Continue with Google')).toBeInTheDocument()
      expect(screen.getByText('Continue with Microsoft')).toBeInTheDocument()
    })

    it('has proper form structure', () => {
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      // Check for form elements
      expect(screen.getByRole('form')).toBeInTheDocument()
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('shows validation errors for empty fields', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      const createAccountButton = screen.getByRole('button', { name: /create account/i })
      await user.click(createAccountButton)
      
      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters.')).toBeInTheDocument()
        expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
        expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument()
      })
    })

    it('validates nickname length', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      const nicknameInput = screen.getByLabelText(/name/i)
      await user.type(nicknameInput, 'J')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters.')).toBeInTheDocument()
      })
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      const emailInput = screen.getByLabelText(/email address/i)
      await user.type(emailInput, 'invalid-email')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
      })
    })

    it('validates email confirmation', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      const emailInput = screen.getByLabelText(/email address/i)
      const confirmEmailInput = screen.getByLabelText(/confirm email/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(confirmEmailInput, 'different@example.com')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Emails do not match')).toBeInTheDocument()
      })
    })

    it('validates password length', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      const passwordInput = screen.getByLabelText(/^password/i)
      await user.type(passwordInput, 'short')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument()
      })
    })

    it('validates password confirmation', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'different123')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
    })

    it('clears validation errors when valid input is entered', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      const nicknameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email address/i)
      const confirmEmailInput = screen.getByLabelText(/confirm email/i)
      
      // Enter invalid data
      await user.type(nicknameInput, 'J')
      await user.type(emailInput, 'test@example.com')
      await user.type(confirmEmailInput, 'different@example.com')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters.')).toBeInTheDocument()
        expect(screen.getByText('Emails do not match')).toBeInTheDocument()
      })
      
      // Clear and enter valid data
      await user.clear(nicknameInput)
      await user.clear(confirmEmailInput)
      await user.type(nicknameInput, 'John')
      await user.type(confirmEmailInput, 'test@example.com')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.queryByText('Name must be at least 2 characters.')).not.toBeInTheDocument()
        expect(screen.queryByText('Emails do not match')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Interaction', () => {
    it('allows filling all form fields', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      const { valid } = authMockData.signUp
      
      const nicknameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email address/i)
      const confirmEmailInput = screen.getByLabelText(/confirm email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      
      await user.type(nicknameInput, valid.nickname)
      await user.type(emailInput, valid.email)
      await user.type(confirmEmailInput, valid.confirmEmail)
      await user.type(passwordInput, valid.password)
      await user.type(confirmPasswordInput, valid.confirmPassword)
      
      expect(nicknameInput).toHaveValue(valid.nickname)
      expect(emailInput).toHaveValue(valid.email)
      expect(confirmEmailInput).toHaveValue(valid.confirmEmail)
      expect(passwordInput).toHaveValue(valid.password)
      expect(confirmPasswordInput).toHaveValue(valid.confirmPassword)
    })

    it('toggles password visibility', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const toggleButtons = screen.getAllByRole('button', { name: /toggle password/i })
      
      // Passwords should be hidden by default
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')
      
      // Click first toggle button
      await user.click(toggleButtons[0])
      
      // First password should be visible
      expect(passwordInput).toHaveAttribute('type', 'text')
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')
      
      // Click second toggle button
      await user.click(toggleButtons[1])
      
      // Both passwords should be visible
      expect(passwordInput).toHaveAttribute('type', 'text')
      expect(confirmPasswordInput).toHaveAttribute('type', 'text')
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const mockSignUp = jest.fn()
      
      jest.doMock('@/contexts/AuthContext', () => ({
        useAuth: () => ({
          signUpWithEmail: mockSignUp,
          signUpWithOAuth: jest.fn(),
          isLoading: false,
        }),
      }))
      
      const user = userEvent.setup()
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      const { valid } = authMockData.signUp
      
      const nicknameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email address/i)
      const confirmEmailInput = screen.getByLabelText(/confirm email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      
      await user.type(nicknameInput, valid.nickname)
      await user.type(emailInput, valid.email)
      await user.type(confirmEmailInput, valid.confirmEmail)
      await user.type(passwordInput, valid.password)
      await user.type(confirmPasswordInput, valid.confirmPassword)
      
      const createAccountButton = screen.getByRole('button', { name: /create account/i })
      await user.click(createAccountButton)
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(valid)
      })
    })

    it('prevents submission with invalid data', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      const { invalid } = authMockData.signUp
      
      const nicknameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email address/i)
      const confirmEmailInput = screen.getByLabelText(/confirm email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      
      await user.type(nicknameInput, invalid.nickname)
      await user.type(emailInput, invalid.email)
      await user.type(confirmEmailInput, invalid.confirmEmail)
      await user.type(passwordInput, invalid.password)
      await user.type(confirmPasswordInput, invalid.confirmPassword)
      
      const createAccountButton = screen.getByRole('button', { name: /create account/i })
      await user.click(createAccountButton)
      
      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters.')).toBeInTheDocument()
        expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
        expect(screen.getByText('Emails do not match')).toBeInTheDocument()
        expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument()
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
    })

    it('shows loading state during submission', async () => {
      jest.doMock('@/contexts/AuthContext', () => ({
        useAuth: () => ({
          signUpWithEmail: jest.fn(),
          signUpWithOAuth: jest.fn(),
          isLoading: true,
        }),
      }))
      
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      const createAccountButton = screen.getByRole('button', { name: /create account/i })
      expect(createAccountButton).toBeDisabled()
      expect(screen.getByText(/creating account/i)).toBeInTheDocument()
    })
  })

  describe('OAuth Integration', () => {
    it('handles Google OAuth sign up', async () => {
      const mockOAuth = jest.fn()
      
      jest.doMock('@/contexts/AuthContext', () => ({
        useAuth: () => ({
          signUpWithEmail: jest.fn(),
          signUpWithOAuth: mockOAuth,
          isLoading: false,
        }),
      }))
      
      const user = userEvent.setup()
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      const googleButton = screen.getByText('Continue with Google')
      await user.click(googleButton)
      
      expect(mockOAuth).toHaveBeenCalledWith('google')
    })

    it('handles Microsoft OAuth sign up', async () => {
      const mockOAuth = jest.fn()
      
      jest.doMock('@/contexts/AuthContext', () => ({
        useAuth: () => ({
          signUpWithEmail: jest.fn(),
          signUpWithOAuth: mockOAuth,
          isLoading: false,
        }),
      }))
      
      const user = userEvent.setup()
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      const microsoftButton = screen.getByText('Continue with Microsoft')
      await user.click(microsoftButton)
      
      expect(mockOAuth).toHaveBeenCalledWith('microsoft')
    })
  })

  describe('Navigation', () => {
    it('has link to sign in page', () => {
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      const signInLink = screen.getByText(/already have an account/i)
      expect(signInLink).toBeInTheDocument()
      expect(signInLink.closest('a')).toHaveAttribute('href', '/sign-in')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
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
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      const createAccountButton = screen.getByRole('button', { name: /create account/i })
      await user.click(createAccountButton)
      
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(
        <PreAssessmentSignUp handleNextButtonOnClick={mockHandleNext} />
      )
      
      // Tab through form elements
      await user.tab()
      expect(document.activeElement).toBe(screen.getByLabelText(/name/i))
      
      await user.tab()
      expect(document.activeElement).toBe(screen.getByLabelText(/email address/i))
      
      await user.tab()
      expect(document.activeElement).toBe(screen.getByLabelText(/confirm email/i))
    })
  })
})