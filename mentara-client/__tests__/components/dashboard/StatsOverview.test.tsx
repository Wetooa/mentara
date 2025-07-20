import React from 'react'
import { render, screen, waitFor } from '@/__tests__/setup'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { useQuery } from '@tanstack/react-query'
import { createMockDashboardData } from '@/__tests__/setup/test-utils'

// Mock React Query
jest.mock('@tanstack/react-query')
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>

describe('StatsOverview Component', () => {
  const mockDashboardData = createMockDashboardData({
    stats: {
      totalSessions: 15,
      upcomingSessions: 3,
      completedAssessments: 8,
      unreadMessages: 5,
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any)

    render(<StatsOverview />)
    expect(screen.getByTestId('stats-loading')).toBeInTheDocument()
  })

  it('renders dashboard stats correctly', async () => {
    mockUseQuery.mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    render(<StatsOverview />)

    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument() // Total sessions
      expect(screen.getByText('3')).toBeInTheDocument()  // Upcoming sessions
      expect(screen.getByText('8')).toBeInTheDocument()  // Completed assessments
      expect(screen.getByText('5')).toBeInTheDocument()  // Unread messages
    })

    expect(screen.getByText(/total sessions/i)).toBeInTheDocument()
    expect(screen.getByText(/upcoming/i)).toBeInTheDocument()
    expect(screen.getByText(/assessments/i)).toBeInTheDocument()
    expect(screen.getByText(/messages/i)).toBeInTheDocument()
  })

  it('handles zero values correctly', async () => {
    const emptyStats = createMockDashboardData({
      stats: {
        totalSessions: 0,
        upcomingSessions: 0,
        completedAssessments: 0,
        unreadMessages: 0,
      },
    })

    mockUseQuery.mockReturnValue({
      data: emptyStats,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    render(<StatsOverview />)

    await waitFor(() => {
      const zeros = screen.getAllByText('0')
      expect(zeros).toHaveLength(4)
    })
  })

  it('renders error state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch dashboard data'),
    } as any)

    render(<StatsOverview />)
    expect(screen.getByText(/error loading stats/i)).toBeInTheDocument()
  })

  it('has proper accessibility attributes', async () => {
    mockUseQuery.mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    render(<StatsOverview />)

    await waitFor(() => {
      const statsSection = screen.getByRole('region', { name: /dashboard statistics/i })
      expect(statsSection).toBeInTheDocument()
    })

    // Check for proper heading structure
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('updates when data changes', async () => {
    const initialData = createMockDashboardData({
      stats: { totalSessions: 5, upcomingSessions: 1, completedAssessments: 2, unreadMessages: 1 },
    })

    const updatedData = createMockDashboardData({
      stats: { totalSessions: 10, upcomingSessions: 2, completedAssessments: 4, unreadMessages: 3 },
    })

    const { rerender } = render(<StatsOverview />)

    // Initial render
    mockUseQuery.mockReturnValue({
      data: initialData,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    rerender(<StatsOverview />)

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    // Updated render
    mockUseQuery.mockReturnValue({
      data: updatedData,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    rerender(<StatsOverview />)

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })
})