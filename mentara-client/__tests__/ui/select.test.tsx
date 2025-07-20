import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

describe('Select Component', () => {
  describe('Basic Functionality', () => {
    it('renders select trigger', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveTextContent('Select an option')
    })

    it('opens dropdown when trigger is clicked', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument()
    })

    it('selects option when clicked', async () => {
      const handleValueChange = jest.fn()
      const user = userEvent.setup()
      
      render(
        <Select onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      const option1 = screen.getByRole('option', { name: 'Option 1' })
      await user.click(option1)
      
      expect(handleValueChange).toHaveBeenCalledWith('option1')
    })

    it('updates trigger text when option is selected', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      await user.click(screen.getByRole('option', { name: 'Option 1' }))
      
      expect(trigger).toHaveTextContent('Option 1')
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('works as controlled component', async () => {
      const handleValueChange = jest.fn()
      const user = userEvent.setup()
      
      const ControlledSelect = () => {
        const [value, setValue] = React.useState('')
        
        return (
          <Select value={value} onValueChange={(newValue) => {
            setValue(newValue)
            handleValueChange(newValue)
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
            </SelectContent>
          </Select>
        )
      }
      
      render(<ControlledSelect />)
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      await user.click(screen.getByRole('option', { name: 'Option 1' }))
      
      expect(handleValueChange).toHaveBeenCalledWith('option1')
      expect(trigger).toHaveTextContent('Option 1')
    })

    it('works with defaultValue', () => {
      render(
        <Select defaultValue="option2">
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveTextContent('Option 2')
    })
  })

  describe('Keyboard Navigation', () => {
    it('opens with Enter key', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      trigger.focus()
      await user.keyboard('{Enter}')
      
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('navigates options with arrow keys', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      // Arrow down should focus first option
      await user.keyboard('{ArrowDown}')
      expect(screen.getByRole('option', { name: 'Option 1' })).toHaveAttribute('aria-selected', 'false')
      
      // Arrow down should move to second option
      await user.keyboard('{ArrowDown}')
      expect(screen.getByRole('option', { name: 'Option 2' })).toHaveAttribute('aria-selected', 'false')
      
      // Arrow up should move back to first option
      await user.keyboard('{ArrowUp}')
      expect(screen.getByRole('option', { name: 'Option 1' })).toHaveAttribute('aria-selected', 'false')
    })

    it('selects option with Enter key', async () => {
      const handleValueChange = jest.fn()
      const user = userEvent.setup()
      
      render(
        <Select onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')
      
      expect(handleValueChange).toHaveBeenCalledWith('option1')
    })

    it('closes with Escape key', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('States and Attributes', () => {
    it('handles disabled state', () => {
      render(
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-disabled', 'true')
      expect(trigger).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('prevents interaction when disabled', async () => {
      const user = userEvent.setup()
      render(
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('handles required attribute', () => {
      render(
        <Select required>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('role', 'combobox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    })

    it('updates aria-expanded when opened', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      
      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('supports aria-label and aria-labelledby', () => {
      render(
        <>
          <label id="select-label">Choose option</label>
          <Select>
            <SelectTrigger aria-labelledby="select-label" aria-label="Option selector">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
            </SelectContent>
          </Select>
        </>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-labelledby', 'select-label')
      expect(trigger).toHaveAttribute('aria-label', 'Option selector')
    })

    it('manages focus correctly', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      // Focus should be on the listbox when opened
      const listbox = screen.getByRole('listbox')
      expect(listbox).toHaveFocus()
    })
  })

  describe('Custom Styling', () => {
    it('accepts custom className on trigger', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger-class">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveClass('custom-trigger-class')
    })

    it('applies default styles', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveClass('flex', 'h-10', 'w-full', 'items-center')
    })
  })

  describe('Multiple Options and Groups', () => {
    it('handles many options', async () => {
      const user = userEvent.setup()
      const options = Array.from({ length: 50 }, (_, i) => `Option ${i + 1}`)
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option, index) => (
              <SelectItem key={index} value={`option${index + 1}`}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 50')).toBeInTheDocument()
    })

    it('handles empty options list', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {/* No items */}
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid open/close cycles', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      
      // Rapidly open and close
      await user.click(trigger)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      
      await user.click(trigger)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('handles missing onValueChange gracefully', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      // Should not throw error when selecting without handler
      await user.click(screen.getByRole('option', { name: 'Option 1' }))
      expect(trigger).toHaveTextContent('Option 1')
    })

    it('handles special characters in values and text', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option-with-dashes">Option with Dashes</SelectItem>
            <SelectItem value="option_with_underscores">Option with Underscores</SelectItem>
            <SelectItem value="option with spaces">Option with Spaces</SelectItem>
            <SelectItem value="option@#$%">Option with Special Chars</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      const specialOption = screen.getByRole('option', { name: 'Option with Special Chars' })
      await user.click(specialOption)
      
      expect(trigger).toHaveTextContent('Option with Special Chars')
    })
  })
})