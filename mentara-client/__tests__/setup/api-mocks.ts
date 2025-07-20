import axios from 'axios'
import { jest } from '@jest/globals'

// Type-safe mock for axios
const mockAxios = axios as jest.Mocked<typeof axios>

// Create a mock axios instance
export const createMockAxiosInstance = () => {
  const mockInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  } as any

  return mockInstance
}

// Mock API responses
export const mockApiResponses = {
  auth: {
    getCurrentUser: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'client',
    },
    registerClient: {
      id: 'new-user-id',
      firstName: 'New',
      lastName: 'User',
      email: 'new@example.com',
      role: 'client',
    },
  },
  dashboard: {
    getUserDashboard: {
      stats: {
        totalSessions: 5,
        upcomingSessions: 1,
        completedAssessments: 3,
        unreadMessages: 2,
      },
      upcomingAppointments: [
        {
          id: 'appt-1',
          therapistName: 'Dr. Smith',
          date: '2024-01-15',
          time: '10:00 AM',
        },
      ],
      recentActivity: [],
      notifications: [],
    },
    getTherapistDashboard: {
      stats: {
        totalClients: 15,
        upcomingSessions: 3,
        completedSessions: 45,
        pendingTasks: 2,
      },
      upcomingAppointments: [],
      recentActivity: [],
    },
  },
  therapists: {
    getRecommendations: {
      therapists: [
        {
          id: 'therapist-1',
          firstName: 'Dr. Sarah',
          lastName: 'Johnson',
          specialties: ['anxiety', 'depression'],
          hourlyRate: 150,
          rating: 4.8,
          reviewCount: 25,
        },
        {
          id: 'therapist-2',
          firstName: 'Dr. Michael',
          lastName: 'Chen',
          specialties: ['trauma', 'PTSD'],
          hourlyRate: 175,
          rating: 4.9,
          reviewCount: 18,
        },
      ],
      totalCount: 2,
      page: 1,
      totalPages: 1,
    },
  },
  booking: {
    meetings: {
      getMy: [
        {
          id: 'meeting-1',
          therapistId: 'therapist-1',
          clientId: 'test-user-id',
          scheduledAt: '2024-01-15T10:00:00Z',
          duration: 60,
          status: 'scheduled',
        },
      ],
    },
    availability: {
      getSlots: [
        {
          id: 'slot-1',
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T11:00:00Z',
          available: true,
        },
        {
          id: 'slot-2',
          startTime: '2024-01-15T14:00:00Z',
          endTime: '2024-01-15T15:00:00Z',
          available: true,
        },
      ],
    },
  },
}

// Helper functions to setup API mocks
export const setupAuthMocks = (mockApi: any) => {
  mockApi.auth.getCurrentUser.mockResolvedValue(mockApiResponses.auth.getCurrentUser)
  mockApi.auth.registerClient.mockResolvedValue(mockApiResponses.auth.registerClient)
  mockApi.auth.registerTherapist.mockResolvedValue({
    ...mockApiResponses.auth.registerClient,
    role: 'therapist',
  })
}

export const setupDashboardMocks = (mockApi: any) => {
  mockApi.dashboard.getUserDashboard.mockResolvedValue(mockApiResponses.dashboard.getUserDashboard)
  mockApi.dashboard.getTherapistDashboard.mockResolvedValue(mockApiResponses.dashboard.getTherapistDashboard)
  mockApi.dashboard.getAdminDashboard.mockResolvedValue({
    stats: { totalUsers: 100, totalTherapists: 25, totalSessions: 500 },
  })
}

export const setupTherapistMocks = (mockApi: any) => {
  mockApi.therapists = mockApi.therapists || {}
  mockApi.therapists.getRecommendations = jest.fn().mockResolvedValue(mockApiResponses.therapists.getRecommendations)
}

export const setupBookingMocks = (mockApi: any) => {
  mockApi.booking.meetings.getMy.mockResolvedValue(mockApiResponses.booking.meetings.getMy)
  mockApi.booking.meetings.getList.mockResolvedValue({
    meetings: mockApiResponses.booking.meetings.getMy,
    totalCount: 1,
    page: 1,
    totalPages: 1,
  })
  mockApi.booking.availability.getSlots.mockResolvedValue(mockApiResponses.booking.availability.getSlots)
}

// Error response helpers
export const createApiError = (status: number, message: string, details?: any) => {
  const error = new Error(message) as any
  error.response = {
    status,
    data: { message, details },
  }
  return error
}

export const createNetworkError = () => {
  const error = new Error('Network Error') as any
  error.code = 'NETWORK_ERROR'
  return error
}

// Reset all mocks
export const resetAllApiMocks = () => {
  jest.clearAllMocks()
}

export { mockAxios }