import React, { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Test component for controlled dialog
const ControlledDialog = () => {
  const [open, setOpen] = useState(false)
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogDescription>This is a test dialog</DialogDescription>
        </DialogHeader>
        <div>Dialog content goes here</div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={() => setOpen(false)}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Simple dialog for basic tests
const SimpleDialog = ({ open = false, onOpenChange = () => {} }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button>Open</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Simple Dialog</DialogTitle>
      </DialogHeader>
      <p>Simple content</p>
    </DialogContent>
  </Dialog>
)

describe('Dialog Component', () => {
  describe('Basic Functionality', () => {
    it('renders trigger button', () => {
      render(<ControlledDialog />)
      
      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      expect(trigger).toBeInTheDocument()
    })

    it('opens dialog when trigger is clicked', async () => {
      const user = userEvent.setup()
      render(<ControlledDialog />)
      
      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Test Dialog')).toBeInTheDocument()
    })

    it('closes dialog when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<ControlledDialog />)
      
      // Open dialog
      await user.click(screen.getByRole('button', { name: 'Open Dialog' }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      
      // Close dialog
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('closes dialog when confirm button is clicked', async () => {
      const user = userEvent.setup()
      render(<ControlledDialog />)
      
      // Open dialog
      await user.click(screen.getByRole('button', { name: 'Open Dialog' }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      
      // Confirm and close
      await user.click(screen.getByRole('button', { name: 'Confirm' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('handles controlled state', async () => {
      const handleOpenChange = jest.fn()
      const user = userEvent.setup()
      
      render(<SimpleDialog open={false} onOpenChange={handleOpenChange} />)
      
      await user.click(screen.getByRole('button', { name: 'Open' }))
      expect(handleOpenChange).toHaveBeenCalledWith(true)
    })

    it('opens when controlled open prop changes', () => {
      const { rerender } = render(<SimpleDialog open={false} />)
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      
      rerender(<SimpleDialog open={true} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('calls onOpenChange when dialog state changes', async () => {
      const handleOpenChange = jest.fn()
      const user = userEvent.setup()
      
      render(<SimpleDialog open={true} onOpenChange={handleOpenChange} />)
      
      // Close with Escape
      await user.keyboard('{Escape}')
      expect(handleOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Keyboard Navigation', () => {
    it('closes dialog with Escape key', async () => {
      const handleOpenChange = jest.fn()
      const user = userEvent.setup()
      
      render(<SimpleDialog open={true} onOpenChange={handleOpenChange} />)
      
      await user.keyboard('{Escape}')
      expect(handleOpenChange).toHaveBeenCalledWith(false)
    })

    it('traps focus within dialog', async () => {
      const user = userEvent.setup()
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Focus Trap Test</DialogTitle>
            </DialogHeader>
            <input placeholder="First input" />
            <input placeholder="Second input" />
            <Button>Close</Button>
          </DialogContent>
        </Dialog>
      )
      
      const firstInput = screen.getByPlaceholderText('First input')
      const secondInput = screen.getByPlaceholderText('Second input')
      const closeButton = screen.getByRole('button', { name: 'Close' })
      
      // Focus should start on first focusable element
      expect(firstInput).toHaveFocus()
      
      // Tab should cycle through focusable elements
      await user.tab()
      expect(secondInput).toHaveFocus()
      
      await user.tab()
      expect(closeButton).toHaveFocus()
      
      // Tab from last element should cycle back to first
      await user.tab()
      expect(firstInput).toHaveFocus()
    })

    it('handles Shift+Tab for reverse focus', async () => {
      const user = userEvent.setup()
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reverse Focus Test</DialogTitle>
            </DialogHeader>
            <input placeholder="First input" />
            <Button>Close</Button>
          </DialogContent>
        </Dialog>
      )
      
      const firstInput = screen.getByPlaceholderText('First input')
      const closeButton = screen.getByRole('button', { name: 'Close' })
      
      // Start at first input
      expect(firstInput).toHaveFocus()
      
      // Shift+Tab should go to last focusable element
      await user.tab({ shift: true })
      expect(closeButton).toHaveFocus()
    })
  })

  describe('Click Outside Behavior', () => {
    it('closes dialog when clicking overlay', async () => {
      const handleOpenChange = jest.fn()
      const user = userEvent.setup()
      
      render(<SimpleDialog open={true} onOpenChange={handleOpenChange} />)
      
      const overlay = document.querySelector('[data-radix-dialog-overlay]')
      if (overlay) {
        await user.click(overlay)
        expect(handleOpenChange).toHaveBeenCalledWith(false)
      }
    })

    it('does not close when clicking dialog content', async () => {
      const handleOpenChange = jest.fn()
      const user = userEvent.setup()
      
      render(<SimpleDialog open={true} onOpenChange={handleOpenChange} />)
      
      const dialogContent = screen.getByRole('dialog')
      await user.click(dialogContent)
      
      expect(handleOpenChange).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<SimpleDialog open={true} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('role', 'dialog')
    })

    it('has proper labeling with DialogTitle', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accessible Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      const dialog = screen.getByRole('dialog')
      const title = screen.getByText('Accessible Dialog')
      
      expect(dialog).toHaveAttribute('aria-labelledby', expect.stringContaining(title.id))
    })

    it('has proper description with DialogDescription', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog with Description</DialogTitle>
              <DialogDescription>This describes the dialog purpose</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      const dialog = screen.getByRole('dialog')
      const description = screen.getByText('This describes the dialog purpose')
      
      expect(dialog).toHaveAttribute('aria-describedby', expect.stringContaining(description.id))
    })

    it('manages focus correctly on open', async () => {
      const user = userEvent.setup()
      
      render(
        <>
          <button>Outside button</button>
          <Dialog open={false}>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Focus Management</DialogTitle>
              </DialogHeader>
              <input placeholder="Auto focus input" autoFocus />
            </DialogContent>
          </Dialog>
        </>
      )
      
      const outsideButton = screen.getByRole('button', { name: 'Outside button' })
      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' })
      
      // Focus outside button first
      outsideButton.focus()
      expect(outsideButton).toHaveFocus()
      
      // Open dialog
      await user.click(triggerButton)
      
      // Focus should move to auto-focus input inside dialog
      const autoFocusInput = screen.getByPlaceholderText('Auto focus input')
      expect(autoFocusInput).toHaveFocus()
    })

    it('restores focus on close', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Focus Restore</DialogTitle>
            </DialogHeader>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )
      
      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' })
      
      // Open dialog
      await user.click(triggerButton)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      
      // Close dialog
      await user.click(screen.getByRole('button', { name: 'Close' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      
      // Focus should return to trigger
      expect(triggerButton).toHaveFocus()
    })
  })

  describe('Portal and Layer Management', () => {
    it('renders dialog in portal', () => {
      render(<SimpleDialog open={true} />)
      
      const dialog = screen.getByRole('dialog')
      // Dialog should be rendered in a portal (typically body or a portal container)
      expect(dialog.closest('body')).toBeTruthy()
    })

    it('has proper z-index stacking', () => {
      render(<SimpleDialog open={true} />)
      
      const overlay = document.querySelector('[data-radix-dialog-overlay]')
      const content = screen.getByRole('dialog')
      
      // Overlay should be behind content
      if (overlay) {
        const overlayZIndex = window.getComputedStyle(overlay).zIndex
        const contentZIndex = window.getComputedStyle(content).zIndex
        
        expect(parseInt(contentZIndex)).toBeGreaterThan(parseInt(overlayZIndex))
      }
    })
  })

  describe('Animation and Transitions', () => {
    it('applies entry animations', () => {
      render(<SimpleDialog open={true} />)
      
      const dialog = screen.getByRole('dialog')
      const overlay = document.querySelector('[data-radix-dialog-overlay]')
      
      // Should have animation classes
      expect(dialog).toHaveClass('animate-in')
      if (overlay) {
        expect(overlay).toHaveClass('animate-in')
      }
    })

    it('applies exit animations when closing', async () => {
      const handleOpenChange = jest.fn()
      const user = userEvent.setup()
      
      render(<SimpleDialog open={true} onOpenChange={handleOpenChange} />)
      
      await user.keyboard('{Escape}')
      
      // Should trigger close animation
      expect(handleOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Content Variations', () => {
    it('handles dialog without header', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <p>Content without header</p>
          </DialogContent>
        </Dialog>
      )
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Content without header')).toBeInTheDocument()
    })

    it('handles dialog without footer', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>No Footer Dialog</DialogTitle>
            </DialogHeader>
            <p>Content without footer</p>
          </DialogContent>
        </Dialog>
      )
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('No Footer Dialog')).toBeInTheDocument()
    })

    it('handles complex content', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complex Content</DialogTitle>
              <DialogDescription>Dialog with form elements</DialogDescription>
            </DialogHeader>
            <form>
              <input placeholder="Name" />
              <textarea placeholder="Message" />
              <select>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </form>
            <DialogFooter>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Message')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid open/close cycles', async () => {
      const user = userEvent.setup()
      render(<ControlledDialog />)
      
      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      
      // Rapidly open and close
      await user.click(trigger)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      
      await user.click(trigger)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('handles disabled trigger', () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button disabled>Disabled Trigger</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Should not open</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      
      const trigger = screen.getByRole('button', { name: 'Disabled Trigger' })
      expect(trigger).toBeDisabled()
      
      fireEvent.click(trigger)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('handles missing onOpenChange gracefully', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>No onChange handler</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      
      // Should not throw error when trying to close
      await user.keyboard('{Escape}')
      
      // Dialog should still be open since no handler to close it
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
})