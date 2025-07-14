import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '@/components/ui/textarea'

describe('Textarea Component', () => {
  describe('Basic Functionality', () => {
    it('renders textarea element', () => {
      render(<Textarea placeholder="Enter your message" />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveAttribute('placeholder', 'Enter your message')
    })

    it('accepts and displays value', () => {
      render(<Textarea value="test value" readOnly />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('test value')
    })

    it('handles controlled textarea changes', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Textarea onChange={handleChange} />)
      
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'hello')
      
      expect(handleChange).toHaveBeenCalledTimes(5) // One per character
    })

    it('handles uncontrolled textarea with defaultValue', async () => {
      const user = userEvent.setup()
      
      render(<Textarea defaultValue="initial text" />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('initial text')
      
      await user.clear(textarea)
      await user.type(textarea, 'new text')
      expect(textarea).toHaveValue('new text')
    })

    it('handles multiline text correctly', async () => {
      const user = userEvent.setup()
      
      render(<Textarea />)
      
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3')
      
      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3')
    })
  })

  describe('Sizing and Attributes', () => {
    it('handles rows attribute', () => {
      render(<Textarea rows={5} />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '5')
    })

    it('handles cols attribute', () => {
      render(<Textarea cols={40} />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('cols', '40')
    })

    it('handles resize styles', () => {
      render(<Textarea className="resize-none" />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('resize-none')
    })

    it('applies default min-height', () => {
      render(<Textarea />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('min-h-[80px]')
    })
  })

  describe('States and Validation', () => {
    it('handles disabled state', () => {
      render(<Textarea disabled />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeDisabled()
      expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('handles readonly state', () => {
      render(<Textarea readOnly value="readonly text" />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('readonly')
      expect(textarea).toHaveValue('readonly text')
    })

    it('handles required attribute', () => {
      render(<Textarea required />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeRequired()
    })

    it('handles maxLength attribute', async () => {
      const user = userEvent.setup()
      render(<Textarea maxLength={10} />)
      
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'This is a very long text that should be truncated')
      
      expect(textarea).toHaveValue('This is a ') // Should be truncated at 10 chars
    })

    it('handles minLength attribute', () => {
      render(<Textarea minLength={5} />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('minlength', '5')
    })
  })

  describe('Focus Management', () => {
    it('focuses on click', async () => {
      const user = userEvent.setup()
      render(<Textarea />)
      
      const textarea = screen.getByRole('textbox')
      await user.click(textarea)
      
      expect(textarea).toHaveFocus()
    })

    it('handles autofocus', () => {
      render(<Textarea autoFocus />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveFocus()
    })

    it('handles focus events', async () => {
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()
      const user = userEvent.setup()
      
      render(
        <>
          <Textarea onFocus={handleFocus} onBlur={handleBlur} />
          <button>Other element</button>
        </>
      )
      
      const textarea = screen.getByRole('textbox')
      const button = screen.getByRole('button')
      
      await user.click(textarea)
      expect(handleFocus).toHaveBeenCalled()
      
      await user.click(button)
      expect(handleBlur).toHaveBeenCalled()
    })

    it('applies focus styles', () => {
      render(<Textarea />)
      
      const textarea = screen.getByRole('textbox')
      textarea.focus()
      
      expect(textarea).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-ring')
    })
  })

  describe('Validation States', () => {
    it('shows invalid state with aria-invalid', () => {
      render(<Textarea aria-invalid="true" />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-invalid', 'true')
      expect(textarea).toBeInvalid()
    })

    it('shows valid state', () => {
      render(<Textarea aria-invalid="false" />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-invalid', 'false')
    })

    it('handles aria-describedby for error messages', () => {
      render(
        <>
          <Textarea aria-describedby="error-message" aria-invalid="true" />
          <div id="error-message">This field is required</div>
        </>
      )
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-describedby', 'error-message')
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Textarea aria-label="Feedback message" />)
      
      const textarea = screen.getByLabelText('Feedback message')
      expect(textarea).toBeInTheDocument()
    })

    it('supports aria-labelledby', () => {
      render(
        <>
          <label id="textarea-label">Message</label>
          <Textarea aria-labelledby="textarea-label" />
        </>
      )
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-labelledby', 'textarea-label')
    })

    it('supports proper labeling with htmlFor', () => {
      render(
        <>
          <label htmlFor="message">Message</label>
          <Textarea id="message" />
        </>
      )
      
      const textarea = screen.getByLabelText('Message')
      expect(textarea).toHaveAttribute('id', 'message')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <>
          <Textarea placeholder="First textarea" />
          <Textarea placeholder="Second textarea" />
        </>
      )
      
      const firstTextarea = screen.getByPlaceholderText('First textarea')
      const secondTextarea = screen.getByPlaceholderText('Second textarea')
      
      firstTextarea.focus()
      expect(firstTextarea).toHaveFocus()
      
      await user.tab()
      expect(secondTextarea).toHaveFocus()
    })
  })

  describe('Styling and Classes', () => {
    it('applies default styles', () => {
      render(<Textarea />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass(
        'flex',
        'min-h-[80px]',
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
      render(<Textarea className="custom-textarea-class" />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('custom-textarea-class')
    })

    it('merges custom classes with defaults', () => {
      render(<Textarea className="bg-red-100 border-red-500" />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('bg-red-100', 'border-red-500')
      expect(textarea).toHaveClass('rounded-md', 'px-3') // Should still have defaults
    })
  })

  describe('Event Handling', () => {
    it('handles onKeyDown events', async () => {
      const handleKeyDown = jest.fn()
      const user = userEvent.setup()
      
      render(<Textarea onKeyDown={handleKeyDown} />)
      
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'a')
      
      expect(handleKeyDown).toHaveBeenCalled()
    })

    it('handles onKeyUp events', async () => {
      const handleKeyUp = jest.fn()
      const user = userEvent.setup()
      
      render(<Textarea onKeyUp={handleKeyUp} />)
      
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'a')
      
      expect(handleKeyUp).toHaveBeenCalled()
    })

    it('handles Enter key in textarea', async () => {
      const handleKeyDown = jest.fn()
      const user = userEvent.setup()
      
      render(<Textarea onKeyDown={handleKeyDown} />)
      
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'test{Enter}new line')
      
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'Enter' })
      )
      expect(textarea).toHaveValue('test\nnew line')
    })

    it('handles paste events', async () => {
      const handlePaste = jest.fn()
      const user = userEvent.setup()
      
      render(<Textarea onPaste={handlePaste} />)
      
      const textarea = screen.getByRole('textbox')
      await user.click(textarea)
      await user.paste('pasted text')
      
      expect(handlePaste).toHaveBeenCalled()
    })
  })

  describe('Form Integration', () => {
    it('works with form submission', () => {
      const handleSubmit = jest.fn(e => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Textarea name="message" defaultValue="test message" />
          <button type="submit">Submit</button>
        </form>
      )
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('name', 'message')
      expect(textarea).toHaveValue('test message')
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleSubmit).toHaveBeenCalled()
    })

    it('reports validity correctly', async () => {
      const user = userEvent.setup()
      
      render(
        <form>
          <Textarea required />
        </form>
      )
      
      const textarea = screen.getByRole('textbox')
      expect(textarea.validity.valid).toBe(false) // Empty required field
      
      await user.type(textarea, 'valid input')
      expect(textarea.validity.valid).toBe(true)
    })

    it('handles form reset', () => {
      render(
        <form>
          <Textarea defaultValue="initial text" />
          <button type="reset">Reset</button>
        </form>
      )
      
      const textarea = screen.getByRole('textbox')
      const resetButton = screen.getByRole('button')
      
      expect(textarea).toHaveValue('initial text')
      fireEvent.click(resetButton)
      expect(textarea).toHaveValue('initial text') // Should reset to default
    })
  })

  describe('Character Count and Limits', () => {
    it('respects maxLength for character counting', async () => {
      const user = userEvent.setup()
      render(<Textarea maxLength={20} />)
      
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'This is a very long message that exceeds the limit')
      
      expect(textarea.value.length).toBeLessThanOrEqual(20)
    })

    it('handles long text content', async () => {
      const user = userEvent.setup()
      const longText = 'A'.repeat(1000)
      
      render(<Textarea />)
      
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, longText)
      
      expect(textarea).toHaveValue(longText)
    })
  })

  describe('Edge Cases', () => {
    it('handles ref forwarding', () => {
      const ref = React.createRef<HTMLTextAreaElement>()
      render(<Textarea ref={ref} />)
      
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    })

    it('handles undefined onChange gracefully', async () => {
      const user = userEvent.setup()
      
      render(<Textarea />)
      
      const textarea = screen.getByRole('textbox')
      // Should not throw error
      await user.type(textarea, 'test')
      
      expect(textarea).toHaveValue('test')
    })

    it('handles special characters in input', async () => {
      const user = userEvent.setup()
      
      render(<Textarea />)
      
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, '!@#$%^&*()\nLine 2\tTab character')
      
      expect(textarea).toHaveValue('!@#$%^&*()\nLine 2\tTab character')
    })

    it('handles rapid input changes', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Textarea onChange={handleChange} />)
      
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'rapid', { delay: 1 })
      
      expect(handleChange).toHaveBeenCalledTimes(5)
    })

    it('handles empty content gracefully', () => {
      render(<Textarea value="" />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('')
    })
  })
})