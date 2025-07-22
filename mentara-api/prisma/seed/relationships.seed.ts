// Relationships Seed Module
// Handles creation of client-therapist relationships and meetings

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { SEED_CONFIG } from './config';

export async function seedClientTherapistRelationships(
  prisma: PrismaClient,
  clients: any[],
  therapists: any[],
) {
  console.log('🤝 Creating client-therapist relationships...');

  const relationships: any[] = [];
  const assignmentCount = Math.floor(
    clients.length * SEED_CONFIG.RELATIONSHIPS.CLIENT_THERAPIST_RATIO,
  );
  const clientsToAssign = faker.helpers.arrayElements(clients, assignmentCount);

  for (const client of clientsToAssign) {
    const therapist = faker.helpers.arrayElement(therapists);
    const relationship = await prisma.clientTherapist.create({
      data: {
        clientId: client.user.id,
        therapistId: therapist.user.id,
        assignedAt: faker.date.past({ years: 1 }),
      },
    });
    relationships.push({ relationship, client, therapist });
    console.log(
      `✅ Assigned ${client.user.firstName} to therapist ${therapist.user.firstName}`,
    );
  }

  return relationships;
}

export async function seedMeetings(
  prisma: PrismaClient,
  relationships: any[]
) {
  console.log('📅 Creating meetings...');

  const meetings: any[] = [];

  for (const { relationship, client, therapist } of relationships) {
    const meetingCount = faker.number.int({
      min: 1,
      max: SEED_CONFIG.RELATIONSHIPS.MEETINGS_PER_RELATIONSHIP,
    });

    for (let i = 0; i < meetingCount; i++) {
      const startTime = faker.date.between({
        from: relationship.assignedAt,
        to: new Date(),
      });

      const meeting = await prisma.meeting.create({
        data: {
          clientId: client.user.id,
          therapistId: therapist.user.id,
          startTime,
          duration: faker.helpers.arrayElement([45, 60, 90]),
          status: faker.helpers.arrayElement([
            'COMPLETED',
            'COMPLETED',
            'SCHEDULED',
            'CANCELLED',
          ]),
          description: faker.lorem.paragraph(),
          meetingType: faker.helpers.arrayElement([
            'initial',
            'followup',
            'crisis',
            'assessment',
          ]),
        },
      });
      meetings.push(meeting);
    }
    console.log(
      `✅ Created ${meetingCount} meetings for ${client.user.firstName} with ${therapist.user.firstName}`,
    );
  }

  return meetings;
}

export async function seedTherapistAvailability(
  prisma: PrismaClient,
  therapists: any[]
) {
  console.log('📅 Creating therapist availability...');

  const availabilities: any[] = [];

  for (const { user } of therapists) {
    // Create availability for each day of the week
    const daysOfWeek = [1, 2, 3, 4, 5]; // Monday to Friday (1-5)
    const selectedDays = faker.helpers.arrayElements(
      daysOfWeek,
      faker.number.int({ min: 3, max: 5 }),
    );

    for (const dayOfWeek of selectedDays) {
      const availability = await prisma.therapistAvailability.create({
        data: {
          therapistId: user.id,
          dayOfWeek: dayOfWeek.toString(),
          startTime: faker.helpers.arrayElement(['09:00', '10:00', '11:00']),
          endTime: faker.helpers.arrayElement(['16:00', '17:00', '18:00']),
        },
      });
      availabilities.push(availability);
    }
    console.log(`✅ Created availability for therapist ${user.firstName}`);
  }

  return availabilities;
}