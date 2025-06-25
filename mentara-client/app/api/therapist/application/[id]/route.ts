import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { generateSecurePassword } from "@/lib/utils";
// Add emailjs-com for server-side email sending
import * as emailjs from "@emailjs/nodejs";

// Configure EmailJS with service credentials
const emailjsConfig = {
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "",
  privateKey: process.env.EMAILJS_PRIVATE_KEY || "",
};

// Helper function to send approval email
async function sendApprovalEmail(application: any, generatedPassword: string) {
  try {
    const templateParams = {
      name: `${application.firstName} ${application.lastName}`,
      email: application.email,
      status: "approved",
      message: "Your application has been approved!",
      password: generatedPassword,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://mentara.app"}/therapist-welcome`,
    };

    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_APPROVED || "",
      templateParams,
      emailjsConfig
    );

    return true;
  } catch (error) {
    console.error("Failed to send approval email:", error);
    return false;
  }
}

// Helper function to send rejection email
async function sendRejectionEmail(application: any) {
  try {
    const templateParams = {
      name: `${application.firstName} ${application.lastName}`,
      email: application.email,
      status: "rejected",
      message: "Unfortunately, your application was not approved at this time.",
    };

    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_REJECTED || "",
      templateParams,
      emailjsConfig
    );

    return true;
  } catch (error) {
    console.error("Failed to send rejection email:", error);
    return false;
  }
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { userId } = await auth();
    const applicationId = await params.id;

    // Check if user is an admin
    const admin = await db.adminUser.findUnique({
      where: { clerkUserId: userId || "" },
    });

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get the application
    const application = await db.therapistApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Check if the application has uploadedDocuments field
    let uploadedDocs = [];

    // If uploadedDocuments field exists and contains an array of document references
    if (application.uploadedDocuments) {
      try {
        // Check if it's already parsed or needs parsing
        const docs =
          typeof application.uploadedDocuments === "string"
            ? JSON.parse(application.uploadedDocuments)
            : application.uploadedDocuments;

        if (Array.isArray(docs)) {
          uploadedDocs = docs;
        }
      } catch (e) {
        console.error("Error parsing uploaded documents:", e);
      }
    }

    // Return application with uploaded documents data
    return NextResponse.json({
      application: {
        ...application,
        uploadedDocuments: uploadedDocs,
      },
    });
  } catch (error) {
    console.error("Error fetching therapist application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { userId } = await auth();
    const applicationId = await params.id;
    const { status } = await req.json();

    // Check if user is an admin
    const admin = await db.adminUser.findUnique({
      where: { clerkUserId: userId || "" },
    });

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Validate the status
    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get the application
    const application = await db.therapistApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // If already processed, reject the request
    if (application.status !== "pending") {
      return NextResponse.json(
        { error: "Application has already been processed" },
        { status: 400 }
      );
    }

    // Update the application status
    const updatedApplication = await db.therapistApplication.update({
      where: { id: applicationId },
      data: {
        status,
        processingDate: new Date(),
        processedBy: admin.id,
      },
    });

    let therapistAccount = null;
    let generatedPassword = null;

    // If approved, create a therapist account in Clerk and our database
    if (status === "approved") {
      try {
        // Generate a secure random password
        generatedPassword = generateSecurePassword(12);

        const client = await clerkClient();

        // console.log(application);

        // Create the user in Clerk
        const clerkUser = await client.users.createUser({
          emailAddress: [application.email],
          password: generatedPassword,
          phoneNumber: application.phoneNumber,
          firstName: application.firstName,
          lastName: application.lastName,
          publicMetadata: {
            role: "therapist",
            applicationId: application.id,
          },
        });

        // Create the therapist in our database
        therapistAccount = await db.therapist.create({
          data: {
            clerkUserId: clerkUser.id,
            email: application.email,
            firstName: application.firstName,
            lastName: application.lastName,
            mobile: application.mobile,
            province: application.province,
            providerType: application.providerType,
            professionalLicenseType: application.professionalLicenseType,
            prcLicenseNumber: application.prcLicenseNumber,
            licenseExpiration: application.expirationDateOfLicense,
            yearsOfExperience: parseInt(application.yearsOfExperience) || 0,
            areasOfExpertise: application.areasOfExpertise,
            therapeuticApproaches: application.therapeuticApproachesUsedList,
            languages: application.languagesOffered,
            weeklyAvailability: application.weeklyAvailability,
            sessionLength: application.preferredSessionLength,
            accepts: application.accepts,
            profileComplete: true,
            isVerified: true,
            applicationId: application.id,
          },
        });

        // Update the application to link to the therapist account
        await db.therapistApplication.update({
          where: { id: applicationId },
          data: {
            therapist: {
              connect: {
                id: therapistAccount.id,
              },
            },
          },
        });

        // Send approval email
        await sendApprovalEmail(application, generatedPassword);
      } catch (error) {
        console.error("Error creating therapist account:", error);

        // Revert the application status change
        await db.therapistApplication.update({
          where: { id: applicationId },
          data: {
            status: "pending",
            processingDate: null,
            processedBy: null,
          },
        });

        return NextResponse.json(
          { error: "Failed to create therapist account" },
          { status: 500 }
        );
      }
    } else if (status === "rejected") {
      // Send rejection email
      await sendRejectionEmail(application);
    }

    return NextResponse.json({
      success: true,
      status,
      application: updatedApplication,
      therapistAccount,
      generatedPassword, // This will be null for rejection
    });
  } catch (error) {
    console.error("Error updating therapist application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}
