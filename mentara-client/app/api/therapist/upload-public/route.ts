import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Received public document upload request');
    
    // Get the form data from the request
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const fileTypes = formData.get('fileTypes') as string;
    
    console.log('Upload request details:', {
      fileCount: files.length,
      fileNames: files.map(f => f.name),
      fileTypes: fileTypes
    });
    
    // Forward the request to the backend API without authentication
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const backendResponse = await fetch(`${backendUrl}/api/therapist/upload-public`, {
      method: 'POST',
      body: formData, // Forward the FormData directly
    });

    console.log('Backend upload response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend upload error:', errorText);
      
      return NextResponse.json(
        { 
          error: 'File upload failed',
          details: errorText 
        },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    console.log('Files uploaded successfully:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during file upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}