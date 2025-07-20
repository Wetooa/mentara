import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

describe('Card Component', () => {
  describe('Basic Functionality', () => {
    it('renders card element', () => {
      render(<Card>Card content</Card>)
      
      const card = screen.getByText('Card content').closest('div')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card')
    })

    it('renders with children content', () => {
      render(
        <Card>
          <div>Custom content</div>
        </Card>
      )
      
      expect(screen.getByText('Custom content')).toBeInTheDocument()
    })

    it('accepts custom className', () => {
      render(<Card className="custom-card-class">Content</Card>)
      
      const card = screen.getByText('Content').closest('div')
      expect(card).toHaveClass('custom-card-class')
    })
  })

  describe('Card Header', () => {
    it('renders card header', () => {
      render(
        <Card>
          <CardHeader>Header content</CardHeader>
        </Card>
      )
      
      expect(screen.getByText('Header content')).toBeInTheDocument()
    })

    it('applies header styles', () => {
      render(
        <Card>
          <CardHeader className="test-header">Header</CardHeader>
        </Card>
      )
      
      const header = screen.getByText('Header')
      expect(header).toHaveClass('test-header')
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })

    it('accepts custom className for header', () => {
      render(
        <Card>
          <CardHeader className="custom-header-class">Header</CardHeader>
        </Card>
      )
      
      const header = screen.getByText('Header')
      expect(header).toHaveClass('custom-header-class')
    })
  })

  describe('Card Title', () => {
    it('renders card title', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
        </Card>
      )
      
      expect(screen.getByText('Card Title')).toBeInTheDocument()
    })

    it('applies title styles', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      )
      
      const title = screen.getByText('Title')
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight')
    })

    it('renders as h3 by default', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      )
      
      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toHaveTextContent('Title')
    })

    it('accepts custom className for title', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle className="custom-title-class">Title</CardTitle>
          </CardHeader>
        </Card>
      )
      
      const title = screen.getByText('Title')
      expect(title).toHaveClass('custom-title-class')
    })
  })

  describe('Card Description', () => {
    it('renders card description', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Card description text</CardDescription>
          </CardHeader>
        </Card>
      )
      
      expect(screen.getByText('Card description text')).toBeInTheDocument()
    })

    it('applies description styles', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      )
      
      const description = screen.getByText('Description')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('accepts custom className for description', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription className="custom-description-class">Description</CardDescription>
          </CardHeader>
        </Card>
      )
      
      const description = screen.getByText('Description')
      expect(description).toHaveClass('custom-description-class')
    })
  })

  describe('Card Content', () => {
    it('renders card content', () => {
      render(
        <Card>
          <CardContent>Main content area</CardContent>
        </Card>
      )
      
      expect(screen.getByText('Main content area')).toBeInTheDocument()
    })

    it('applies content styles', () => {
      render(
        <Card>
          <CardContent className="test-content">Content</CardContent>
        </Card>
      )
      
      const content = screen.getByText('Content')
      expect(content).toHaveClass('test-content')
      expect(content).toHaveClass('p-6', 'pt-0')
    })

    it('accepts custom className for content', () => {
      render(
        <Card>
          <CardContent className="custom-content-class">Content</CardContent>
        </Card>
      )
      
      const content = screen.getByText('Content')
      expect(content).toHaveClass('custom-content-class')
    })
  })

  describe('Card Footer', () => {
    it('renders card footer', () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      )
      
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('applies footer styles', () => {
      render(
        <Card>
          <CardFooter className="test-footer">Footer</CardFooter>
        </Card>
      )
      
      const footer = screen.getByText('Footer')
      expect(footer).toHaveClass('test-footer')
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
    })

    it('accepts custom className for footer', () => {
      render(
        <Card>
          <CardFooter className="custom-footer-class">Footer</CardFooter>
        </Card>
      )
      
      const footer = screen.getByText('Footer')
      expect(footer).toHaveClass('custom-footer-class')
    })
  })

  describe('Complete Card Structure', () => {
    it('renders complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This is a complete card example</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Action Button</button>
          </CardFooter>
        </Card>
      )
      
      expect(screen.getByRole('heading', { level: 3, name: 'Complete Card' })).toBeInTheDocument()
      expect(screen.getByText('This is a complete card example')).toBeInTheDocument()
      expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument()
    })

    it('maintains proper structure hierarchy', () => {
      render(
        <Card data-testid="card">
          <CardHeader data-testid="header">
            <CardTitle data-testid="title">Title</CardTitle>
            <CardDescription data-testid="description">Description</CardDescription>
          </CardHeader>
          <CardContent data-testid="content">Content</CardContent>
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      )
      
      const card = screen.getByTestId('card')
      const header = screen.getByTestId('header')
      const title = screen.getByTestId('title')
      const description = screen.getByTestId('description')
      const content = screen.getByTestId('content')
      const footer = screen.getByTestId('footer')
      
      expect(card).toContainElement(header)
      expect(card).toContainElement(content)
      expect(card).toContainElement(footer)
      expect(header).toContainElement(title)
      expect(header).toContainElement(description)
    })
  })

  describe('Interactive Cards', () => {
    it('handles click events', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(
        <Card onClick={handleClick} className="cursor-pointer">
          <CardContent>Clickable card</CardContent>
        </Card>
      )
      
      const card = screen.getByText('Clickable card').closest('div')
      await user.click(card!)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles keyboard events', async () => {
      const handleKeyDown = jest.fn()
      const user = userEvent.setup()
      
      render(
        <Card onKeyDown={handleKeyDown} tabIndex={0}>
          <CardContent>Keyboard accessible card</CardContent>
        </Card>
      )
      
      const card = screen.getByText('Keyboard accessible card').closest('div')
      card!.focus()
      await user.keyboard('{Enter}')
      
      expect(handleKeyDown).toHaveBeenCalled()
    })

    it('supports focus management', () => {
      render(
        <Card tabIndex={0} className="focus:ring-2">
          <CardContent>Focusable card</CardContent>
        </Card>
      )
      
      const card = screen.getByText('Focusable card').closest('div')
      card!.focus()
      
      expect(card).toHaveFocus()
    })
  })

  describe('Accessibility', () => {
    it('supports ARIA attributes', () => {
      render(
        <Card role="region" aria-labelledby="card-title">
          <CardHeader>
            <CardTitle id="card-title">Accessible Card</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      )
      
      const card = screen.getByRole('region')
      expect(card).toHaveAttribute('aria-labelledby', 'card-title')
    })

    it('maintains semantic heading hierarchy', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Main Title</CardTitle>
          </CardHeader>
          <CardContent>
            <h4>Subsection</h4>
            <p>Content under subsection</p>
          </CardContent>
        </Card>
      )
      
      const mainTitle = screen.getByRole('heading', { level: 3 })
      const subTitle = screen.getByRole('heading', { level: 4 })
      
      expect(mainTitle).toHaveTextContent('Main Title')
      expect(subTitle).toHaveTextContent('Subsection')
    })

    it('supports screen reader navigation', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Describes the card purpose</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content that provides value to users</p>
          </CardContent>
        </Card>
      )
      
      // Verify content is accessible to screen readers
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Describes the card purpose')).toBeInTheDocument()
      expect(screen.getByText('Main content that provides value to users')).toBeInTheDocument()
    })
  })

  describe('Styling Variations', () => {
    it('supports different border styles', () => {
      render(
        <Card className="border-2 border-dashed border-red-500">
          <CardContent>Styled border card</CardContent>
        </Card>
      )
      
      const card = screen.getByText('Styled border card').closest('div')
      expect(card).toHaveClass('border-2', 'border-dashed', 'border-red-500')
    })

    it('supports different background styles', () => {
      render(
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600">
          <CardContent>Gradient background card</CardContent>
        </Card>
      )
      
      const card = screen.getByText('Gradient background card').closest('div')
      expect(card).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-purple-600')
    })

    it('supports shadow variations', () => {
      render(
        <Card className="shadow-lg hover:shadow-xl">
          <CardContent>Shadow card</CardContent>
        </Card>
      )
      
      const card = screen.getByText('Shadow card').closest('div')
      expect(card).toHaveClass('shadow-lg', 'hover:shadow-xl')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty card gracefully', () => {
      render(<Card />)
      
      const card = document.querySelector('.rounded-lg.border.bg-card')
      expect(card).toBeInTheDocument()
    })

    it('handles card with only header', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Header Only</CardTitle>
          </CardHeader>
        </Card>
      )
      
      expect(screen.getByText('Header Only')).toBeInTheDocument()
    })

    it('handles card with only content', () => {
      render(
        <Card>
          <CardContent>Content Only</CardContent>
        </Card>
      )
      
      expect(screen.getByText('Content Only')).toBeInTheDocument()
    })

    it('handles card with only footer', () => {
      render(
        <Card>
          <CardFooter>Footer Only</CardFooter>
        </Card>
      )
      
      expect(screen.getByText('Footer Only')).toBeInTheDocument()
    })

    it('handles nested cards', () => {
      render(
        <Card>
          <CardContent>
            <Card>
              <CardContent>Nested card</CardContent>
            </Card>
          </CardContent>
        </Card>
      )
      
      expect(screen.getByText('Nested card')).toBeInTheDocument()
    })

    it('handles ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref}>Content</Card>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })
})