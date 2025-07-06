import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileDrawer } from '../mobile-drawer';

// Mock framer-motion for testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, ...props }) => (
      <div className={className} onClick={onClick} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }) => children,
}));

describe('MobileDrawer', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Drawer Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset body overflow after each test
    document.body.style.overflow = 'unset';
  });

  describe('Rendering', () => {
    it('renders drawer when isOpen is true', () => {
      render(<MobileDrawer {...defaultProps} />);
      
      expect(screen.getByTestId('mobile-drawer')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-drawer-backdrop')).toBeInTheDocument();
      expect(screen.getByText('Drawer Content')).toBeInTheDocument();
    });

    it('does not render drawer when isOpen is false', () => {
      render(<MobileDrawer {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByTestId('mobile-drawer')).not.toBeInTheDocument();
      expect(screen.queryByTestId('mobile-drawer-backdrop')).not.toBeInTheDocument();
    });

    it('renders title when provided', () => {
      render(<MobileDrawer {...defaultProps} title="Test Title" />);
      
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('does not render title header when title is not provided', () => {
      render(<MobileDrawer {...defaultProps} />);
      
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<MobileDrawer {...defaultProps} title="Navigation" />);
      
      const drawer = screen.getByTestId('mobile-drawer');
      expect(drawer).toHaveAttribute('role', 'dialog');
      expect(drawer).toHaveAttribute('aria-modal', 'true');
      expect(drawer).toHaveAttribute('aria-label', 'Navigation');
    });

    it('uses default aria-label when no title is provided', () => {
      render(<MobileDrawer {...defaultProps} />);
      
      const drawer = screen.getByTestId('mobile-drawer');
      expect(drawer).toHaveAttribute('aria-label', 'Navigation drawer');
    });

    it('close button has proper aria-label', () => {
      render(<MobileDrawer {...defaultProps} />);
      
      const closeButton = screen.getByTestId('mobile-drawer-close');
      expect(closeButton).toHaveAttribute('aria-label', 'Close navigation');
    });
  });

  describe('Interaction', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      
      render(<MobileDrawer {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByTestId('mobile-drawer-close');
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      
      render(<MobileDrawer {...defaultProps} onClose={onClose} />);
      
      const backdrop = screen.getByTestId('mobile-drawer-backdrop');
      await user.click(backdrop);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', () => {
      const onClose = jest.fn();
      
      render(<MobileDrawer {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose for other key presses', () => {
      const onClose = jest.fn();
      
      render(<MobileDrawer {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll Management', () => {
    it('prevents body scroll when drawer is open', () => {
      render(<MobileDrawer {...defaultProps} isOpen={true} />);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when drawer is closed', () => {
      const { rerender } = render(<MobileDrawer {...defaultProps} isOpen={true} />);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      rerender(<MobileDrawer {...defaultProps} isOpen={false} />);
      
      expect(document.body.style.overflow).toBe('unset');
    });

    it('restores body scroll on unmount', () => {
      const { unmount } = render(<MobileDrawer {...defaultProps} isOpen={true} />);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      unmount();
      
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Focus Management', () => {
    it('focuses first focusable element when drawer opens', async () => {
      render(
        <MobileDrawer {...defaultProps}>
          <button>First Button</button>
          <button>Second Button</button>
        </MobileDrawer>
      );
      
      await waitFor(() => {
        expect(screen.getByText('First Button')).toHaveFocus();
      }, { timeout: 100 });
    });

    it('handles drawer with no focusable elements gracefully', () => {
      expect(() => {
        render(
          <MobileDrawer {...defaultProps}>
            <div>No focusable content</div>
          </MobileDrawer>
        );
      }).not.toThrow();
    });
  });

  describe('Event Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<MobileDrawer {...defaultProps} />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('CSS Classes', () => {
    it('applies correct CSS classes to drawer', () => {
      render(<MobileDrawer {...defaultProps} />);
      
      const drawer = screen.getByTestId('mobile-drawer');
      expect(drawer).toHaveClass(
        'fixed', 'left-0', 'top-0', 'bottom-0', 'w-80', 'max-w-[85vw]',
        'bg-white', 'shadow-xl', 'z-50', 'flex', 'flex-col'
      );
    });

    it('applies correct CSS classes to backdrop', () => {
      render(<MobileDrawer {...defaultProps} />);
      
      const backdrop = screen.getByTestId('mobile-drawer-backdrop');
      expect(backdrop).toHaveClass(
        'fixed', 'inset-0', 'bg-black/50', 'z-40'
      );
    });
  });
});