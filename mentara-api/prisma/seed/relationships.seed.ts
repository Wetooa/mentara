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

export async function seedMeetingNotes(
  prisma: PrismaClient,
  meetings: any[]
) {
  console.log('📝 Creating meeting notes for therapy sessions...');

  const meetingNotes: any[] = [];

  // Create notes for completed meetings (about 80% have notes)
  const completedMeetings = meetings.filter(meeting => meeting.status === 'COMPLETED');
  const notesCount = Math.floor(completedMeetings.length * 0.8);
  const meetingsWithNotes = faker.helpers.arrayElements(completedMeetings, notesCount);

  const noteTemplates = [
    "Client presented with increased anxiety this week. Discussed coping strategies including deep breathing exercises and mindfulness techniques. Homework assigned: practice daily mindfulness for 10 minutes.",
    "Significant progress noted in mood regulation. Client reported using CBT techniques successfully during a challenging work situation. Continue current treatment plan with focus on thought challenging.",
    "Session focused on trauma processing using EMDR techniques. Client showed good tolerance and engagement. Plan to continue trauma work in next session with additional grounding exercises.",
    "Client expressed concerns about medication side effects. Discussed with prescribing psychiatrist. Mood tracking shows improvement over past 2 weeks. Continue current therapeutic approach.",
    "Family dynamics discussion revealed additional stressors. Introduced boundary-setting techniques and communication skills. Client motivated to practice assertiveness in family interactions.",
    "Crisis intervention session. Client experiencing acute anxiety related to work deadlines. Developed safety plan and coping strategies. Follow-up scheduled within 48 hours.",
    "Couples therapy session addressing communication patterns. Both partners engaged well with conflict resolution exercises. Homework: practice active listening techniques daily.",
    "Group therapy dynamics positive. Client participating more actively and providing peer support. Continue encouraging social skill development and community engagement.",
    "Substance use recovery focus. Client maintained sobriety for 2 weeks. Discussed triggers and relapse prevention strategies. Connected with sponsor and AA meetings.",
    "Sleep hygiene improvements noted. Client following sleep schedule consistently. Anxiety levels decreased. Continue behavioral interventions for insomnia management."
  ];

  for (const meeting of meetingsWithNotes) {
    try {
      const notes = await prisma.meetingNotes.create({
        data: {
          id: `meeting_notes_${meeting.id}_${Date.now()}`,
          meetingId: meeting.id,
          notes: faker.helpers.arrayElement(noteTemplates),
          createdAt: faker.date.between({
            from: meeting.startTime,
            to: new Date(meeting.startTime.getTime() + 24 * 60 * 60 * 1000) // Within 24 hours after meeting
          }),
        },
      });
      meetingNotes.push(notes);
    } catch (error) {
      // Skip if notes already exist
    }
  }

  console.log(`✅ Created ${meetingNotes.length} meeting notes`);
  return meetingNotes;
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