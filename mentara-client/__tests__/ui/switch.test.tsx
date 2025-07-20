import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Switch } from '@/components/ui/switch'

describe('Switch Component', () => {
  describe('Basic Functionality', () => {
    it('renders switch element', () => {
      render(<Switch />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toBeInTheDocument()
    })

    it('handles checked state', () => {
      render(<Switch checked />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toBeChecked()
    })

    it('handles unchecked state', () => {
      render(<Switch checked={false} />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).not.toBeChecked()
    })

    it('toggles on click', async () => {
      const handleCheckedChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Switch onCheckedChange={handleCheckedChange} />)
      
      const switchElement = screen.getByRole('switch')
      await user.click(switchElement)
      
      expect(handleCheckedChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('works as controlled component', async () => {
      const ControlledSwitch = () => {
        const [checked, setChecked] = React.useState(false)
        
        return (
          <Switch 
            checked={checked} 
            onCheckedChange={setChecked}
            data-testid="controlled-switch"
          />
        )
      }
      
      const user = userEvent.setup()
      render(<ControlledSwitch />)
      
      const switchElement = screen.getByTestId('controlled-switch')
      expect(switchElement).not.toBeChecked()
      
      await user.click(switchElement)
      expect(switchElement).toBeChecked()
      
      await user.click(switchElement)
      expect(switchElement).not.toBeChecked()
    })

    it('works with defaultChecked', () => {
      render(<Switch defaultChecked />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toBeChecked()
    })
  })

  describe('States and Attributes', () => {
    it('handles disabled state', () => {
      render(<Switch disabled />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toBeDisabled()
    })

    it('prevents interaction when disabled', async () => {
      const handleCheckedChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Switch disabled onCheckedChange={handleCheckedChange} />)
      
      const switchElement = screen.getByRole('switch')
      await user.click(switchElement)
      
      expect(handleCheckedChange).not.toHaveBeenCalled()
    })

    it('handles required attribute', () => {
      render(<Switch required />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toBeRequired()
    })

    it('handles name attribute for forms', () => {
      render(<Switch name="notifications" />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('name', 'notifications')
    })

    it('handles value attribute', () => {
      render(<Switch value="enabled" />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('value', 'enabled')
    })
  })

  describe('Keyboard Navigation', () => {
    it('focuses with Tab key', async () => {
      const user = userEvent.setup()
      render(<Switch />)
      
      const switchElement = screen.getByRole('switch')
      await user.tab()
      
      expect(switchElement).toHaveFocus()
    })

    it('toggles with Space key', async () => {
      const handleCheckedChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Switch onCheckedChange={handleCheckedChange} />)
      
      const switchElement = screen.getByRole('switch')
      switchElement.focus()
      await user.keyboard(' ')
      
      expect(handleCheckedChange).toHaveBeenCalledWith(true)
    })

    it('toggles with Enter key', async () => {
      const handleCheckedChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Switch onCheckedChange={handleCheckedChange} />)
      
      const switchElement = screen.getByRole('switch')
      switchElement.focus()
      await user.keyboard('{Enter}')
      
      expect(handleCheckedChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Switch />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('role', 'switch')
      expect(switchElement).toHaveAttribute('type', 'button')
    })

    it('updates aria-checked correctly', () => {
      const { rerender } = render(<Switch checked={false} />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')
      
      rerender(<Switch checked={true} />)
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })

    it('supports aria-label', () => {
      render(<Switch aria-label="Enable notifications" />)
      
      const switchElement = screen.getByLabelText('Enable notifications')
      expect(switchElement).toBeInTheDocument()
    })

    it('supports aria-labelledby', () => {
      render(
        <>
          <label id="switch-label">Dark mode</label>
          <Switch aria-labelledby="switch-label" />
        </>
      )
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-labelledby', 'switch-label')
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <Switch aria-describedby="switch-description" />
          <div id="switch-description">Toggle to enable dark mode</div>
        </>
      )
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-describedby', 'switch-description')
    })

    it('indicates disabled state to screen readers', () => {
      render(<Switch disabled />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Focus Management', () => {
    it('handles focus events', async () => {
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()
      const user = userEvent.setup()
      
      render(
        <>
          <Switch onFocus={handleFocus} onBlur={handleBlur} />
          <button>Other element</button>
        </>
      )
      
      const switchElement = screen.getByRole('switch')
      const button = screen.getByRole('button')
      
      await user.click(switchElement)
      expect(handleFocus).toHaveBeenCalled()
      
      await user.click(button)
      expect(handleBlur).toHaveBeenCalled()
    })

    it('supports autofocus', () => {
      render(<Switch autoFocus />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveFocus()
    })
  })

  describe('Custom Styling', () => {
    it('accepts custom className', () => {
      render(<Switch className="custom-switch-class" />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveClass('custom-switch-class')
    })

    it('supports size variations through classes', () => {
      render(<Switch className="w-12 h-6" />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveClass('w-12', 'h-6')
    })
  })

  describe('Form Integration', () => {
    it('submits with form', () => {
      const handleSubmit = jest.fn(e => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Switch name="notifications" value="enabled" defaultChecked />
          <button type="submit">Submit</button>
        </form>
      )
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('name', 'notifications')
      expect(switchElement).toHaveAttribute('value', 'enabled')
      expect(switchElement).toBeChecked()
      
      const submitButton = screen.getByRole('button', { name: 'Submit' })
      submitButton.click()
      expect(handleSubmit).toHaveBeenCalled()
    })

    it('reports validity correctly', () => {
      render(
        <form>
          <Switch required />
        </form>
      )
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement.validity.valid).toBe(false) // Required but unchecked
    })

    it('handles form reset', () => {
      render(
        <form>
          <Switch defaultChecked />
          <button type="reset">Reset</button>
        </form>
      )
      
      const switchElement = screen.getByRole('switch')
      const resetButton = screen.getByRole('button')
      
      expect(switchElement).toBeChecked()
      resetButton.click()
      expect(switchElement).toBeChecked() // Should reset to default
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid clicks', async () => {
      const handleCheckedChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Switch onCheckedChange={handleCheckedChange} />)
      
      const switchElement = screen.getByRole('switch')
      
      // Rapid clicks
      await user.click(switchElement)
      await user.click(switchElement)
      await user.click(switchElement)
      
      expect(handleCheckedChange).toHaveBeenCalledTimes(3)
    })

    it('handles missing onCheckedChange gracefully', async () => {
      const user = userEvent.setup()
      
      render(<Switch />)
      
      const switchElement = screen.getByRole('switch')
      // Should not throw error
      await user.click(switchElement)
      
      expect(switchElement).toBeInTheDocument()
    })

    it('handles ref forwarding', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Switch ref={ref} />)
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  describe('Visual States', () => {
    it('shows checked state visually', () => {
      render(<Switch checked />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('data-state', 'checked')
    })

    it('shows unchecked state visually', () => {
      render(<Switch checked={false} />)
      
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('data-state', 'unchecked')
    })
  })

  describe('Usage Patterns', () => {
    it('works as a toggle for settings', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <label htmlFor="dark-mode">Dark Mode</label>
          <Switch id="dark-mode" />
        </div>
      )
      
      const switchElement = screen.getByLabelText('Dark Mode')
      expect(switchElement).not.toBeChecked()
      
      await user.click(switchElement)
      expect(switchElement).toBeChecked()
    })

    it('works for feature flags', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <Switch aria-label="Enable experimental features" />
        </div>
      )
      
      const switchElement = screen.getByLabelText('Enable experimental features')
      await user.click(switchElement)
      
      expect(switchElement).toBeChecked()
    })
  })
})