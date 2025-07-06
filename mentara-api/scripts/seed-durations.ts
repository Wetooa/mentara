import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDurations() {
  console.log('Meeting durations are handled by the Meeting model duration field...');
  console.log('No separate MeetingDuration table needed. Duration is stored as integer minutes in Meeting model.');
  console.log('Common durations: 15, 30, 45, 60, 90, 120 minutes');
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
