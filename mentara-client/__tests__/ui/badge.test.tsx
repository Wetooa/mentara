import React from 'react'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge Component', () => {
  describe('Basic Functionality', () => {
    it('renders badge element', () => {
      render(<Badge>Badge text</Badge>)
      
      expect(screen.getByText('Badge text')).toBeInTheDocument()
    })

    it('applies base styles', () => {
      render(<Badge>Badge</Badge>)
      
      const badge = screen.getByText('Badge')
      expect(badge).toHaveClass('inline-flex')
    })

    it('accepts custom className', () => {
      render(<Badge className="custom-badge-class">Badge</Badge>)
      
      const badge = screen.getByText('Badge')
      expect(badge).toHaveClass('custom-badge-class')
    })
  })

  describe('Badge Variants', () => {
    it('renders default variant', () => {
      render(<Badge>Default Badge</Badge>)
      
      const badge = screen.getByText('Default Badge')
      expect(badge).toBeInTheDocument()
    })

    it('renders secondary variant', () => {
      render(<Badge variant="secondary">Secondary Badge</Badge>)
      
      const badge = screen.getByText('Secondary Badge')
      expect(badge).toBeInTheDocument()
    })

    it('renders destructive variant', () => {
      render(<Badge variant="destructive">Destructive Badge</Badge>)
      
      const badge = screen.getByText('Destructive Badge')
      expect(badge).toBeInTheDocument()
    })

    it('renders outline variant', () => {
      render(<Badge variant="outline">Outline Badge</Badge>)
      
      const badge = screen.getByText('Outline Badge')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Content Variations', () => {
    it('renders with text content', () => {
      render(<Badge>Simple text</Badge>)
      
      expect(screen.getByText('Simple text')).toBeInTheDocument()
    })

    it('renders with number content', () => {
      render(<Badge>42</Badge>)
      
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('renders with mixed content', () => {
      render(<Badge>Status: Active</Badge>)
      
      expect(screen.getByText('Status: Active')).toBeInTheDocument()
    })

    it('renders with empty content', () => {
      render(<Badge />)
      
      const badge = document.querySelector('[data-slot="badge"]') || 
                    document.querySelector('.inline-flex')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Badge aria-label="Status badge">Active</Badge>)
      
      const badge = screen.getByLabelText('Status badge')
      expect(badge).toBeInTheDocument()
    })

    it('supports role attribute', () => {
      render(<Badge role="status">Loading</Badge>)
      
      const badge = screen.getByRole('status')
      expect(badge).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <Badge aria-describedby="badge-description">Important</Badge>
          <div id="badge-description">This is an important notification</div>
        </>
      )
      
      const badge = screen.getByText('Important')
      expect(badge).toHaveAttribute('aria-describedby', 'badge-description')
    })
  })

  describe('Interactive Badges', () => {
    it('can be clickable', () => {
      const handleClick = jest.fn()
      render(<Badge onClick={handleClick}>Clickable</Badge>)
      
      const badge = screen.getByText('Clickable')
      badge.click()
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles keyboard events', () => {
      const handleKeyDown = jest.fn()
      render(<Badge onKeyDown={handleKeyDown} tabIndex={0}>Keyboard</Badge>)
      
      const badge = screen.getByText('Keyboard')
      badge.focus()
      
      expect(document.activeElement).toBe(badge)
    })
  })

  describe('Custom Styling', () => {
    it('merges custom classes', () => {
      render(<Badge className="bg-red-500 text-white">Custom</Badge>)
      
      const badge = screen.getByText('Custom')
      expect(badge).toHaveClass('bg-red-500', 'text-white')
    })

    it('supports size variations through classes', () => {
      render(<Badge className="text-lg px-4">Large Badge</Badge>)
      
      const badge = screen.getByText('Large Badge')
      expect(badge).toHaveClass('text-lg', 'px-4')
    })
  })

  describe('Edge Cases', () => {
    it('handles special characters', () => {
      render(<Badge>Special: !@#$%^&*()</Badge>)
      
      expect(screen.getByText('Special: !@#$%^&*()')).toBeInTheDocument()
    })

    it('handles long text content', () => {
      const longText = 'This is a very long badge text that might wrap'
      render(<Badge>{longText}</Badge>)
      
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('handles JSX content', () => {
      render(
        <Badge>
          <span>Status: </span>
          <strong>Active</strong>
        </Badge>
      )
      
      expect(screen.getByText('Status:')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('handles ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Badge ref={ref}>Ref Badge</Badge>)
      
      expect(ref.current).toBeInstanceOf(HTMLElement)
    })
  })

  describe('Semantic Usage', () => {
    it('can represent status', () => {
      render(<Badge variant="destructive">Error</Badge>)
      
      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('can represent notifications', () => {
      render(<Badge className="bg-blue-500">3</Badge>)
      
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('can represent categories', () => {
      render(<Badge variant="outline">Technology</Badge>)
      
      expect(screen.getByText('Technology')).toBeInTheDocument()
    })
  })
})