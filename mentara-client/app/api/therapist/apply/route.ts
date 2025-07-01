import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Received therapist application request');
    
    // Get the application data from the request body
    const applicationData = await request.json();
    console.log('Application data received:', { 
      firstName: applicationData.firstName,
      lastName: applicationData.lastName,
      email: applicationData.email,
      fieldsCount: Object.keys(applicationData).length 
    });
    
    // Forward the request to the backend API without authentication
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const backendResponse = await fetch(`${backendUrl}/api/therapist/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    });

    console.log('Backend response status:', backendResponse.status);

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
    console.log('Application submitted successfully:', result);
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