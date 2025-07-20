import { NextRequest, NextResponse } from "next/server";
// JWT auth will be handled by backend middleware

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Extract the token from the authorization header
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Get the form data from the request
    const formData = await request.formData();

    // Forward the request to the backend API
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const backendResponse = await fetch(`${backendUrl}/api/therapist/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, // Forward the FormData directly
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Backend upload error:", errorText);

      return NextResponse.json(
        {
          error: "File upload failed",
          details: errorText,
        },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      {
        error: "Internal server error during file upload",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
