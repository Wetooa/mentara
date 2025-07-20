import React from 'react'
import { render, screen } from '@/__tests__/setup'
import { RoleProtection } from '@/components/auth/RoleProtection'
import { useAuth } from '@clerk/nextjs'

// Mock the auth hook
jest.mock('@clerk/nextjs')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('RoleProtection Component', () => {
  const TestComponent = () => <div>Protected Content</div>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders protected content for authorized users', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      userId: 'test-user-id',
    } as any)

    render(
      <RoleProtection allowedRoles={['client']} userRole="client">
        <TestComponent />
      </RoleProtection>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('shows access denied for unauthorized users', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      userId: 'test-user-id',
    } as any)

    render(
      <RoleProtection allowedRoles={['admin']} userRole="client">
        <TestComponent />
      </RoleProtection>
    )

    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows loading state when auth is not loaded', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
      userId: null,
    } as any)

    render(
      <RoleProtection allowedRoles={['client']} userRole="client">
        <TestComponent />
      </RoleProtection>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('redirects to sign-in for unauthenticated users', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      userId: null,
    } as any)

    render(
      <RoleProtection allowedRoles={['client']} userRole="client">
        <TestComponent />
      </RoleProtection>
    )

    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })

  it('allows multiple roles', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      userId: 'test-user-id',
    } as any)

    render(
      <RoleProtection allowedRoles={['client', 'therapist']} userRole="therapist">
        <TestComponent />
      </RoleProtection>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('handles admin role access', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      userId: 'admin-user-id',
    } as any)

    render(
      <RoleProtection allowedRoles={['admin']} userRole="admin">
        <TestComponent />
      </RoleProtection>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})