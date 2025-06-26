import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupBookingDemo() {
  console.log('Setting up booking demo data...');

  // Get some therapists and clients
  const therapists = await prisma.therapist.findMany({
    where: { 
      approved: true,
      status: 'approved'
    },
    take: 3,
  });

  const clients = await prisma.user.findMany({
    where: { role: 'user' },
    take: 5,
  });

  if (therapists.length === 0 || clients.length === 0) {
    console.log(
      'No therapists or clients found. Please create some users first.',
    );
    return;
  }

  console.log(
    `Found ${therapists.length} therapists and ${clients.length} clients`,
  );

  // Assign therapists to clients
  for (const client of clients) {
    const therapist = therapists[Math.floor(Math.random() * therapists.length)];

    await prisma.clientTherapist.upsert({
      where: {
        clientId_therapistId: {
          clientId: client.id,
          therapistId: therapist.userId,
        },
      },
      update: {},
      create: {
        clientId: client.id,
        therapistId: therapist.userId,
        status: 'active',
      },
    });
  }

  console.log('Assigned therapists to clients');

  // Set up availability for therapists
  for (const therapist of therapists) {
    // Monday to Friday, 9 AM to 5 PM
    for (let day = 1; day <= 5; day++) {
      await prisma.therapistAvailability.upsert({
        where: {
          therapistId_dayOfWeek_startTime_endTime: {
            therapistId: therapist.userId,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '17:00',
          },
        },
        update: { isAvailable: true },
        create: {
          therapistId: therapist.userId,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
        },
      });
    }

    // Saturday, 9 AM to 12 PM
    await prisma.therapistAvailability.upsert({
      where: {
        therapistId_dayOfWeek_startTime_endTime: {
          therapistId: therapist.userId,
          dayOfWeek: 6,
          startTime: '09:00',
          endTime: '12:00',
        },
      },
      update: { isAvailable: true },
      create: {
        therapistId: therapist.userId,
        dayOfWeek: 6,
        startTime: '09:00',
        endTime: '12:00',
        isAvailable: true,
      },
    });
  }

  console.log('Set up therapist availability');

  // Create some sample meetings
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  dayAfterTomorrow.setHours(14, 0, 0, 0);

  for (let i = 0; i < 3; i++) {
    const client = clients[i % clients.length];
    const therapist = therapists[i % therapists.length];

    const startTime = new Date(tomorrow);
    startTime.setHours(10 + i, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 60);

    await prisma.meeting.create({
      data: {
        title: `Sample Session ${i + 1}`,
        description: 'This is a sample therapy session',
        startTime,
        endTime,
        duration: 60,
        meetingType: 'video',
        clientId: client.id,
        therapistId: therapist.userId,
        status: 'SCHEDULED',
      },
    });
  }

  console.log('Created sample meetings');
  console.log('Booking demo setup complete!');
}

async function main() {
  try {
    await setupBookingDemo();
  } catch (error) {
    console.error('Error setting up booking demo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
