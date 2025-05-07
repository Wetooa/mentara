import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export const config = {
  api: {
    bodyParser: false, // Disable built-in parser to handle FormData
  },
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    // Check if the request is multipart/form-data
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data" },
        { status: 400 }
      );
    }

    // Parse the FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const docType = formData.get("docType") as string;

    if (!file || !docType) {
      return NextResponse.json(
        { error: "Missing file or document type" },
        { status: 400 }
      );
    }

    // Get the file details
    const fileBytes = await file.arrayBuffer();
    const buffer = Buffer.from(fileBytes);
    const fileName = file.name;
    const fileType = file.type;

    // Generate a unique file id
    const fileId = uuidv4();
    const filePath = `therapist-applications/${docType}/${fileId}-${fileName}`;

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from("applicants-files") // Using your bucket name
      .upload(filePath, buffer, {
        contentType: fileType,
        cacheControl: "3600",
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload file to storage: " + error.message },
        { status: 500 }
      );
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from("applicants-files")
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData.publicUrl;

    // Create a record in the database
    const fileUpload = await prisma.fileUpload.create({
      data: {
        id: fileId,
        fileName,
        fileSize: buffer.length,
        fileType,
        fileUrl,
        docType,
        uploadedBy: userId || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      fileUrl,
      uploadId: fileId,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        error:
          "Failed to upload file: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
