// Phase 12: Notifications & Device Tokens
// Creates notifications and device tokens for users

import { PrismaClient } from '@prisma/client';
import { PhaseResult } from './progress-tracker';
import { seedNotifications } from '../notifications.seed';

export async function runPhase12Notifications(
  prisma: PrismaClient,
  usersData: any,
  relationshipsData: any,
  meetingsData: any,
  worksheetsData: any,
  messagingData: any,
  config: 'comprehensive' | 'simple'
): Promise<PhaseResult> {
  console.log(`🔔 PHASE 12: Creating notifications & device tokens (${config} mode)...`);

  try {
    const existingCount = await prisma.notification.count();
    if (existingCount > 0) {
      console.log(`⏭️ Found ${existingCount} existing notifications, skipping phase`);
      return {
        success: true,
        message: `Found ${existingCount} existing notifications`,
        skipped: true,
      };
    }

    // Get users from users data
    const users = usersData.users || [];
    if (users.length === 0) {
      return {
        success: false,
        message: 'No users found in users data for notification creation',
      };
    }

    // Extract data arrays from phase results
    const relationships = relationshipsData?.relationships || [];
    const meetings = meetingsData?.meetings || [];
    const worksheets = worksheetsData?.worksheets || [];
    const messages = messagingData?.messages || [];

    // Create notifications using the existing seed function
    const result = await seedNotifications(
      prisma,
      users,
      relationships,
      meetings,
      worksheets,
      messages,
      config
    );

    const notifications = result.notifications || [];
    console.log(`✅ Phase 12 completed: Created ${notifications.length} notifications`);

    return {
      success: true,
      message: `Notifications phase completed - ${notifications.length} notifications created`,
      data: { notifications, deviceTokens: [] },
    };

  } catch (error) {
    console.error('❌ Phase 12 failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}