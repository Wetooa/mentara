import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BookingModal from '../BookingModal';
import { TherapistCardData } from '@/types/therapist';

// Mock the API hook
jest.mock('@/lib/api', () => ({
  useApi: () => ({
    booking: {
      getAvailableSlots: jest.fn(() => Promise.resolve({
        slots: [
          {
            date: '2024-01-15',
            time: '10:00',
            available: true,
            therapistId: 'therapist-1'
          },
          {
            date: '2024-01-15',
            time: '14:00',
            available: true,
            therapistId: 'therapist-1'
          }
        ]
      })),
      createMeeting: jest.fn(() => Promise.resolve({
        id: 'meeting-1',
        therapistId: 'therapist-1',
        date: '2024-01-15',
        time: '10:00'
      }))
    }
  })
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const mockTherapist: TherapistCardData = {
  id: 'therapist-1',
  name: 'Dr. Jane Smith',
  specializations: ['Anxiety', 'Depression'],
  location: 'New York, NY',
  rating: 4.8,
  reviewCount: 156,
  bio: 'Experienced therapist specializing in cognitive behavioral therapy.',
  hourlyRate: 120,
  isVerified: true,
  profileImage: '/images/therapist1.jpg',
  availability: 'Available today',
  tags: ['CBT', 'EMDR'],
  experience: '8 years',
  education: 'PhD Psychology',
  languages: ['English', 'Spanish']
};

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('BookingModal Component', () => {
  const defaultProps = {
    therapist: mockTherapist,
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open with therapist data', () => {
    renderWithQueryClient(<BookingModal {...defaultProps} />);
    
    expect(screen.getByText('Book Session with Dr. Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Schedule your therapy session')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithQueryClient(<BookingModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Book Session with Dr. Jane Smith')).not.toBeInTheDocument();
  });

  it('does not render when no therapist is provided', () => {
    renderWithQueryClient(<BookingModal {...defaultProps} therapist={null} />);
    
    expect(screen.queryByText('Book Session with')).not.toBeInTheDocument();
  });

  it('displays therapist information correctly', () => {
    renderWithQueryClient(<BookingModal {...defaultProps} />);
    
    expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Anxiety, Depression')).toBeInTheDocument();
    expect(screen.getByText('$120/hour')).toBeInTheDocument();
  });

  it('has all required form fields', () => {
    renderWithQueryClient(<BookingModal {...defaultProps} />);
    
    expect(screen.getByLabelText(/meeting type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/session notes/i)).toBeInTheDocument();
  });

  it('allows selecting meeting type', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<BookingModal {...defaultProps} />);
    
    const meetingTypeSelect = screen.getByLabelText(/meeting type/i);
    await user.click(meetingTypeSelect);
    
    await waitFor(() => {
      expect(screen.getByText('Video Call')).toBeInTheDocument();
      expect(screen.getByText('Phone Call')).toBeInTheDocument();
      expect(screen.getByText('In-Person')).toBeInTheDocument();
    });
  });

  it('allows selecting session duration', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<BookingModal {...defaultProps} />);
    
    const durationSelect = screen.getByLabelText(/duration/i);
    await user.click(durationSelect);
    
    await waitFor(() => {
      expect(screen.getByText('30 minutes')).toBeInTheDocument();
      expect(screen.getByText('45 minutes')).toBeInTheDocument();
      expect(screen.getByText('60 minutes')).toBeInTheDocument();
    });
  });

  it('allows entering session notes', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<BookingModal {...defaultProps} />);
    
    const notesTextarea = screen.getByLabelText(/session notes/i);
    await user.type(notesTextarea, 'This is my first session with anxiety management.');
    
    expect(notesTextarea).toHaveValue('This is my first session with anxiety management.');
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    
    renderWithQueryClient(<BookingModal {...defaultProps} onClose={onClose} />);
    
    // Click the X button in the dialog header
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when fetching available slots', () => {
    renderWithQueryClient(<BookingModal {...defaultProps} />);
    
    // Should show loading indicator while fetching slots
    expect(screen.getByText(/loading available times/i)).toBeInTheDocument();
  });

  it('displays calendar for date selection', async () => {
    renderWithQueryClient(<BookingModal {...defaultProps} />);
    
    await waitFor(() => {
      // Calendar should be visible
      const calendar = screen.getByRole('grid');
      expect(calendar).toBeInTheDocument();
    });
  });

  it('validates required fields before submission', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<BookingModal {...defaultProps} />);
    
    // Try to book without selecting required fields
    const bookButton = screen.getByRole('button', { name: /book session/i });
    await user.click(bookButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/please select a meeting type/i)).toBeInTheDocument();
    });
  });

  it('shows success message after successful booking', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    
    renderWithQueryClient(<BookingModal {...defaultProps} onSuccess={onSuccess} />);
    
    // Fill in required fields
    const meetingTypeSelect = screen.getByLabelText(/meeting type/i);
    await user.click(meetingTypeSelect);
    await user.click(screen.getByText('Video Call'));
    
    const durationSelect = screen.getByLabelText(/duration/i);
    await user.click(durationSelect);
    await user.click(screen.getByText('60 minutes'));
    
    // Wait for slots to load and select a time
    await waitFor(() => {
      const timeSlot = screen.getByText('10:00 AM');
      user.click(timeSlot);
    });
    
    // Book the session
    const bookButton = screen.getByRole('button', { name: /book session/i });
    await user.click(bookButton);
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('handles booking errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock API to return error
    jest.mocked(require('@/lib/api').useApi).mockReturnValue({
      booking: {
        getAvailableSlots: jest.fn(() => Promise.reject(new Error('Failed to fetch slots'))),
        createMeeting: jest.fn(() => Promise.reject(new Error('Booking failed')))
      }
    });
    
    renderWithQueryClient(<BookingModal {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load available times/i)).toBeInTheDocument();
    });
  });

  it('displays pricing information', () => {
    renderWithQueryClient(<BookingModal {...defaultProps} />);
    
    expect(screen.getByText('$120/hour')).toBeInTheDocument();
  });

  it('shows different icons for different meeting types', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<BookingModal {...defaultProps} />);
    
    const meetingTypeSelect = screen.getByLabelText(/meeting type/i);
    await user.click(meetingTypeSelect);
    
    await waitFor(() => {
      // Video call should have video icon
      const videoOption = screen.getByText('Video Call').closest('[role="option"]');
      expect(videoOption).toBeInTheDocument();
      
      // Phone call should have phone icon  
      const phoneOption = screen.getByText('Phone Call').closest('[role="option"]');
      expect(phoneOption).toBeInTheDocument();
    });
  });
});