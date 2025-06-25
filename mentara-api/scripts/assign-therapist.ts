import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignTherapistToUser(
  userClerkId: string,
  therapistClerkId: string,
) {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { clerkId: userClerkId },
    });

    if (!user) {
      console.error(`User with clerkId ${userClerkId} not found`);
      return;
    }

    // Find the therapist
    const therapist = await prisma.therapist.findUnique({
      where: { clerkUserId: therapistClerkId },
    });

    if (!therapist) {
      console.error(`Therapist with clerkUserId ${therapistClerkId} not found`);
      return;
    }

    // Assign the therapist to the user
    const updatedUser = await prisma.user.update({
      where: { clerkId: userClerkId },
      data: { therapistId: therapist.id },
      include: { therapist: true },
    });

    console.log(
      `Successfully assigned therapist ${therapist.firstName} ${therapist.lastName} to user ${user.firstName} ${user.lastName}`,
    );
    console.log('Updated user:', updatedUser);
  } catch (error) {
    console.error('Error assigning therapist:', error);
  }
}

async function assignRandomTherapists() {
  try {
    // Get all users without therapists
    const usersWithoutTherapist = await prisma.user.findMany({
      where: {
        therapistId: null,
        isActive: true,
        role: 'user',
      },
    });

    // Get all active therapists
    const therapists = await prisma.therapist.findMany({
      where: {
        isActive: true,
      },
    });

    if (therapists.length === 0) {
      console.log('No active therapists found');
      return;
    }

    console.log(
      `Found ${usersWithoutTherapist.length} users without therapists`,
    );
    console.log(`Found ${therapists.length} active therapists`);

    // Assign therapists randomly
    for (let i = 0; i < usersWithoutTherapist.length; i++) {
      const user = usersWithoutTherapist[i];
      const therapist = therapists[i % therapists.length]; // Round-robin assignment

      await prisma.user.update({
        where: { id: user.id },
        data: { therapistId: therapist.id },
      });

      console.log(
        `Assigned therapist ${therapist.firstName} ${therapist.lastName} to user ${user.firstName} ${user.lastName}`,
      );
    }

    console.log('Finished assigning therapists to users');
  } catch (error) {
    console.error('Error in random assignment:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage:');
    console.log(
      '  npm run assign-therapist -- <userClerkId> <therapistClerkId>',
    );
    console.log('  npm run assign-random-therapists');
    return;
  }

  if (args[0] === 'random') {
    await assignRandomTherapists();
  } else if (args.length === 2) {
    const [userClerkId, therapistClerkId] = args;
    await assignTherapistToUser(userClerkId, therapistClerkId);
  } else {
    console.log('Invalid arguments');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
