import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * Get current authentication status (validates Clerk auth only)
 */
export async function GET(request: NextRequest) {
  try {
    const authObj = await auth();
    
    if (!authObj.userId) {
      return NextResponse.json({
        isValid: false,
        authenticated: false,
      });
    }

    return NextResponse.json({
      isValid: true,
      authenticated: true,
      userId: authObj.userId,
    });

  } catch (error) {
    console.error('Session info error:', error);
    return NextResponse.json(
      { error: 'Failed to get session info' },
      { status: 500 }
    );
  }
}