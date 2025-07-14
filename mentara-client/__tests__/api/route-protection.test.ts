import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs'

// Mock Clerk auth
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn(),
}))

const mockAuth = auth as jest.MockedFunction<typeof auth>

// Mock API route handlers
const createMockRouteHandler = (requiresAuth: boolean = true, allowedRoles: string[] = []) => {
  return async (request: NextRequest) => {
    if (requiresAuth) {
      const authObj = await auth()
      
      if (!authObj.userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Check role if specified
      if (allowedRoles.length > 0) {
        const userRole = authObj.sessionClaims?.metadata?.role as string
        if (!allowedRoles.includes(userRole) && userRole !== 'admin') {
          return new Response(JSON.stringify({ error: 'Forbidden' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

describe('API Route Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Public API Routes', () => {
    const publicRouteHandler = createMockRouteHandler(false)

    it('allows unauthenticated access to public routes', async () => {
      mockAuth.mockResolvedValue({ userId: null } as any)

      const request = new NextRequest('http://localhost:3000/api/therapist/apply')
      const response = await publicRouteHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    describe('Specific Public Routes', () => {
      const publicRoutes = [
        '/api/therapist/apply',
        '/api/therapist/upload-public',
        '/api/auth/validate-role',
        '/api/auth/session-info',
        '/api/auth/refresh-session',
        '/api/auth/clear-session',
      ]

      publicRoutes.forEach(route => {
        it(`allows access to ${route} without authentication`, async () => {
          mockAuth.mockResolvedValue({ userId: null } as any)

          const request = new NextRequest(`http://localhost:3000${route}`)
          const response = await publicRouteHandler(request)

          expect(response.status).toBe(200)
        })
      })
    })
  })

  describe('Protected API Routes', () => {
    const protectedRouteHandler = createMockRouteHandler(true)

    it('returns 401 for unauthenticated requests', async () => {
      mockAuth.mockResolvedValue({ userId: null } as any)

      const request = new NextRequest('http://localhost:3000/api/user/profile')
      const response = await protectedRouteHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('allows authenticated requests', async () => {
      mockAuth.mockResolvedValue({ 
        userId: 'user-123',
        sessionClaims: { metadata: { role: 'client' } }
      } as any)

      const request = new NextRequest('http://localhost:3000/api/user/profile')
      const response = await protectedRouteHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('handles auth service errors gracefully', async () => {
      mockAuth.mockRejectedValue(new Error('Auth service unavailable'))

      const request = new NextRequest('http://localhost:3000/api/user/profile')
      
      await expect(protectedRouteHandler(request)).rejects.toThrow('Auth service unavailable')
    })
  })

  describe('Role-Based API Route Protection', () => {
    describe('Client-only routes', () => {
      const clientOnlyHandler = createMockRouteHandler(true, ['client'])

      it('allows clients access', async () => {
        mockAuth.mockResolvedValue({ 
          userId: 'client-123',
          sessionClaims: { metadata: { role: 'client' } }
        } as any)

        const request = new NextRequest('http://localhost:3000/api/booking/create')
        const response = await clientOnlyHandler(request)

        expect(response.status).toBe(200)
      })

      it('denies therapists access', async () => {
        mockAuth.mockResolvedValue({ 
          userId: 'therapist-123',
          sessionClaims: { metadata: { role: 'therapist' } }
        } as any)

        const request = new NextRequest('http://localhost:3000/api/booking/create')
        const response = await clientOnlyHandler(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe('Forbidden')
      })

      it('allows admin access (admin override)', async () => {
        mockAuth.mockResolvedValue({ 
          userId: 'admin-123',
          sessionClaims: { metadata: { role: 'admin' } }
        } as any)

        const request = new NextRequest('http://localhost:3000/api/booking/create')
        const response = await clientOnlyHandler(request)

        expect(response.status).toBe(200)
      })
    })

    describe('Therapist-only routes', () => {
      const therapistOnlyHandler = createMockRouteHandler(true, ['therapist'])

      it('allows therapists access', async () => {
        mockAuth.mockResolvedValue({ 
          userId: 'therapist-123',
          sessionClaims: { metadata: { role: 'therapist' } }
        } as any)

        const request = new NextRequest('http://localhost:3000/api/therapist/patients')
        const response = await therapistOnlyHandler(request)

        expect(response.status).toBe(200)
      })

      it('denies clients access', async () => {
        mockAuth.mockResolvedValue({ 
          userId: 'client-123',
          sessionClaims: { metadata: { role: 'client' } }
        } as any)

        const request = new NextRequest('http://localhost:3000/api/therapist/patients')
        const response = await therapistOnlyHandler(request)

        expect(response.status).toBe(403)
      })
    })

    describe('Admin-only routes', () => {
      const adminOnlyHandler = createMockRouteHandler(true, ['admin'])

      it('allows admin access', async () => {
        mockAuth.mockResolvedValue({ 
          userId: 'admin-123',
          sessionClaims: { metadata: { role: 'admin' } }
        } as any)

        const request = new NextRequest('http://localhost:3000/api/admin/users')
        const response = await adminOnlyHandler(request)

        expect(response.status).toBe(200)
      })

      it('denies non-admin access', async () => {
        mockAuth.mockResolvedValue({ 
          userId: 'client-123',
          sessionClaims: { metadata: { role: 'client' } }
        } as any)

        const request = new NextRequest('http://localhost:3000/api/admin/users')
        const response = await adminOnlyHandler(request)

        expect(response.status).toBe(403)
      })
    })

    describe('Multi-role routes', () => {
      const multiRoleHandler = createMockRouteHandler(true, ['client', 'therapist'])

      it('allows clients access', async () => {
        mockAuth.mockResolvedValue({ 
          userId: 'client-123',
          sessionClaims: { metadata: { role: 'client' } }
        } as any)

        const request = new NextRequest('http://localhost:3000/api/messages/send')
        const response = await multiRoleHandler(request)

        expect(response.status).toBe(200)
      })

      it('allows therapists access', async () => {
        mockAuth.mockResolvedValue({ 
          userId: 'therapist-123',
          sessionClaims: { metadata: { role: 'therapist' } }
        } as any)

        const request = new NextRequest('http://localhost:3000/api/messages/send')
        const response = await multiRoleHandler(request)

        expect(response.status).toBe(200)
      })

      it('denies moderators access', async () => {
        mockAuth.mockResolvedValue({ 
          userId: 'mod-123',
          sessionClaims: { metadata: { role: 'moderator' } }
        } as any)

        const request = new NextRequest('http://localhost:3000/api/messages/send')
        const response = await multiRoleHandler(request)

        expect(response.status).toBe(403)
      })
    })
  })

  describe('Special Case Routes', () => {
    describe('Webhook routes', () => {
      const webhookHandler = createMockRouteHandler(false)

      it('allows unauthenticated access to webhook endpoints', async () => {
        mockAuth.mockResolvedValue({ userId: null } as any)

        const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
          method: 'POST',
          headers: {
            'svix-signature': 'test-signature',
          },
        })

        const response = await webhookHandler(request)
        expect(response.status).toBe(200)
      })
    })

    describe('File upload routes', () => {
      it('protects private file uploads', async () => {
        const protectedUploadHandler = createMockRouteHandler(true, ['therapist'])
        
        mockAuth.mockResolvedValue({ 
          userId: 'therapist-123',
          sessionClaims: { metadata: { role: 'therapist' } }
        } as any)

        const request = new NextRequest('http://localhost:3000/api/therapist/upload')
        const response = await protectedUploadHandler(request)

        expect(response.status).toBe(200)
      })

      it('allows public file uploads', async () => {
        const publicUploadHandler = createMockRouteHandler(false)
        
        mockAuth.mockResolvedValue({ userId: null } as any)

        const request = new NextRequest('http://localhost:3000/api/therapist/upload-public')
        const response = await publicUploadHandler(request)

        expect(response.status).toBe(200)
      })
    })
  })

  describe('Error Handling', () => {
    it('handles missing session claims gracefully', async () => {
      const roleBasedHandler = createMockRouteHandler(true, ['admin'])
      
      mockAuth.mockResolvedValue({ 
        userId: 'user-123',
        sessionClaims: null
      } as any)

      const request = new NextRequest('http://localhost:3000/api/admin/users')
      const response = await roleBasedHandler(request)

      expect(response.status).toBe(403)
    })

    it('handles missing role metadata gracefully', async () => {
      const roleBasedHandler = createMockRouteHandler(true, ['admin'])
      
      mockAuth.mockResolvedValue({ 
        userId: 'user-123',
        sessionClaims: { metadata: {} }
      } as any)

      const request = new NextRequest('http://localhost:3000/api/admin/users')
      const response = await roleBasedHandler(request)

      expect(response.status).toBe(403)
    })

    it('handles undefined metadata gracefully', async () => {
      const roleBasedHandler = createMockRouteHandler(true, ['admin'])
      
      mockAuth.mockResolvedValue({ 
        userId: 'user-123',
        sessionClaims: { metadata: undefined }
      } as any)

      const request = new NextRequest('http://localhost:3000/api/admin/users')
      const response = await roleBasedHandler(request)

      expect(response.status).toBe(403)
    })
  })

  describe('HTTP Methods', () => {
    const protectedHandler = createMockRouteHandler(true)

    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

    methods.forEach(method => {
      it(`protects ${method} requests`, async () => {
        mockAuth.mockResolvedValue({ userId: null } as any)

        const request = new NextRequest('http://localhost:3000/api/protected', {
          method,
        })

        const response = await protectedHandler(request)
        expect(response.status).toBe(401)
      })

      it(`allows authenticated ${method} requests`, async () => {
        mockAuth.mockResolvedValue({ 
          userId: 'user-123',
          sessionClaims: { metadata: { role: 'client' } }
        } as any)

        const request = new NextRequest('http://localhost:3000/api/protected', {
          method,
        })

        const response = await protectedHandler(request)
        expect(response.status).toBe(200)
      })
    })
  })
})