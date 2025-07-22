import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { DatabaseTestSetup } from '../database-test.setup';
import { TestDataGenerator } from '../enhanced-test-helpers';

/**
 * Cross-Model Relationship Integration Tests
 * 
 * Comprehensive testing of complex relationships across all 18 Prisma models
 * to ensure data integrity, referential consistency, and proper cascade behavior.
 */
describe('Cross-Model Relationships Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    // Setup test database
    prisma = await DatabaseTestSetup.setupTestDatabase();

    moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    // Clean database after each test
    await DatabaseTestSetup.cleanupDatabase();
  });

  afterAll(async () => {
    await DatabaseTestSetup.stopContainer();
    await app.close();
    await moduleRef.close();
  });

  describe('User → Client → Therapist Assignment Workflow', () => {
    it('should create complete user-client-therapist relationship chain', async () => {
      // 1. Create client user
      const clientUser = await prisma.user.create({
        data: {
          id: 'client-user-123',
          email: 'client@test.com',
          firstName: 'Test',
          lastName: 'Client',
          role: 'client',
          isActive: true,
          emailVerified: true,
        },
      });

      // 2. Create client profile
      const client = await prisma.client.create({
        data: {
          userId: clientUser.id,
          hasSeenTherapistRecommendations: false,
        },
      });

      // 3. Create therapist user
      const therapistUser = await prisma.user.create({
        data: {
          id: 'therapist-user-123',
          email: 'therapist@test.com',
          firstName: 'Dr. Test',
          lastName: 'Therapist',
          role: 'therapist',
          isActive: true,
          emailVerified: true,
        },
      });

      // 4. Create therapist profile
      const therapist = await prisma.therapist.create({
        data: {
          userId: therapistUser.id,
          mobile: '+1234567890',
          province: 'Ontario',
          providerType: 'Clinical Psychologist',
          professionalLicenseType: 'Licensed',
          isPRCLicensed: 'yes',
          prcLicenseNumber: 'PRC123456',
          practiceStartDate: new Date('2020-01-01'),
          yearsOfExperience: 5,
          areasOfExpertise: ['Anxiety', 'Depression'],
          assessmentTools: ['PHQ-9', 'GAD-7'],
          therapeuticApproachesUsedList: ['CBT', 'DBT'],
          languagesOffered: ['English'],
          providedOnlineTherapyBefore: true,
          comfortableUsingVideoConferencing: true,
          preferredSessionLength: [60],
          acceptTypes: ['Individual'],
          status: 'approved',
          hourlyRate: 150,
          expirationDateOfLicense: new Date('2025-01-01'),
          compliesWithDataPrivacyAct: true,
          willingToAbideByPlatformGuidelines: true,
          treatmentSuccessRates: {},
          sessionLength: '60 minutes',
        },
      });

      // 5. Create client-therapist assignment
      const assignment = await prisma.clientTherapist.create({
        data: {
          clientId: client.userId,
          therapistId: therapist.userId,
          notes: 'Initial assignment for anxiety treatment',
        },
      });

      // 6. Verify complete relationship chain
      const completeRelationship = await prisma.user.findUnique({
        where: { id: clientUser.id },
        include: {
          client: {
            include: {
              assignedTherapists: {
                include: {
                  therapist: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Assertions
      expect(completeRelationship).toBeTruthy();
      expect(completeRelationship?.client).toBeTruthy();
      expect(completeRelationship?.client?.assignedTherapists).toHaveLength(1);
      expect(completeRelationship?.client?.assignedTherapists[0].therapist.user.email).toBe('therapist@test.com');
      expect(assignment.notes).toBe('Initial assignment for anxiety treatment');
    });

    it('should handle cascade deletion properly', async () => {
      // Create test data
      const user = await prisma.user.create({
        data: TestDataGenerator.createUser({ role: 'client' }),
      });

      const client = await prisma.client.create({
        data: {
          userId: user.id,
          hasSeenTherapistRecommendations: false,
        },
      });

      // Create client medical history
      const medicalHistory = await prisma.clientMedicalHistory.create({
        data: {
          clientId: client.userId,
          condition: 'Anxiety Disorder',
          notes: 'Diagnosed in 2020',
        },
      });

      // Create client preferences
      const preference = await prisma.clientPreference.create({
        data: {
          clientId: client.userId,
          key: 'preferred_session_time',
          value: 'morning',
        },
      });

      // Delete user - should cascade to client and related records
      await prisma.user.delete({
        where: { id: user.id },
      });

      // Verify cascade deletion
      const deletedClient = await prisma.client.findUnique({
        where: { userId: user.id },
      });
      const deletedHistory = await prisma.clientMedicalHistory.findUnique({
        where: { id: medicalHistory.id },
      });
      const deletedPreference = await prisma.clientPreference.findUnique({
        where: { id: preference.id },
      });

      expect(deletedClient).toBeNull();
      expect(deletedHistory).toBeNull();
      expect(deletedPreference).toBeNull();
    });
  });

  describe('Conversation → Message → Reactions Messaging Flow', () => {
    it('should create complete messaging workflow with reactions', async () => {
      // 1. Create participants
      const user1 = await prisma.user.create({
        data: TestDataGenerator.createUser({
          id: 'user-1',
          email: 'user1@test.com',
          firstName: 'Alice',
        }),
      });

      const user2 = await prisma.user.create({
        data: TestDataGenerator.createUser({
          id: 'user-2',
          email: 'user2@test.com',
          firstName: 'Bob',
        }),
      });

      // 2. Create conversation
      const conversation = await prisma.conversation.create({
        data: {
          type: 'DIRECT',
          isActive: true,
        },
      });

      // 3. Add participants
      await prisma.conversationParticipant.createMany({
        data: [
          {
            conversationId: conversation.id,
            userId: user1.id,
            role: 'MEMBER',
          },
          {
            conversationId: conversation.id,
            userId: user2.id,
            role: 'MEMBER',
          },
        ],
      });

      // 4. Create messages
      const message1 = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user1.id,
          content: 'Hello, how are you today?',
          messageType: 'TEXT',
        },
      });

      const message2 = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user2.id,
          content: 'I am doing well, thank you!',
          messageType: 'TEXT',
          replyToId: message1.id,
        },
      });

      // 5. Add message reactions
      const reaction1 = await prisma.messageReaction.create({
        data: {
          messageId: message1.id,
          userId: user2.id,
          emoji: '👍',
        },
      });

      const reaction2 = await prisma.messageReaction.create({
        data: {
          messageId: message2.id,
          userId: user1.id,
          emoji: '😊',
        },
      });

      // 6. Add read receipts
      await prisma.messageReadReceipt.createMany({
        data: [
          {
            messageId: message1.id,
            userId: user2.id,
          },
          {
            messageId: message2.id,
            userId: user1.id,
          },
        ],
      });

      // 7. Update conversation last message time
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      });

      // Verify complete messaging flow
      const completeConversation = await prisma.conversation.findUnique({
        where: { id: conversation.id },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          messages: {
            include: {
              reactions: {
                include: {
                  user: true,
                },
              },
              readReceipts: {
                include: {
                  user: true,
                },
              },
              replyTo: true,
              replies: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      // Assertions
      expect(completeConversation).toBeTruthy();
      expect(completeConversation?.participants).toHaveLength(2);
      expect(completeConversation?.messages).toHaveLength(2);
      expect(completeConversation?.messages[0].reactions).toHaveLength(1);
      expect(completeConversation?.messages[1].reactions).toHaveLength(1);
      expect(completeConversation?.messages[0].readReceipts).toHaveLength(1);
      expect(completeConversation?.messages[1].readReceipts).toHaveLength(1);
      expect(completeConversation?.messages[1].replyToId).toBe(message1.id);
      expect(completeConversation?.lastMessageAt).toBeTruthy();
    });

    it('should handle user blocking in messaging workflow', async () => {
      // Create users
      const blocker = await prisma.user.create({
        data: TestDataGenerator.createUser({
          id: 'blocker-user',
          email: 'blocker@test.com',
        }),
      });

      const blocked = await prisma.user.create({
        data: TestDataGenerator.createUser({
          id: 'blocked-user',
          email: 'blocked@test.com',
        }),
      });

      // Create conversation and messages
      const conversation = await prisma.conversation.create({
        data: {
          type: 'DIRECT',
          participants: {
            create: [
              { userId: blocker.id, role: 'MEMBER' },
              { userId: blocked.id, role: 'MEMBER' },
            ],
          },
        },
      });

      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: blocked.id,
          content: 'Hello there!',
          messageType: 'TEXT',
        },
      });

      // Block user
      const userBlock = await prisma.userBlock.create({
        data: {
          blockerId: blocker.id,
          blockedId: blocked.id,
          reason: 'Inappropriate behavior',
        },
      });

      // Verify blocking relationship
      const blockingUser = await prisma.user.findUnique({
        where: { id: blocker.id },
        include: {
          blocking: {
            include: {
              blocked: true,
            },
          },
        },
      });

      const blockedUser = await prisma.user.findUnique({
        where: { id: blocked.id },
        include: {
          blockedBy: {
            include: {
              blocker: true,
            },
          },
        },
      });

      expect(blockingUser?.blocking).toHaveLength(1);
      expect(blockingUser?.blocking[0].blockedId).toBe(blocked.id);
      expect(blockedUser?.blockedBy).toHaveLength(1);
      expect(blockedUser?.blockedBy[0].blockerId).toBe(blocker.id);
      expect(userBlock.reason).toBe('Inappropriate behavior');
    });
  });

  describe('Meeting → SessionLog → Review Lifecycle', () => {
    it('should create complete session lifecycle with reviews', async () => {
      // Setup users
      const clientUser = await prisma.user.create({
        data: TestDataGenerator.createUser({
          id: 'session-client',
          role: 'client',
        }),
      });

      const therapistUser = await prisma.user.create({
        data: TestDataGenerator.createUser({
          id: 'session-therapist',
          role: 'therapist',
        }),
      });

      const client = await prisma.client.create({
        data: {
          userId: clientUser.id,
          hasSeenTherapistRecommendations: true,
        },
      });

      const therapist = await prisma.therapist.create({
        data: {
          userId: therapistUser.id,
          mobile: '+1234567890',
          province: 'Ontario',
          providerType: 'Clinical Psychologist',
          professionalLicenseType: 'Licensed',
          isPRCLicensed: 'yes',
          prcLicenseNumber: 'PRC123456',
          practiceStartDate: new Date('2020-01-01'),
          yearsOfExperience: 5,
          areasOfExpertise: ['Depression'],
          assessmentTools: ['PHQ-9'],
          therapeuticApproachesUsedList: ['CBT'],
          languagesOffered: ['English'],
          providedOnlineTherapyBefore: true,
          comfortableUsingVideoConferencing: true,
          preferredSessionLength: [60],
          acceptTypes: ['Individual'],
          status: 'approved',
          hourlyRate: 150,
          expirationDateOfLicense: new Date('2025-01-01'),
          compliesWithDataPrivacyAct: true,
          willingToAbideByPlatformGuidelines: true,
          treatmentSuccessRates: {},
          sessionLength: '60 minutes',
        },
      });

      // Create meeting
      const meeting = await prisma.meeting.create({
        data: {
          clientId: client.userId,
          therapistId: therapist.userId,
          startTime: new Date('2024-12-01T10:00:00Z'),
          duration: 60,
          status: 'COMPLETED',
          meetingType: 'video',
          description: 'Initial therapy session',
        },
      });

      // Create session log
      const sessionLog = await prisma.sessionLog.create({
        data: {
          clientId: client.userId,
          meetingId: meeting.id,
          sessionDate: new Date('2024-12-01T10:00:00Z'),
          duration: 60,
          sessionType: 'Individual',
          notes: 'Client showed good progress with anxiety management techniques',
          mood: 'positive',
          progress: 'good',
        },
      });

      // Create review
      const review = await prisma.review.create({
        data: {
          clientId: client.userId,
          therapistId: therapist.userId,
          rating: 5,
          comment: 'Excellent therapist, very helpful and understanding',
          isAnonymous: false,
        },
      });

      // Verify complete lifecycle
      const completeMeeting = await prisma.meeting.findUnique({
        where: { id: meeting.id },
        include: {
          client: {
            include: {
              user: true,
              sessionLogs: true,
              reviews: true,
            },
          },
          therapist: {
            include: {
              user: true,
            },
          },
        },
      });

      const sessionWithReview = await prisma.sessionLog.findUnique({
        where: { id: sessionLog.id },
        include: {
          client: {
            include: {
              reviews: {
                where: {
                  therapistId: therapist.userId,
                },
              },
            },
          },
        },
      });

      // Assertions
      expect(completeMeeting).toBeTruthy();
      expect(completeMeeting?.status).toBe('COMPLETED');
      expect(completeMeeting?.client?.sessionLogs).toHaveLength(1);
      expect(completeMeeting?.client?.reviews).toHaveLength(1);
      expect(sessionWithReview?.notes).toContain('anxiety management');
      expect(sessionWithReview?.client?.reviews[0].rating).toBe(5);
    });
  });

  describe('User → Notification → AuditLog Activity Tracking', () => {
    it('should create complete activity tracking workflow', async () => {
      // Create user
      const user = await prisma.user.create({
        data: TestDataGenerator.createUser({
          id: 'activity-user',
          email: 'activity@test.com',
        }),
      });

      // Create notification settings
      const notificationSettings = await prisma.notificationSettings.create({
        data: {
          userId: user.id,
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          marketingEmails: false,
        },
      });

      // Create notification
      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'meeting_reminder',
          title: 'Upcoming Therapy Session',
          message: 'You have a therapy session scheduled in 1 hour',
          isRead: false,
          priority: 'high',
        },
      });

      // Create audit log
      const auditLog = await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_LOGIN',
          entity: 'User',
          entityId: user.id,
          details: {
            ip: '192.168.1.1',
            userAgent: 'Mozilla/5.0...',
            timestamp: new Date().toISOString(),
          },
          severity: 'INFO',
        },
      });

      // Create user activity
      const userActivity = await prisma.userActivity.create({
        data: {
          userId: user.id,
          activityType: 'page_view',
          activityData: {
            page: '/dashboard',
            duration: 120,
            interactions: ['button_click', 'scroll'],
          },
        },
      });

      // Verify complete activity tracking
      const userWithActivities = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          notificationSettings: true,
          notifications: {
            where: { isRead: false },
          },
          auditLogs: {
            orderBy: { createdAt: 'desc' },
          },
          activities: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      // Assertions
      expect(userWithActivities).toBeTruthy();
      expect(userWithActivities?.notificationSettings?.emailNotifications).toBe(true);
      expect(userWithActivities?.notifications).toHaveLength(1);
      expect(userWithActivities?.notifications[0].type).toBe('meeting_reminder');
      expect(userWithActivities?.auditLogs).toHaveLength(1);
      expect(userWithActivities?.auditLogs[0].action).toBe('USER_LOGIN');
      expect(userWithActivities?.activities).toHaveLength(1);
      expect(userWithActivities?.activities[0].activityType).toBe('page_view');
    });
  });

  describe('Community → Post → Comment → Hearts Content Flow', () => {
    it('should create complete community content interaction flow', async () => {
      // Create users
      const author = await prisma.user.create({
        data: TestDataGenerator.createUser({
          id: 'content-author',
          email: 'author@test.com',
        }),
      });

      const commenter = await prisma.user.create({
        data: TestDataGenerator.createUser({
          id: 'content-commenter',
          email: 'commenter@test.com',
        }),
      });

      // Create community
      const community = await prisma.community.create({
        data: {
          name: 'Anxiety Support',
          description: 'A supportive community for anxiety management',
          isPrivate: false,
          memberLimit: 100,
        },
      });

      // Create room and room group
      const roomGroup = await prisma.roomGroup.create({
        data: {
          communityId: community.id,
          name: 'General Discussion',
          description: 'General discussion topics',
        },
      });

      const room = await prisma.room.create({
        data: {
          communityId: community.id,
          roomGroupId: roomGroup.id,
          name: 'Daily Check-ins',
          description: 'Share your daily progress',
          postingRole: 'MEMBER',
        },
      });

      // Create memberships
      await prisma.membership.createMany({
        data: [
          {
            userId: author.id,
            communityId: community.id,
            role: 'MEMBER',
            status: 'ACTIVE',
          },
          {
            userId: commenter.id,
            communityId: community.id,
            role: 'MEMBER',
            status: 'ACTIVE',
          },
        ],
      });

      // Create post
      const post = await prisma.post.create({
        data: {
          authorId: author.id,
          communityId: community.id,
          roomId: room.id,
          title: 'My anxiety journey',
          content: 'Sharing my experience with anxiety management...',
          type: 'TEXT',
          isApproved: true,
        },
      });

      // Create comment
      const comment = await prisma.comment.create({
        data: {
          authorId: commenter.id,
          postId: post.id,
          content: 'Thank you for sharing, this is very helpful!',
          isApproved: true,
        },
      });

      // Create reply to comment
      const reply = await prisma.reply.create({
        data: {
          authorId: author.id,
          commentId: comment.id,
          content: 'I appreciate your support!',
          isApproved: true,
        },
      });

      // Add hearts
      const postHeart = await prisma.postHeart.create({
        data: {
          userId: commenter.id,
          postId: post.id,
        },
      });

      const commentHeart = await prisma.commentHeart.create({
        data: {
          userId: author.id,
          commentId: comment.id,
        },
      });

      const replyHeart = await prisma.replyHeart.create({
        data: {
          userId: commenter.id,
          replyId: reply.id,
        },
      });

      // Verify complete content flow
      const completePost = await prisma.post.findUnique({
        where: { id: post.id },
        include: {
          author: true,
          community: true,
          room: {
            include: {
              roomGroup: true,
            },
          },
          comments: {
            include: {
              author: true,
              replies: {
                include: {
                  author: true,
                  hearts: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
              hearts: {
                include: {
                  user: true,
                },
              },
            },
          },
          hearts: {
            include: {
              user: true,
            },
          },
        },
      });

      // Assertions
      expect(completePost).toBeTruthy();
      expect(completePost?.hearts).toHaveLength(1);
      expect(completePost?.comments).toHaveLength(1);
      expect(completePost?.comments[0].hearts).toHaveLength(1);
      expect(completePost?.comments[0].replies).toHaveLength(1);
      expect(completePost?.comments[0].replies[0].hearts).toHaveLength(1);
      expect(completePost?.room?.roomGroup?.name).toBe('General Discussion');
    });
  });

  describe('Complex Transaction Scenarios', () => {
    it('should handle complex multi-model transaction rollback', async () => {
      const transactionTestFn = async () => {
        return await prisma.$transaction(async (tx) => {
          // Create user
          const user = await tx.user.create({
            data: TestDataGenerator.createUser({
              email: 'transaction@test.com',
            }),
          });

          // Create client
          const client = await tx.client.create({
            data: {
              userId: user.id,
              hasSeenTherapistRecommendations: false,
            },
          });

          // Create notification settings
          await tx.notificationSettings.create({
            data: {
              userId: user.id,
              emailNotifications: true,
              pushNotifications: true,
            },
          });

          // Intentionally cause a constraint violation
          await tx.user.create({
            data: {
              id: user.id, // Duplicate ID should cause error
              email: 'duplicate@test.com',
              firstName: 'Duplicate',
              lastName: 'User',
              role: 'client',
            },
          });

          return { user, client };
        });
      };

      // Transaction should fail and rollback
      await expect(transactionTestFn()).rejects.toThrow();

      // Verify no data was committed
      const user = await prisma.user.findUnique({
        where: { email: 'transaction@test.com' },
      });
      const client = await prisma.client.findFirst({
        where: {
          user: { email: 'transaction@test.com' },
        },
      });
      const settings = await prisma.notificationSettings.findFirst({
        where: {
          user: { email: 'transaction@test.com' },
        },
      });

      expect(user).toBeNull();
      expect(client).toBeNull();
      expect(settings).toBeNull();
    });

    it('should handle concurrent user creation correctly', async () => {
      const concurrentUsers = Array.from({ length: 5 }, (_, i) => 
        prisma.user.create({
          data: TestDataGenerator.createUser({
            email: `concurrent-${i}@test.com`,
            firstName: `User${i}`,
          }),
        })
      );

      const results = await Promise.allSettled(concurrentUsers);
      const successful = results.filter(r => r.status === 'fulfilled').length;

      expect(successful).toBe(5); // All should succeed with unique emails
    });
  });
});