import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { refreshSession } from '@/lib/session';

/**
 * Refresh session data (returns updated session for client-side storage)
 */
export async function POST(request: NextRequest) {
  try {
    const authObj = await auth();
    
    if (!authObj.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current session data from request body
    const body = await request.json();
    const currentSession = body.sessionData;

    if (!currentSession || currentSession.userId !== authObj.userId) {
      return NextResponse.json(
        { error: 'No valid session found', requiresRevalidation: true },
        { status: 400 }
      );
    }

    // Refresh the session
    const refreshedSession = refreshSession(currentSession);

    return NextResponse.json({
      success: true,
      message: 'Session refreshed successfully',
      sessionData: refreshedSession,
      lastValidated: refreshedSession.lastValidated,
      expiresAt: refreshedSession.expiresAt,
    });

  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    );
  }
}