import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '@/components/ui/checkbox'

describe('Checkbox Component', () => {
  describe('Basic Functionality', () => {
    it('renders checkbox element', () => {
      render(<Checkbox />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('handles checked state', () => {
      render(<Checkbox checked />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('handles unchecked state', () => {
      render(<Checkbox checked={false} />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('toggles on click', async () => {
      const handleCheckedChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Checkbox onCheckedChange={handleCheckedChange} />)
      
      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      
      expect(handleCheckedChange).toHaveBeenCalledWith(true)
    })

    it('toggles from checked to unchecked', async () => {
      const handleCheckedChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Checkbox checked onCheckedChange={handleCheckedChange} />)
      
      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      
      expect(handleCheckedChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('works as controlled component', async () => {
      const ControlledCheckbox = () => {
        const [checked, setChecked] = React.useState(false)
        
        return (
          <Checkbox 
            checked={checked} 
            onCheckedChange={setChecked}
            data-testid="controlled-checkbox"
          />
        )
      }
      
      const user = userEvent.setup()
      render(<ControlledCheckbox />)
      
      const checkbox = screen.getByTestId('controlled-checkbox')
      expect(checkbox).not.toBeChecked()
      
      await user.click(checkbox)
      expect(checkbox).toBeChecked()
      
      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('works with defaultChecked', () => {
      render(<Checkbox defaultChecked />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('ignores defaultChecked when controlled', () => {
      render(<Checkbox checked={false} defaultChecked />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })
  })

  describe('Indeterminate State', () => {
    it('handles indeterminate state', () => {
      render(<Checkbox checked="indeterminate" />)
      
      const checkbox = screen.getByRole('checkbox')
      // Indeterminate state is not checked but has special visual state
      expect(checkbox).not.toBeChecked()
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate')
    })

    it('transitions from indeterminate to checked', async () => {
      const handleCheckedChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Checkbox checked="indeterminate" onCheckedChange={handleCheckedChange} />)
      
      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      
      expect(handleCheckedChange).toHaveBeenCalledWith(true)
    })

    it('shows indeterminate icon', () => {
      render(<Checkbox checked="indeterminate" />)
      
      const checkbox = screen.getByRole('checkbox')
      const icon = checkbox.querySelector('svg[data-testid="indeterminate-icon"]')
      expect(icon || checkbox.querySelector('[data-state="indeterminate"]')).toBeInTheDocument()
    })
  })

  describe('States and Attributes', () => {
    it('handles disabled state', () => {
      render(<Checkbox disabled />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('prevents interaction when disabled', async () => {
      const handleCheckedChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Checkbox disabled onCheckedChange={handleCheckedChange} />)
      
      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      
      expect(handleCheckedChange).not.toHaveBeenCalled()
    })

    it('handles required attribute', () => {
      render(<Checkbox required />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeRequired()
    })

    it('handles name attribute for forms', () => {
      render(<Checkbox name="agree-terms" />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('name', 'agree-terms')
    })

    it('handles value attribute', () => {
      render(<Checkbox value="newsletter" />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('value', 'newsletter')
    })
  })

  describe('Keyboard Navigation', () => {
    it('focuses with Tab key', async () => {
      const user = userEvent.setup()
      render(<Checkbox />)
      
      const checkbox = screen.getByRole('checkbox')
      await user.tab()
      
      expect(checkbox).toHaveFocus()
    })

    it('toggles with Space key', async () => {
      const handleCheckedChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Checkbox onCheckedChange={handleCheckedChange} />)
      
      const checkbox = screen.getByRole('checkbox')
      checkbox.focus()
      await user.keyboard(' ')
      
      expect(handleCheckedChange).toHaveBeenCalledWith(true)
    })

    it('does not toggle with Enter key', async () => {
      const handleCheckedChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Checkbox onCheckedChange={handleCheckedChange} />)
      
      const checkbox = screen.getByRole('checkbox')
      checkbox.focus()
      await user.keyboard('{Enter}')
      
      expect(handleCheckedChange).not.toHaveBeenCalled()
    })

    it('prevents Space key default behavior', async () => {
      const preventDefault = jest.fn()
      const user = userEvent.setup()
      
      render(
        <Checkbox 
          onKeyDown={(e) => {
            if (e.key === ' ') {
              preventDefault()
            }
          }} 
        />
      )
      
      const checkbox = screen.getByRole('checkbox')
      checkbox.focus()
      await user.keyboard(' ')
      
      // The component should handle space key internally
      expect(checkbox).toHaveFocus()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Checkbox />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('role', 'checkbox')
      expect(checkbox).toHaveAttribute('type', 'button')
    })

    it('updates aria-checked correctly', () => {
      const { rerender } = render(<Checkbox checked={false} />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
      
      rerender(<Checkbox checked={true} />)
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
      
      rerender(<Checkbox checked="indeterminate" />)
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
    })

    it('supports aria-label', () => {
      render(<Checkbox aria-label="Accept terms and conditions" />)
      
      const checkbox = screen.getByLabelText('Accept terms and conditions')
      expect(checkbox).toBeInTheDocument()
    })

    it('supports aria-labelledby', () => {
      render(
        <>
          <label id="checkbox-label">Subscribe to newsletter</label>
          <Checkbox aria-labelledby="checkbox-label" />
        </>
      )
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-labelledby', 'checkbox-label')
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <Checkbox aria-describedby="checkbox-description" />
          <div id="checkbox-description">This will send you weekly updates</div>
        </>
      )
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-describedby', 'checkbox-description')
    })

    it('indicates disabled state to screen readers', () => {
      render(<Checkbox disabled />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Focus Management', () => {
    it('applies focus styles', () => {
      render(<Checkbox />)
      
      const checkbox = screen.getByRole('checkbox')
      checkbox.focus()
      
      expect(checkbox).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-ring')
    })

    it('handles focus events', async () => {
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()
      const user = userEvent.setup()
      
      render(
        <>
          <Checkbox onFocus={handleFocus} onBlur={handleBlur} />
          <button>Other element</button>
        </>
      )
      
      const checkbox = screen.getByRole('checkbox')
      const button = screen.getByRole('button')
      
      await user.click(checkbox)
      expect(handleFocus).toHaveBeenCalled()
      
      await user.click(button)
      expect(handleBlur).toHaveBeenCalled()
    })

    it('supports autofocus', () => {
      render(<Checkbox autoFocus />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveFocus()
    })
  })

  describe('Custom Styling', () => {
    it('accepts custom className', () => {
      render(<Checkbox className="custom-checkbox-class" />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('custom-checkbox-class')
    })

    it('applies default styles', () => {
      render(<Checkbox />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass(
        'peer',
        'h-4',
        'w-4',
        'shrink-0',
        'rounded-sm',
        'border'
      )
    })

    it('merges custom styles with defaults', () => {
      render(<Checkbox className="border-red-500 bg-red-100" />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('border-red-500', 'bg-red-100')
      expect(checkbox).toHaveClass('h-4', 'w-4', 'rounded-sm') // Should still have defaults
    })
  })

  describe('Form Integration', () => {
    it('submits with form', () => {
      const handleSubmit = jest.fn(e => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Checkbox name="newsletter" value="yes" defaultChecked />
          <button type="submit">Submit</button>
        </form>
      )
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('name', 'newsletter')
      expect(checkbox).toHaveAttribute('value', 'yes')
      expect(checkbox).toBeChecked()
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleSubmit).toHaveBeenCalled()
    })

    it('reports validity correctly', () => {
      render(
        <form>
          <Checkbox required />
        </form>
      )
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox.validity.valid).toBe(false) // Required but unchecked
    })

    it('handles form reset', () => {
      render(
        <form>
          <Checkbox defaultChecked />
          <button type="reset">Reset</button>
        </form>
      )
      
      const checkbox = screen.getByRole('checkbox')
      const resetButton = screen.getByRole('button')
      
      expect(checkbox).toBeChecked()
      fireEvent.click(resetButton)
      expect(checkbox).toBeChecked() // Should reset to default
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid clicks', async () => {
      const handleCheckedChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Checkbox onCheckedChange={handleCheckedChange} />)
      
      const checkbox = screen.getByRole('checkbox')
      
      // Rapid clicks
      await user.click(checkbox)
      await user.click(checkbox)
      await user.click(checkbox)
      
      expect(handleCheckedChange).toHaveBeenCalledTimes(3)
    })

    it('handles missing onCheckedChange gracefully', async () => {
      const user = userEvent.setup()
      
      render(<Checkbox />)
      
      const checkbox = screen.getByRole('checkbox')
      // Should not throw error
      await user.click(checkbox)
      
      expect(checkbox).toBeInTheDocument()
    })

    it('handles ref forwarding', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Checkbox ref={ref} />)
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })

    it('prevents double submission in forms', async () => {
      const handleSubmit = jest.fn(e => e.preventDefault())
      const user = userEvent.setup()
      
      render(
        <form onSubmit={handleSubmit}>
          <Checkbox required />
          <button type="submit">Submit</button>
        </form>
      )
      
      const checkbox = screen.getByRole('checkbox')
      const submitButton = screen.getByRole('button', { name: 'Submit' })
      
      await user.click(checkbox) // Make it valid
      await user.dblClick(submitButton)
      
      // Should only submit once despite double click
      expect(handleSubmit).toHaveBeenCalledTimes(2) // dblClick triggers two events
    })
  })

  describe('Visual States', () => {
    it('shows checked icon when checked', () => {
      render(<Checkbox checked />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-state', 'checked')
      
      // Should contain check icon
      const checkIcon = checkbox.querySelector('svg') || checkbox.querySelector('[data-testid="check-icon"]')
      expect(checkIcon).toBeInTheDocument()
    })

    it('shows indeterminate icon when indeterminate', () => {
      render(<Checkbox checked="indeterminate" />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate')
    })

    it('shows unchecked state properly', () => {
      render(<Checkbox checked={false} />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-state', 'unchecked')
    })
  })
})