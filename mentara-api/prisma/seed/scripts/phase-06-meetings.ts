// Phase 6: Meetings & Payment Methods
// Creates therapy meetings and payment methods

import { PrismaClient } from '@prisma/client';
import { PhaseResult } from './progress-tracker';
import { seedMeetings, seedMeetingNotes, seedTherapistAvailability } from '../relationships.seed';
import { seedPaymentMethods } from '../payments.seed';

export async function runPhase06Meetings(
  prisma: PrismaClient,
  relationshipsData: any,
  usersData: any,
  config: 'comprehensive' | 'simple'
): Promise<PhaseResult> {
  console.log(`📅 PHASE 6: Creating meetings & payment methods (${config} mode)...`);

  try {
    // Check if meetings already exist (idempotent check)
    const existingCount = await prisma.meeting.count();
    if (existingCount > 0) {
      console.log(`⏭️ Found ${existingCount} existing meetings, skipping phase`);
      
      // Return existing data for next phases
      const existingMeetings = await prisma.meeting.findMany();
      const existingPaymentMethods = await prisma.paymentMethod.findMany();
      
      return {
        success: true,
        message: `Found ${existingCount} existing meetings`,
        skipped: true,
        data: { meetings: existingMeetings, paymentMethods: existingPaymentMethods },
      };
    }

    // Get relationships and users from previous phases
    const relationships = relationshipsData?.relationships || [];
    const users = usersData?.users || [];
    const therapists = usersData?.therapists || [];

    if (relationships.length === 0) {
      return {
        success: false,
        message: 'No relationships found for meeting creation',
      };
    }

    // Create meetings for client-therapist relationships
    const meetings = await seedMeetings(prisma, relationships, config);

    // Create meeting notes for completed meetings
    const meetingNotes = await seedMeetingNotes(prisma, meetings);

    // Create therapist availability schedules
    const availability = await seedTherapistAvailability(prisma, therapists);

    // Create payment methods for users
    const paymentMethods = await seedPaymentMethods(prisma, users);

    console.log(`✅ Phase 6 completed: Created ${meetings.length} meetings, ${meetingNotes.length} meeting notes, ${availability.length} availability slots, ${paymentMethods.length} payment methods`);

    return {
      success: true,
      message: `Meetings & payment methods phase completed - ${meetings.length} meetings, ${paymentMethods.length} payment methods created`,
      data: { meetings, meetingNotes, availability, paymentMethods },
    };

  } catch (error) {
    console.error('❌ Phase 6 failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}