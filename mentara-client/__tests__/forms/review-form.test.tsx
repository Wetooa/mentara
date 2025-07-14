import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/__tests__/setup/form-test-utils'
import { zodTestUtils } from '@/__tests__/setup/zod-test-utils'
import { reviewFormMockData } from '@/__tests__/setup/form-mocks'
import ReviewForm from '@/components/reviews/ReviewForm'
import { z } from 'zod'

// Mock dependencies
jest.mock('@/hooks/useReviews', () => ({
  useCreateReview: () => ({
    mutate: jest.fn(),
    isLoading: false,
  }),
}))

const reviewFormSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review must be less than 1000 characters'),
  isAnonymous: z.boolean().default(false),
})

const mockTherapist = {
  id: 'therapist-123',
  name: 'Dr. John Smith',
  avatar: '/avatar.jpg',
  specialty: 'Clinical Psychology',
  rating: 4.5,
  reviewCount: 25,
}

const mockProps = {
  therapist: mockTherapist,
  meetingId: 'meeting-123',
  isOpen: true,
  onClose: jest.fn(),
  onSuccess: jest.fn(),
}

describe('Review Form', () => {
  describe('Zod Schema Validation', () => {
    it('validates valid review data', () => {
      zodTestUtils.testValidData(reviewFormSchema, reviewFormMockData.valid)
    })

    it('validates invalid review data', () => {
      zodTestUtils.testInvalidData(reviewFormSchema, reviewFormMockData.invalid, [
        'Please select a rating',
        'Title is required',
        'Review must be at least 10 characters',
      ])
    })

    it('validates rating range', () => {
      zodTestUtils.testNumberValidation(
        reviewFormSchema,
        'rating',
        5,
        0,
        reviewFormMockData.valid
      )
      
      zodTestUtils.testNumberValidation(
        reviewFormSchema,
        'rating',
        1,
        6,
        reviewFormMockData.valid
      )
    })

    it('validates title length', () => {
      zodTestUtils.testStringLength(
        reviewFormSchema,
        'title',
        1,
        100,
        reviewFormMockData.valid
      )
    })

    it('validates content length', () => {
      zodTestUtils.testStringLength(
        reviewFormSchema,
        'content',
        10,
        1000,
        reviewFormMockData.valid
      )
    })

    it('validates boolean fields', () => {
      const testData = { ...reviewFormMockData.valid }
      
      testData.isAnonymous = true
      zodTestUtils.testValidData(reviewFormSchema, testData)
      
      testData.isAnonymous = false
      zodTestUtils.testValidData(reviewFormSchema, testData)
    })
  })

  describe('Component Integration', () => {
    it('renders the review form when open', () => {
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      expect(screen.getByText('Write a Review')).toBeInTheDocument()
      expect(screen.getByText('Dr. John Smith')).toBeInTheDocument()
      expect(screen.getByText('Clinical Psychology')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      renderWithQueryClient(<ReviewForm {...mockProps} isOpen={false} />)
      
      expect(screen.queryByText('Write a Review')).not.toBeInTheDocument()
    })

    it('displays all form fields', () => {
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      // Check for rating stars
      expect(screen.getAllByRole('button', { name: /star/i })).toHaveLength(5)
      
      // Check for form fields
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/review/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/anonymous/i)).toBeInTheDocument()
      
      // Check for submit button
      expect(screen.getByRole('button', { name: /submit review/i })).toBeInTheDocument()
    })

    it('has proper form structure', () => {
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      // Check for dialog structure
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit review/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })
  })

  describe('Rating Interaction', () => {
    it('allows selecting rating stars', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const stars = screen.getAllByRole('button', { name: /star/i })
      
      // Click on 4th star
      await user.click(stars[3])
      
      // First 4 stars should be filled
      expect(stars[0]).toHaveClass('fill-yellow-400')
      expect(stars[1]).toHaveClass('fill-yellow-400')
      expect(stars[2]).toHaveClass('fill-yellow-400')
      expect(stars[3]).toHaveClass('fill-yellow-400')
      expect(stars[4]).toHaveClass('fill-gray-300')
    })

    it('shows hover effects on stars', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const stars = screen.getAllByRole('button', { name: /star/i })
      
      // Hover over 3rd star
      await user.hover(stars[2])
      
      // First 3 stars should be highlighted
      expect(stars[0]).toHaveClass('fill-yellow-400')
      expect(stars[1]).toHaveClass('fill-yellow-400')
      expect(stars[2]).toHaveClass('fill-yellow-400')
      expect(stars[3]).toHaveClass('fill-gray-300')
      expect(stars[4]).toHaveClass('fill-gray-300')
    })

    it('resets hover state on mouse leave', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const stars = screen.getAllByRole('button', { name: /star/i })
      
      // Hover over 3rd star then unhover
      await user.hover(stars[2])
      await user.unhover(stars[2])
      
      // All stars should be back to default state
      stars.forEach(star => {
        expect(star).toHaveClass('fill-gray-300')
      })
    })
  })

  describe('Form Validation', () => {
    it('shows validation errors for empty fields', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please select a rating')).toBeInTheDocument()
        expect(screen.getByText('Title is required')).toBeInTheDocument()
        expect(screen.getByText('Review must be at least 10 characters')).toBeInTheDocument()
      })
    })

    it('validates title length', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'a'.repeat(101))
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Title must be less than 100 characters')).toBeInTheDocument()
      })
    })

    it('validates content length', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const contentInput = screen.getByLabelText(/review/i)
      await user.type(contentInput, 'Short')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Review must be at least 10 characters')).toBeInTheDocument()
      })
    })

    it('validates content maximum length', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const contentInput = screen.getByLabelText(/review/i)
      await user.type(contentInput, 'a'.repeat(1001))
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Review must be less than 1000 characters')).toBeInTheDocument()
      })
    })

    it('validates rating selection', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please select a rating')).toBeInTheDocument()
      })
    })

    it('clears validation errors when valid input is entered', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const titleInput = screen.getByLabelText(/title/i)
      const contentInput = screen.getByLabelText(/review/i)
      const stars = screen.getAllByRole('button', { name: /star/i })
      
      // Submit to trigger validation errors
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please select a rating')).toBeInTheDocument()
        expect(screen.getByText('Title is required')).toBeInTheDocument()
        expect(screen.getByText('Review must be at least 10 characters')).toBeInTheDocument()
      })
      
      // Enter valid data
      await user.click(stars[4]) // 5 stars
      await user.type(titleInput, 'Great therapist')
      await user.type(contentInput, 'This therapist was very helpful and professional.')
      
      await waitFor(() => {
        expect(screen.queryByText('Please select a rating')).not.toBeInTheDocument()
        expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
        expect(screen.queryByText('Review must be at least 10 characters')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Interaction', () => {
    it('allows filling all form fields', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const { valid } = reviewFormMockData
      
      const titleInput = screen.getByLabelText(/title/i)
      const contentInput = screen.getByLabelText(/review/i)
      const anonymousCheckbox = screen.getByLabelText(/anonymous/i)
      const stars = screen.getAllByRole('button', { name: /star/i })
      
      // Select rating
      await user.click(stars[valid.rating - 1])
      
      // Fill text fields
      await user.type(titleInput, valid.title)
      await user.type(contentInput, valid.content)
      
      // Toggle anonymous
      if (valid.isAnonymous) {
        await user.click(anonymousCheckbox)
      }
      
      expect(titleInput).toHaveValue(valid.title)
      expect(contentInput).toHaveValue(valid.content)
      expect(anonymousCheckbox).toBeChecked()
    })

    it('shows character count for content', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const contentInput = screen.getByLabelText(/review/i)
      await user.type(contentInput, 'Test content')
      
      expect(screen.getByText('12/1000')).toBeInTheDocument()
    })

    it('toggles anonymous checkbox', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const anonymousCheckbox = screen.getByLabelText(/anonymous/i)
      
      // Initially unchecked
      expect(anonymousCheckbox).not.toBeChecked()
      
      // Click to check
      await user.click(anonymousCheckbox)
      expect(anonymousCheckbox).toBeChecked()
      
      // Click to uncheck
      await user.click(anonymousCheckbox)
      expect(anonymousCheckbox).not.toBeChecked()
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const mockCreateReview = jest.fn()
      
      jest.doMock('@/hooks/useReviews', () => ({
        useCreateReview: () => ({
          mutate: mockCreateReview,
          isLoading: false,
        }),
      }))
      
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const { valid } = reviewFormMockData
      
      const titleInput = screen.getByLabelText(/title/i)
      const contentInput = screen.getByLabelText(/review/i)
      const stars = screen.getAllByRole('button', { name: /star/i })
      
      // Fill form
      await user.click(stars[valid.rating - 1])
      await user.type(titleInput, valid.title)
      await user.type(contentInput, valid.content)
      
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockCreateReview).toHaveBeenCalledWith({
          therapistId: mockTherapist.id,
          meetingId: mockProps.meetingId,
          ...valid,
        })
      })
    })

    it('prevents submission with invalid data', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const { invalid } = reviewFormMockData
      
      const titleInput = screen.getByLabelText(/title/i)
      const contentInput = screen.getByLabelText(/review/i)
      
      // Fill with invalid data
      await user.type(titleInput, invalid.title)
      await user.type(contentInput, invalid.content)
      
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please select a rating')).toBeInTheDocument()
        expect(screen.getByText('Title is required')).toBeInTheDocument()
        expect(screen.getByText('Review must be at least 10 characters')).toBeInTheDocument()
      })
    })

    it('shows loading state during submission', async () => {
      jest.doMock('@/hooks/useReviews', () => ({
        useCreateReview: () => ({
          mutate: jest.fn(),
          isLoading: true,
        }),
      }))
      
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/submitting/i)).toBeInTheDocument()
    })

    it('calls onSuccess after successful submission', async () => {
      const mockCreateReview = jest.fn((data, options) => {
        options.onSuccess()
      })
      
      jest.doMock('@/hooks/useReviews', () => ({
        useCreateReview: () => ({
          mutate: mockCreateReview,
          isLoading: false,
        }),
      }))
      
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const { valid } = reviewFormMockData
      
      const titleInput = screen.getByLabelText(/title/i)
      const contentInput = screen.getByLabelText(/review/i)
      const stars = screen.getAllByRole('button', { name: /star/i })
      
      // Fill form
      await user.click(stars[valid.rating - 1])
      await user.type(titleInput, valid.title)
      await user.type(contentInput, valid.content)
      
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockProps.onSuccess).toHaveBeenCalled()
      })
    })
  })

  describe('Dialog Interaction', () => {
    it('closes dialog when cancel button is clicked', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)
      
      expect(mockProps.onClose).toHaveBeenCalled()
    })

    it('closes dialog when clicking outside', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const dialog = screen.getByRole('dialog')
      await user.click(dialog)
      
      expect(mockProps.onClose).toHaveBeenCalled()
    })

    it('closes dialog with Escape key', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      await user.keyboard('{Escape}')
      
      expect(mockProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      // Check for dialog role
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('aria-labelledby')
      
      // Check for proper input labels
      expect(screen.getByLabelText(/title/i)).toHaveAccessibleName()
      expect(screen.getByLabelText(/review/i)).toHaveAccessibleName()
      expect(screen.getByLabelText(/anonymous/i)).toHaveAccessibleName()
    })

    it('announces validation errors to screen readers', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      // Tab through form elements
      await user.tab()
      expect(document.activeElement).toBe(screen.getAllByRole('button', { name: /star/i })[0])
      
      await user.tab()
      expect(document.activeElement).toBe(screen.getByLabelText(/title/i))
      
      await user.tab()
      expect(document.activeElement).toBe(screen.getByLabelText(/review/i))
    })

    it('allows rating selection with keyboard', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<ReviewForm {...mockProps} />)
      
      const stars = screen.getAllByRole('button', { name: /star/i })
      
      // Focus first star and press Enter
      stars[0].focus()
      await user.keyboard('{Enter}')
      
      // First star should be selected
      expect(stars[0]).toHaveClass('fill-yellow-400')
    })
  })
})