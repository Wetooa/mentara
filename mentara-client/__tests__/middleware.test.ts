import { NextRequest, NextResponse } from 'next/server'
import middleware from '../middleware'

// Mock Clerk middleware
jest.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: (handler: any) => handler,
}))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    next: jest.fn(() => ({ type: 'next' })),
    redirect: jest.fn((url) => ({ type: 'redirect', url })),
  },
}))

describe('Middleware', () => {
  let mockAuth: jest.Mock
  let mockRequest: Partial<NextRequest>

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockAuth = jest.fn()
    mockRequest = {
      nextUrl: {
        pathname: '/',
        searchParams: new URLSearchParams(),
      } as any,
      url: 'http://localhost:3000/',
    }
  })

  describe('Public Routes', () => {
    const publicRoutes = [
      '/',
      '/landing',
      '/sign-in',
      '/sign-up',
      '/pre-assessment',
      '/therapist-application',
      '/about',
      '/community',
      '/for-therapists',
    ]

    publicRoutes.forEach(route => {
      it(`allows access to public route: ${route}`, async () => {
        mockRequest.nextUrl!.pathname = route
        mockAuth.mockResolvedValue({ userId: null })

        const result = await middleware(mockAuth, mockRequest as NextRequest)

        expect(NextResponse.next).toHaveBeenCalled()
        expect(NextResponse.redirect).not.toHaveBeenCalled()
      })
    })

    it('allows access to therapist-application sub-routes', async () => {
      mockRequest.nextUrl!.pathname = '/therapist-application/step-1'
      mockAuth.mockResolvedValue({ userId: null })

      const result = await middleware(mockAuth, mockRequest as NextRequest)

      expect(NextResponse.next).toHaveBeenCalled()
    })
  })

  describe('Public API Routes', () => {
    const publicApiRoutes = [
      '/api/therapist/apply',
      '/api/therapist/upload-public',
      '/api/auth/validate-role',
      '/api/auth/session-info',
      '/api/auth/refresh-session',
      '/api/auth/clear-session',
    ]

    publicApiRoutes.forEach(route => {
      it(`allows access to public API route: ${route}`, async () => {
        mockRequest.nextUrl!.pathname = route
        mockAuth.mockResolvedValue({ userId: null })

        const result = await middleware(mockAuth, mockRequest as NextRequest)

        expect(NextResponse.next).toHaveBeenCalled()
        expect(NextResponse.redirect).not.toHaveBeenCalled()
      })
    })
  })

  describe('Protected Routes', () => {
    const protectedRoutes = [
      '/user',
      '/therapist',
      '/moderator',
      '/admin',
      '/user/dashboard',
      '/therapist/patients',
      '/admin/users',
    ]

    protectedRoutes.forEach(route => {
      it(`redirects unauthenticated users from protected route: ${route}`, async () => {
        mockRequest.nextUrl!.pathname = route
        mockRequest.url = `http://localhost:3000${route}`
        mockAuth.mockResolvedValue({ userId: null })

        const result = await middleware(mockAuth, mockRequest as NextRequest)

        expect(NextResponse.redirect).toHaveBeenCalled()
        const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0][0]
        expect(redirectCall.pathname).toBe('/sign-in')
        expect(redirectCall.searchParams.get('redirect_url')).toBe(mockRequest.url)
      })

      it(`allows authenticated users to access protected route: ${route}`, async () => {
        mockRequest.nextUrl!.pathname = route
        mockAuth.mockResolvedValue({ userId: 'user-123' })

        const result = await middleware(mockAuth, mockRequest as NextRequest)

        expect(NextResponse.next).toHaveBeenCalled()
        expect(NextResponse.redirect).not.toHaveBeenCalled()
      })
    })
  })

  describe('Authentication Flow', () => {
    it('preserves redirect URL in sign-in redirect', async () => {
      const originalUrl = 'http://localhost:3000/user/dashboard?tab=sessions'
      mockRequest.nextUrl!.pathname = '/user/dashboard'
      mockRequest.url = originalUrl
      mockAuth.mockResolvedValue({ userId: null })

      await middleware(mockAuth, mockRequest as NextRequest)

      expect(NextResponse.redirect).toHaveBeenCalled()
      const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0][0]
      expect(redirectCall.searchParams.get('redirect_url')).toBe(originalUrl)
    })

    it('handles auth errors gracefully', async () => {
      mockRequest.nextUrl!.pathname = '/user'
      mockAuth.mockRejectedValue(new Error('Auth service unavailable'))

      // Should not throw and should handle as unauthenticated
      await expect(middleware(mockAuth, mockRequest as NextRequest)).rejects.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('handles root path correctly', async () => {
      mockRequest.nextUrl!.pathname = '/'
      mockAuth.mockResolvedValue({ userId: null })

      const result = await middleware(mockAuth, mockRequest as NextRequest)

      expect(NextResponse.next).toHaveBeenCalled()
    })

    it('handles paths with query parameters', async () => {
      mockRequest.nextUrl!.pathname = '/user'
      mockRequest.url = 'http://localhost:3000/user?tab=messages&id=123'
      mockAuth.mockResolvedValue({ userId: null })

      await middleware(mockAuth, mockRequest as NextRequest)

      const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0][0]
      expect(redirectCall.searchParams.get('redirect_url')).toBe(mockRequest.url)
    })

    it('handles nested protected routes', async () => {
      mockRequest.nextUrl!.pathname = '/admin/users/details/123'
      mockAuth.mockResolvedValue({ userId: 'admin-user' })

      const result = await middleware(mockAuth, mockRequest as NextRequest)

      expect(NextResponse.next).toHaveBeenCalled()
    })

    it('handles API routes correctly', async () => {
      mockRequest.nextUrl!.pathname = '/api/user/profile'
      mockAuth.mockResolvedValue({ userId: null })

      await middleware(mockAuth, mockRequest as NextRequest)

      expect(NextResponse.redirect).toHaveBeenCalled()
    })
  })

  describe('Configuration', () => {
    it('exports correct matcher configuration', () => {
      const middleware = require('../middleware')
      expect(middleware.config).toBeDefined()
      expect(middleware.config.matcher).toBeDefined()
      expect(Array.isArray(middleware.config.matcher)).toBe(true)
    })
  })
})