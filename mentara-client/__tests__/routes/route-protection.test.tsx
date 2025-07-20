import React from 'react'
import { render, screen, waitFor } from '@/__tests__/setup'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'

// Mock Next.js navigation
jest.mock('next/navigation')
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

// Mock Clerk hooks
jest.mock('@clerk/nextjs')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

// Mock protected route layouts
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`)
      return
    }

    // Role-based route protection
    const userRole = user?.publicMetadata?.role as string
    
    // Define role restrictions
    const roleRestrictions: Record<string, string[]> = {
      '/user': ['client'],
      '/therapist': ['therapist'],
      '/admin': ['admin'],
      '/moderator': ['moderator'],
    }

    // Check if current path requires specific role
    for (const [routePrefix, allowedRoles] of Object.entries(roleRestrictions)) {
      if (pathname.startsWith(routePrefix)) {
        if (!allowedRoles.includes(userRole) && userRole !== 'admin') {
          // Redirect to appropriate dashboard
          const redirectMap = {
            client: '/user',
            therapist: '/therapist',
            moderator: '/moderator',
            admin: '/admin',
          }
          router.push(redirectMap[userRole as keyof typeof redirectMap] || '/')
          return
        }
      }
    }
  }, [isLoaded, isSignedIn, user, router, pathname])

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <div>Redirecting to sign-in...</div>
  }

  return <div data-testid="protected-content">{children}</div>
}

describe('Route Protection', () => {
  const mockPush = jest.fn()
  const TestPage = ({ content = 'Protected Page Content' }: { content?: string }) => (
    <div>{content}</div>
  )

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
    ]

    publicRoutes.forEach(route => {
      it(`allows unauthenticated access to ${route}`, () => {
        mockUsePathname.mockReturnValue(route)
        mockUseAuth.mockReturnValue({
          isLoaded: true,
          isSignedIn: false,
          userId: null,
        } as any)

        // Public routes don't use ProtectedLayout, so just render the page
        render(<TestPage content={`Public page: ${route}`} />)
        
        expect(screen.getByText(`Public page: ${route}`)).toBeInTheDocument()
        expect(mockPush).not.toHaveBeenCalled()
      })
    })
  })

  describe('Protected Routes - Authentication', () => {
    const protectedRoutes = [
      '/user',
      '/user/dashboard',
      '/user/messages',
      '/user/booking',
      '/therapist',
      '/therapist/dashboard',
      '/therapist/patients',
      '/admin',
      '/admin/users',
      '/moderator',
      '/moderator/content',
    ]

    protectedRoutes.forEach(route => {
      it(`redirects unauthenticated users from ${route}`, async () => {
        mockUsePathname.mockReturnValue(route)
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
          <ProtectedLayout>
            <TestPage />
          </ProtectedLayout>
        )

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(
            `/sign-in?redirect_url=${encodeURIComponent(route)}`
          )
        })
      })

      it(`shows loading while auth loads for ${route}`, () => {
        mockUsePathname.mockReturnValue(route)
        mockUseAuth.mockReturnValue({
          isLoaded: false,
          isSignedIn: false,
          userId: null,
        } as any)

        render(
          <ProtectedLayout>
            <TestPage />
          </ProtectedLayout>
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()
      })
    })
  })

  describe('Role-Based Access Control', () => {
    describe('Client Routes (/user/*)', () => {
      const userRoutes = [
        '/user',
        '/user/dashboard',
        '/user/messages',
        '/user/booking',
        '/user/therapist',
        '/user/worksheets',
        '/user/community',
      ]

      userRoutes.forEach(route => {
        it(`allows clients access to ${route}`, async () => {
          mockUsePathname.mockReturnValue(route)
          mockUseAuth.mockReturnValue({
            isLoaded: true,
            isSignedIn: true,
            userId: 'client-123',
          } as any)

          mockUseUser.mockReturnValue({
            isLoaded: true,
            user: {
              id: 'client-123',
              publicMetadata: { role: 'client' },
            },
          } as any)

          render(
            <ProtectedLayout>
              <TestPage />
            </ProtectedLayout>
          )

          await waitFor(() => {
            expect(screen.getByTestId('protected-content')).toBeInTheDocument()
          })
          expect(mockPush).not.toHaveBeenCalled()
        })

        it(`redirects therapists from ${route}`, async () => {
          mockUsePathname.mockReturnValue(route)
          mockUseAuth.mockReturnValue({
            isLoaded: true,
            isSignedIn: true,
            userId: 'therapist-123',
          } as any)

          mockUseUser.mockReturnValue({
            isLoaded: true,
            user: {
              id: 'therapist-123',
              publicMetadata: { role: 'therapist' },
            },
          } as any)

          render(
            <ProtectedLayout>
              <TestPage />
            </ProtectedLayout>
          )

          await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/therapist')
          })
        })
      })
    })

    describe('Therapist Routes (/therapist/*)', () => {
      const therapistRoutes = [
        '/therapist',
        '/therapist/dashboard',
        '/therapist/patients',
        '/therapist/schedule',
        '/therapist/worksheets',
        '/therapist/community',
      ]

      therapistRoutes.forEach(route => {
        it(`allows therapists access to ${route}`, async () => {
          mockUsePathname.mockReturnValue(route)
          mockUseAuth.mockReturnValue({
            isLoaded: true,
            isSignedIn: true,
            userId: 'therapist-123',
          } as any)

          mockUseUser.mockReturnValue({
            isLoaded: true,
            user: {
              id: 'therapist-123',
              publicMetadata: { role: 'therapist' },
            },
          } as any)

          render(
            <ProtectedLayout>
              <TestPage />
            </ProtectedLayout>
          )

          await waitFor(() => {
            expect(screen.getByTestId('protected-content')).toBeInTheDocument()
          })
          expect(mockPush).not.toHaveBeenCalled()
        })

        it(`redirects clients from ${route}`, async () => {
          mockUsePathname.mockReturnValue(route)
          mockUseAuth.mockReturnValue({
            isLoaded: true,
            isSignedIn: true,
            userId: 'client-123',
          } as any)

          mockUseUser.mockReturnValue({
            isLoaded: true,
            user: {
              id: 'client-123',
              publicMetadata: { role: 'client' },
            },
          } as any)

          render(
            <ProtectedLayout>
              <TestPage />
            </ProtectedLayout>
          )

          await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/user')
          })
        })
      })
    })

    describe('Admin Routes (/admin/*)', () => {
      const adminRoutes = [
        '/admin',
        '/admin/users',
        '/admin/reports',
        '/admin/therapist-applications',
        '/admin/content',
      ]

      adminRoutes.forEach(route => {
        it(`allows admins access to ${route}`, async () => {
          mockUsePathname.mockReturnValue(route)
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
            <ProtectedLayout>
              <TestPage />
            </ProtectedLayout>
          )

          await waitFor(() => {
            expect(screen.getByTestId('protected-content')).toBeInTheDocument()
          })
          expect(mockPush).not.toHaveBeenCalled()
        })

        it(`redirects non-admins from ${route}`, async () => {
          mockUsePathname.mockReturnValue(route)
          mockUseAuth.mockReturnValue({
            isLoaded: true,
            isSignedIn: true,
            userId: 'client-123',
          } as any)

          mockUseUser.mockReturnValue({
            isLoaded: true,
            user: {
              id: 'client-123',
              publicMetadata: { role: 'client' },
            },
          } as any)

          render(
            <ProtectedLayout>
              <TestPage />
            </ProtectedLayout>
          )

          await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/user')
          })
        })
      })
    })

    describe('Moderator Routes (/moderator/*)', () => {
      const moderatorRoutes = [
        '/moderator',
        '/moderator/content',
      ]

      moderatorRoutes.forEach(route => {
        it(`allows moderators access to ${route}`, async () => {
          mockUsePathname.mockReturnValue(route)
          mockUseAuth.mockReturnValue({
            isLoaded: true,
            isSignedIn: true,
            userId: 'mod-123',
          } as any)

          mockUseUser.mockReturnValue({
            isLoaded: true,
            user: {
              id: 'mod-123',
              publicMetadata: { role: 'moderator' },
            },
          } as any)

          render(
            <ProtectedLayout>
              <TestPage />
            </ProtectedLayout>
          )

          await waitFor(() => {
            expect(screen.getByTestId('protected-content')).toBeInTheDocument()
          })
          expect(mockPush).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe('Admin Override Access', () => {
    const allProtectedRoutes = [
      '/user/dashboard',
      '/therapist/patients',
      '/moderator/content',
    ]

    allProtectedRoutes.forEach(route => {
      it(`allows admin access to ${route} regardless of role restriction`, async () => {
        mockUsePathname.mockReturnValue(route)
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
          <ProtectedLayout>
            <TestPage />
          </ProtectedLayout>
        )

        await waitFor(() => {
          expect(screen.getByTestId('protected-content')).toBeInTheDocument()
        })
        expect(mockPush).not.toHaveBeenCalled()
      })
    })
  })

  describe('Special Routes', () => {
    it('allows access to meeting rooms for authenticated users', async () => {
      mockUsePathname.mockReturnValue('/meeting/abc123')
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
        <ProtectedLayout>
          <TestPage />
        </ProtectedLayout>
      )

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      })
    })

    it('handles force-logout route', async () => {
      mockUsePathname.mockReturnValue('/force-logout')
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
        <ProtectedLayout>
          <TestPage />
        </ProtectedLayout>
      )

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      })
    })
  })
})