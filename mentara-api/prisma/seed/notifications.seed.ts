// Simple Notifications Seed Module
// Creates basic notification records using only the existing Notification model

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { SEED_CONFIG } from './config';

// Simple notification types that exist in the schema
const NOTIFICATION_TYPES = [
  'APPOINTMENT_REMINDER',
  'MESSAGE_RECEIVED', 
  'WORKSHEET_ASSIGNED',
  'COMMUNITY_POST',
  'THERAPIST_APPROVED',
  'PAYMENT_SUCCESS',
  'SYSTEM_UPDATE',
] as const;

const NOTIFICATION_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;

export async function seedNotifications(
  prisma: PrismaClient,
  users: any[],
  relationships: any[],
  meetings: any[],
  worksheets: any[],
  messages: any[],
  mode: 'simple' | 'comprehensive' = 'comprehensive'
) {
  console.log('🔔 Creating basic notifications...');

  const config = SEED_CONFIG;
  const notifications: any[] = [];
  const notificationCount = users.length * config.NOTIFICATIONS.NOTIFICATIONS_PER_USER;

  for (const user of users) {
    const userNotificationCount = faker.number.int({ min: 1, max: 3 });
    
    for (let i = 0; i < userNotificationCount; i++) {
      const type = faker.helpers.arrayElement(NOTIFICATION_TYPES);
      const priority = faker.helpers.arrayElement(NOTIFICATION_PRIORITIES);
      const isRead = faker.datatype.boolean({ probability: config.NOTIFICATIONS.READ_RATE });
      
      // Generate context-appropriate title and message
      const { title, message } = generateNotificationContent(type, user);
      
      try {
        const notification = await prisma.notification.create({
          data: {
            userId: user.id,
            type,
            priority,
            title,
            message,
            isRead,
            readAt: isRead ? faker.date.recent() : null,
            data: generateNotificationData(type),
            actionUrl: generateActionUrl(type),
            createdAt: faker.date.past({ years: 0.1 }), // Within ~1 month
          },
        });
        
        notifications.push(notification);
      } catch (error) {
        console.log(`⚠️ Skipped duplicate notification for ${user.firstName}`);
      }
    }
  }

  console.log(`✅ Created ${notifications.length} notifications`);
  console.log(`   📬 ${notifications.filter(n => !n.isRead).length} unread`);
  console.log(`   📫 ${notifications.filter(n => n.isRead).length} read`);
  
  return { notifications };
}

function generateNotificationContent(type: string, user: any): { title: string; message: string } {
  const templates = {
    APPOINTMENT_REMINDER: {
      title: 'Upcoming Therapy Session',
      message: 'You have a therapy session scheduled for tomorrow at 2:00 PM.',
    },
    MESSAGE_RECEIVED: {
      title: 'New Message',
      message: 'You have received a new message from your therapist.',
    },
    WORKSHEET_ASSIGNED: {
      title: 'New Worksheet Assigned',
      message: 'Your therapist has assigned you a new worksheet to complete.',
    },
    COMMUNITY_POST: {
      title: 'New Community Post',
      message: 'There\'s a new post in the Anxiety Support community.',
    },
    THERAPIST_APPROVED: {
      title: 'Application Approved',
      message: 'Congratulations! Your therapist application has been approved.',
    },
    PAYMENT_SUCCESS: {
      title: 'Payment Processed',
      message: 'Your payment for the therapy session has been processed successfully.',
    },
    SYSTEM_UPDATE: {
      title: 'Platform Update',
      message: 'Mentara has been updated with new features and improvements.',
    },
  };

  const template = templates[type] || {
    title: 'Notification',
    message: 'You have a new notification.',
  };

  return {
    title: template.title,
    message: template.message,
  };
}

function generateNotificationData(type: string): any {
  const dataTemplates = {
    APPOINTMENT_REMINDER: {
      meetingId: faker.string.uuid(),
      sessionTime: faker.date.future().toISOString(),
    },
    MESSAGE_RECEIVED: {
      conversationId: faker.string.uuid(),
      senderId: faker.string.uuid(),
    },
    WORKSHEET_ASSIGNED: {
      worksheetId: faker.string.uuid(),
      dueDate: faker.date.future().toISOString(),
    },
    COMMUNITY_POST: {
      postId: faker.string.uuid(),
      communitySlug: faker.helpers.arrayElement(['anxiety-support', 'depression-support', 'adhd-support']),
    },
    PAYMENT_SUCCESS: {
      amount: faker.number.float({ min: 80, max: 200, fractionDigits: 2 }),
      paymentId: faker.string.uuid(),
    },
  };

  return dataTemplates[type] || {};
}

function generateActionUrl(type: string): string | null {
  const urlTemplates = {
    APPOINTMENT_REMINDER: '/client/meetings',
    MESSAGE_RECEIVED: '/client/messages',
    WORKSHEET_ASSIGNED: '/client/worksheets',
    COMMUNITY_POST: '/client/communities',
    THERAPIST_APPROVED: '/therapist/dashboard',
    PAYMENT_SUCCESS: '/client/billing',
    SYSTEM_UPDATE: '/updates',
  };

  return urlTemplates[type] || null;
}