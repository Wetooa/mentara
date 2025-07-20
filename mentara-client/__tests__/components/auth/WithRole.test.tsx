import React from 'react'
import { render, screen, waitFor } from '@/__tests__/setup'
import { WithRole } from '@/components/auth/WithRole'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

// Mock Clerk hooks
jest.mock('@clerk/nextjs')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

// Mock Next.js router
jest.mock('next/navigation')
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockPush = jest.fn()
const mockReplace = jest.fn()

describe('WithRole Component', () => {
  const TestComponent = () => <div>Protected Content</div>

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    })
  })

  it('renders content for users with correct role', async () => {
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

    render(
      <WithRole allowedRoles={['client']}>
        <TestComponent />
      </WithRole>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it('shows access denied for users with incorrect role', async () => {
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

    render(
      <WithRole allowedRoles={['admin']}>
        <TestComponent />
      </WithRole>
    )

    await waitFor(() => {
      expect(screen.getByText(/access denied/i)).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })

  it('redirects to appropriate dashboard for wrong role', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      userId: 'user-123',
    } as any)

    mockUseUser.mockReturnValue({
      isLoaded: true,
      user: {
        id: 'user-123',
        publicMetadata: { role: 'therapist' },
      },
    } as any)

    render(
      <WithRole allowedRoles={['admin']} redirectOnFail={true}>
        <TestComponent />
      </WithRole>
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/therapist')
    })
  })

  it('shows loading state while auth is loading', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
      userId: null,
    } as any)

    mockUseUser.mockReturnValue({
      isLoaded: false,
      user: null,
    } as any)

    render(
      <WithRole allowedRoles={['client']}>
        <TestComponent />
      </WithRole>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('redirects to sign-in for unauthenticated users', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      userId: null,
    } as any)

    mockUseUser.mockReturnValue({
      isLoaded: true,
      user: null,
    } as any)

    render(
      <WithRole allowedRoles={['client']}>
        <TestComponent />
      </WithRole>
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/sign-in')
    })
  })

  it('handles multiple allowed roles', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      userId: 'user-123',
    } as any)

    mockUseUser.mockReturnValue({
      isLoaded: true,
      user: {
        id: 'user-123',
        publicMetadata: { role: 'moderator' },
      },
    } as any)

    render(
      <WithRole allowedRoles={['admin', 'moderator']}>
        <TestComponent />
      </WithRole>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it('handles admin role access to all routes', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      userId: 'admin-123',
    } as any)

    mockUseUser.mockReturnValue({
      isLoaded: true,
      user: {
        id: 'admin-123',
        publicMetadata: { role: 'admin' },
      },
    } as any)

    render(
      <WithRole allowedRoles={['therapist']}>
        <TestComponent />
      </WithRole>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it('shows custom fallback component', async () => {
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

    const CustomFallback = () => <div>Custom Access Denied</div>

    render(
      <WithRole allowedRoles={['admin']} fallback={<CustomFallback />}>
        <TestComponent />
      </WithRole>
    )

    await waitFor(() => {
      expect(screen.getByText('Custom Access Denied')).toBeInTheDocument()
    })
  })

  it('handles users without role metadata', async () => {
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

    render(
      <WithRole allowedRoles={['client']}>
        <TestComponent />
      </WithRole>
    )

    await waitFor(() => {
      expect(screen.getByText(/access denied/i)).toBeInTheDocument()
    })
  })

  describe('Role Detection Edge Cases', () => {
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

      render(
        <WithRole allowedRoles={['client']}>
          <TestComponent />
        </WithRole>
      )

      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument()
      })
    })

    it('handles undefined publicMetadata', async () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'user-123',
      } as any)

      mockUseUser.mockReturnValue({
        isLoaded: true,
        user: {
          id: 'user-123',
          publicMetadata: undefined,
        },
      } as any)

      render(
        <WithRole allowedRoles={['client']}>
          <TestComponent />
        </WithRole>
      )

      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument()
      })
    })
  })
})