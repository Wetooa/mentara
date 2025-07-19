import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Extract the token from the authorization header
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Get the application data from the request body
    const applicationData = await request.json();
    
    // Forward the request to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const backendResponse = await fetch(`${backendUrl}/api/therapist/application`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend application submission error:', errorText);
      
      return NextResponse.json(
        { 
          error: 'Application submission failed',
          details: errorText 
        },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during application submission',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Extract the token from the authorization header
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    // Build query string for backend
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);

    // Forward the request to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const backendResponse = await fetch(
      `${backendUrl}/api/therapist/application?${queryParams.toString()}`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend get applications error:', errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch applications',
          details: errorText 
        },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error while fetching applications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}