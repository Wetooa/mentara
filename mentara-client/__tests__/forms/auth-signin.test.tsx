import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/__tests__/setup/form-test-utils'
import { zodTestUtils } from '@/__tests__/setup/zod-test-utils'
import { authMockData } from '@/__tests__/setup/form-mocks'
import SignIn from '@/components/auth/SignIn'
import { z } from 'zod'

// Mock dependencies
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signInWithEmail: jest.fn().mockResolvedValue({}),
    signInWithOAuth: jest.fn().mockResolvedValue({}),
    isLoading: false,
  }),
}))

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
})

describe('Sign In Form', () => {
  describe('Zod Schema Validation', () => {
    it('validates valid form data', () => {
      zodTestUtils.testValidData(formSchema, authMockData.signIn.valid)
    })

    it('validates invalid form data', () => {
      zodTestUtils.testInvalidData(formSchema, authMockData.signIn.invalid, [
        'Please enter a valid email address.',
        'Password must be at least 8 characters.',
      ])
    })

    it('validates email format', () => {
      zodTestUtils.testEmailValidation(formSchema, 'email', { password: 'password123' })
    })

    it('validates password length', () => {
      zodTestUtils.testStringLength(
        formSchema,
        'password',
        8,
        undefined,
        { email: 'test@example.com' }
      )
    })
  })

  describe('Component Integration', () => {
    it('renders the sign in form', () => {
      renderWithQueryClient(<SignIn />)
      
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('displays OAuth options', () => {
      renderWithQueryClient(<SignIn />)
      
      expect(screen.getByText('Continue with Google')).toBeInTheDocument()
      expect(screen.getByText('Continue with Microsoft')).toBeInTheDocument()
    })

    it('has proper form structure', () => {
      renderWithQueryClient(<SignIn />)
      
      // Check for form elements
      expect(screen.getByRole('form')).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('shows validation errors for empty fields', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SignIn />)
      
      const signInButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(signInButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
        expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument()
      })
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SignIn />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
      })
    })

    it('validates password length', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SignIn />)
      
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, 'short')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument()
      })
    })

    it('clears validation errors when valid input is entered', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SignIn />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      // Enter invalid data
      await user.type(emailInput, 'invalid')
      await user.type(passwordInput, 'short')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
        expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument()
      })
      
      // Clear and enter valid data
      await user.clear(emailInput)
      await user.clear(passwordInput)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid email address.')).not.toBeInTheDocument()
        expect(screen.queryByText('Password must be at least 8 characters.')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Interaction', () => {
    it('allows filling form fields', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SignIn />)
      
      const { valid } = authMockData.signIn
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, valid.email)
      await user.type(passwordInput, valid.password)
      
      expect(emailInput).toHaveValue(valid.email)
      expect(passwordInput).toHaveValue(valid.password)
    })

    it('toggles password visibility', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SignIn />)
      
      const passwordInput = screen.getByLabelText(/password/i)
      const toggleButton = screen.getByRole('button', { name: /toggle password/i })
      
      // Password should be hidden by default
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      // Click toggle button
      await user.click(toggleButton)
      
      // Password should be visible
      expect(passwordInput).toHaveAttribute('type', 'text')
      
      // Click toggle button again
      await user.click(toggleButton)
      
      // Password should be hidden again
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const mockSignIn = jest.fn()
      
      jest.doMock('@/hooks/useAuth', () => ({
        useAuth: () => ({
          signInWithEmail: mockSignIn,
          signInWithOAuth: jest.fn(),
          isLoading: false,
        }),
      }))
      
      const user = userEvent.setup()
      renderWithQueryClient(<SignIn />)
      
      const { valid } = authMockData.signIn
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, valid.email)
      await user.type(passwordInput, valid.password)
      
      const signInButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(signInButton)
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(valid)
      })
    })

    it('prevents submission with invalid data', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SignIn />)
      
      const { invalid } = authMockData.signIn
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, invalid.email)
      await user.type(passwordInput, invalid.password)
      
      const signInButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(signInButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
        expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument()
      })
    })

    it('shows loading state during submission', async () => {
      jest.doMock('@/hooks/useAuth', () => ({
        useAuth: () => ({
          signInWithEmail: jest.fn(),
          signInWithOAuth: jest.fn(),
          isLoading: true,
        }),
      }))
      
      renderWithQueryClient(<SignIn />)
      
      const signInButton = screen.getByRole('button', { name: /sign in/i })
      expect(signInButton).toBeDisabled()
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    })
  })

  describe('OAuth Integration', () => {
    it('handles Google OAuth sign in', async () => {
      const mockOAuth = jest.fn()
      
      jest.doMock('@/hooks/useAuth', () => ({
        useAuth: () => ({
          signInWithEmail: jest.fn(),
          signInWithOAuth: mockOAuth,
          isLoading: false,
        }),
      }))
      
      const user = userEvent.setup()
      renderWithQueryClient(<SignIn />)
      
      const googleButton = screen.getByText('Continue with Google')
      await user.click(googleButton)
      
      expect(mockOAuth).toHaveBeenCalledWith('google')
    })

    it('handles Microsoft OAuth sign in', async () => {
      const mockOAuth = jest.fn()
      
      jest.doMock('@/hooks/useAuth', () => ({
        useAuth: () => ({
          signInWithEmail: jest.fn(),
          signInWithOAuth: mockOAuth,
          isLoading: false,
        }),
      }))
      
      const user = userEvent.setup()
      renderWithQueryClient(<SignIn />)
      
      const microsoftButton = screen.getByText('Continue with Microsoft')
      await user.click(microsoftButton)
      
      expect(mockOAuth).toHaveBeenCalledWith('microsoft')
    })
  })

  describe('Error Handling', () => {
    it('handles authentication errors', async () => {
      const mockSignIn = jest.fn().mockRejectedValue(new Error('Invalid credentials'))
      
      jest.doMock('@/hooks/useAuth', () => ({
        useAuth: () => ({
          signInWithEmail: mockSignIn,
          signInWithOAuth: jest.fn(),
          isLoading: false,
        }),
      }))
      
      const user = userEvent.setup()
      renderWithQueryClient(<SignIn />)
      
      const { valid } = authMockData.signIn
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, valid.email)
      await user.type(passwordInput, valid.password)
      
      const signInButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(signInButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('has link to sign up page', () => {
      renderWithQueryClient(<SignIn />)
      
      const signUpLink = screen.getByText(/don't have an account/i)
      expect(signUpLink).toBeInTheDocument()
      expect(signUpLink.closest('a')).toHaveAttribute('href', '/sign-up')
    })

    it('has forgot password link', () => {
      renderWithQueryClient(<SignIn />)
      
      const forgotPasswordLink = screen.getByText(/forgot password/i)
      expect(forgotPasswordLink).toBeInTheDocument()
      expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderWithQueryClient(<SignIn />)
      
      // Check for form role
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
      
      // Check for proper input labels
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toHaveAccessibleName()
      expect(passwordInput).toHaveAccessibleName()
    })

    it('announces validation errors to screen readers', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SignIn />)
      
      const signInButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(signInButton)
      
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SignIn />)
      
      // Tab through form elements
      await user.tab()
      expect(document.activeElement).toBe(screen.getByLabelText(/email/i))
      
      await user.tab()
      expect(document.activeElement).toBe(screen.getByLabelText(/password/i))
      
      await user.tab()
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /sign in/i }))
    })

    it('submits form with Enter key', async () => {
      const mockSignIn = jest.fn()
      
      jest.doMock('@/hooks/useAuth', () => ({
        useAuth: () => ({
          signInWithEmail: mockSignIn,
          signInWithOAuth: jest.fn(),
          isLoading: false,
        }),
      }))
      
      const user = userEvent.setup()
      renderWithQueryClient(<SignIn />)
      
      const { valid } = authMockData.signIn
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, valid.email)
      await user.type(passwordInput, valid.password)
      
      // Press Enter to submit
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(valid)
      })
    })
  })
})