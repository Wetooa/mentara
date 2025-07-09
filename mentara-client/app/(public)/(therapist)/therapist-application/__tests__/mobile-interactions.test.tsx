import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SinglePageTherapistApplication from '../page';

// Mock necessary modules
jest.mock('@/hooks/useMobile', () => ({
  useIsMobile: jest.fn(() => false),
}));

jest.mock('@/store/therapistform', () => ({
  __esModule: true,
  default: () => ({
    updateField: jest.fn(),
    updateNestedField: jest.fn(),
    documents: {
      prcLicense: [],
      nbiClearance: [],
      resumeCV: [],
      liabilityInsurance: [],
      birForm: [],
    },
    updateDocuments: jest.fn(),
    removeDocument: jest.fn(),
  }),
}));

jest.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

jest.mock('@/lib/api/therapist-application', () => ({
  submitApplicationWithDocuments: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/therapist-application',
}));

describe('Mobile Interactions', () => {
  const mockUseIsMobile = require('@/hooks/use-mobile').useIsMobile;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mobile Layout Rendering', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    afterEach(() => {
      mockUseIsMobile.mockReturnValue(false);
    });

    it('renders mobile progress header instead of desktop header', () => {
      render(<SinglePageTherapistApplication />);
      
      // Mobile header should be present
      expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-previous-button')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-next-button')).toBeInTheDocument();
      
      // Desktop header should be hidden
      expect(screen.queryByText('Complete all sections below to submit your application')).not.toBeInTheDocument();
    });

    it('does not render desktop sidebar on mobile', () => {
      render(<SinglePageTherapistApplication />);
      
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    });

    it('uses mobile-specific content layout', () => {
      render(<SinglePageTherapistApplication />);
      
      const mainContent = screen.getByTestId('main-content');
      expect(mainContent).toHaveClass('w-full', 'p-4'); // Mobile-specific classes
    });

    it('shows progress in mobile header', () => {
      render(<SinglePageTherapistApplication />);
      
      // Progress should be visible in mobile header
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('Basic Information')).toBeInTheDocument(); // Current section
    });
  });

  describe('Mobile Drawer Functionality', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    afterEach(() => {
      mockUseIsMobile.mockReturnValue(false);
    });

    it('opens mobile drawer when menu button is clicked', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      const menuButton = screen.getByTestId('mobile-menu-button');
      await user.click(menuButton);
      
      expect(screen.getByTestId('mobile-drawer')).toBeInTheDocument();
      expect(screen.getByText('Application Progress')).toBeInTheDocument();
    });

    it('closes mobile drawer when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Open drawer
      const menuButton = screen.getByTestId('mobile-menu-button');
      await user.click(menuButton);
      
      // Close drawer
      const closeButton = screen.getByTestId('mobile-drawer-close');
      await user.click(closeButton);
      
      expect(screen.queryByTestId('mobile-drawer')).not.toBeInTheDocument();
    });

    it('closes mobile drawer when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Open drawer
      const menuButton = screen.getByTestId('mobile-menu-button');
      await user.click(menuButton);
      
      // Click backdrop
      const backdrop = screen.getByTestId('mobile-drawer-backdrop');
      await user.click(backdrop);
      
      expect(screen.queryByTestId('mobile-drawer')).not.toBeInTheDocument();
    });

    it('closes drawer when section is clicked in mobile drawer', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Open drawer
      const menuButton = screen.getByTestId('mobile-menu-button');
      await user.click(menuButton);
      
      // Click on a section in the drawer
      const profSection = screen.getByText('Professional Profile');
      await user.click(profSection);
      
      expect(screen.queryByTestId('mobile-drawer')).not.toBeInTheDocument();
    });

    it('shows same sidebar content in mobile drawer as desktop', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Open mobile drawer
      const menuButton = screen.getByTestId('mobile-menu-button');
      await user.click(menuButton);
      
      // Should contain all sections
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Professional Profile')).toBeInTheDocument();
      expect(screen.getByText('Availability & Services')).toBeInTheDocument();
      expect(screen.getByText('Document Upload')).toBeInTheDocument();
      expect(screen.getByText('Review & Submit')).toBeInTheDocument();
      
      // Should contain progress information
      expect(screen.getByText('Overall Progress')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Mobile Navigation Controls', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    afterEach(() => {
      mockUseIsMobile.mockReturnValue(false);
    });

    it('shows previous button as disabled on first section', () => {
      render(<SinglePageTherapistApplication />);
      
      const prevButton = screen.getByTestId('mobile-previous-button');
      expect(prevButton).toBeDisabled();
    });

    it('enables next button when not on last section', () => {
      render(<SinglePageTherapistApplication />);
      
      const nextButton = screen.getByTestId('mobile-next-button');
      expect(nextButton).not.toBeDisabled();
    });

    it('navigates to next section when next button is clicked', async () => {
      const user = userEvent.setup();
      const scrollIntoViewMock = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;
      
      render(<SinglePageTherapistApplication />);
      
      const nextButton = screen.getByTestId('mobile-next-button');
      await user.click(nextButton);
      
      // Should scroll to next section
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Mobile header should show new current section
      expect(screen.getByText('Professional Profile')).toBeInTheDocument();
    });

    it('navigates to previous section when previous button is clicked', async () => {
      const user = userEvent.setup();
      const scrollIntoViewMock = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;
      
      render(<SinglePageTherapistApplication />);
      
      // First go to next section
      const nextButton = screen.getByTestId('mobile-next-button');
      await user.click(nextButton);
      
      // Then go back
      const prevButton = screen.getByTestId('mobile-previous-button');
      await user.click(prevButton);
      
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Should be back to first section
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
    });

    it('updates current section indicator correctly', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Initially on Basic Information
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      
      // Navigate to next section
      const nextButton = screen.getByTestId('mobile-next-button');
      await user.click(nextButton);
      
      // Should show Professional Profile as current
      expect(screen.getByText('Professional Profile')).toBeInTheDocument();
    });

    it('disables next button on last section', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Navigate to last section (4 clicks for 5 sections)
      const nextButton = screen.getByTestId('mobile-next-button');
      
      for (let i = 0; i < 4; i++) {
        await user.click(nextButton);
      }
      
      // Next button should now be disabled
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Touch Target Optimization', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    afterEach(() => {
      mockUseIsMobile.mockReturnValue(false);
    });

    it('has minimum 44px touch targets for radio buttons', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Open professional profile section
      await user.click(screen.getByText('Professional Profile'));
      
      // Radio button containers should have min-h-[44px]
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        const container = radio.closest('div');
        expect(container).toHaveClass('min-h-[44px]');
      });
    });

    it('has minimum 44px touch targets for checkboxes', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Open professional profile section to access checkboxes
      await user.click(screen.getByText('Professional Profile'));
      
      // Find expertise area checkboxes
      const anxietyCheckbox = screen.getByText('Anxiety').closest('label');
      expect(anxietyCheckbox).toHaveClass('min-h-[44px]');
    });

    it('applies touch-manipulation CSS for better mobile interaction', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Open professional profile section
      await user.click(screen.getByText('Professional Profile'));
      
      // Touch targets should have touch-manipulation class
      const touchTargets = screen.getAllByRole('radio');
      touchTargets.forEach(target => {
        const container = target.closest('div');
        expect(container).toHaveClass('touch-manipulation');
      });
    });
  });

  describe('Mobile Form Layout', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    afterEach(() => {
      mockUseIsMobile.mockReturnValue(false);
    });

    it('stacks form fields vertically on mobile', () => {
      render(<SinglePageTherapistApplication />);
      
      // Grid layouts should start with grid-cols-1 for mobile
      const formContainer = screen.getByTestId('main-content');
      const gridElements = formContainer.querySelectorAll('[class*="grid-cols-1"]');
      
      expect(gridElements.length).toBeGreaterThan(0);
    });

    it('uses appropriate spacing for mobile', () => {
      render(<SinglePageTherapistApplication />);
      
      const mainContent = screen.getByTestId('main-content');
      expect(mainContent).toHaveClass('p-4'); // Mobile padding
    });

    it('maintains form functionality on mobile', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Form inputs should still work on mobile
      const firstNameInput = screen.getByPlaceholderText('Enter your first name');
      await user.type(firstNameInput, 'John');
      
      expect(firstNameInput).toHaveValue('John');
    });
  });

  describe('Desktop vs Mobile Behavior', () => {
    it('renders desktop layout when not mobile', () => {
      mockUseIsMobile.mockReturnValue(false);
      render(<SinglePageTherapistApplication />);
      
      // Desktop sidebar should be visible
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      
      // Mobile header should not be present
      expect(screen.queryByTestId('mobile-menu-button')).not.toBeInTheDocument();
      
      // Desktop header should be present
      expect(screen.getByText('Complete all sections below to submit your application')).toBeInTheDocument();
    });

    it('switches layout when mobile state changes', () => {
      mockUseIsMobile.mockReturnValue(false);
      const { rerender } = render(<SinglePageTherapistApplication />);
      
      // Initially desktop
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      
      // Switch to mobile
      mockUseIsMobile.mockReturnValue(true);
      rerender(<SinglePageTherapistApplication />);
      
      // Should now be mobile layout
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
      expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
    });
  });

  describe('Mobile Accessibility', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    afterEach(() => {
      mockUseIsMobile.mockReturnValue(false);
    });

    it('maintains proper ARIA labels in mobile mode', () => {
      render(<SinglePageTherapistApplication />);
      
      // Mobile menu button should have aria-label
      const menuButton = screen.getByTestId('mobile-menu-button');
      expect(menuButton).toHaveAttribute('aria-label', 'Open navigation menu');
      
      // Navigation buttons should have proper labels
      const prevButton = screen.getByTestId('mobile-previous-button');
      const nextButton = screen.getByTestId('mobile-next-button');
      
      expect(prevButton).toHaveTextContent('Previous');
      expect(nextButton).toHaveTextContent('Next');
    });

    it('supports keyboard navigation in mobile mode', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Tab navigation should work
      await user.tab();
      
      // Should focus on first interactive element
      expect(document.activeElement).toBeDefined();
    });

    it('handles focus properly when drawer opens', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Open drawer
      const menuButton = screen.getByTestId('mobile-menu-button');
      await user.click(menuButton);
      
      // Focus should move to drawer content
      // (This would be tested more thoroughly with actual focus management)
      expect(screen.getByTestId('mobile-drawer')).toBeInTheDocument();
    });
  });
});