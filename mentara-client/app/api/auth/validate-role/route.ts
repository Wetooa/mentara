import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSession } from '@/lib/session';
import { UserRole } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface BackendUserResponse {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  permissions?: string[];
  profile?: any;
}

/**
 * Validate user role and create/refresh session
 */
export async function POST(request: NextRequest) {
  try {
    const authObj = await auth();
    
    if (!authObj.userId) {
      console.error('No user ID found in auth object');
      return NextResponse.json(
        { error: 'Unauthorized', details: 'No user ID found' },
        { status: 401 }
      );
    }

    // Get user token for backend authentication
    const token = await authObj.getToken();
    
    if (!token) {
      console.error('Failed to get authentication token for user:', authObj.userId);
      return NextResponse.json(
        { error: 'Failed to get authentication token', details: 'Token retrieval failed' },
        { status: 401 }
      );
    }

    // Call backend to validate user and get role
    const backendResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend auth validation failed:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: errorText,
        userId: authObj.userId
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to validate user with backend',
          details: `Backend returned ${backendResponse.status}: ${errorText}`,
          backendStatus: backendResponse.status
        },
        { status: backendResponse.status }
      );
    }

    const userData: BackendUserResponse = await backendResponse.json();

    if (!userData.id || !userData.email || !userData.role) {
      console.error('Incomplete user data from backend:', userData);
      return NextResponse.json(
        { error: 'Incomplete user data from backend', details: 'Missing required user fields' },
        { status: 500 }
      );
    }

    // Create session data for client-side storage
    const sessionData = createSession({
      userId: authObj.userId,
      role: userData.role,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      permissions: userData.permissions || [],
    });

    console.log('Session validation successful for user:', authObj.userId);

    // Return user data with session data for client-side storage
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        permissions: userData.permissions,
      },
      sessionData: sessionData,
      sessionCreated: true,
    });

  } catch (error) {
    console.error('Role validation error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}