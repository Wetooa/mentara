import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/__tests__/setup/form-test-utils'
import { zodTestUtils } from '@/__tests__/setup/zod-test-utils'
import { bookingMockData } from '@/__tests__/setup/form-mocks'
import { SessionSchedulingModal } from '@/components/therapist/patient/SessionSchedulingModal'
import { z } from 'zod'

// Mock dependencies
jest.mock('@/hooks/useBooking', () => ({
  useCreateBooking: () => ({
    mutate: jest.fn(),
    isLoading: false,
  }),
  useAvailableSlots: () => ({
    data: [
      { start: '09:00', end: '10:00', available: true },
      { start: '10:00', end: '11:00', available: true },
      { start: '11:00', end: '12:00', available: false },
      { start: '14:00', end: '15:00', available: true },
      { start: '15:00', end: '16:00', available: true },
    ],
    isLoading: false,
  }),
}))

const sessionSchedulingSchema = z.object({
  date: z.string().min(1, 'Please select a date'),
  timeSlot: z.object({
    start: z.string().min(1, 'Please select a time slot'),
    end: z.string().min(1, 'Please select a time slot'),
    available: z.boolean(),
  }),
  notes: z.string().optional(),
  sessionType: z.enum(['individual', 'group', 'family']),
  duration: z.number().min(30, 'Minimum session duration is 30 minutes').max(120, 'Maximum session duration is 120 minutes'),
})

const mockPatient = {
  id: 'patient-123',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: '/avatar.jpg',
  status: 'active',
  nextSession: '2024-01-15T10:00:00Z',
  totalSessions: 5,
  progressScore: 75,
}

const mockProps = {
  patient: mockPatient,
  isOpen: true,
  onClose: jest.fn(),
  onSuccess: jest.fn(),
}

describe('Session Scheduling Modal', () => {
  describe('Zod Schema Validation', () => {
    it('validates valid booking data', () => {
      zodTestUtils.testValidData(sessionSchedulingSchema, bookingMockData.valid)
    })

    it('validates invalid booking data', () => {
      zodTestUtils.testInvalidData(sessionSchedulingSchema, bookingMockData.invalid, [
        'Please select a date',
        'Please select a time slot',
      ])
    })

    it('validates session type enum', () => {
      const validTypes = ['individual', 'group', 'family']
      
      zodTestUtils.testEnumValidation(
        sessionSchedulingSchema,
        'sessionType',
        validTypes,
        'invalid-type',
        bookingMockData.valid
      )
    })

    it('validates duration range', () => {
      zodTestUtils.testNumberValidation(
        sessionSchedulingSchema,
        'duration',
        50,
        29,
        bookingMockData.valid
      )
      
      zodTestUtils.testNumberValidation(
        sessionSchedulingSchema,
        'duration',
        90,
        121,
        bookingMockData.valid
      )
    })

    it('validates required date field', () => {
      zodTestUtils.testRequiredField(
        sessionSchedulingSchema,
        'date',
        bookingMockData.valid
      )
    })

    it('validates time slot object', () => {
      const validTimeSlot = {
        start: '10:00',
        end: '11:00',
        available: true,
      }
      
      const invalidTimeSlot = {
        start: '',
        end: '',
        available: false,
      }
      
      zodTestUtils.testFieldValidation(
        sessionSchedulingSchema,
        'timeSlot',
        validTimeSlot,
        invalidTimeSlot,
        'Please select a time slot'
      )
    })
  })

  describe('Component Integration', () => {
    it('renders the scheduling modal when open', () => {
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      expect(screen.getByText('Schedule Session')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('patient-123')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} isOpen={false} />)
      
      expect(screen.queryByText('Schedule Session')).not.toBeInTheDocument()
    })

    it('displays all form fields', () => {
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      // Check for form fields
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
      expect(screen.getByText(/available slots/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/session type/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/duration/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
      
      // Check for submit button
      expect(screen.getByRole('button', { name: /schedule session/i })).toBeInTheDocument()
    })

    it('displays available time slots', () => {
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      // Check for available time slots
      expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument()
      expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument()
      expect(screen.getByText('14:00 - 15:00')).toBeInTheDocument()
      expect(screen.getByText('15:00 - 16:00')).toBeInTheDocument()
      
      // Check that unavailable slot is marked as disabled
      const unavailableSlot = screen.getByText('11:00 - 12:00')
      expect(unavailableSlot.closest('button')).toBeDisabled()
    })

    it('has proper modal structure', () => {
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      // Check for modal structure
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /schedule session/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })
  })

  describe('Date Selection', () => {
    it('allows selecting a date', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      const dateInput = screen.getByLabelText(/date/i)
      await user.type(dateInput, '2024-01-15')
      
      expect(dateInput).toHaveValue('2024-01-15')
    })

    it('loads available slots when date is selected', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      const dateInput = screen.getByLabelText(/date/i)
      await user.type(dateInput, '2024-01-15')
      
      // Available slots should be displayed
      expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument()
      expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument()
    })

    it('prevents selecting past dates', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      const dateInput = screen.getByLabelText(/date/i)
      const pastDate = '2023-01-01'
      
      await user.type(dateInput, pastDate)
      
      // Should show validation error
      expect(screen.getByText(/cannot select past dates/i)).toBeInTheDocument()
    })
  })

  describe('Time Slot Selection', () => {
    it('allows selecting available time slots', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      // First select a date
      const dateInput = screen.getByLabelText(/date/i)
      await user.type(dateInput, '2024-01-15')
      
      // Then select a time slot
      const timeSlot = screen.getByText('09:00 - 10:00')
      await user.click(timeSlot)
      
      // Time slot should be selected
      expect(timeSlot.closest('button')).toHaveClass('selected')
    })

    it('prevents selecting unavailable time slots', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      const dateInput = screen.getByLabelText(/date/i)
      await user.type(dateInput, '2024-01-15')
      
      const unavailableSlot = screen.getByText('11:00 - 12:00')
      
      // Should not be clickable
      expect(unavailableSlot.closest('button')).toBeDisabled()
    })

    it('shows only one selected time slot at a time', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      const dateInput = screen.getByLabelText(/date/i)
      await user.type(dateInput, '2024-01-15')
      
      const slot1 = screen.getByText('09:00 - 10:00')
      const slot2 = screen.getByText('10:00 - 11:00')
      
      // Select first slot
      await user.click(slot1)
      expect(slot1.closest('button')).toHaveClass('selected')
      
      // Select second slot
      await user.click(slot2)
      expect(slot2.closest('button')).toHaveClass('selected')
      expect(slot1.closest('button')).not.toHaveClass('selected')
    })
  })

  describe('Session Configuration', () => {
    it('allows selecting session type', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      const sessionTypeSelect = screen.getByLabelText(/session type/i)
      await user.click(sessionTypeSelect)
      
      // Select individual session
      const individualOption = screen.getByText('Individual')
      await user.click(individualOption)
      
      expect(sessionTypeSelect).toHaveValue('individual')
    })

    it('allows setting session duration', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      const durationInput = screen.getByLabelText(/duration/i)
      await user.clear(durationInput)
      await user.type(durationInput, '60')
      
      expect(durationInput).toHaveValue('60')
    })

    it('allows adding session notes', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      const { valid } = bookingMockData
      
      const notesInput = screen.getByLabelText(/notes/i)
      await user.type(notesInput, valid.notes)
      
      expect(notesInput).toHaveValue(valid.notes)
    })
  })

  describe('Form Validation', () => {
    it('shows validation errors for required fields', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      const scheduleButton = screen.getByRole('button', { name: /schedule session/i })
      await user.click(scheduleButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please select a date')).toBeInTheDocument()
        expect(screen.getByText('Please select a time slot')).toBeInTheDocument()
        expect(screen.getByText('Please select a session type')).toBeInTheDocument()
      })
    })

    it('validates session duration range', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      const durationInput = screen.getByLabelText(/duration/i)
      
      // Test minimum duration
      await user.clear(durationInput)
      await user.type(durationInput, '25')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Minimum session duration is 30 minutes')).toBeInTheDocument()
      })
      
      // Test maximum duration
      await user.clear(durationInput)
      await user.type(durationInput, '125')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Maximum session duration is 120 minutes')).toBeInTheDocument()
      })
    })

    it('clears validation errors when valid input is entered', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      // Submit to trigger validation errors
      const scheduleButton = screen.getByRole('button', { name: /schedule session/i })
      await user.click(scheduleButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please select a date')).toBeInTheDocument()
      })
      
      // Enter valid date
      const dateInput = screen.getByLabelText(/date/i)
      await user.type(dateInput, '2024-01-15')
      
      await waitFor(() => {
        expect(screen.queryByText('Please select a date')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const mockCreateBooking = jest.fn()
      
      jest.doMock('@/hooks/useBooking', () => ({
        useCreateBooking: () => ({
          mutate: mockCreateBooking,
          isLoading: false,
        }),
        useAvailableSlots: () => ({
          data: [
            { start: '09:00', end: '10:00', available: true },
            { start: '10:00', end: '11:00', available: true },
          ],
          isLoading: false,
        }),
      }))
      
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      const { valid } = bookingMockData
      
      // Fill form
      const dateInput = screen.getByLabelText(/date/i)
      await user.type(dateInput, valid.date)
      
      const timeSlot = screen.getByText('09:00 - 10:00')
      await user.click(timeSlot)
      
      const sessionTypeSelect = screen.getByLabelText(/session type/i)
      await user.click(sessionTypeSelect)
      await user.click(screen.getByText('Individual'))
      
      const durationInput = screen.getByLabelText(/duration/i)
      await user.clear(durationInput)
      await user.type(durationInput, String(valid.duration))
      
      const notesInput = screen.getByLabelText(/notes/i)
      await user.type(notesInput, valid.notes)
      
      const scheduleButton = screen.getByRole('button', { name: /schedule session/i })
      await user.click(scheduleButton)
      
      await waitFor(() => {
        expect(mockCreateBooking).toHaveBeenCalledWith({
          patientId: mockPatient.id,
          date: valid.date,
          timeSlot: valid.timeSlot,
          sessionType: valid.sessionType,
          duration: valid.duration,
          notes: valid.notes,
        })
      })
    })

    it('prevents submission with invalid data', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      const { invalid } = bookingMockData
      
      // Fill with invalid data
      const durationInput = screen.getByLabelText(/duration/i)
      await user.clear(durationInput)
      await user.type(durationInput, String(invalid.duration))
      
      const scheduleButton = screen.getByRole('button', { name: /schedule session/i })
      await user.click(scheduleButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please select a date')).toBeInTheDocument()
        expect(screen.getByText('Please select a time slot')).toBeInTheDocument()
        expect(screen.getByText('Minimum session duration is 30 minutes')).toBeInTheDocument()
      })
    })

    it('shows loading state during submission', async () => {
      jest.doMock('@/hooks/useBooking', () => ({
        useCreateBooking: () => ({
          mutate: jest.fn(),
          isLoading: true,
        }),
        useAvailableSlots: () => ({
          data: [],
          isLoading: false,
        }),
      }))
      
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      const scheduleButton = screen.getByRole('button', { name: /schedule session/i })
      expect(scheduleButton).toBeDisabled()
      expect(screen.getByText(/scheduling/i)).toBeInTheDocument()
    })

    it('calls onSuccess after successful submission', async () => {
      const mockCreateBooking = jest.fn((data, options) => {
        options.onSuccess()
      })
      
      jest.doMock('@/hooks/useBooking', () => ({
        useCreateBooking: () => ({
          mutate: mockCreateBooking,
          isLoading: false,
        }),
        useAvailableSlots: () => ({
          data: [
            { start: '09:00', end: '10:00', available: true },
          ],
          isLoading: false,
        }),
      }))
      
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      // Fill minimum required fields
      const dateInput = screen.getByLabelText(/date/i)
      await user.type(dateInput, '2024-01-15')
      
      const timeSlot = screen.getByText('09:00 - 10:00')
      await user.click(timeSlot)
      
      const sessionTypeSelect = screen.getByLabelText(/session type/i)
      await user.click(sessionTypeSelect)
      await user.click(screen.getByText('Individual'))
      
      const scheduleButton = screen.getByRole('button', { name: /schedule session/i })
      await user.click(scheduleButton)
      
      await waitFor(() => {
        expect(mockProps.onSuccess).toHaveBeenCalled()
      })
    })
  })

  describe('Modal Interaction', () => {
    it('closes modal when cancel button is clicked', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)
      
      expect(mockProps.onClose).toHaveBeenCalled()
    })

    it('closes modal with Escape key', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      await user.keyboard('{Escape}')
      
      expect(mockProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Loading States', () => {
    it('shows loading state while fetching available slots', () => {
      jest.doMock('@/hooks/useBooking', () => ({
        useCreateBooking: () => ({
          mutate: jest.fn(),
          isLoading: false,
        }),
        useAvailableSlots: () => ({
          data: [],
          isLoading: true,
        }),
      }))
      
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      expect(screen.getByText(/loading available slots/i)).toBeInTheDocument()
    })

    it('shows empty state when no slots are available', () => {
      jest.doMock('@/hooks/useBooking', () => ({
        useCreateBooking: () => ({
          mutate: jest.fn(),
          isLoading: false,
        }),
        useAvailableSlots: () => ({
          data: [],
          isLoading: false,
        }),
      }))
      
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      expect(screen.getByText(/no available slots/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      // Check for dialog role
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('aria-labelledby')
      
      // Check for proper input labels
      expect(screen.getByLabelText(/date/i)).toHaveAccessibleName()
      expect(screen.getByLabelText(/session type/i)).toHaveAccessibleName()
      expect(screen.getByLabelText(/duration/i)).toHaveAccessibleName()
      expect(screen.getByLabelText(/notes/i)).toHaveAccessibleName()
    })

    it('announces validation errors to screen readers', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      const scheduleButton = screen.getByRole('button', { name: /schedule session/i })
      await user.click(scheduleButton)
      
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SessionSchedulingModal {...mockProps} />)
      
      // Tab through form elements
      await user.tab()
      expect(document.activeElement).toBe(screen.getByLabelText(/date/i))
      
      await user.tab()
      expect(document.activeElement).toBe(screen.getByLabelText(/session type/i))
      
      await user.tab()
      expect(document.activeElement).toBe(screen.getByLabelText(/duration/i))
    })
  })
})