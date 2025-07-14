import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from './test-utils'

// Base component test template
export const createComponentTest = (componentName: string) => ({
  // Basic rendering test
  renders: (Component: React.ComponentType<any>, props: any = {}) => {
    it(`renders ${componentName} without crashing`, () => {
      render(<Component {...props} />)
    })
  },

  // Accessibility test
  accessibility: (Component: React.ComponentType<any>, props: any = {}) => {
    it(`${componentName} is accessible`, async () => {
      const { container } = render(<Component {...props} />)
      
      // Check for proper heading structure
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headings.forEach(heading => {
        expect(heading).toBeInTheDocument()
      })

      // Check for proper button accessibility
      const buttons = screen.getAllByRole('button', { hidden: true })
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type')
      })
    })
  },

  // Loading state test
  loadingState: (Component: React.ComponentType<any>, loadingProps: any) => {
    it(`${componentName} shows loading state`, () => {
      render(<Component {...loadingProps} />)
      expect(screen.getByTestId('loading') || screen.getByText(/loading/i)).toBeInTheDocument()
    })
  },

  // Error state test
  errorState: (Component: React.ComponentType<any>, errorProps: any) => {
    it(`${componentName} shows error state`, () => {
      render(<Component {...errorProps} />)
      expect(screen.getByTestId('error') || screen.getByText(/error/i)).toBeInTheDocument()
    })
  },

  // User interaction test
  userInteraction: (
    Component: React.ComponentType<any>, 
    props: any,
    interactionTest: (user: ReturnType<typeof userEvent.setup>) => Promise<void>
  ) => {
    it(`${componentName} handles user interactions`, async () => {
      const user = userEvent.setup()
      render(<Component {...props} />)
      await interactionTest(user)
    })
  },
})

// Form component test helpers
export const formTestHelpers = {
  // Test form validation
  validation: async (formElement: HTMLElement, validationRules: Record<string, any>) => {
    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const field = screen.getByLabelText(new RegExp(fieldName, 'i'))
      
      if (rules.required) {
        fireEvent.blur(field)
        await waitFor(() => {
          expect(screen.getByText(/required/i)).toBeInTheDocument()
        })
      }

      if (rules.minLength) {
        fireEvent.change(field, { target: { value: 'a'.repeat(rules.minLength - 1) } })
        fireEvent.blur(field)
        await waitFor(() => {
          expect(screen.getByText(/minimum/i)).toBeInTheDocument()
        })
      }

      if (rules.pattern) {
        fireEvent.change(field, { target: { value: 'invalid-format' } })
        fireEvent.blur(field)
        await waitFor(() => {
          expect(screen.getByText(/invalid/i)).toBeInTheDocument()
        })
      }
    }
  },

  // Test form submission
  submission: async (submitData: Record<string, any>, onSubmit: jest.Mock) => {
    for (const [fieldName, value] of Object.entries(submitData)) {
      const field = screen.getByLabelText(new RegExp(fieldName, 'i'))
      await userEvent.type(field, value.toString())
    }

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining(submitData),
        expect.anything()
      )
    })
  },
}

// API integration test helpers
export const apiTestHelpers = {
  // Test loading states during API calls
  loadingStates: async (triggerApiCall: () => Promise<void>) => {
    expect(screen.getByTestId('loading')).toBeInTheDocument()
    await triggerApiCall()
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })
  },

  // Test success states
  successStates: async (triggerApiCall: () => Promise<void>, expectedContent: string | RegExp) => {
    await triggerApiCall()
    await waitFor(() => {
      expect(screen.getByText(expectedContent)).toBeInTheDocument()
    })
  },

  // Test error handling
  errorHandling: async (triggerApiCall: () => Promise<void>, expectedErrorMessage: string | RegExp) => {
    await triggerApiCall()
    await waitFor(() => {
      expect(screen.getByText(expectedErrorMessage)).toBeInTheDocument()
    })
  },
}

// Router testing helpers
export const routerTestHelpers = {
  // Mock router push
  expectNavigation: (mockPush: jest.Mock, expectedPath: string) => {
    expect(mockPush).toHaveBeenCalledWith(expectedPath)
  },

  // Test navigation on component actions
  navigationOnAction: async (action: () => Promise<void>, mockPush: jest.Mock, expectedPath: string) => {
    await action()
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expectedPath)
    })
  },
}

// Auth testing helpers
export const authTestHelpers = {
  // Test protected component behavior
  protectedComponent: (Component: React.ComponentType<any>, props: any = {}) => {
    it('redirects unauthenticated users', () => {
      // Mock unauthenticated state
      jest.mocked(require('@clerk/nextjs').useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        userId: null,
      })

      render(<Component {...props} />)
      expect(screen.getByText(/sign in/i)).toBeInTheDocument()
    })
  },

  // Test role-based access
  roleBasedAccess: (Component: React.ComponentType<any>, allowedRoles: string[], userRole: string) => {
    it(`allows access for ${allowedRoles.join(', ')} roles`, () => {
      const shouldHaveAccess = allowedRoles.includes(userRole)
      
      render(<Component />)
      
      if (shouldHaveAccess) {
        expect(screen.queryByText(/access denied/i)).not.toBeInTheDocument()
      } else {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument()
      }
    })
  },
}