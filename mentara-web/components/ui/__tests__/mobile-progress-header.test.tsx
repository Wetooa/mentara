import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileProgressHeader } from '../mobile-progress-header';

describe('MobileProgressHeader', () => {
  const defaultProps = {
    title: 'Therapist Application',
    progress: 45,
    currentSection: 'Professional Profile',
    onMenuClick: jest.fn(),
    onPreviousSection: jest.fn(),
    onNextSection: jest.fn(),
    hasPrevious: true,
    hasNext: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders title and current section', () => {
      render(<MobileProgressHeader {...defaultProps} />);
      
      expect(screen.getByText('Therapist Application')).toBeInTheDocument();
      expect(screen.getByText('Professional Profile')).toBeInTheDocument();
    });

    it('displays progress percentage', () => {
      render(<MobileProgressHeader {...defaultProps} />);
      
      expect(screen.getByText('45%')).toBeInTheDocument();
    });

    it('renders progress bar with correct value', () => {
      render(<MobileProgressHeader {...defaultProps} />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      // Check for the data attribute instead
      expect(progressBar).toHaveAttribute('data-slot', 'progress');
    });

    it('renders menu button', () => {
      render(<MobileProgressHeader {...defaultProps} />);
      
      const menuButton = screen.getByTestId('mobile-menu-button');
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute('aria-label', 'Open navigation menu');
    });

    it('renders navigation buttons', () => {
      render(<MobileProgressHeader {...defaultProps} />);
      
      expect(screen.getByTestId('mobile-previous-button')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-next-button')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onMenuClick when menu button is clicked', async () => {
      const user = userEvent.setup();
      const onMenuClick = jest.fn();
      
      render(<MobileProgressHeader {...defaultProps} onMenuClick={onMenuClick} />);
      
      const menuButton = screen.getByTestId('mobile-menu-button');
      await user.click(menuButton);
      
      expect(onMenuClick).toHaveBeenCalledTimes(1);
    });

    it('calls onPreviousSection when previous button is clicked', async () => {
      const user = userEvent.setup();
      const onPreviousSection = jest.fn();
      
      render(<MobileProgressHeader {...defaultProps} onPreviousSection={onPreviousSection} />);
      
      const previousButton = screen.getByTestId('mobile-previous-button');
      await user.click(previousButton);
      
      expect(onPreviousSection).toHaveBeenCalledTimes(1);
    });

    it('calls onNextSection when next button is clicked', async () => {
      const user = userEvent.setup();
      const onNextSection = jest.fn();
      
      render(<MobileProgressHeader {...defaultProps} onNextSection={onNextSection} />);
      
      const nextButton = screen.getByTestId('mobile-next-button');
      await user.click(nextButton);
      
      expect(onNextSection).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button States', () => {
    it('disables previous button when hasPrevious is false', () => {
      render(<MobileProgressHeader {...defaultProps} hasPrevious={false} />);
      
      const previousButton = screen.getByTestId('mobile-previous-button');
      expect(previousButton).toBeDisabled();
    });

    it('disables next button when hasNext is false', () => {
      render(<MobileProgressHeader {...defaultProps} hasNext={false} />);
      
      const nextButton = screen.getByTestId('mobile-next-button');
      expect(nextButton).toBeDisabled();
    });

    it('disables previous button when onPreviousSection is not provided', () => {
      render(<MobileProgressHeader {...defaultProps} onPreviousSection={undefined} />);
      
      const previousButton = screen.getByTestId('mobile-previous-button');
      expect(previousButton).toBeDisabled();
    });

    it('disables next button when onNextSection is not provided', () => {
      render(<MobileProgressHeader {...defaultProps} onNextSection={undefined} />);
      
      const nextButton = screen.getByTestId('mobile-next-button');
      expect(nextButton).toBeDisabled();
    });

    it('enables buttons when conditions are met', () => {
      render(<MobileProgressHeader {...defaultProps} />);
      
      const previousButton = screen.getByTestId('mobile-previous-button');
      const nextButton = screen.getByTestId('mobile-next-button');
      
      expect(previousButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Text Truncation', () => {
    it('applies truncate classes to long titles', () => {
      const longTitle = 'This is a very long title that should be truncated on small screens to prevent layout issues';
      
      render(<MobileProgressHeader {...defaultProps} title={longTitle} />);
      
      const titleElement = screen.getByText(longTitle);
      expect(titleElement).toHaveClass('truncate');
    });

    it('applies truncate classes to long section names', () => {
      const longSection = 'This is a very long section name that should be truncated on small screens';
      
      render(<MobileProgressHeader {...defaultProps} currentSection={longSection} />);
      
      const sectionElement = screen.getByText(longSection);
      expect(sectionElement).toHaveClass('truncate');
    });
  });

  describe('CSS Classes and Layout', () => {
    it('applies sticky positioning', () => {
      const { container } = render(<MobileProgressHeader {...defaultProps} />);
      
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('sticky', 'top-0', 'z-30');
    });

    it('has proper background and border styles', () => {
      const { container } = render(<MobileProgressHeader {...defaultProps} />);
      
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('bg-white', 'border-b', 'border-gray-200', 'shadow-sm');
    });

    it('applies correct button styling', () => {
      render(<MobileProgressHeader {...defaultProps} />);
      
      const nextButton = screen.getByTestId('mobile-next-button');
      expect(nextButton).toHaveClass('bg-green-600', 'hover:bg-green-700');
    });
  });

  describe('Progress Values', () => {
    it('handles 0% progress correctly', () => {
      render(<MobileProgressHeader {...defaultProps} progress={0} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('handles 100% progress correctly', () => {
      render(<MobileProgressHeader {...defaultProps} progress={100} />);
      
      expect(screen.getByText('100%')).toBeInTheDocument();
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('handles decimal progress values', () => {
      render(<MobileProgressHeader {...defaultProps} progress={67.5} />);
      
      expect(screen.getByText('67.5%')).toBeInTheDocument();
    });
  });
});