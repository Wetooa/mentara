import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Webhook } from "svix";

export async function POST(req: Request) {
  // Get the Clerk webhook event
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  // If there's no signature or other required headers, return an error
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Missing svix headers", { status: 400 });
  }

  // Get the event body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook
  // This is a simplified version. In production, use actual webhook verification
  // with CLERK_WEBHOOK_SECRET environment variable
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (webhookSecret) {
    const wh = new Webhook(webhookSecret);
    try {
      wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new NextResponse("Webhook verification failed", { status: 400 });
    }
  }

  // Process the webhook event
  const { type, data } = payload as WebhookEvent;

  // Handle user creation or update events
  if (type === "user.created" || type === "user.updated") {
    const { id, email_addresses, public_metadata } = data;

    // Check if the user has admin privileges in their metadata
    const isAdmin = public_metadata?.role === "admin";

    if (isAdmin && email_addresses?.length > 0) {
      // If the user has admin privileges, add or update them in the AdminUser table
      try {
        const adminUser = await prisma.adminUser.upsert({
          where: { clerkUserId: id },
          update: {
            email: email_addresses[0].email_address,
            role: public_metadata.role || "admin",
            permissions: public_metadata.permissions || ["view", "edit"],
          },
          create: {
            clerkUserId: id,
            email: email_addresses[0].email_address,
            role: public_metadata.role || "admin",
            permissions: public_metadata.permissions || ["view", "edit"],
          },
        });

        console.log("Admin user synced to database:", adminUser.id);
      } catch (error) {
        console.error("Error syncing admin user to database:", error);
      }
    }
  }

  // Handle user deletion
  if (type === "user.deleted") {
    const { id } = data;

    // Remove the user from the AdminUser table if they exist
    try {
      const deletedAdmin = await prisma.adminUser.delete({
        where: { clerkUserId: id },
      });

      console.log("Admin user removed from database:", deletedAdmin.id);
    } catch (error) {
      // User might not be an admin, so deletion may fail - this is fine
      console.log("No admin user found to delete for Clerk user ID:", id);
    }
  }

  return NextResponse.json({ success: true });
}
