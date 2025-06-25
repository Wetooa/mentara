import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDurations() {
  console.log('Seeding meeting durations...');

  const durations = [
    { name: '15 minutes', duration: 15, sortOrder: 1 },
    { name: '30 minutes', duration: 30, sortOrder: 2 },
    { name: '45 minutes', duration: 45, sortOrder: 3 },
    { name: '1 hour', duration: 60, sortOrder: 4 },
    { name: '1.5 hours', duration: 90, sortOrder: 5 },
    { name: '2 hours', duration: 120, sortOrder: 6 },
  ];

  for (const duration of durations) {
    await prisma.meetingDuration.upsert({
      where: { duration: duration.duration },
      update: duration,
      create: duration,
    });
  }

  console.log('Meeting durations seeded successfully!');
}

async function main() {
  try {
    await seedDurations();
  } catch (error) {
    console.error('Error seeding durations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
