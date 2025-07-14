import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/setup'
import userEvent from '@testing-library/user-event'
import { TherapistCard } from '@/components/therapist/listing/TherapistCard'
import { createMockTherapist } from '@/__tests__/setup/test-utils'

describe('TherapistCard Component', () => {
  const mockTherapist = createMockTherapist({
    id: 'therapist-1',
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    bio: 'Experienced therapist specializing in anxiety and depression.',
    specialties: ['Anxiety', 'Depression', 'Cognitive Behavioral Therapy'],
    hourlyRate: 150,
    rating: 4.8,
    reviewCount: 25,
    imageUrl: '/images/therapist-1.jpg',
  })

  const mockOnSelect = jest.fn()
  const mockOnFavorite = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders therapist information correctly', () => {
    render(
      <TherapistCard
        therapist={mockTherapist}
        onSelect={mockOnSelect}
        onFavorite={mockOnFavorite}
      />
    )

    expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText(/experienced therapist/i)).toBeInTheDocument()
    expect(screen.getByText('$150')).toBeInTheDocument()
    expect(screen.getByText('4.8')).toBeInTheDocument()
    expect(screen.getByText('(25 reviews)')).toBeInTheDocument()
  })

  it('displays specialties correctly', () => {
    render(
      <TherapistCard
        therapist={mockTherapist}
        onSelect={mockOnSelect}
        onFavorite={mockOnFavorite}
      />
    )

    expect(screen.getByText('Anxiety')).toBeInTheDocument()
    expect(screen.getByText('Depression')).toBeInTheDocument()
    expect(screen.getByText('Cognitive Behavioral Therapy')).toBeInTheDocument()
  })

  it('calls onSelect when card is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TherapistCard
        therapist={mockTherapist}
        onSelect={mockOnSelect}
        onFavorite={mockOnFavorite}
      />
    )

    const card = screen.getByRole('button', { name: /view profile/i })
    await user.click(card)

    expect(mockOnSelect).toHaveBeenCalledWith(mockTherapist)
  })

  it('calls onFavorite when favorite button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TherapistCard
        therapist={mockTherapist}
        onSelect={mockOnSelect}
        onFavorite={mockOnFavorite}
      />
    )

    const favoriteButton = screen.getByRole('button', { name: /add to favorites/i })
    await user.click(favoriteButton)

    expect(mockOnFavorite).toHaveBeenCalledWith(mockTherapist.id)
  })

  it('shows favorite state when therapist is favorited', () => {
    render(
      <TherapistCard
        therapist={{ ...mockTherapist, isFavorited: true }}
        onSelect={mockOnSelect}
        onFavorite={mockOnFavorite}
      />
    )

    expect(screen.getByRole('button', { name: /remove from favorites/i })).toBeInTheDocument()
  })

  it('handles missing image gracefully', () => {
    const therapistWithoutImage = createMockTherapist({
      ...mockTherapist,
      imageUrl: undefined,
    })

    render(
      <TherapistCard
        therapist={therapistWithoutImage}
        onSelect={mockOnSelect}
        onFavorite={mockOnFavorite}
      />
    )

    // Should show placeholder or initials
    expect(screen.getByText('SJ')).toBeInTheDocument() // Initials fallback
  })

  it('displays availability status', () => {
    const availableTherapist = createMockTherapist({
      ...mockTherapist,
      isAvailable: true,
    })

    render(
      <TherapistCard
        therapist={availableTherapist}
        onSelect={mockOnSelect}
        onFavorite={mockOnFavorite}
      />
    )

    expect(screen.getByText(/available/i)).toBeInTheDocument()
  })

  it('handles unavailable therapists', () => {
    const unavailableTherapist = createMockTherapist({
      ...mockTherapist,
      isAvailable: false,
    })

    render(
      <TherapistCard
        therapist={unavailableTherapist}
        onSelect={mockOnSelect}
        onFavorite={mockOnFavorite}
      />
    )

    expect(screen.getByText(/not available/i)).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <TherapistCard
        therapist={mockTherapist}
        onSelect={mockOnSelect}
        onFavorite={mockOnFavorite}
      />
    )

    // Main card should be accessible
    const card = screen.getByRole('button', { name: /view profile/i })
    expect(card).toHaveAttribute('aria-label')

    // Favorite button should be accessible
    const favoriteButton = screen.getByRole('button', { name: /add to favorites/i })
    expect(favoriteButton).toHaveAttribute('aria-label')

    // Rating should have proper text
    expect(screen.getByText(/4\.8 out of 5 stars/i)).toBeInTheDocument()
  })

  it('prevents event bubbling on favorite button click', async () => {
    const user = userEvent.setup()
    
    render(
      <TherapistCard
        therapist={mockTherapist}
        onSelect={mockOnSelect}
        onFavorite={mockOnFavorite}
      />
    )

    const favoriteButton = screen.getByRole('button', { name: /add to favorites/i })
    await user.click(favoriteButton)

    expect(mockOnFavorite).toHaveBeenCalledWith(mockTherapist.id)
    expect(mockOnSelect).not.toHaveBeenCalled()
  })

  it('truncates long bio text', () => {
    const therapistWithLongBio = createMockTherapist({
      ...mockTherapist,
      bio: 'This is a very long bio that should be truncated when displayed in the card component to ensure proper layout and readability. This bio is intentionally long to test the truncation functionality.',
    })

    const { container } = render(
      <TherapistCard
        therapist={therapistWithLongBio}
        onSelect={mockOnSelect}
        onFavorite={mockOnFavorite}
      />
    )

    // Check if CSS classes for text truncation are applied
    const bioElement = container.querySelector('[data-testid="therapist-bio"]')
    expect(bioElement).toHaveClass('line-clamp-3') // Assuming Tailwind line-clamp is used
  })
})