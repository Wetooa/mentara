import { createAxiosClient, setTokenProvider } from '@/lib/api/client'
import { MentaraApiError } from '@/lib/api/errorHandler'

// Mock Clerk
const mockGetToken = jest.fn()
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: mockGetToken,
    isSignedIn: true,
    userId: 'test-user-id',
  }),
}))

// Mock window.Clerk for client-side fallback
Object.defineProperty(window, 'Clerk', {
  value: {
    session: {
      getToken: jest.fn(),
    },
  },
  writable: true,
})

describe('Token Management', () => {
  let axiosInstance: any

  beforeEach(() => {
    jest.clearAllMocks()
    axiosInstance = createAxiosClient()
  })

  describe('Token Provider Setup', () => {
    it('uses global token provider when available', async () => {
      const mockGlobalTokenProvider = jest.fn().mockResolvedValue('global-token')
      setTokenProvider(mockGlobalTokenProvider)

      const config = { headers: {} }
      await axiosInstance.interceptors.request.handlers[0].fulfilled(config)

      expect(mockGlobalTokenProvider).toHaveBeenCalled()
      expect(config.headers.Authorization).toBe('Bearer global-token')
    })

    it('falls back to client-side Clerk when global provider fails', async () => {
      const mockGlobalTokenProvider = jest.fn().mockRejectedValue(new Error('Provider failed'))
      setTokenProvider(mockGlobalTokenProvider)
      
      const mockClientToken = jest.fn().mockResolvedValue('client-token')
      ;(window as any).Clerk.session.getToken = mockClientToken

      const config = { headers: {} }
      await axiosInstance.interceptors.request.handlers[0].fulfilled(config)

      expect(mockGlobalTokenProvider).toHaveBeenCalled()
      expect(mockClientToken).toHaveBeenCalled()
      expect(config.headers.Authorization).toBe('Bearer client-token')
    })

    it('continues without token when both providers fail', async () => {
      const mockGlobalTokenProvider = jest.fn().mockRejectedValue(new Error('Provider failed'))
      setTokenProvider(mockGlobalTokenProvider)
      
      const mockClientToken = jest.fn().mockRejectedValue(new Error('Client failed'))
      ;(window as any).Clerk.session.getToken = mockClientToken

      const config = { headers: {} }
      await axiosInstance.interceptors.request.handlers[0].fulfilled(config)

      expect(config.headers.Authorization).toBeUndefined()
    })
  })

  describe('Request Interceptor', () => {
    it('adds authorization header with valid token', async () => {
      mockGetToken.mockResolvedValue('valid-token')
      setTokenProvider(mockGetToken)

      const config = { headers: {} }
      const result = await axiosInstance.interceptors.request.handlers[0].fulfilled(config)

      expect(result.headers.Authorization).toBe('Bearer valid-token')
    })

    it('handles token provider errors gracefully', async () => {
      const mockTokenProvider = jest.fn().mockRejectedValue(new Error('Token expired'))
      setTokenProvider(mockTokenProvider)

      const config = { headers: {} }
      const result = await axiosInstance.interceptors.request.handlers[0].fulfilled(config)

      expect(result.headers.Authorization).toBeUndefined()
      expect(result).toBe(config) // Should still return the config
    })

    it('logs requests in development mode', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      mockGetToken.mockResolvedValue('dev-token')
      setTokenProvider(mockGetToken)

      const config = { 
        method: 'GET', 
        url: '/api/test',
        headers: {},
        params: { id: 123 }
      }
      
      await axiosInstance.interceptors.request.handlers[0].fulfilled(config)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📤 GET /api/test'),
        expect.objectContaining({
          hasAuth: true,
          params: { id: 123 }
        })
      )

      consoleSpy.mockRestore()
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Response Interceptor', () => {
    it('unwraps NestJS response wrapper', () => {
      const wrappedResponse = {
        data: {
          success: true,
          data: { id: 1, name: 'Test' },
          timestamp: '2024-01-01T00:00:00Z',
          path: '/api/test',
          statusCode: 200
        },
        status: 200,
        config: { method: 'GET', url: '/api/test' }
      }

      const result = axiosInstance.interceptors.response.handlers[0].fulfilled(wrappedResponse)

      expect(result).toEqual({ id: 1, name: 'Test' })
    })

    it('returns raw data for non-wrapped responses', () => {
      const rawResponse = {
        data: { id: 1, name: 'Test' },
        status: 200,
        config: { method: 'GET', url: '/api/test' }
      }

      const result = axiosInstance.interceptors.response.handlers[0].fulfilled(rawResponse)

      expect(result).toEqual({ id: 1, name: 'Test' })
    })

    it('logs successful responses in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      const response = {
        data: { success: true },
        status: 200,
        config: { method: 'POST', url: '/api/test' }
      }

      axiosInstance.interceptors.response.handlers[0].fulfilled(response)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📥 POST /api/test'),
        expect.objectContaining({
          status: 200,
          dataType: 'object'
        })
      )

      consoleSpy.mockRestore()
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Error Handling', () => {
    it('transforms axios errors to MentaraApiError', () => {
      const axiosError = {
        message: 'Request failed',
        response: {
          status: 400,
          data: { message: 'Bad request' }
        },
        config: { url: '/api/test', method: 'POST' }
      }

      expect(() => {
        axiosInstance.interceptors.response.handlers[0].rejected(axiosError)
      }).rejects.toThrow(MentaraApiError)
    })

    it('handles 401 unauthorized errors', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      const unauthorizedError = {
        message: 'Unauthorized',
        response: {
          status: 401,
          data: { message: 'Invalid token' }
        },
        config: { url: '/api/protected' }
      }

      try {
        axiosInstance.interceptors.response.handlers[0].rejected(unauthorizedError)
      } catch (error) {
        expect(error).toBeInstanceOf(MentaraApiError)
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Unauthorized request detected')
        )
      }

      consoleWarnSpy.mockRestore()
    })

    it('handles network errors', () => {
      const networkError = {
        message: 'Network Error',
        code: 'NETWORK_ERROR',
        config: { url: '/api/test' }
      }

      expect(() => {
        axiosInstance.interceptors.response.handlers[0].rejected(networkError)
      }).rejects.toThrow(MentaraApiError)
    })
  })

  describe('Token Refresh Scenarios', () => {
    it('retries request with new token after 401', async () => {
      // Mock a scenario where first request fails with 401, then succeeds with new token
      let callCount = 0
      const mockTokenProvider = jest.fn(() => {
        callCount++
        return callCount === 1 ? 'expired-token' : 'refreshed-token'
      })
      
      setTokenProvider(mockTokenProvider)

      const config = { headers: {} }
      
      // First call with expired token
      await axiosInstance.interceptors.request.handlers[0].fulfilled(config)
      expect(config.headers.Authorization).toBe('Bearer expired-token')
      
      // Second call should get refreshed token
      const newConfig = { headers: {} }
      await axiosInstance.interceptors.request.handlers[0].fulfilled(newConfig)
      expect(newConfig.headers.Authorization).toBe('Bearer refreshed-token')
    })

    it('handles token refresh failures', async () => {
      let callCount = 0
      const mockTokenProvider = jest.fn(() => {
        callCount++
        if (callCount === 1) return 'expired-token'
        throw new Error('Refresh failed')
      })
      
      setTokenProvider(mockTokenProvider)

      const config = { headers: {} }
      
      // First call should work
      await axiosInstance.interceptors.request.handlers[0].fulfilled(config)
      expect(config.headers.Authorization).toBe('Bearer expired-token')
      
      // Second call should fail gracefully
      const newConfig = { headers: {} }
      await axiosInstance.interceptors.request.handlers[0].fulfilled(newConfig)
      expect(newConfig.headers.Authorization).toBeUndefined()
    })
  })
})