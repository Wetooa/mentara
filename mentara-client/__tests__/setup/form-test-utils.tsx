import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useForm, FormProvider, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Enhanced render function for forms with React Query
export function renderWithQueryClient(ui: React.ReactElement, options?: any) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>,
    options
  )
}

// Form wrapper for testing React Hook Form components
interface FormWrapperProps<T extends Record<string, any>> {
  children: React.ReactNode
  schema: z.ZodSchema<T>
  defaultValues?: Partial<T>
  onSubmit?: (data: T) => void
  formRef?: React.MutableRefObject<UseFormReturn<T> | null>
}

export function FormWrapper<T extends Record<string, any>>({
  children,
  schema,
  defaultValues,
  onSubmit = () => {},
  formRef,
}: FormWrapperProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  if (formRef) {
    formRef.current = form
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} data-testid="test-form">
        {children}
      </form>
    </FormProvider>
  )
}

// Utility to render form components with proper context
export function renderForm<T extends Record<string, any>>(
  component: React.ReactElement,
  options: {
    schema: z.ZodSchema<T>
    defaultValues?: Partial<T>
    onSubmit?: (data: T) => void
  }
) {
  const formRef = React.createRef<UseFormReturn<T> | null>()
  
  const result = renderWithQueryClient(
    <FormWrapper
      schema={options.schema}
      defaultValues={options.defaultValues}
      onSubmit={options.onSubmit}
      formRef={formRef as React.MutableRefObject<UseFormReturn<T> | null>}
    >
      {component}
    </FormWrapper>
  )

  return {
    ...result,
    form: formRef.current,
    getForm: () => formRef.current,
  }
}

// Form interaction utilities
export const formUtils = {
  // Fill form field with value
  async fillField(fieldName: string, value: string) {
    const user = userEvent.setup()
    const field = screen.getByLabelText(new RegExp(fieldName, 'i')) || 
                  screen.getByPlaceholderText(new RegExp(fieldName, 'i')) ||
                  screen.getByRole('textbox', { name: new RegExp(fieldName, 'i') })
    
    await user.clear(field)
    await user.type(field, value)
  },

  // Select option from dropdown
  async selectOption(fieldName: string, optionValue: string) {
    const user = userEvent.setup()
    const select = screen.getByLabelText(new RegExp(fieldName, 'i')) ||
                   screen.getByRole('combobox', { name: new RegExp(fieldName, 'i') })
    
    await user.click(select)
    const option = screen.getByText(new RegExp(optionValue, 'i'))
    await user.click(option)
  },

  // Check/uncheck checkbox
  async toggleCheckbox(fieldName: string, checked: boolean = true) {
    const user = userEvent.setup()
    const checkbox = screen.getByLabelText(new RegExp(fieldName, 'i')) ||
                     screen.getByRole('checkbox', { name: new RegExp(fieldName, 'i') })
    
    if (checked) {
      await user.check(checkbox)
    } else {
      await user.uncheck(checkbox)
    }
  },

  // Submit form
  async submitForm() {
    const user = userEvent.setup()
    const submitButton = screen.getByRole('button', { name: /submit|save|continue/i })
    await user.click(submitButton)
  },

  // Wait for form validation
  async waitForValidation() {
    await waitFor(() => {
      // Wait for any validation errors to appear or disappear
    }, { timeout: 1000 })
  },

  // Get form errors
  getFormErrors() {
    return screen.queryAllByRole('alert').map(alert => alert.textContent)
  },

  // Check if field has error
  hasFieldError(fieldName: string) {
    const field = screen.getByLabelText(new RegExp(fieldName, 'i'))
    return field.getAttribute('aria-invalid') === 'true'
  },

  // Get field error message
  getFieldError(fieldName: string) {
    const field = screen.getByLabelText(new RegExp(fieldName, 'i'))
    const errorId = field.getAttribute('aria-describedby')
    if (errorId) {
      const errorElement = document.getElementById(errorId)
      return errorElement?.textContent || null
    }
    return null
  },
}

// Form validation testing utilities
export const validationUtils = {
  // Test required field validation
  async testRequiredField(fieldName: string) {
    await formUtils.fillField(fieldName, '')
    await formUtils.submitForm()
    await formUtils.waitForValidation()
    
    expect(formUtils.hasFieldError(fieldName)).toBe(true)
    expect(formUtils.getFieldError(fieldName)).toMatch(/required/i)
  },

  // Test field length validation
  async testFieldLength(fieldName: string, minLength?: number, maxLength?: number) {
    if (minLength) {
      await formUtils.fillField(fieldName, 'a'.repeat(minLength - 1))
      await formUtils.submitForm()
      await formUtils.waitForValidation()
      
      expect(formUtils.hasFieldError(fieldName)).toBe(true)
      expect(formUtils.getFieldError(fieldName)).toMatch(/at least/i)
    }

    if (maxLength) {
      await formUtils.fillField(fieldName, 'a'.repeat(maxLength + 1))
      await formUtils.submitForm()
      await formUtils.waitForValidation()
      
      expect(formUtils.hasFieldError(fieldName)).toBe(true)
      expect(formUtils.getFieldError(fieldName)).toMatch(/less than|maximum/i)
    }
  },

  // Test email validation
  async testEmailValidation(fieldName: string) {
    const invalidEmails = ['invalid', 'test@', '@test.com', 'test@test']
    
    for (const email of invalidEmails) {
      await formUtils.fillField(fieldName, email)
      await formUtils.submitForm()
      await formUtils.waitForValidation()
      
      expect(formUtils.hasFieldError(fieldName)).toBe(true)
      expect(formUtils.getFieldError(fieldName)).toMatch(/valid email/i)
    }

    // Test valid email
    await formUtils.fillField(fieldName, 'test@example.com')
    await formUtils.submitForm()
    await formUtils.waitForValidation()
    
    expect(formUtils.hasFieldError(fieldName)).toBe(false)
  },

  // Test password validation
  async testPasswordValidation(fieldName: string, minLength: number = 8) {
    await formUtils.fillField(fieldName, 'a'.repeat(minLength - 1))
    await formUtils.submitForm()
    await formUtils.waitForValidation()
    
    expect(formUtils.hasFieldError(fieldName)).toBe(true)
    expect(formUtils.getFieldError(fieldName)).toMatch(/at least.*characters/i)
  },

  // Test phone number validation
  async testPhoneValidation(fieldName: string) {
    const invalidPhones = ['123', '09123456', '+63123456789012']
    
    for (const phone of invalidPhones) {
      await formUtils.fillField(fieldName, phone)
      await formUtils.submitForm()
      await formUtils.waitForValidation()
      
      expect(formUtils.hasFieldError(fieldName)).toBe(true)
    }

    // Test valid phone
    await formUtils.fillField(fieldName, '09123456789')
    await formUtils.submitForm()
    await formUtils.waitForValidation()
    
    expect(formUtils.hasFieldError(fieldName)).toBe(false)
  },
}

// Mock toast context for forms
export const mockToastContext = {
  showToast: jest.fn(),
  toast: jest.fn(),
}

// Mock API responses for form submissions
export const mockFormSubmissionResponses = {
  success: {
    data: { id: 'test-id', message: 'Success' },
    status: 200,
  },
  validation_error: {
    response: {
      data: { message: 'Validation failed', errors: {} },
      status: 400,
    },
  },
  server_error: {
    response: {
      data: { message: 'Server error' },
      status: 500,
    },
  },
}

// Form accessibility testing utilities
export const a11yUtils = {
  // Test keyboard navigation
  async testKeyboardNavigation() {
    const user = userEvent.setup()
    
    // Test tab navigation
    await user.tab()
    expect(document.activeElement).toBeInTheDocument()
    
    // Test form submission with Enter key
    await user.keyboard('{Enter}')
    await formUtils.waitForValidation()
  },

  // Test screen reader support
  testScreenReaderSupport() {
    const form = screen.getByTestId('test-form')
    
    // Check for proper ARIA attributes
    expect(form).toHaveAttribute('role', 'form')
    
    // Check for proper labeling
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach(input => {
      expect(input).toHaveAccessibleName()
    })
  },

  // Test error announcement
  testErrorAnnouncement() {
    const errors = screen.getAllByRole('alert')
    errors.forEach(error => {
      expect(error).toHaveAttribute('aria-live', 'polite')
    })
  },
}

export default {
  renderWithQueryClient,
  FormWrapper,
  renderForm,
  formUtils,
  validationUtils,
  mockToastContext,
  mockFormSubmissionResponses,
  a11yUtils,
}