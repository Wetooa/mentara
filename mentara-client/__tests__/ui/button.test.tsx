import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Download } from 'lucide-react'

describe('Button Component', () => {
  describe('Basic Functionality', () => {
    it('renders with default variant and size', () => {
      render(<Button>Click me</Button>)
      
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('handles click events', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Click me</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('passes through custom props', () => {
      render(
        <Button data-testid="custom-button" aria-label="Custom button">
          Test
        </Button>
      )
      
      const button = screen.getByTestId('custom-button')
      expect(button).toHaveAttribute('aria-label', 'Custom button')
    })
  })

  describe('Variants', () => {
    it('renders default variant correctly', () => {
      render(<Button variant="default">Default</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('renders destructive variant correctly', () => {
      render(<Button variant="destructive">Delete</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')
    })

    it('renders outline variant correctly', () => {
      render(<Button variant="outline">Outline</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border', 'border-input', 'bg-background')
    })

    it('renders secondary variant correctly', () => {
      render(<Button variant="secondary">Secondary</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')
    })

    it('renders ghost variant correctly', () => {
      render(<Button variant="ghost">Ghost</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground')
    })

    it('renders link variant correctly', () => {
      render(<Button variant="link">Link</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-primary', 'underline-offset-4')
    })
  })

  describe('Sizes', () => {
    it('renders default size correctly', () => {
      render(<Button size="default">Default size</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'px-4', 'py-2')
    })

    it('renders small size correctly', () => {
      render(<Button size="sm">Small</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9', 'rounded-md', 'px-3')
    })

    it('renders large size correctly', () => {
      render(<Button size="lg">Large</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11', 'rounded-md', 'px-8')
    })

    it('renders icon size correctly', () => {
      render(<Button size="icon"><Plus /></Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'w-10')
    })
  })

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Button disabled>Disabled</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })

    it('prevents click when disabled', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Button disabled onClick={handleClick}>Disabled</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('shows loading state with spinner', () => {
      render(<Button loading>Loading</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('replaces content with loading state', () => {
      render(<Button loading>Click me</Button>)
      
      // Text should be hidden during loading
      expect(screen.queryByText('Click me')).not.toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })

  describe('Icons and Content', () => {
    it('renders with leading icon', () => {
      render(
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      )
      
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('Add Item')).toBeInTheDocument()
    })

    it('renders with trailing icon', () => {
      render(
        <Button>
          Download
          <Download className="ml-2 h-4 w-4" />
        </Button>
      )
      
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('Download')).toBeInTheDocument()
    })

    it('renders icon-only button', () => {
      render(
        <Button size="icon" aria-label="Add item">
          <Plus />
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Add item')
    })
  })

  describe('Accessibility', () => {
    it('supports keyboard navigation', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Accessible button</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
      
      await user.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(2)
    })

    it('has proper ARIA attributes when disabled', () => {
      render(<Button disabled aria-describedby="error-text">Disabled</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-disabled', 'true')
      expect(button).toHaveAttribute('aria-describedby', 'error-text')
    })

    it('has proper ARIA attributes when loading', () => {
      render(<Button loading aria-label="Saving changes">Save</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-disabled', 'true')
      expect(button).toHaveAttribute('aria-label', 'Saving changes')
    })

    it('supports focus management', () => {
      render(<Button autoFocus>Auto focused</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveFocus()
    })
  })

  describe('Form Integration', () => {
    it('submits form when type is submit', () => {
      const handleSubmit = jest.fn(e => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      )
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleSubmit).toHaveBeenCalled()
    })

    it('resets form when type is reset', () => {
      render(
        <form>
          <input defaultValue="test" />
          <Button type="reset">Reset</Button>
        </form>
      )
      
      const input = screen.getByRole('textbox')
      const button = screen.getByRole('button')
      
      expect(input).toHaveValue('test')
      fireEvent.click(button)
      expect(input).toHaveValue('')
    })

    it('does not submit form when type is button', () => {
      const handleSubmit = jest.fn()
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="button">Button</Button>
        </form>
      )
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Hover and Focus States', () => {
    it('applies hover styles on mouse enter', async () => {
      const user = userEvent.setup()
      render(<Button>Hover me</Button>)
      
      const button = screen.getByRole('button')
      await user.hover(button)
      
      expect(button).toHaveClass('hover:bg-primary/90')
    })

    it('applies focus styles on keyboard focus', () => {
      render(<Button>Focus me</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      
      expect(button).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-ring')
    })

    it('removes focus styles on blur', () => {
      render(<Button>Focus and blur</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      button.blur()
      
      expect(button).not.toHaveFocus()
    })
  })

  describe('Custom Styling', () => {
    it('accepts custom className', () => {
      render(<Button className="custom-class">Custom styled</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('merges custom styles with default classes', () => {
      render(<Button className="bg-red-500">Custom background</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red-500')
      // Should still have other default classes
      expect(button).toHaveClass('rounded-md', 'text-sm', 'font-medium')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<Button>{null}</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toBeEmptyDOMElement()
    })

    it('handles boolean children', () => {
      render(<Button>{false && 'Hidden'}</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('handles multiple click handlers', async () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()
      const user = userEvent.setup()
      
      render(
        <div onClick={handler2}>
          <Button onClick={handler1}>Multiple handlers</Button>
        </div>
      )
      
      await user.click(screen.getByRole('button'))
      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
    })

    it('prevents double clicks when loading', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Button loading onClick={handleClick}>Loading</Button>)
      
      await user.dblClick(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })
})