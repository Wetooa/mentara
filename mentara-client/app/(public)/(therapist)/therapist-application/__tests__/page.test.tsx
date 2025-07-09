import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SinglePageTherapistApplication from '../page';

// Mock necessary modules
jest.mock('@/hooks/useMobile', () => ({
  useIsMobile: jest.fn(() => false), // Default to desktop
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

// Mock Next.js router
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

describe('SinglePageTherapistApplication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('renders the therapist application form', () => {
      render(<SinglePageTherapistApplication />);
      
      expect(screen.getByText('Therapist Application')).toBeInTheDocument();
      expect(screen.getByText('Complete all sections below to submit your application to join the Mentara therapist network.')).toBeInTheDocument();
    });

    it('renders desktop sidebar by default', () => {
      render(<SinglePageTherapistApplication />);
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });

    it('shows all required sections', () => {
      render(<SinglePageTherapistApplication />);
      
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Professional Profile')).toBeInTheDocument();
      expect(screen.getByText('Availability & Services')).toBeInTheDocument();
      expect(screen.getByText('Document Upload')).toBeInTheDocument();
      expect(screen.getByText('Review & Submit')).toBeInTheDocument();
    });

    it('shows submit button as disabled initially', () => {
      render(<SinglePageTherapistApplication />);
      
      const submitButton = screen.getByRole('button', { name: /submit application/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Mobile Responsive Behavior', () => {
    beforeEach(() => {
      // Mock mobile viewport
      const useIsMobile = require('@/hooks/useMobile').useIsMobile;
      useIsMobile.mockReturnValue(true);
    });

    afterEach(() => {
      // Reset to desktop
      const useIsMobile = require('@/hooks/useMobile').useIsMobile;
      useIsMobile.mockReturnValue(false);
    });

    it('renders mobile header instead of desktop header on mobile', () => {
      render(<SinglePageTherapistApplication />);
      
      expect(screen.queryByText('Complete all sections below')).not.toBeInTheDocument();
      expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
    });

    it('does not render desktop sidebar on mobile', () => {
      render(<SinglePageTherapistApplication />);
      
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    });

    it('opens mobile drawer when menu button is clicked', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      const menuButton = screen.getByTestId('mobile-menu-button');
      await user.click(menuButton);
      
      expect(screen.getByTestId('mobile-drawer')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    describe('Basic Information Section', () => {
      beforeEach(() => {
        render(<SinglePageTherapistApplication />);
      });

      it('validates required fields in basic information', async () => {
        const user = userEvent.setup();
        
        // Try to move to next section without filling required fields
        const firstNameInput = screen.getByPlaceholderText('Enter your first name');
        await user.click(firstNameInput);
        await user.tab(); // Trigger blur validation
        
        await waitFor(() => {
          expect(screen.getByText('First name is required')).toBeInTheDocument();
        });
      });

      it('validates mobile phone number format', async () => {
        const user = userEvent.setup();
        
        const phoneInput = screen.getByPlaceholderText('e.g., 09xxxxxxxxx');
        await user.type(phoneInput, '123');
        await user.tab(); // Trigger blur validation
        
        await waitFor(() => {
          expect(screen.getByText('Invalid PH mobile number')).toBeInTheDocument();
        });
      });

      it('validates email format', async () => {
        const user = userEvent.setup();
        
        const emailInput = screen.getByPlaceholderText('Enter your email address');
        await user.type(emailInput, 'invalid-email');
        await user.tab(); // Trigger blur validation
        
        await waitFor(() => {
          expect(screen.getByText('Invalid email format')).toBeInTheDocument();
        });
      });

      it('accepts valid basic information', async () => {
        const user = userEvent.setup();
        
        // Fill valid information
        await user.type(screen.getByPlaceholderText('Enter your first name'), 'John');
        await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe');
        await user.type(screen.getByPlaceholderText('e.g., 09xxxxxxxxx'), '09123456789');
        await user.type(screen.getByPlaceholderText('Enter your email address'), 'john.doe@example.com');
        
        // Should not show validation errors
        expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
        expect(screen.queryByText('Invalid PH mobile number')).not.toBeInTheDocument();
        expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
      });
    });

    describe('Professional Profile Section', () => {
      beforeEach(() => {
        render(<SinglePageTherapistApplication />);
        // Open professional profile section
        fireEvent.click(screen.getByText('Professional Profile'));
      });

      it('validates professional license type selection', async () => {
        const user = userEvent.setup();
        
        // Try to proceed without selecting license type
        const submitButton = screen.getByRole('button', { name: /submit application/i });
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText('Please select your professional license type')).toBeInTheDocument();
        });
      });

      it('shows conditional PRC license fields when PRC licensed', async () => {
        const user = userEvent.setup();
        
        // Select RPsy license
        await user.click(screen.getByLabelText(/RPsy \(Registered Psychologist\)/));
        
        // Select PRC licensed = Yes
        await user.click(screen.getByLabelText('Yes'));
        
        // Should show conditional fields
        await waitFor(() => {
          expect(screen.getByPlaceholderText('e.g., 1234567')).toBeInTheDocument();
          expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Date input
        });
      });

      it('validates PRC license number format', async () => {
        const user = userEvent.setup();
        
        // Set up PRC licensed scenario
        await user.click(screen.getByLabelText(/RPsy \(Registered Psychologist\)/));
        await user.click(screen.getByLabelText('Yes'));
        
        // Enter invalid license number
        const licenseInput = screen.getByPlaceholderText('e.g., 1234567');
        await user.type(licenseInput, '123');
        await user.tab();
        
        await waitFor(() => {
          expect(screen.getByText('Please enter a valid 7-digit PRC license number')).toBeInTheDocument();
        });
      });

      it('validates required areas of expertise', async () => {
        const user = userEvent.setup();
        
        // Try to submit without selecting expertise areas
        const submitButton = screen.getByRole('button', { name: /submit application/i });
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText('Please select at least one area of expertise')).toBeInTheDocument();
        });
      });

      it('requires platform guidelines agreement', async () => {
        const user = userEvent.setup();
        
        // Select 'No' for platform guidelines
        const noRadio = screen.getByDisplayValue('no');
        await user.click(noRadio);
        
        const submitButton = screen.getByRole('button', { name: /submit application/i });
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Progress Tracking', () => {
    it('shows 0% progress initially', () => {
      render(<SinglePageTherapistApplication />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('updates progress as sections are completed', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Fill basic information
      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe');
      await user.type(screen.getByPlaceholderText('e.g., 09xxxxxxxxx'), '09123456789');
      await user.type(screen.getByPlaceholderText('Enter your email address'), 'john.doe@example.com');
      
      // Progress should increase from 0%
      await waitFor(() => {
        const progressText = screen.getByTestId('overall-progress');
        expect(progressText).not.toHaveTextContent('0%');
      });
    });

    it('shows section completion status', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Initially should show incomplete
      expect(screen.getByText('0/6 complete')).toBeInTheDocument();
      
      // Fill basic information fields
      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe');
      
      // Should show partial completion
      await waitFor(() => {
        expect(screen.getByText('2/6 complete')).toBeInTheDocument();
      });
    });
  });

  describe('Section Navigation', () => {
    it('allows opening and closing sections', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Professional Profile should be closed initially
      expect(screen.queryByText('Professional License Information')).not.toBeInTheDocument();
      
      // Click to open
      await user.click(screen.getByText('Professional Profile'));
      
      // Should now be visible
      await waitFor(() => {
        expect(screen.getByText('Professional License Information')).toBeInTheDocument();
      });
      
      // Click to close
      await user.click(screen.getByText('Professional Profile'));
      
      // Should be hidden again
      await waitFor(() => {
        expect(screen.queryByText('Professional License Information')).not.toBeInTheDocument();
      });
    });

    it('scrolls to section when clicked from sidebar', async () => {
      const user = userEvent.setup();
      const scrollIntoViewMock = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;
      
      render(<SinglePageTherapistApplication />);
      
      // Click on a section in sidebar
      const sidebarSection = screen.getAllByText('Professional Profile')[0]; // First occurrence (in sidebar)
      await user.click(sidebarSection);
      
      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'start'
        });
      });
    });
  });

  describe('Auto-save Functionality', () => {
    it('shows save status', () => {
      render(<SinglePageTherapistApplication />);
      
      expect(screen.getByText('Not saved yet')).toBeInTheDocument();
    });

    // Note: Auto-save testing would require mocking timers and form state changes
    // This is a basic structure that can be expanded
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<SinglePageTherapistApplication />);
      
      // Check for form role
      expect(screen.getByRole('form')).toBeInTheDocument();
      
      // Check for proper button labels
      expect(screen.getByRole('button', { name: /submit application/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Tab through form elements
      await user.tab();
      expect(screen.getByPlaceholderText('Enter your first name')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByPlaceholderText('Enter your last name')).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('handles form submission errors gracefully', async () => {
      const { submitApplicationWithDocuments } = require('@/lib/api/therapist-application');
      submitApplicationWithDocuments.mockRejectedValueOnce(new Error('Network error'));
      
      const user = userEvent.setup();
      render(<SinglePageTherapistApplication />);
      
      // Fill minimum required data and submit
      // This test would need to fill all required fields to enable submission
      // Abbreviated for test structure demonstration
      
      const submitButton = screen.getByRole('button', { name: /submit application/i });
      await user.click(submitButton);
      
      // Should handle error gracefully (redirect to error page)
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('error'));
      });
    });
  });
});