// Notifications Seed Module
// Handles creation of notifications, settings, and device tokens

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedNotifications(
  prisma: PrismaClient,
  allUsers: any[],
  relationships: any[],
  meetings: any[],
  worksheets: any[],
  messages: any[]
) {
  console.log('🔔 Creating notifications and settings...');

  const notifications: any[] = [];
  const notificationSettings: any[] = [];
  const deviceTokens: any[] = [];
  const scheduledNotifications: any[] = [];

  // Create notification settings for all users
  for (const user of allUsers) {
    try {
      const settings = await prisma.notificationSettings.create({
        data: {
          userId: user.id,
          emailAppointmentReminders: faker.datatype.boolean({ probability: 0.9 }),
          emailNewMessages: faker.datatype.boolean({ probability: 0.7 }),
          emailWorksheetUpdates: faker.datatype.boolean({ probability: 0.8 }),
          emailSystemUpdates: faker.datatype.boolean({ probability: 0.3 }),
          emailMarketing: faker.datatype.boolean({ probability: 0.2 }),
          pushAppointmentReminders: faker.datatype.boolean({ probability: 0.95 }),
          pushNewMessages: faker.datatype.boolean({ probability: 0.8 }),
          pushWorksheetUpdates: faker.datatype.boolean({ probability: 0.7 }),
          pushSystemUpdates: faker.datatype.boolean({ probability: 0.6 }),
          inAppMessages: faker.datatype.boolean({ probability: 0.9 }),
          inAppUpdates: faker.datatype.boolean({ probability: 0.8 }),
          quietHoursEnabled: faker.datatype.boolean({ probability: 0.4 }),
          quietHoursStart: faker.datatype.boolean({ probability: 0.4 }) ? '22:00' : null,
          quietHoursEnd: faker.datatype.boolean({ probability: 0.4 }) ? '08:00' : null,
          quietHoursTimezone: faker.datatype.boolean({ probability: 0.4 }) ? 'America/New_York' : null,
        },
      });
      notificationSettings.push(settings);
    } catch (error) {
      console.error(`Failed to create notification settings for user ${user.id}:`, error);
    }
  }

  // Create device tokens for active users
  const activeUsers = faker.helpers.arrayElements(allUsers, Math.min(40, allUsers.length));
  for (const user of activeUsers) {
    try {
      // Most users have 1-2 devices
      const deviceCount = faker.number.int({ min: 1, max: 2 });
      
      for (let i = 0; i < deviceCount; i++) {
        const platform = faker.helpers.arrayElement(['IOS', 'ANDROID', 'WEB']);
        
        const token = await prisma.deviceToken.create({
          data: {
            userId: user.id,
            token: generateDeviceToken(platform),
            platform,
            isActive: faker.datatype.boolean({ probability: 0.9 }),
            lastUsedAt: faker.date.recent({ days: 30 }),
            deviceInfo: generateDeviceInfo(platform),
          },
        });
        deviceTokens.push(token);
      }
    } catch (error) {
      console.error(`Failed to create device tokens for user ${user.id}:`, error);
    }
  }

  // Create notifications for various events
  
  // Message notifications
  const recentMessages = messages.slice(0, Math.min(messages.length, 50));
  for (const message of recentMessages) {
    try {
      // Get conversation participants to notify
      const participants = await prisma.conversationParticipant.findMany({
        where: { 
          conversationId: message.conversationId,
          userId: { not: message.senderId },
        },
      });

      for (const participant of participants) {
        if (faker.datatype.boolean({ probability: 0.8 })) { // 80% chance of notification
          const notification = await prisma.notification.create({
            data: {
              userId: participant.userId,
              title: 'New Message',
              message: `You have a new message: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
              type: 'MESSAGE_RECEIVED',
              priority: 'NORMAL',
              actionUrl: `/messages/${message.conversationId}`,
              data: {
                messageId: message.id,
                senderId: message.senderId,
                conversationId: message.conversationId,
              },
              isRead: faker.datatype.boolean({ probability: 0.6 }),
              readAt: faker.datatype.boolean({ probability: 0.6 }) ? faker.date.recent({ days: 7 }) : null,
              createdAt: message.createdAt,
            },
          });
          notifications.push(notification);
        }
      }
    } catch (error) {
      // Continue with next message if this one fails
    }
  }

  // Appointment reminder notifications
  const upcomingMeetings = meetings.filter(meeting => 
    meeting.status === 'SCHEDULED' && new Date(meeting.startTime) > new Date()
  );
  
  for (const meeting of upcomingMeetings.slice(0, 20)) {
    try {
      // Notify both client and therapist
      const participants = [meeting.clientId, meeting.therapistId];
      
      for (const userId of participants) {
        const notification = await prisma.notification.create({
          data: {
            userId,
            title: 'Appointment Reminder',
            message: `You have an upcoming therapy session on ${new Date(meeting.startTime).toLocaleDateString()} at ${new Date(meeting.startTime).toLocaleTimeString()}`,
            type: 'APPOINTMENT_REMINDER',
            priority: 'HIGH',
            actionUrl: `/appointments/${meeting.id}`,
            data: {
              meetingId: meeting.id,
              startTime: meeting.startTime,
              duration: meeting.duration,
            },
            isRead: false, // Appointment reminders are usually unread
            scheduledFor: new Date(new Date(meeting.startTime).getTime() - 24 * 60 * 60 * 1000), // 24 hours before
            createdAt: faker.date.recent({ days: 3 }),
          },
        });
        notifications.push(notification);
      }
    } catch (error) {
      // Continue with next meeting if this one fails
    }
  }

  // Worksheet notifications
  const recentWorksheets = worksheets.slice(0, Math.min(worksheets.length, 30));
  for (const worksheet of recentWorksheets) {
    try {
      if (worksheet.status === 'assigned') {
        // Worksheet assigned notification
        const notification = await prisma.notification.create({
          data: {
            userId: worksheet.clientId,
            title: 'New Worksheet Assigned',
            message: `Your therapist has assigned you a new worksheet: ${worksheet.title}`,
            type: 'WORKSHEET_ASSIGNED',
            priority: 'NORMAL',
            actionUrl: `/worksheets/${worksheet.id}`,
            data: {
              worksheetId: worksheet.id,
              title: worksheet.title,
              dueDate: worksheet.dueDate,
            },
            isRead: faker.datatype.boolean({ probability: 0.7 }),
            readAt: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.recent({ days: 5 }) : null,
            createdAt: worksheet.createdAt,
          },
        });
        notifications.push(notification);
      }

      if (worksheet.feedback && worksheet.therapistId) {
        // Worksheet feedback notification
        const notification = await prisma.notification.create({
          data: {
            userId: worksheet.clientId,
            title: 'Worksheet Feedback Received',
            message: `Your therapist has provided feedback on your "${worksheet.title}" worksheet`,
            type: 'WORKSHEET_FEEDBACK',
            priority: 'NORMAL',
            actionUrl: `/worksheets/${worksheet.id}`,
            data: {
              worksheetId: worksheet.id,
              title: worksheet.title,
            },
            isRead: faker.datatype.boolean({ probability: 0.8 }),
            readAt: faker.datatype.boolean({ probability: 0.8 }) ? faker.date.recent({ days: 3 }) : null,
            createdAt: faker.date.between({
              from: worksheet.submittedAt || worksheet.createdAt,
              to: new Date(),
            }),
          },
        });
        notifications.push(notification);
      }
    } catch (error) {
      // Continue with next worksheet if this one fails
    }
  }

  // Relationship establishment notifications
  for (const { relationship, client, therapist } of relationships.slice(0, 15)) {
    try {
      // Notify client about relationship establishment
      const clientNotification = await prisma.notification.create({
        data: {
          userId: client.user.id,
          title: 'Therapist Assigned',
          message: `You have been matched with ${therapist.user.firstName} ${therapist.user.lastName}. You can now schedule your first session.`,
          type: 'RELATIONSHIP_ESTABLISHED',
          priority: 'HIGH',
          actionUrl: `/therapist/${therapist.user.id}`,
          data: {
            therapistId: therapist.user.id,
            relationshipId: relationship.id,
          },
          isRead: faker.datatype.boolean({ probability: 0.9 }),
          readAt: faker.datatype.boolean({ probability: 0.9 }) ? faker.date.recent({ days: 7 }) : null,
          createdAt: relationship.assignedAt,
        },
      });
      notifications.push(clientNotification);

      // Notify therapist about new client
      const therapistNotification = await prisma.notification.create({
        data: {
          userId: therapist.user.id,
          title: 'New Client Assigned',
          message: `${client.user.firstName} ${client.user.lastName} has been assigned to your care. Review their profile and schedule an initial consultation.`,
          type: 'CLIENT_REQUEST_RECEIVED',
          priority: 'HIGH',
          actionUrl: `/client/${client.user.id}`,
          data: {
            clientId: client.user.id,
            relationshipId: relationship.id,
          },
          isRead: faker.datatype.boolean({ probability: 0.85 }),
          readAt: faker.datatype.boolean({ probability: 0.85 }) ? faker.date.recent({ days: 7 }) : null,
          createdAt: relationship.assignedAt,
        },
      });
      notifications.push(therapistNotification);
    } catch (error) {
      // Continue with next relationship if this one fails
    }
  }

  // System notifications
  const systemNotificationTypes = [
    {
      type: 'SYSTEM_UPDATE',
      title: 'Platform Update Available',
      message: 'New features and improvements are now available. Update your app to get the latest enhancements.',
      priority: 'NORMAL',
    },
    {
      type: 'SYSTEM_MAINTENANCE',
      title: 'Scheduled Maintenance',
      message: 'The platform will undergo scheduled maintenance on Sunday from 2:00 AM to 4:00 AM EST.',
      priority: 'HIGH',
    },
    {
      type: 'SECURITY_ALERT',
      title: 'Security Update',
      message: 'We\'ve enhanced our security measures. Please review your account settings.',
      priority: 'HIGH',
    },
  ];

  // Send system notifications to subset of users
  for (const sysNotif of systemNotificationTypes) {
    const recipients = faker.helpers.arrayElements(allUsers, faker.number.int({ min: 10, max: 25 }));
    
    for (const user of recipients) {
      try {
        const notification = await prisma.notification.create({
          data: {
            userId: user.id,
            title: sysNotif.title,
            message: sysNotif.message,
            type: sysNotif.type as any,
            priority: sysNotif.priority as any,
            actionUrl: '/settings',
            isRead: faker.datatype.boolean({ probability: 0.4 }),
            readAt: faker.datatype.boolean({ probability: 0.4 }) ? faker.date.recent({ days: 7 }) : null,
            createdAt: faker.date.recent({ days: 14 }),
          },
        });
        notifications.push(notification);
      } catch (error) {
        // Continue with next user if this one fails
      }
    }
  }

  // Create scheduled notifications for future appointments
  for (const meeting of upcomingMeetings.slice(0, 10)) {
    try {
      const scheduledTime = new Date(new Date(meeting.startTime).getTime() - 60 * 60 * 1000); // 1 hour before
      
      const scheduledNotif = await prisma.scheduledNotification.create({
        data: {
          userId: meeting.clientId,
          title: 'Session Starting Soon',
          body: `Your therapy session with ${faker.person.firstName()} starts in 1 hour`,
          type: 'APPOINTMENT_REMINDER',
          priority: 'HIGH',
          actionUrl: `/appointments/${meeting.id}`,
          notificationChannel: 'push',
          scheduledFor: scheduledTime,
          data: {
            meetingId: meeting.id,
            reminderType: '1hour',
          },
        },
      });
      scheduledNotifications.push(scheduledNotif);
    } catch (error) {
      // Continue with next meeting if this one fails
    }
  }

  // Calculate notification statistics
  const notificationStats = calculateNotificationStats(notifications);

  console.log(`📊 Notification system summary:`);
  console.log(`   🔔 Total notifications: ${notifications.length}`);
  console.log(`   ⚙️  Notification settings: ${notificationSettings.length}`);
  console.log(`   📱 Device tokens: ${deviceTokens.length}`);
  console.log(`   ⏰ Scheduled notifications: ${scheduledNotifications.length}`);
  console.log(`   ✅ Read notifications: ${notifications.filter(n => n.isRead).length}`);
  console.log(`   🔴 Unread notifications: ${notifications.filter(n => !n.isRead).length}`);
  console.log(`   🔥 High priority: ${notifications.filter(n => n.priority === 'HIGH').length}`);
  console.log(`   📊 Type distribution: ${notificationStats.typeDistribution}`);

  return { notifications, notificationSettings, deviceTokens, scheduledNotifications };
}

function generateDeviceToken(platform: string): string {
  if (platform === 'WEB') {
    // Web push token format
    return `BN${faker.string.alphanumeric(154)}:${faker.string.alphanumeric(139)}`;
  } else if (platform === 'IOS') {
    // iOS APNS token format (64 characters)
    return faker.string.hexadecimal({ length: 64, prefix: '' });
  } else {
    // Android FCM token format
    return `${faker.string.alphanumeric(11)}:APA91b${faker.string.alphanumeric(134)}`;
  }
}

function generateDeviceInfo(platform: string): any {
  const baseInfo = {
    appVersion: faker.system.semver(),
    language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de', 'pt']),
    timezone: faker.helpers.arrayElement([
      'America/New_York', 'America/Los_Angeles', 'Europe/London', 
      'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney'
    ]),
  };

  if (platform === 'IOS') {
    return {
      ...baseInfo,
      platform: 'iOS',
      deviceModel: faker.helpers.arrayElement([
        'iPhone 14 Pro', 'iPhone 14', 'iPhone 13 Pro', 'iPhone 13', 
        'iPhone 12', 'iPad Pro', 'iPad Air'
      ]),
      osVersion: faker.helpers.arrayElement(['16.4', '16.3', '16.2', '15.7']),
      screenSize: faker.helpers.arrayElement(['390x844', '428x926', '375x667']),
    };
  } else if (platform === 'ANDROID') {
    return {
      ...baseInfo,
      platform: 'Android',
      deviceModel: faker.helpers.arrayElement([
        'Samsung Galaxy S23', 'Google Pixel 7', 'OnePlus 11', 
        'Samsung Galaxy A54', 'Xiaomi 13'
      ]),
      osVersion: faker.helpers.arrayElement(['13', '12', '11', '10']),
      screenSize: faker.helpers.arrayElement(['393x851', '412x915', '360x780']),
    };
  } else {
    return {
      ...baseInfo,
      platform: 'Web',
      browser: faker.helpers.arrayElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
      browserVersion: faker.system.semver(),
      os: faker.helpers.arrayElement(['Windows', 'macOS', 'Linux']),
      screenResolution: faker.helpers.arrayElement([
        '1920x1080', '1366x768', '1440x900', '2560x1440'
      ]),
    };
  }
}

function calculateNotificationStats(notifications: any[]) {
  const typeCounts: Record<string, number> = {};
  
  notifications.forEach(notification => {
    typeCounts[notification.type] = (typeCounts[notification.type] || 0) + 1;
  });

  // Get top 5 notification types
  const sortedTypes = Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([type, count]) => `${type}:${count}`)
    .join(', ');

  return {
    typeDistribution: sortedTypes,
    totalTypes: Object.keys(typeCounts).length,
  };
}