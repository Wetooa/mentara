import React from 'react'
import { render, screen, waitFor } from '@/__tests__/setup'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'

// Mock the SSO callback page
const SSOCallbackPage = () => {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn || !userId) {
      router.push('/sign-in?error=sso_failed')
      return
    }

    // Get redirect URL from search params
    const redirectUrl = searchParams.get('redirect_url')
    const userRole = user?.publicMetadata?.role as string

    // Determine where to redirect based on role
    let targetUrl = redirectUrl || '/'
    
    if (!redirectUrl) {
      switch (userRole) {
        case 'client':
          targetUrl = '/user'
          break
        case 'therapist':
          targetUrl = '/therapist'
          break
        case 'moderator':
          targetUrl = '/moderator'
          break
        case 'admin':
          targetUrl = '/admin'
          break
        default:
          targetUrl = '/'
      }
    }

    router.push(targetUrl)
  }, [isLoaded, isSignedIn, userId, user, router, searchParams])

  if (!isLoaded) {
    return <div>Loading authentication...</div>
  }

  if (!isSignedIn) {
    return <div>Authentication failed. Redirecting...</div>
  }

  return <div>Authenticating... Please wait.</div>
}

// Mock Clerk hooks
jest.mock('@clerk/nextjs')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

// Mock Next.js router
jest.mock('next/navigation')
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>
const mockPush = jest.fn()

describe('SSO Callback Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    })

    mockUseSearchParams.mockReturnValue({
      get: jest.fn(),
      has: jest.fn(),
      toString: jest.fn(),
    } as any)
  })

  it('shows loading state while authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
      userId: null,
    } as any)

    mockUseUser.mockReturnValue({
      isLoaded: false,
      user: null,
    } as any)

    render(<SSOCallbackPage />)

    expect(screen.getByText('Loading authentication...')).toBeInTheDocument()
  })

  it('redirects to sign-in on authentication failure', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      userId: null,
    } as any)

    mockUseUser.mockReturnValue({
      isLoaded: true,
      user: null,
    } as any)

    render(<SSOCallbackPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/sign-in?error=sso_failed')
    })
  })

  describe('Role-based Redirects', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'user-123',
      } as any)
    })

    it('redirects client to /user dashboard', async () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        user: {
          id: 'user-123',
          publicMetadata: { role: 'client' },
        },
      } as any)

      render(<SSOCallbackPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/user')
      })
    })

    it('redirects therapist to /therapist dashboard', async () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        user: {
          id: 'therapist-123',
          publicMetadata: { role: 'therapist' },
        },
      } as any)

      render(<SSOCallbackPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/therapist')
      })
    })

    it('redirects moderator to /moderator dashboard', async () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        user: {
          id: 'mod-123',
          publicMetadata: { role: 'moderator' },
        },
      } as any)

      render(<SSOCallbackPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/moderator')
      })
    })

    it('redirects admin to /admin dashboard', async () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        user: {
          id: 'admin-123',
          publicMetadata: { role: 'admin' },
        },
      } as any)

      render(<SSOCallbackPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin')
      })
    })

    it('redirects to root for unknown roles', async () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        user: {
          id: 'user-123',
          publicMetadata: { role: 'unknown' },
        },
      } as any)

      render(<SSOCallbackPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('Redirect URL Handling', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'user-123',
      } as any)

      mockUseUser.mockReturnValue({
        isLoaded: true,
        user: {
          id: 'user-123',
          publicMetadata: { role: 'client' },
        },
      } as any)
    })

    it('uses redirect_url parameter when provided', async () => {
      const mockGet = jest.fn((key) => {
        if (key === 'redirect_url') return '/user/messages'
        return null
      })

      mockUseSearchParams.mockReturnValue({
        get: mockGet,
        has: jest.fn(),
        toString: jest.fn(),
      } as any)

      render(<SSOCallbackPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/user/messages')
      })
    })

    it('falls back to role-based redirect when no redirect_url provided', async () => {
      const mockGet = jest.fn(() => null)

      mockUseSearchParams.mockReturnValue({
        get: mockGet,
        has: jest.fn(),
        toString: jest.fn(),
      } as any)

      render(<SSOCallbackPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/user')
      })
    })

    it('handles malformed redirect URLs safely', async () => {
      const mockGet = jest.fn((key) => {
        if (key === 'redirect_url') return 'javascript:alert("xss")'
        return null
      })

      mockUseSearchParams.mockReturnValue({
        get: mockGet,
        has: jest.fn(),
        toString: jest.fn(),
      } as any)

      render(<SSOCallbackPage />)

      // Should fall back to safe role-based redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/user')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles missing user metadata gracefully', async () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'user-123',
      } as any)

      mockUseUser.mockReturnValue({
        isLoaded: true,
        user: {
          id: 'user-123',
          publicMetadata: {},
        },
      } as any)

      render(<SSOCallbackPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('handles null user object', async () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'user-123',
      } as any)

      mockUseUser.mockReturnValue({
        isLoaded: true,
        user: null,
      } as any)

      render(<SSOCallbackPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('shows appropriate message during redirect', () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'user-123',
      } as any)

      mockUseUser.mockReturnValue({
        isLoaded: true,
        user: {
          id: 'user-123',
          publicMetadata: { role: 'client' },
        },
      } as any)

      render(<SSOCallbackPage />)

      expect(screen.getByText('Authenticating... Please wait.')).toBeInTheDocument()
    })
  })
})