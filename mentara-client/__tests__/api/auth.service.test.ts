import { createAuthService } from '@/lib/api/services/auth'
import { createMockAxiosInstance } from '@/__tests__/setup/api-mocks'

describe('AuthService', () => {
  let mockAxios: any
  let authService: any

  beforeEach(() => {
    mockAxios = createMockAxiosInstance()
    authService = createAuthService(mockAxios)
    jest.clearAllMocks()
  })

  describe('registerClient', () => {
    it('calls correct endpoint with client data', async () => {
      const clientData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '555-1234',
      }

      const expectedResponse = {
        id: 'user-123',
        ...clientData,
        role: 'client',
      }

      mockAxios.post.mockResolvedValue(expectedResponse)

      const result = await authService.registerClient(clientData)

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/register/client', clientData)
      expect(result).toEqual(expectedResponse)
    })

    it('handles registration errors', async () => {
      const clientData = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
      const error = new Error('Email already exists')

      mockAxios.post.mockRejectedValue(error)

      await expect(authService.registerClient(clientData)).rejects.toThrow('Email already exists')
    })
  })

  describe('registerTherapist', () => {
    it('calls correct endpoint with therapist data', async () => {
      const therapistData = {
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com',
        licenseNumber: 'LIC123456',
        specialties: ['anxiety', 'depression'],
      }

      const expectedResponse = {
        id: 'therapist-123',
        ...therapistData,
        role: 'therapist',
      }

      mockAxios.post.mockResolvedValue(expectedResponse)

      const result = await authService.registerTherapist(therapistData)

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/register/therapist', therapistData)
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('getCurrentUser', () => {
    it('fetches current user data', async () => {
      const expectedUser = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'client',
      }

      mockAxios.get.mockResolvedValue(expectedUser)

      const result = await authService.getCurrentUser()

      expect(mockAxios.get).toHaveBeenCalledWith('/auth/me')
      expect(result).toEqual(expectedUser)
    })

    it('handles unauthorized requests', async () => {
      const error = new Error('Unauthorized')
      error.response = { status: 401 }

      mockAxios.get.mockRejectedValue(error)

      await expect(authService.getCurrentUser()).rejects.toThrow('Unauthorized')
    })
  })

  describe('getAllUsers', () => {
    it('fetches all users (admin only)', async () => {
      const expectedUsers = [
        { id: 'user-1', firstName: 'John', role: 'client' },
        { id: 'user-2', firstName: 'Jane', role: 'therapist' },
      ]

      mockAxios.get.mockResolvedValue(expectedUsers)

      const result = await authService.getAllUsers()

      expect(mockAxios.get).toHaveBeenCalledWith('/auth/users')
      expect(result).toEqual(expectedUsers)
    })
  })

  describe('forceLogout', () => {
    it('forces user logout', async () => {
      const expectedResponse = { success: true }

      mockAxios.post.mockResolvedValue(expectedResponse)

      const result = await authService.forceLogout()

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/force-logout')
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('submitPreAssessment', () => {
    it('submits pre-assessment data', async () => {
      const assessmentData = {
        responses: [1, 2, 3, 4, 5],
        completedAt: new Date().toISOString(),
      }

      const expectedResponse = {
        success: true,
        message: 'Assessment submitted successfully',
      }

      mockAxios.post.mockResolvedValue(expectedResponse)

      const result = await authService.submitPreAssessment(assessmentData)

      expect(mockAxios.post).toHaveBeenCalledWith('/pre-assessment/submit', assessmentData)
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('assignCommunities', () => {
    it('assigns user to communities', async () => {
      const expectedResponse = {
        assignedCommunities: ['anxiety-support', 'depression-help'],
        success: true,
      }

      mockAxios.post.mockResolvedValue(expectedResponse)

      const result = await authService.assignCommunities()

      expect(mockAxios.post).toHaveBeenCalledWith('/communities/assign-user')
      expect(result).toEqual(expectedResponse)
    })
  })
})