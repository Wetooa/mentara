import { NextRequest, NextResponse } from 'next/server';

/**
 * Clear session (client-side localStorage will handle the actual clearing)
 */
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Session clear request processed',
    });

  } catch (error) {
    console.error('Session clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear session' },
      { status: 500 }
    );
  }
}