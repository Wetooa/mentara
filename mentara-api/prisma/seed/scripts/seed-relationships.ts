#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🤝 Seeding Client-Therapist Relationships (Standalone)...');
  
  try {
    // Check if relationships already exist
    const existingRelationships = await prisma.clientTherapist.count();
    if (existingRelationships > 0) {
      console.log(`ℹ️  Found ${existingRelationships} existing relationships`);
      const answer = process.env.FORCE_SEED || 'n';
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('✅ Relationships already exist, skipping...');
        return;
      }
    }

    // Fetch required data from database
    const clients = await prisma.user.findMany({
      where: { role: 'client' },
      include: { client: true }
    });
    
    const therapists = await prisma.user.findMany({
      where: { role: 'therapist' },
      include: { therapist: true }
    });

    if (clients.length === 0 || therapists.length === 0) {
      console.log('⚠️  No clients or therapists found. Please run user seeding first.');
      return;
    }

    console.log(`📊 Found ${clients.length} clients and ${therapists.length} therapists`);

    let relationshipsCreated = 0;
    let meetingsCreated = 0;
    let notesCreated = 0;

    // Create relationships - aim for each client to have 1-2 therapists
    const targetRelationshipsPerClient = faker.number.int({ min: 1, max: Math.min(2, therapists.length) });
    
    for (const client of clients) {
      const numRelationships = Math.min(targetRelationshipsPerClient, therapists.length);
      const assignedTherapists = faker.helpers.arrayElements(therapists, numRelationships);
      
      for (const therapist of assignedTherapists) {
        try {
          // Create client-therapist relationship
          const relationship = await prisma.clientTherapist.create({
            data: {
              clientId: client.id,
              therapistId: therapist.id,
              assignedAt: faker.date.between({
                from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Up to 1 year ago
                to: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)     // At least 30 days ago
              }),
            },
          });
          
          relationshipsCreated++;
          console.log(`✅ Created relationship: ${client.firstName} ↔ ${therapist.firstName}`);

          // Create meetings for this relationship
          const meetingCount = faker.number.int({ min: 2, max: 8 });
          
          for (let i = 0; i < meetingCount; i++) {
            try {
              const startTime = faker.date.between({
                from: relationship.assignedAt,
                to: new Date()
              });
              
              const duration = faker.helpers.arrayElement([30, 45, 60, 90]); // minutes
              const endTime = new Date(startTime.getTime() + duration * 60000);
              
              const meeting = await prisma.meeting.create({
                data: {
                  clientId: client.id,
                  therapistId: therapist.id,
                  title: `Therapy Session with ${client.firstName}`,
                  description: `Scheduled therapy session between ${client.firstName} and ${therapist.firstName}`,
                  startTime: startTime,
                  endTime: endTime,
                  duration: duration,
                  status: faker.helpers.arrayElement(['COMPLETED', 'COMPLETED', 'COMPLETED', 'SCHEDULED', 'CANCELLED']),
                  meetingType: 'video',
                  meetingUrl: `https://mentara.app/meeting/${faker.string.uuid()}`,
                },
              });
              
              meetingsCreated++;

              // Create meeting notes for completed meetings
              if (meeting.status === 'COMPLETED' && faker.datatype.boolean({ probability: 0.8 })) {
                const noteTemplates = [
                  "Client showed good progress in managing anxiety symptoms. Discussed coping strategies and homework assignments.",
                  "Session focused on cognitive behavioral techniques. Client demonstrated understanding of thought pattern recognition.",
                  "Explored family dynamics and their impact on current stress levels. Client expressed readiness for family therapy.",
                  "Reviewed medication effects and side effects. Coordinated with psychiatrist for dosage adjustment.",
                  "Crisis intervention session. Client in stable condition after implementing safety plan discussed in previous sessions.",
                  "Couples therapy session addressing communication patterns. Both partners engaged well with conflict resolution exercises.",
                  "Group therapy dynamics positive. Client participating more actively and providing peer support to others.",
                  "Substance use recovery focus. Client maintained sobriety for 2 weeks. Discussed triggers and prevention strategies.",
                  "Sleep hygiene improvements noted. Client following sleep schedule consistently. Anxiety levels decreased significantly.",
                  "Breakthrough session with significant emotional processing. Client made important connections about past trauma."
                ];

                try {
                  await prisma.meetingNotes.create({
                    data: {
                      id: `meeting_notes_${meeting.id}_${Date.now()}`,
                      meetingId: meeting.id,
                      notes: faker.helpers.arrayElement(noteTemplates),
                      createdAt: faker.date.between({
                        from: meeting.startTime,
                        to: new Date(meeting.startTime.getTime() + 24 * 60 * 60 * 1000)
                      }),
                    },
                  });
                  notesCreated++;
                } catch (error) {
                  // Skip if notes already exist
                }
              }

            } catch (error) {
              console.log(`⚠️  Skipped meeting creation for ${client.firstName} & ${therapist.firstName}`);
            }
          }

        } catch (error) {
          console.log(`⚠️  Failed to create relationship between ${client.firstName} and ${therapist.firstName}: ${error.message}`);
        }
      }
    }

    // Create therapist availability schedules
    console.log('\n📅 Creating therapist availability...');
    let availabilityCreated = 0;
    
    for (const therapist of therapists) {
      const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const workingDays = faker.helpers.arrayElements(daysOfWeek, faker.number.int({ min: 3, max: 6 }));
      
      for (const day of workingDays) {
        try {
          const startHour = faker.number.int({ min: 8, max: 12 });
          const endHour = faker.number.int({ min: 14, max: 18 });
          
          await prisma.therapistAvailability.create({
            data: {
              therapistId: therapist.id,
              dayOfWeek: day,
              startTime: `${startHour.toString().padStart(2, '0')}:00`,
              endTime: `${endHour.toString().padStart(2, '0')}:00`,
              timezone: 'UTC',
              isAvailable: true,
              notes: faker.helpers.arrayElement([
                'Regular office hours',
                'Available for emergency sessions',
                'Preferred time for new clients',
                'Video sessions only',
                null
              ]),
            },
          });
          availabilityCreated++;
        } catch (error) {
          // Skip if availability already exists for this day
        }
      }
    }

    console.log('\n🎉 Client-Therapist relationships seeded successfully!');
    console.log('📈 Summary:');
    console.log(`   🤝 Relationships created: ${relationshipsCreated}`);
    console.log(`   📅 Meetings created: ${meetingsCreated}`);
    console.log(`   📝 Meeting notes created: ${notesCreated}`);
    console.log(`   ⏰ Availability slots created: ${availabilityCreated}`);

  } catch (error) {
    console.error('❌ Error seeding relationships:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during relationship seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });