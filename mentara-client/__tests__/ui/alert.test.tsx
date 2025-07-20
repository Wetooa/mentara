import React from 'react'
import { render, screen } from '@testing-library/react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'

describe('Alert Component', () => {
  describe('Basic Functionality', () => {
    it('renders alert element', () => {
      render(<Alert>Alert content</Alert>)
      
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent('Alert content')
    })

    it('applies default styles', () => {
      render(<Alert>Default alert</Alert>)
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass(
        'relative',
        'w-full',
        'rounded-lg',
        'border',
        'p-4'
      )
    })

    it('accepts custom className', () => {
      render(<Alert className="custom-alert-class">Alert</Alert>)
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('custom-alert-class')
    })
  })

  describe('Alert Variants', () => {
    it('renders default variant correctly', () => {
      render(<Alert variant="default">Default alert</Alert>)
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-background', 'text-foreground')
    })

    it('renders destructive variant correctly', () => {
      render(<Alert variant="destructive">Destructive alert</Alert>)
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive')
    })

    it('renders success variant correctly if available', () => {
      // Note: This test depends on the actual implementation
      // Some Alert components may not have a success variant
      render(<Alert className="border-green-500 text-green-700">Success alert</Alert>)
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-green-500', 'text-green-700')
    })

    it('renders warning variant correctly if available', () => {
      render(<Alert className="border-yellow-500 text-yellow-700">Warning alert</Alert>)
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-yellow-500', 'text-yellow-700')
    })
  })

  describe('Alert Title', () => {
    it('renders alert title', () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
        </Alert>
      )
      
      expect(screen.getByText('Alert Title')).toBeInTheDocument()
    })

    it('applies title styles', () => {
      render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
        </Alert>
      )
      
      const title = screen.getByText('Title')
      expect(title).toHaveClass('mb-1', 'font-medium', 'leading-none', 'tracking-tight')
    })

    it('renders as h5 by default', () => {
      render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
        </Alert>
      )
      
      const title = screen.getByRole('heading', { level: 5 })
      expect(title).toHaveTextContent('Title')
    })

    it('accepts custom className for title', () => {
      render(
        <Alert>
          <AlertTitle className="custom-title-class">Title</AlertTitle>
        </Alert>
      )
      
      const title = screen.getByText('Title')
      expect(title).toHaveClass('custom-title-class')
    })
  })

  describe('Alert Description', () => {
    it('renders alert description', () => {
      render(
        <Alert>
          <AlertDescription>Alert description text</AlertDescription>
        </Alert>
      )
      
      expect(screen.getByText('Alert description text')).toBeInTheDocument()
    })

    it('applies description styles', () => {
      render(
        <Alert>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      )
      
      const description = screen.getByText('Description')
      expect(description).toHaveClass('text-sm')
    })

    it('accepts custom className for description', () => {
      render(
        <Alert>
          <AlertDescription className="custom-description-class">Description</AlertDescription>
        </Alert>
      )
      
      const description = screen.getByText('Description')
      expect(description).toHaveClass('custom-description-class')
    })
  })

  describe('Alert with Icons', () => {
    it('renders with icon', () => {
      render(
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Terminal Alert</AlertTitle>
          <AlertDescription>This is a terminal alert</AlertDescription>
        </Alert>
      )
      
      expect(screen.getByText('Terminal Alert')).toBeInTheDocument()
      expect(screen.getByText('This is a terminal alert')).toBeInTheDocument()
    })

    it('renders error alert with icon', () => {
      render(
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive')
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('renders success alert with icon', () => {
      render(
        <Alert className="border-green-500 text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Operation completed successfully</AlertDescription>
        </Alert>
      )
      
      expect(screen.getByText('Success')).toBeInTheDocument()
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument()
    })

    it('renders warning alert with icon', () => {
      render(
        <Alert className="border-yellow-500 text-yellow-700">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Please review your settings</AlertDescription>
        </Alert>
      )
      
      expect(screen.getByText('Warning')).toBeInTheDocument()
      expect(screen.getByText('Please review your settings')).toBeInTheDocument()
    })
  })

  describe('Complete Alert Structure', () => {
    it('renders complete alert with all components', () => {
      render(
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Complete Alert</AlertTitle>
          <AlertDescription>
            This is a complete alert with icon, title, and description.
          </AlertDescription>
        </Alert>
      )
      
      expect(screen.getByRole('heading', { level: 5, name: 'Complete Alert' })).toBeInTheDocument()
      expect(screen.getByText('This is a complete alert with icon, title, and description.')).toBeInTheDocument()
    })

    it('maintains proper structure hierarchy', () => {
      render(
        <Alert data-testid="alert">
          <AlertTitle data-testid="title">Title</AlertTitle>
          <AlertDescription data-testid="description">Description</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByTestId('alert')
      const title = screen.getByTestId('title')
      const description = screen.getByTestId('description')
      
      expect(alert).toContainElement(title)
      expect(alert).toContainElement(description)
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA role', () => {
      render(<Alert>Alert message</Alert>)
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('role', 'alert')
    })

    it('supports aria-label', () => {
      render(<Alert aria-label="Important notification">Alert content</Alert>)
      
      const alert = screen.getByLabelText('Important notification')
      expect(alert).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <Alert aria-describedby="alert-description">
            <AlertTitle>Title</AlertTitle>
            <AlertDescription id="alert-description">Description</AlertDescription>
          </Alert>
        </>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-describedby', 'alert-description')
    })

    it('maintains semantic heading structure', () => {
      render(
        <Alert>
          <AlertTitle>Main Alert</AlertTitle>
          <AlertDescription>
            Additional information about the alert
          </AlertDescription>
        </Alert>
      )
      
      const title = screen.getByRole('heading', { level: 5 })
      expect(title).toHaveTextContent('Main Alert')
    })

    it('provides proper context for screen readers', () => {
      render(
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unable to save changes. Please try again.
          </AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Unable to save changes. Please try again.')).toBeInTheDocument()
    })
  })

  describe('Different Alert Types', () => {
    it('renders informational alert', () => {
      render(
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>Here's some helpful information</AlertDescription>
        </Alert>
      )
      
      expect(screen.getByText('Information')).toBeInTheDocument()
      expect(screen.getByText("Here's some helpful information")).toBeInTheDocument()
    })

    it('renders error alert', () => {
      render(
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>An error occurred</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive')
      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('renders alert with only title', () => {
      render(
        <Alert>
          <AlertTitle>Title Only Alert</AlertTitle>
        </Alert>
      )
      
      expect(screen.getByText('Title Only Alert')).toBeInTheDocument()
    })

    it('renders alert with only description', () => {
      render(
        <Alert>
          <AlertDescription>Description only alert</AlertDescription>
        </Alert>
      )
      
      expect(screen.getByText('Description only alert')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty alert gracefully', () => {
      render(<Alert />)
      
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
    })

    it('handles long content', () => {
      const longContent = 'A'.repeat(1000)
      
      render(
        <Alert>
          <AlertTitle>Long Content Alert</AlertTitle>
          <AlertDescription>{longContent}</AlertDescription>
        </Alert>
      )
      
      expect(screen.getByText('Long Content Alert')).toBeInTheDocument()
      expect(screen.getByText(longContent)).toBeInTheDocument()
    })

    it('handles special characters', () => {
      render(
        <Alert>
          <AlertTitle>Special Characters: !@#$%^&*()</AlertTitle>
          <AlertDescription>Content with émojis 🎉 and ñ characters</AlertDescription>
        </Alert>
      )
      
      expect(screen.getByText('Special Characters: !@#$%^&*()')).toBeInTheDocument()
      expect(screen.getByText('Content with émojis 🎉 and ñ characters')).toBeInTheDocument()
    })

    it('handles nested elements', () => {
      render(
        <Alert>
          <AlertTitle>Complex Content</AlertTitle>
          <AlertDescription>
            <span>Nested span with <strong>bold text</strong></span>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
          </AlertDescription>
        </Alert>
      )
      
      expect(screen.getByText('Complex Content')).toBeInTheDocument()
      expect(screen.getByText('bold text')).toBeInTheDocument()
      expect(screen.getByText('List item 1')).toBeInTheDocument()
    })

    it('handles ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Alert ref={ref}>Content</Alert>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Styling Variations', () => {
    it('supports custom border styles', () => {
      render(
        <Alert className="border-l-4 border-blue-500">
          <AlertDescription>Left border alert</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-l-4', 'border-blue-500')
    })

    it('supports custom background colors', () => {
      render(
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription>Blue background alert</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-blue-50', 'border-blue-200')
    })

    it('supports responsive design', () => {
      render(
        <Alert className="w-full md:w-1/2 lg:w-1/3">
          <AlertDescription>Responsive alert</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('w-full', 'md:w-1/2', 'lg:w-1/3')
    })
  })
})