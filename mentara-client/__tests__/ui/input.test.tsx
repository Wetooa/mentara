import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  describe('Basic Functionality', () => {
    it('renders input element', () => {
      render(<Input placeholder="Enter text" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('placeholder', 'Enter text')
    })

    it('accepts and displays value', () => {
      render(<Input value="test value" readOnly />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('test value')
    })

    it('handles controlled input changes', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Input onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'hello')
      
      expect(handleChange).toHaveBeenCalledTimes(5) // One per character
    })

    it('handles uncontrolled input with defaultValue', async () => {
      const user = userEvent.setup()
      
      render(<Input defaultValue="initial" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('initial')
      
      await user.clear(input)
      await user.type(input, 'new value')
      expect(input).toHaveValue('new value')
    })
  })

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<Input />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('renders password input', () => {
      render(<Input type="password" />)
      
      const input = screen.getByLabelText(/password/i) || document.querySelector('input[type="password"]')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('renders email input', () => {
      render(<Input type="email" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('renders number input', () => {
      render(<Input type="number" />)
      
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('renders search input', () => {
      render(<Input type="search" />)
      
      const input = screen.getByRole('searchbox')
      expect(input).toHaveAttribute('type', 'search')
    })

    it('renders tel input', () => {
      render(<Input type="tel" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('renders url input', () => {
      render(<Input type="url" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'url')
    })
  })

  describe('States and Attributes', () => {
    it('handles disabled state', () => {
      render(<Input disabled />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('handles readonly state', () => {
      render(<Input readOnly value="readonly value" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('readonly')
      expect(input).toHaveValue('readonly value')
    })

    it('handles required attribute', () => {
      render(<Input required />)
      
      const input = screen.getByRole('textbox', { required: true })
      expect(input).toBeRequired()
    })

    it('handles maxLength attribute', async () => {
      const user = userEvent.setup()
      render(<Input maxLength={5} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, '1234567890')
      
      expect(input).toHaveValue('12345') // Should be truncated
    })

    it('handles minLength attribute', () => {
      render(<Input minLength={3} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('minlength', '3')
    })

    it('handles pattern attribute', () => {
      render(<Input pattern="[0-9]{3}" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('pattern', '[0-9]{3}')
    })
  })

  describe('Focus Management', () => {
    it('focuses on click', async () => {
      const user = userEvent.setup()
      render(<Input />)
      
      const input = screen.getByRole('textbox')
      await user.click(input)
      
      expect(input).toHaveFocus()
    })

    it('handles autofocus', () => {
      render(<Input autoFocus />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveFocus()
    })

    it('handles focus events', async () => {
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()
      const user = userEvent.setup()
      
      render(
        <>
          <Input onFocus={handleFocus} onBlur={handleBlur} />
          <button>Other element</button>
        </>
      )
      
      const input = screen.getByRole('textbox')
      const button = screen.getByRole('button')
      
      await user.click(input)
      expect(handleFocus).toHaveBeenCalled()
      
      await user.click(button)
      expect(handleBlur).toHaveBeenCalled()
    })

    it('applies focus styles', () => {
      render(<Input />)
      
      const input = screen.getByRole('textbox')
      input.focus()
      
      expect(input).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-ring')
    })
  })

  describe('Validation States', () => {
    it('shows invalid state with aria-invalid', () => {
      render(<Input aria-invalid="true" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toBeInvalid()
    })

    it('shows valid state', () => {
      render(<Input aria-invalid="false" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'false')
    })

    it('handles aria-describedby for error messages', () => {
      render(
        <>
          <Input aria-describedby="error-message" aria-invalid="true" />
          <div id="error-message">This field is required</div>
        </>
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'error-message')
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Input aria-label="Search users" />)
      
      const input = screen.getByLabelText('Search users')
      expect(input).toBeInTheDocument()
    })

    it('supports aria-labelledby', () => {
      render(
        <>
          <label id="input-label">Username</label>
          <Input aria-labelledby="input-label" />
        </>
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-labelledby', 'input-label')
    })

    it('supports proper labeling with htmlFor', () => {
      render(
        <>
          <label htmlFor="username">Username</label>
          <Input id="username" />
        </>
      )
      
      const input = screen.getByLabelText('Username')
      expect(input).toHaveAttribute('id', 'username')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <>
          <Input placeholder="First input" />
          <Input placeholder="Second input" />
        </>
      )
      
      const firstInput = screen.getByPlaceholderText('First input')
      const secondInput = screen.getByPlaceholderText('Second input')
      
      firstInput.focus()
      expect(firstInput).toHaveFocus()
      
      await user.tab()
      expect(secondInput).toHaveFocus()
    })
  })

  describe('Styling and Classes', () => {
    it('applies default styles', () => {
      render(<Input />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass(
        'flex',
        'h-10',
        'w-full',
        'rounded-md',
        'border',
        'border-input',
        'bg-background',
        'px-3',
        'py-2',
        'text-sm'
      )
    })

    it('accepts custom className', () => {
      render(<Input className="custom-input-class" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-input-class')
    })

    it('merges custom classes with defaults', () => {
      render(<Input className="bg-red-100 border-red-500" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('bg-red-100', 'border-red-500')
      expect(input).toHaveClass('rounded-md', 'px-3') // Should still have defaults
    })
  })

  describe('Event Handling', () => {
    it('handles onKeyDown events', async () => {
      const handleKeyDown = jest.fn()
      const user = userEvent.setup()
      
      render(<Input onKeyDown={handleKeyDown} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'a')
      
      expect(handleKeyDown).toHaveBeenCalled()
    })

    it('handles onKeyUp events', async () => {
      const handleKeyUp = jest.fn()
      const user = userEvent.setup()
      
      render(<Input onKeyUp={handleKeyUp} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'a')
      
      expect(handleKeyUp).toHaveBeenCalled()
    })

    it('handles Enter key submission', async () => {
      const handleKeyDown = jest.fn(e => {
        if (e.key === 'Enter') {
          e.preventDefault()
        }
      })
      const user = userEvent.setup()
      
      render(<Input onKeyDown={handleKeyDown} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test{Enter}')
      
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'Enter' })
      )
    })

    it('handles paste events', async () => {
      const handlePaste = jest.fn()
      const user = userEvent.setup()
      
      render(<Input onPaste={handlePaste} />)
      
      const input = screen.getByRole('textbox')
      await user.click(input)
      await user.paste('pasted text')
      
      expect(handlePaste).toHaveBeenCalled()
    })
  })

  describe('Form Integration', () => {
    it('works with form submission', () => {
      const handleSubmit = jest.fn(e => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Input name="username" defaultValue="testuser" />
          <button type="submit">Submit</button>
        </form>
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('name', 'username')
      expect(input).toHaveValue('testuser')
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleSubmit).toHaveBeenCalled()
    })

    it('reports validity correctly', async () => {
      const user = userEvent.setup()
      
      render(
        <form>
          <Input required />
        </form>
      )
      
      const input = screen.getByRole('textbox')
      expect(input.validity.valid).toBe(false) // Empty required field
      
      await user.type(input, 'valid input')
      expect(input.validity.valid).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles ref forwarding', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} />)
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it('handles undefined onChange gracefully', async () => {
      const user = userEvent.setup()
      
      render(<Input />)
      
      const input = screen.getByRole('textbox')
      // Should not throw error
      await user.type(input, 'test')
      
      expect(input).toHaveValue('test')
    })

    it('handles special characters in input', async () => {
      const user = userEvent.setup()
      
      render(<Input />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, '!@#$%^&*()')
      
      expect(input).toHaveValue('!@#$%^&*()')
    })

    it('handles rapid input changes', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Input onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'rapid', { delay: 1 })
      
      expect(handleChange).toHaveBeenCalledTimes(5)
    })
  })
})