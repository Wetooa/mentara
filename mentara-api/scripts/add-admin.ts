import { PrismaClient } from "@prisma/client";
import { env } from "process";

const prisma = new PrismaClient();

async function addAdminUser() {
  // Replace these values with your Clerk user's information
  const clerkUserId = process.argv[2]; // Passed as first argument to the script
  const email = process.argv[3]; // Passed as second argument to the script

  if (!clerkUserId || !email) {
    console.error("Usage: bun add-admin.ts <clerkUserId> <email>");
    process.exit(1);
  }

  try {
    // Check if the admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { clerkUserId },
    });

    if (existingAdmin) {
      console.log(`Admin user with Clerk ID ${clerkUserId} already exists.`);
      return;
    }

    // Create the admin user
    const adminUser = await prisma.adminUser.create({
      data: {
        clerkUserId,
        email,
        role: "admin",
        permissions: ["view", "edit", "delete"],
      },
    });

    console.log("Successfully added admin user:");
    console.log(adminUser);
  } catch (error) {
    console.error("Error adding admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addAdminUser();
