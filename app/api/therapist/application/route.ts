import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    // Safer JSON parsing with error handling
    let applicationData;
    try {
      applicationData = await req.json();
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON format in request body" },
        { status: 400 }
      );
    }

    console.log(
      "Received application data:",
      JSON.stringify({
        firstName: applicationData.firstName,
        lastName: applicationData.lastName,
        email: applicationData.email,
        // Log a subset of fields to avoid flooding logs
      })
    );

    // Validate the application data (you can add more validation as needed)
    if (
      !applicationData.firstName ||
      !applicationData.lastName ||
      !applicationData.email
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure all required JSON fields are properly formatted
    const sanitizedData = {
      clerkUserId: userId || null, // May be null if not authenticated
      status: "pending",

      // Personal Info
      firstName: String(applicationData.firstName || ""),
      lastName: String(applicationData.lastName || ""),
      email: String(applicationData.email || ""),
      mobile: String(applicationData.mobile || ""),
      province: String(applicationData.province || ""),

      // Professional Info
      providerType: String(applicationData.providerType || ""),
      professionalLicenseType: String(
        applicationData.professionalLicenseType || ""
      ),
      isPRCLicensed: String(applicationData.isPRCLicensed || "no"),
      prcLicenseNumber: String(applicationData.prcLicenseNumber || ""),
      expirationDateOfLicense: applicationData.expirationDateOfLicense
        ? new Date(applicationData.expirationDateOfLicense)
        : null,
      isLicenseActive: String(applicationData.isLicenseActive || "no"),
      yearsOfExperience: String(applicationData.yearsOfExperience || ""),
      areasOfExpertise: applicationData.areasOfExpertise || {},
      assessmentTools: applicationData.assessmentTools || {},
      therapeuticApproachesUsedList:
        applicationData.therapeuticApproachesUsedList || {},
      languagesOffered: applicationData.languagesOffered || {},

      // Practice Details
      providedOnlineTherapyBefore: String(
        applicationData.providedOnlineTherapyBefore || "no"
      ),
      comfortableUsingVideoConferencing: String(
        applicationData.comfortableUsingVideoConferencing || "no"
      ),
      weeklyAvailability: String(applicationData.weeklyAvailability || ""),
      preferredSessionLength: String(
        applicationData.preferredSessionLength || ""
      ),
      accepts: applicationData.accepts || {},

      // Compliance
      privateConfidentialSpace: String(
        applicationData.privateConfidentialSpace || "no"
      ),
      compliesWithDataPrivacyAct: String(
        applicationData.compliesWithDataPrivacyAct || "no"
      ),
      professionalLiabilityInsurance: String(
        applicationData.professionalLiabilityInsurance || "no"
      ),
      complaintsOrDisciplinaryActions: String(
        applicationData.complaintsOrDisciplinaryActions || "no"
      ),
      willingToAbideByPlatformGuidelines: String(
        applicationData.willingToAbideByPlatformGuidelines || "no"
      ),

      // Documents
      uploadedDocuments: applicationData.uploadedDocuments || {},

      // Store the complete application data as JSON for future reference
      applicationData: applicationData,
    };

    // Create the application in the database
    try {
      const application = await db.therapistApplication.create({
        data: sanitizedData,
      });

      return NextResponse.json({
        success: true,
        message: "Application submitted successfully",
        applicationId: application.id,
      });
    } catch (dbError) {
      console.error("Database error creating application:", dbError);
      return NextResponse.json(
        {
          error:
            "Database error: " +
            (dbError instanceof Error ? dbError.message : "Unknown error"),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error submitting therapist application:", error);
    return NextResponse.json(
      {
        error:
          "Failed to submit application: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}

// Get all applications (for admin use)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    // Check if user is an admin
    const admin = await db.adminUser.findUnique({
      where: { clerkUserId: userId || "" },
    });

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Extract query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Build the query
    const query: any = {};
    if (status) {
      query.status = status;
    }

    // Get the applications with pagination
    const applications = await db.therapistApplication.findMany({
      where: query,
      orderBy: { submissionDate: "desc" },
      take: limit,
      skip: offset,
    });

    // Count total applications for this query
    const totalCount = await db.therapistApplication.count({
      where: query,
    });

    return NextResponse.json({
      applications,
      pagination: {
        total: totalCount,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Error fetching therapist applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
