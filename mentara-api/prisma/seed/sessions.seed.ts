// Sessions Seed Module
// Handles creation of session logs, activities, and therapy progress records

import { PrismaClient, SessionType, ActivityType, UserActionType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { Decimal } from '@prisma/client/runtime/library';

export async function seedSessions(
  prisma: PrismaClient,
  relationships: any[],
  meetings: any[],
  allUsers: any[]
) {
  console.log('🎯 Creating session logs and progress tracking...');

  const sessionLogs: any[] = [];
  const sessionActivities: any[] = [];
  const therapyProgress: any[] = [];
  const userActivities: any[] = [];

  // Create session logs for completed meetings
  const completedMeetings = meetings.filter(meeting => meeting.status === 'COMPLETED');
  
  for (const meeting of completedMeetings) {
    try {
      // Determine session type based on meeting type
      const sessionType = mapMeetingTypeToSessionType(meeting.meetingType);
      
      // Calculate session duration (use meeting duration as base)
      const duration = meeting.duration + faker.number.int({ min: -15, max: 15 }); // Add some variance
      const endTime = new Date(meeting.startTime.getTime() + duration * 60 * 1000);
      
      // Determine platform and quality
      const platform = faker.helpers.arrayElement(['video', 'phone', 'chat', 'in-person']);
      const quality = faker.number.int({ min: 3, max: 5 }); // Most sessions are good quality
      const connectionIssues = faker.datatype.boolean({ probability: 0.15 }); // 15% have issues
      
      // Create session log
      const sessionLog = await prisma.sessionLog.create({
        data: {
          meetingId: meeting.id,
          sessionType,
          clientId: meeting.clientId,
          therapistId: meeting.therapistId,
          startTime: meeting.startTime,
          endTime,
          duration,
          status: 'COMPLETED',
          platform,
          quality: connectionIssues ? Math.max(1, quality - 2) : quality,
          notes: generateSessionNotes(sessionType, quality, connectionIssues),
          connectionIssues,
          recordingUrl: faker.datatype.boolean({ probability: 0.3 }) 
            ? faker.internet.url() + '/recordings/' + faker.string.uuid() + '.mp4'
            : null,
          recordingSize: faker.datatype.boolean({ probability: 0.3 })
            ? faker.number.int({ min: 50000000, max: 500000000 }) // 50MB to 500MB
            : null,
        },
      });
      sessionLogs.push(sessionLog);

      // Create session activities
      const activities = await createSessionActivities(prisma, sessionLog, sessionType, platform);
      sessionActivities.push(...activities);

    } catch (error) {
      console.error(`Failed to create session log for meeting ${meeting.id}:`, error);
    }
  }

  // Create some self-guided sessions for clients
  const clients = allUsers.filter(user => user.role === 'client');
  for (const client of clients.slice(0, Math.min(clients.length, 20))) {
    try {
      const selfGuidedCount = faker.number.int({ min: 0, max: 3 });
      
      for (let i = 0; i < selfGuidedCount; i++) {
        const startTime = faker.date.past({ years: 0.5 });
        const duration = faker.number.int({ min: 15, max: 90 });
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
        
        const sessionLog = await prisma.sessionLog.create({
          data: {
            sessionType: 'SELF_GUIDED',
            clientId: client.id,
            startTime,
            endTime,
            duration,
            status: 'COMPLETED',
            platform: 'web',
            quality: faker.number.int({ min: 4, max: 5 }),
            notes: generateSelfGuidedNotes(),
          },
        });
        sessionLogs.push(sessionLog);

        // Create activities for self-guided sessions
        const activities = await createSelfGuidedActivities(prisma, sessionLog);
        sessionActivities.push(...activities);
      }
    } catch (error) {
      console.error(`Failed to create self-guided sessions for client ${client.id}:`, error);
    }
  }

  // Create therapy progress records for active relationships
  for (const { relationship, client, therapist } of relationships) {
    try {
      // Create 1-3 progress records per relationship (depending on relationship age)
      const relationshipAge = Date.now() - new Date(relationship.assignedAt).getTime();
      const monthsActive = relationshipAge / (30 * 24 * 60 * 60 * 1000);
      const progressCount = Math.min(3, Math.floor(monthsActive / 2) + 1); // One every 2 months
      
      for (let i = 0; i < progressCount; i++) {
        const assessmentDate = faker.date.between({
          from: new Date(relationship.assignedAt.getTime() + i * 60 * 24 * 60 * 60 * 1000), // 2 months apart
          to: new Date(),
        });
        
        // Generate realistic progress scores that generally improve over time
        const baseScore = 40 + (i * 15) + faker.number.int({ min: -10, max: 20 });
        const progressScore = Math.min(95, Math.max(20, baseScore));
        
        const progress = await prisma.therapyProgress.create({
          data: {
            clientId: client.user.id,
            therapistId: therapist.user.id,
            assessmentDate,
            progressScore: new Decimal(progressScore),
            improvementAreas: generateImprovementAreas(),
            concernAreas: generateConcernAreas(),
            goalsSet: generateGoalsSet(),
            goalsAchieved: generateGoalsAchieved(i),
            nextMilestones: generateNextMilestones(),
            moodScore: faker.number.int({ min: 4, max: 8 }),
            anxietyScore: faker.number.int({ min: 2, max: 7 }),
            depressionScore: faker.number.int({ min: 2, max: 6 }),
            functionalScore: faker.number.int({ min: 5, max: 9 }),
            therapistNotes: generateTherapistProgressNotes(progressScore),
            clientFeedback: generateClientFeedback(),
            recommendations: generateRecommendations(),
          },
        });
        therapyProgress.push(progress);
      }
    } catch (error) {
      console.error(`Failed to create progress records for ${client.user.firstName}:`, error);
    }
  }

  // Create user activities for platform engagement
  await createUserActivities(prisma, allUsers, userActivities);

  console.log(`📊 Session tracking summary:`);
  console.log(`   🎯 Session logs: ${sessionLogs.length}`);
  console.log(`   📋 Session activities: ${sessionActivities.length}`);
  console.log(`   📈 Progress records: ${therapyProgress.length}`);
  console.log(`   👤 User activities: ${userActivities.length}`);
  console.log(`   📹 Video sessions: ${sessionLogs.filter(s => s.platform === 'video').length}`);
  console.log(`   📞 Phone sessions: ${sessionLogs.filter(s => s.platform === 'phone').length}`);
  console.log(`   💬 Chat sessions: ${sessionLogs.filter(s => s.platform === 'chat').length}`);
  console.log(`   🏢 In-person sessions: ${sessionLogs.filter(s => s.platform === 'in-person').length}`);
  console.log(`   🔗 Self-guided sessions: ${sessionLogs.filter(s => s.sessionType === 'SELF_GUIDED').length}`);

  return { sessionLogs, sessionActivities, therapyProgress, userActivities };
}

function mapMeetingTypeToSessionType(meetingType: string): SessionType {
  const mapping = {
    'initial': SessionType.INITIAL_CONSULTATION,
    'followup': SessionType.REGULAR_THERAPY,
    'crisis': SessionType.CRISIS_INTERVENTION, 
    'assessment': SessionType.ASSESSMENT,
  };
  
  return mapping[meetingType] || SessionType.REGULAR_THERAPY;
}

async function createSessionActivities(
  prisma: PrismaClient,
  sessionLog: any,
  sessionType: string,
  platform: string
) {
  const activities: any[] = [];
  
  // Always start with session start
  let currentTime = new Date(sessionLog.startTime);
  
  activities.push(await prisma.sessionActivity.create({
    data: {
      sessionId: sessionLog.id,
      activityType: 'SESSION_START',
      timestamp: currentTime,
      description: 'Session began',
    },
  }));

  // Add various activities during the session
  const sessionDuration = sessionLog.duration * 60 * 1000; // Convert to milliseconds
  const activityCount = faker.number.int({ min: 3, max: 8 });
  
  for (let i = 0; i < activityCount; i++) {
    const activityTime = new Date(currentTime.getTime() + faker.number.int({ min: 5, max: 15 }) * 60 * 1000);
    if (activityTime >= sessionLog.endTime) break;
    
    const activityType = generateSessionActivity(sessionType, platform);
    
    activities.push(await prisma.sessionActivity.create({
      data: {
        sessionId: sessionLog.id,
        activityType,
        timestamp: activityTime,
        duration: faker.number.int({ min: 30, max: 600 }), // 30 seconds to 10 minutes
        description: generateActivityDescription(activityType),
        metadata: generateActivityMetadata(activityType),
      },
    }));
    
    currentTime = activityTime;
  }

  // Always end with session end
  activities.push(await prisma.sessionActivity.create({
    data: {
      sessionId: sessionLog.id,
      activityType: 'SESSION_END',
      timestamp: sessionLog.endTime,
      description: 'Session completed',
    },
  }));

  return activities;
}

async function createSelfGuidedActivities(prisma: PrismaClient, sessionLog: any) {
  const activities: any[] = [];
  
  // Self-guided activities
  const activityTypes = [ActivityType.MOOD_CHECK_IN, ActivityType.ASSESSMENT_COMPLETION, ActivityType.GOAL_SETTING];
  const activityType = faker.helpers.arrayElement(activityTypes);
  
  activities.push(await prisma.sessionActivity.create({
    data: {
      sessionId: sessionLog.id,
      activityType,
      timestamp: sessionLog.startTime,
      duration: sessionLog.duration * 60, // Convert to seconds
      description: generateActivityDescription(activityType),
    },
  }));

  return activities;
}

async function createUserActivities(prisma: PrismaClient, allUsers: any[], userActivities: any[]) {
  console.log('👤 Creating user platform activities...');
  
  // Create activities for subset of users to avoid too much data
  const activeUsers = faker.helpers.arrayElements(allUsers, Math.min(30, allUsers.length));
  
  for (const user of activeUsers) {
    try {
      const activityCount = faker.number.int({ min: 10, max: 50 });
      
      for (let i = 0; i < activityCount; i++) {
        const action = generateUserAction(user.role);
        
        await prisma.userActivity.create({
          data: {
            userId: user.id,
            action,
            timestamp: faker.date.past({ years: 0.5 }),
            page: generatePageForAction(action),
            component: generateComponentForAction(action),
            metadata: generateUserActivityMetadata(action),
            sessionId: faker.string.uuid(),
            deviceInfo: generateDeviceInfo(),
          },
        });
      }
    } catch (error) {
      // Continue with next user if this one fails
    }
  }
}

function generateSessionNotes(sessionType: string, quality: number, hasIssues: boolean): string {
  if (hasIssues) {
    return faker.helpers.arrayElement([
      'Session experienced some technical difficulties with audio/video connection.',
      'Had connectivity issues but managed to complete the session successfully.',
      'Minor technical problems but good therapeutic progress made.',
    ]);
  }
  
  const notes = {
    'INITIAL_CONSULTATION': [
      'Comprehensive initial assessment completed. Established treatment goals and discussed therapy approach.',
      'Good rapport established. Client expressed readiness to engage in therapeutic process.',
      'Initial intake session focused on understanding client\'s concerns and treatment expectations.',
    ],
    'REGULAR_THERAPY': [
      'Productive session with good client engagement. Continued work on established goals.',
      'Client showed progress on homework assignments. Discussed new coping strategies.',
      'Explored underlying patterns and emotions. Client demonstrated increased self-awareness.',
    ],
    'CRISIS_INTERVENTION': [
      'Crisis intervention provided. Client stabilized and safety plan established.',
      'Emergency session focused on immediate safety and coping strategies.',
      'Crisis support provided with follow-up care scheduled.',
    ],
    'ASSESSMENT': [
      'Comprehensive assessment completed. Results will inform treatment planning.',
      'Psychological evaluation conducted with standardized instruments.',
      'Assessment focused on current functioning and treatment needs.',
    ],
  };
  
  const sessionNotes = notes[sessionType] || notes['REGULAR_THERAPY'];
  return faker.helpers.arrayElement(sessionNotes);
}

function generateSelfGuidedNotes(): string {
  return faker.helpers.arrayElement([
    'Client completed self-guided mindfulness exercises using platform tools.',
    'Self-directed mood tracking and journaling session completed.',
    'Client engaged with interactive therapy worksheets independently.',
    'Self-guided progress check-in and goal review completed.',
  ]);
}

function generateSessionActivity(sessionType: string, platform: string): ActivityType {
  const commonActivities = [ActivityType.MOOD_CHECK_IN, ActivityType.PROGRESS_REVIEW, ActivityType.GOAL_SETTING];
  
  if (platform === 'video') {
    return faker.helpers.arrayElement([
      ...commonActivities,
      ActivityType.SCREEN_SHARE,
      ActivityType.WHITEBOARD_USE,
      ActivityType.CHAT_MESSAGE,
    ]);
  } else if (platform === 'chat') {
    return faker.helpers.arrayElement([
      ...commonActivities,
      ActivityType.CHAT_MESSAGE,
      ActivityType.FILE_SHARE,
    ]);
  }
  
  return faker.helpers.arrayElement(commonActivities);
}

function generateActivityDescription(activityType: string): string {
  const descriptions = {
    'MOOD_CHECK_IN': 'Client completed mood assessment and emotional check-in',
    'PROGRESS_REVIEW': 'Reviewed progress on treatment goals and objectives',
    'GOAL_SETTING': 'Established new therapeutic goals and action plans',
    'SCREEN_SHARE': 'Therapist shared screen to review therapeutic materials',
    'WHITEBOARD_USE': 'Collaborative whiteboard session for visual exercises',
    'CHAT_MESSAGE': 'Text communication during session',
    'FILE_SHARE': 'Shared therapeutic resources and worksheets',
    'HOMEWORK_ASSIGNMENT': 'Assigned between-session practice exercises',
    'ASSESSMENT_COMPLETION': 'Client completed standardized assessment tool',
  };
  
  return descriptions[activityType] || 'Session activity completed';
}

function generateActivityMetadata(activityType: string): any {
  if (activityType === 'MOOD_CHECK_IN') {
    return {
      moodRating: faker.number.int({ min: 1, max: 10 }),
      anxietyLevel: faker.number.int({ min: 1, max: 10 }),
      energyLevel: faker.number.int({ min: 1, max: 10 }),
    };
  } else if (activityType === 'GOAL_SETTING') {
    return {
      goalsSet: faker.number.int({ min: 1, max: 3 }),
      timeframe: faker.helpers.arrayElement(['1 week', '2 weeks', '1 month']),
    };
  }
  
  return null;
}

function generateUserAction(userRole: string): UserActionType {
  if (userRole === 'client') {
    return faker.helpers.arrayElement([
      UserActionType.PAGE_VIEW, UserActionType.THERAPIST_SEARCH, UserActionType.THERAPIST_PROFILE_VIEW, 
      UserActionType.MESSAGE_SEND, UserActionType.WORKSHEET_COMPLETE, UserActionType.POST_VIEW, UserActionType.POST_CREATE
    ]);
  } else if (userRole === 'therapist') {
    return faker.helpers.arrayElement([
      UserActionType.PAGE_VIEW, UserActionType.MESSAGE_SEND, UserActionType.POST_VIEW, UserActionType.APPOINTMENT_BOOK, UserActionType.PROFILE_UPDATE
    ]);
  }
  
  return UserActionType.PAGE_VIEW;
}

function generatePageForAction(action: string): string {
  const pageMapping = {
    'THERAPIST_SEARCH': '/therapists/search',
    'THERAPIST_PROFILE_VIEW': '/therapists/profile',
    'MESSAGE_SEND': '/messages',
    'WORKSHEET_COMPLETE': '/worksheets',
    'POST_VIEW': '/community',
    'POST_CREATE': '/community/create',
    'APPOINTMENT_BOOK': '/booking',
  };
  
  return pageMapping[action] || '/dashboard';
}

function generateComponentForAction(action: string): string {
  const componentMapping = {
    'THERAPIST_SEARCH': 'SearchFilters',
    'THERAPIST_PROFILE_VIEW': 'TherapistCard',
    'MESSAGE_SEND': 'MessageInput',
    'WORKSHEET_COMPLETE': 'WorksheetForm',
    'POST_CREATE': 'PostEditor',
  };
  
  return componentMapping[action] || 'Button';
}

function generateUserActivityMetadata(action: string): any {
  if (action === 'THERAPIST_SEARCH') {
    return {
      filters: {
        specialties: faker.helpers.arrayElements(['anxiety', 'depression', 'trauma'], { min: 1, max: 2 }),
        location: faker.location.city(),
        priceRange: faker.helpers.arrayElement(['$50-100', '$100-150', '$150-200']),
      },
      resultsCount: faker.number.int({ min: 5, max: 25 }),
    };
  }
  
  return null;
}

function generateDeviceInfo(): any {
  return {
    platform: faker.helpers.arrayElement(['web', 'mobile', 'tablet']),
    browser: faker.helpers.arrayElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
    os: faker.helpers.arrayElement(['Windows', 'macOS', 'iOS', 'Android']),
    screenResolution: faker.helpers.arrayElement(['1920x1080', '1366x768', '414x896', '375x667']),
  };
}

// Progress tracking helper functions
function generateImprovementAreas(): string[] {
  return faker.helpers.arrayElements([
    'Mood regulation', 'Anxiety management', 'Sleep quality', 'Social interactions',
    'Work performance', 'Relationship communication', 'Self-esteem', 'Stress management',
    'Emotional awareness', 'Coping strategies', 'Daily functioning', 'Motivation'
  ], { min: 2, max: 4 });
}

function generateConcernAreas(): string[] {
  return faker.helpers.arrayElements([
    'Persistent negative thoughts', 'Social withdrawal', 'Sleep disturbances',
    'Work stress', 'Relationship conflicts', 'Low energy', 'Concentration difficulties'
  ], { min: 0, max: 2 });
}

function generateGoalsSet(): any {
  return {
    shortTerm: faker.helpers.arrayElements([
      'Practice mindfulness daily', 'Improve sleep hygiene', 'Increase social activities',
      'Develop coping strategies', 'Complete daily mood tracking'
    ], { min: 2, max: 3 }),
    longTerm: faker.helpers.arrayElements([
      'Reduce anxiety symptoms', 'Improve work-life balance', 'Strengthen relationships',
      'Build self-confidence', 'Develop healthy habits'
    ], { min: 1, max: 2 })
  };
}

function generateGoalsAchieved(progressIndex: number): any {
  if (progressIndex === 0) return null;
  
  return faker.helpers.arrayElements([
    'Established daily routine', 'Improved sleep schedule', 'Reduced anxiety episodes',
    'Increased self-awareness', 'Better stress management'
  ], { min: 1, max: 3 });
}

function generateNextMilestones(): any {
  return faker.helpers.arrayElements([
    'Continue mindfulness practice', 'Address remaining triggers', 'Strengthen support network',
    'Maintain progress', 'Explore new coping strategies'
  ], { min: 2, max: 3 });
}

function generateTherapistProgressNotes(progressScore: number): string {
  if (progressScore >= 80) {
    return 'Excellent progress demonstrated. Client showing significant improvement in target areas and developing strong coping skills.';
  } else if (progressScore >= 60) {
    return 'Good progress noted. Client is actively engaging and making steady improvements. Continue current therapeutic approach.';
  } else if (progressScore >= 40) {
    return 'Moderate progress observed. Some areas showing improvement while others need continued attention. Adjusting treatment plan as needed.';
  } else {
    return 'Limited progress in this period. Exploring barriers to change and considering alternative therapeutic approaches.';
  }
}

function generateClientFeedback(): string {
  return faker.helpers.arrayElement([
    'Therapy has been very helpful. I feel more equipped to handle my challenges.',
    'I appreciate the support and strategies provided. Seeing positive changes.',
    'The sessions have given me valuable insights and tools for improvement.',
    'Grateful for the therapeutic process and the progress I\'ve made.',
    'Finding the treatment beneficial and feeling more hopeful about the future.',
  ]);
}

function generateRecommendations(): string[] {
  return faker.helpers.arrayElements([
    'Continue current therapeutic approach', 'Increase session frequency',
    'Practice mindfulness exercises', 'Maintain medication compliance',
    'Engage in regular physical activity', 'Strengthen social connections',
    'Focus on sleep hygiene', 'Develop relapse prevention plan'
  ], { min: 2, max: 4 });
}