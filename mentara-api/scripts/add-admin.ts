import { PrismaClient } from '@prisma/client';
import { env } from 'process';

const prisma = new PrismaClient();

async function addAdminUser() {
  // Replace these values with your Clerk user's information
  const clerkUserId = process.argv[2]; // Passed as first argument to the script
  const email = process.argv[3]; // Passed as second argument to the script
  const firstName = process.argv[4] || 'Admin'; // Optional first name
  const lastName = process.argv[5] || 'User'; // Optional last name

  if (!clerkUserId || !email) {
    console.error(
      'Usage: bun add-admin.ts <clerkUserId> <email> [firstName] [lastName]',
    );
    process.exit(1);
  }

  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: clerkUserId },
      include: { admin: true },
    });

    if (existingUser?.admin) {
      console.log(`Admin user with Clerk ID ${clerkUserId} already exists.`);
      return;
    }

    // Create or update the user with admin role
    const user = await prisma.user.upsert({
      where: { id: clerkUserId },
      update: { role: 'admin' },
      create: {
        id: clerkUserId,
        email,
        firstName,
        lastName,
        role: 'admin',
      },
    });

    // Create the admin record
    const admin = await prisma.admin.create({
      data: {
        userId: clerkUserId,
        permissions: ['view', 'edit', 'delete'],
        adminLevel: 'admin',
      },
    });

    console.log('Successfully added admin user:');
    console.log({ user, admin });
  } catch (error) {
    console.error('Error adding admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAdminUser();
