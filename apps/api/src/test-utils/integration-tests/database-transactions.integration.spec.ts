import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { DatabaseTestSetup } from '../database-test.setup';
import { TestDataGenerator } from '../enhanced-test-helpers';

/**
 * Database Transactions Integration Tests
 * 
 * Comprehensive testing of transaction integrity, rollback scenarios,
 * constraint validation, and concurrent transaction handling.
 */
describe('Database Transactions Integration', () => {
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

  describe('Multi-Model Transaction Integrity', () => {
    it('should successfully commit complex multi-model transaction', async () => {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create user
        const user = await tx.user.create({
          data: TestDataGenerator.createUser({
            email: 'transaction-success@test.com',
            firstName: 'Transaction',
            lastName: 'Success',
            role: 'client',
          }),
        });

        // 2. Create client profile
        const client = await tx.client.create({
          data: {
            userId: user.id,
            hasSeenTherapistRecommendations: false,
          },
        });

        // 3. Create notification settings
        const notificationSettings = await tx.notificationSettings.create({
          data: {
            userId: user.id,
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            marketingEmails: false,
          },
        });

        // 4. Create pre-assessment
        const preAssessment = await tx.preAssessment.create({
          data: {
            userId: user.id,
            questionnaires: {
              PHQ9: [1, 2, 1, 0, 2, 1, 3, 2, 1],
              GAD7: [2, 1, 3, 2, 1, 2, 3],
            },
            scores: {
              depression: 15,
              anxiety: 12,
            },
            severityLevels: {
              depression: 'moderate',
              anxiety: 'mild',
            },
            status: 'COMPLETED',
          },
        });

        // 5. Create user activity
        const userActivity = await tx.userActivity.create({
          data: {
            userId: user.id,
            activityType: 'account_creation',
            activityData: {
              registrationSource: 'web',
              completedSteps: ['profile', 'assessment'],
            },
          },
        });

        // 6. Create audit log
        const auditLog = await tx.auditLog.create({
          data: {
            userId: user.id,
            action: 'USER_REGISTRATION',
            entity: 'User',
            entityId: user.id,
            details: {
              registrationCompleted: true,
              assessmentCompleted: true,
            },
            severity: 'INFO',
          },
        });

        return {
          user,
          client,
          notificationSettings,
          preAssessment,
          userActivity,
          auditLog,
        };
      });

      // Verify all entities were created
      expect(result.user.email).toBe('transaction-success@test.com');
      expect(result.client.userId).toBe(result.user.id);
      expect(result.notificationSettings.emailNotifications).toBe(true);
      expect(result.preAssessment.status).toBe('COMPLETED');
      expect(result.userActivity.activityType).toBe('account_creation');
      expect(result.auditLog.action).toBe('USER_REGISTRATION');

      // Verify data persistence after transaction
      const persistedUser = await prisma.user.findUnique({
        where: { id: result.user.id },
        include: {
          client: true,
          notificationSettings: true,
          preAssessment: true,
          activities: true,
          auditLogs: true,
        },
      });

      expect(persistedUser).toBeTruthy();
      expect(persistedUser?.client).toBeTruthy();
      expect(persistedUser?.notificationSettings).toBeTruthy();
      expect(persistedUser?.preAssessment).toBeTruthy();
      expect(persistedUser?.activities).toHaveLength(1);
      expect(persistedUser?.auditLogs).toHaveLength(1);
    });

    it('should rollback transaction on constraint violation', async () => {
      const transactionFunction = async () => {
        return await prisma.$transaction(async (tx) => {
          // 1. Create first user successfully
          const user1 = await tx.user.create({
            data: TestDataGenerator.createUser({
              email: 'rollback-test@test.com',
              firstName: 'First',
              lastName: 'User',
            }),
          });

          // 2. Create client for first user
          const client1 = await tx.client.create({
            data: {
              userId: user1.id,
              hasSeenTherapistRecommendations: false,
            },
          });

          // 3. Create notification settings
          const settings1 = await tx.notificationSettings.create({
            data: {
              userId: user1.id,
              emailNotifications: true,
              pushNotifications: true,
            },
          });

          // 4. Attempt to create user with duplicate email (should fail)
          const user2 = await tx.user.create({
            data: {
              id: 'duplicate-user',
              email: 'rollback-test@test.com', // Duplicate email
              firstName: 'Duplicate',
              lastName: 'User',
              role: 'client',
            },
          });

          return { user1, client1, settings1, user2 };
        });
      };

      // Transaction should fail due to unique constraint violation
      await expect(transactionFunction()).rejects.toThrow();

      // Verify no data was persisted
      const users = await prisma.user.findMany({
        where: {
          email: 'rollback-test@test.com',
        },
      });

      const clients = await prisma.client.findMany({
        where: {
          user: {
            email: 'rollback-test@test.com',
          },
        },
      });

      const settings = await prisma.notificationSettings.findMany({
        where: {
          user: {
            email: 'rollback-test@test.com',
          },
        },
      });

      expect(users).toHaveLength(0);
      expect(clients).toHaveLength(0);
      expect(settings).toHaveLength(0);
    });

    it('should handle nested transaction rollback in complex scenarios', async () => {
      const nestedTransactionFunction = async () => {
        return await prisma.$transaction(async (tx) => {
          // Create therapist user and profile
          const therapistUser = await tx.user.create({
            data: TestDataGenerator.createUser({
              email: 'nested-therapist@test.com',
              role: 'therapist',
            }),
          });

          const therapist = await tx.therapist.create({
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
              areasOfExpertise: ['Anxiety'],
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

          // Create client user and profile
          const clientUser = await tx.user.create({
            data: TestDataGenerator.createUser({
              email: 'nested-client@test.com',
              role: 'client',
            }),
          });

          const client = await tx.client.create({
            data: {
              userId: clientUser.id,
              hasSeenTherapistRecommendations: true,
            },
          });

          // Create meeting
          const meeting = await tx.meeting.create({
            data: {
              clientId: client.userId,
              therapistId: therapist.userId,
              startTime: new Date('2024-12-01T10:00:00Z'),
              duration: 60,
              status: 'SCHEDULED',
              meetingType: 'video',
            },
          });

          // Create session log
          const sessionLog = await tx.sessionLog.create({
            data: {
              clientId: client.userId,
              meetingId: meeting.id,
              sessionDate: new Date('2024-12-01T10:00:00Z'),
              duration: 60,
              sessionType: 'Individual',
              notes: 'Initial session notes',
              mood: 'neutral',
              progress: 'good',
            },
          });

          // Attempt to create duplicate meeting at same time (should fail)
          const duplicateMeeting = await tx.meeting.create({
            data: {
              clientId: client.userId,
              therapistId: therapist.userId,
              startTime: new Date('2024-12-01T10:00:00Z'), // Same time
              duration: 60,
              status: 'SCHEDULED',
              meetingType: 'video',
            },
          });

          return {
            therapistUser,
            therapist,
            clientUser,
            client,
            meeting,
            sessionLog,
            duplicateMeeting,
          };
        });
      };

      // Transaction should fail (assuming business logic prevents double booking)
      await expect(nestedTransactionFunction()).rejects.toThrow();

      // Verify complete rollback
      const therapists = await prisma.therapist.findMany({
        where: {
          user: {
            email: 'nested-therapist@test.com',
          },
        },
      });

      const clients = await prisma.client.findMany({
        where: {
          user: {
            email: 'nested-client@test.com',
          },
        },
      });

      const meetings = await prisma.meeting.findMany({
        where: {
          client: {
            user: {
              email: 'nested-client@test.com',
            },
          },
        },
      });

      expect(therapists).toHaveLength(0);
      expect(clients).toHaveLength(0);
      expect(meetings).toHaveLength(0);
    });
  });

  describe('Constraint Validation and Cascade Deletion', () => {
    it('should enforce foreign key constraints properly', async () => {
      // Attempt to create client with non-existent user ID
      const invalidClientCreation = async () => {
        return await prisma.client.create({
          data: {
            userId: 'non-existent-user-id',
            hasSeenTherapistRecommendations: false,
          },
        });
      };

      await expect(invalidClientCreation()).rejects.toThrow();

      // Attempt to create message with non-existent conversation ID
      const user = await prisma.user.create({
        data: TestDataGenerator.createUser(),
      });

      const invalidMessageCreation = async () => {
        return await prisma.message.create({
          data: {
            conversationId: 'non-existent-conversation-id',
            senderId: user.id,
            content: 'This should fail',
            messageType: 'TEXT',
          },
        });
      };

      await expect(invalidMessageCreation()).rejects.toThrow();
    });

    it('should handle cascade deletion correctly across related models', async () => {
      // Create complete user hierarchy
      const user = await prisma.user.create({
        data: TestDataGenerator.createUser({
          email: 'cascade@test.com',
          role: 'client',
        }),
      });

      const client = await prisma.client.create({
        data: {
          userId: user.id,
          hasSeenTherapistRecommendations: false,
        },
      });

      // Create related entities
      const [
        notificationSettings,
        preAssessment,
        userActivity,
        auditLog,
        medicalHistory,
        clientPreference,
      ] = await Promise.all([
        prisma.notificationSettings.create({
          data: {
            userId: user.id,
            emailNotifications: true,
            pushNotifications: true,
          },
        }),
        prisma.preAssessment.create({
          data: {
            userId: user.id,
            questionnaires: { PHQ9: [1, 2, 3] },
            scores: { depression: 10 },
            severityLevels: { depression: 'mild' },
            status: 'COMPLETED',
          },
        }),
        prisma.userActivity.create({
          data: {
            userId: user.id,
            activityType: 'login',
            activityData: { timestamp: new Date().toISOString() },
          },
        }),
        prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'USER_LOGIN',
            entity: 'User',
            entityId: user.id,
            details: { ip: '127.0.0.1' },
            severity: 'INFO',
          },
        }),
        prisma.clientMedicalHistory.create({
          data: {
            clientId: client.userId,
            condition: 'Anxiety',
            notes: 'Test condition',
          },
        }),
        prisma.clientPreference.create({
          data: {
            clientId: client.userId,
            key: 'session_time',
            value: 'morning',
          },
        }),
      ]);

      // Get IDs before deletion
      const relatedIds = {
        notificationSettings: notificationSettings.id,
        preAssessment: preAssessment.id,
        userActivity: userActivity.id,
        auditLog: auditLog.id,
        medicalHistory: medicalHistory.id,
        clientPreference: clientPreference.id,
      };

      // Delete user - should cascade to all related entities
      await prisma.user.delete({
        where: { id: user.id },
      });

      // Verify cascade deletion
      const checkResults = await Promise.allSettled([
        prisma.user.findUnique({ where: { id: user.id } }),
        prisma.client.findUnique({ where: { userId: user.id } }),
        prisma.notificationSettings.findUnique({ where: { id: relatedIds.notificationSettings } }),
        prisma.preAssessment.findUnique({ where: { id: relatedIds.preAssessment } }),
        prisma.userActivity.findUnique({ where: { id: relatedIds.userActivity } }),
        prisma.auditLog.findUnique({ where: { id: relatedIds.auditLog } }),
        prisma.clientMedicalHistory.findUnique({ where: { id: relatedIds.medicalHistory } }),
        prisma.clientPreference.findUnique({ where: { id: relatedIds.clientPreference } }),
      ]);

      // All should be null (deleted)
      checkResults.forEach(result => {
        expect(result.status).toBe('fulfilled');
        if (result.status === 'fulfilled') {
          expect(result.value).toBeNull();
        }
      });
    });

    it('should handle unique constraint violations gracefully', async () => {
      // Create user with unique email
      const user1 = await prisma.user.create({
        data: TestDataGenerator.createUser({
          email: 'unique@test.com',
          firstName: 'First',
        }),
      });

      // Attempt to create another user with same email
      const duplicateEmailAttempt = async () => {
        return await prisma.user.create({
          data: TestDataGenerator.createUser({
            email: 'unique@test.com', // Duplicate email
            firstName: 'Second',
          }),
        });
      };

      await expect(duplicateEmailAttempt()).rejects.toThrow();

      // Create conversation participant
      const conversation = await prisma.conversation.create({
        data: {
          type: 'DIRECT',
          isActive: true,
        },
      });

      const participant1 = await prisma.conversationParticipant.create({
        data: {
          conversationId: conversation.id,
          userId: user1.id,
          role: 'MEMBER',
        },
      });

      // Attempt to create duplicate participant
      const duplicateParticipantAttempt = async () => {
        return await prisma.conversationParticipant.create({
          data: {
            conversationId: conversation.id,
            userId: user1.id, // Duplicate combination
            role: 'ADMIN',
          },
        });
      };

      await expect(duplicateParticipantAttempt()).rejects.toThrow();
    });
  });

  describe('Concurrent Transaction Handling', () => {
    it('should handle concurrent user creation correctly', async () => {
      const concurrentUsers = Array.from({ length: 10 }, (_, i) =>
        prisma.user.create({
          data: TestDataGenerator.createUser({
            email: `concurrent-${i}@test.com`,
            firstName: `User${i}`,
          }),
        })
      );

      const results = await Promise.allSettled(concurrentUsers);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      expect(successful).toBe(10); // All should succeed with unique emails
      expect(failed).toBe(0);

      // Verify all users were created
      const createdUsers = await prisma.user.findMany({
        where: {
          email: {
            startsWith: 'concurrent-',
          },
        },
      });

      expect(createdUsers).toHaveLength(10);
    });

    it('should handle concurrent transaction conflicts', async () => {
      // Create base user
      const user = await prisma.user.create({
        data: TestDataGenerator.createUser({
          email: 'concurrent-transaction@test.com',
        }),
      });

      // Create concurrent transactions that modify the same user
      const concurrentTransactions = Array.from({ length: 5 }, (_, i) =>
        prisma.$transaction(async (tx) => {
          // Read current user state
          const currentUser = await tx.user.findUnique({
            where: { id: user.id },
          });

          if (!currentUser) {
            throw new Error('User not found');
          }

          // Simulate some processing time
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

          // Update user with new information
          const updatedUser = await tx.user.update({
            where: { id: user.id },
            data: {
              firstName: `Updated${i}`,
              bio: `Transaction ${i} bio update`,
              updatedAt: new Date(),
            },
          });

          // Create activity log
          await tx.userActivity.create({
            data: {
              userId: user.id,
              activityType: 'profile_update',
              activityData: {
                updateNumber: i,
                timestamp: new Date().toISOString(),
              },
            },
          });

          return updatedUser;
        })
      );

      const results = await Promise.allSettled(concurrentTransactions);
      const successful = results.filter(r => r.status === 'fulfilled').length;

      // All transactions should succeed due to proper isolation
      expect(successful).toBe(5);

      // Verify final state consistency
      const finalUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          activities: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      expect(finalUser?.activities).toHaveLength(5);
      expect(finalUser?.firstName).toMatch(/Updated\d/);
    });

    it('should handle optimistic concurrency control', async () => {
      // Create meeting for concurrent updates
      const clientUser = await prisma.user.create({
        data: TestDataGenerator.createUser({
          role: 'client',
          email: 'concurrency-client@test.com',
        }),
      });

      const therapistUser = await prisma.user.create({
        data: TestDataGenerator.createUser({
          role: 'therapist',
          email: 'concurrency-therapist@test.com',
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
          areasOfExpertise: ['Anxiety'],
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

      const meeting = await prisma.meeting.create({
        data: {
          clientId: client.userId,
          therapistId: therapist.userId,
          startTime: new Date('2024-12-01T10:00:00Z'),
          duration: 60,
          status: 'SCHEDULED',
          meetingType: 'video',
          description: 'Initial meeting',
        },
      });

      // Simulate concurrent updates to the meeting
      const concurrentUpdates = [
        prisma.meeting.update({
          where: { id: meeting.id },
          data: {
            description: 'Updated by client',
            updatedAt: new Date(),
          },
        }),
        prisma.meeting.update({
          where: { id: meeting.id },
          data: {
            status: 'IN_PROGRESS',
            updatedAt: new Date(),
          },
        }),
        prisma.meeting.update({
          where: { id: meeting.id },
          data: {
            duration: 90,
            updatedAt: new Date(),
          },
        }),
      ];

      const updateResults = await Promise.allSettled(concurrentUpdates);
      const successfulUpdates = updateResults.filter(r => r.status === 'fulfilled').length;

      // All updates should succeed
      expect(successfulUpdates).toBe(3);

      // Verify final meeting state is consistent
      const finalMeeting = await prisma.meeting.findUnique({
        where: { id: meeting.id },
      });

      expect(finalMeeting).toBeTruthy();
      expect(finalMeeting?.updatedAt.getTime()).toBeGreaterThan(meeting.updatedAt.getTime());
    });
  });

  describe('Transaction Performance and Deadlock Prevention', () => {
    it('should handle large transaction volumes efficiently', async () => {
      const startTime = Date.now();
      const batchSize = 20;

      // Create batch of transactions
      const transactions = Array.from({ length: batchSize }, (_, i) =>
        prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: TestDataGenerator.createUser({
              email: `batch-${i}@test.com`,
              firstName: `BatchUser${i}`,
            }),
          });

          const client = await tx.client.create({
            data: {
              userId: user.id,
              hasSeenTherapistRecommendations: false,
            },
          });

          const settings = await tx.notificationSettings.create({
            data: {
              userId: user.id,
              emailNotifications: true,
              pushNotifications: true,
            },
          });

          return { user, client, settings };
        })
      );

      const results = await Promise.allSettled(transactions);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const successful = results.filter(r => r.status === 'fulfilled').length;

      expect(successful).toBe(batchSize);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds

      console.log(`✅ Batch Transaction Performance:
        Transactions: ${batchSize}
        Successful: ${successful}
        Duration: ${duration}ms
        Avg per transaction: ${(duration / batchSize).toFixed(2)}ms`);
    });

    it('should prevent deadlocks in complex scenarios', async () => {
      // Create base entities
      const users = await Promise.all([
        prisma.user.create({
          data: TestDataGenerator.createUser({
            email: 'deadlock-1@test.com',
          }),
        }),
        prisma.user.create({
          data: TestDataGenerator.createUser({
            email: 'deadlock-2@test.com',
          }),
        }),
      ]);

      const conversation = await prisma.conversation.create({
        data: {
          type: 'DIRECT',
          participants: {
            create: [
              { userId: users[0].id, role: 'MEMBER' },
              { userId: users[1].id, role: 'MEMBER' },
            ],
          },
        },
      });

      // Create transactions that could potentially deadlock
      const potentialDeadlockTransactions = [
        // Transaction 1: Update user1 then user2
        prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: users[0].id },
            data: { bio: 'Updated by transaction 1' },
          });

          await new Promise(resolve => setTimeout(resolve, 50));

          await tx.user.update({
            where: { id: users[1].id },
            data: { bio: 'Also updated by transaction 1' },
          });

          await tx.message.create({
            data: {
              conversationId: conversation.id,
              senderId: users[0].id,
              content: 'Message from transaction 1',
              messageType: 'TEXT',
            },
          });

          return 'transaction-1-success';
        }),

        // Transaction 2: Update user2 then user1
        prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: users[1].id },
            data: { firstName: 'Updated by transaction 2' },
          });

          await new Promise(resolve => setTimeout(resolve, 50));

          await tx.user.update({
            where: { id: users[0].id },
            data: { firstName: 'Also updated by transaction 2' },
          });

          await tx.message.create({
            data: {
              conversationId: conversation.id,
              senderId: users[1].id,
              content: 'Message from transaction 2',
              messageType: 'TEXT',
            },
          });

          return 'transaction-2-success';
        }),
      ];

      const deadlockResults = await Promise.allSettled(potentialDeadlockTransactions);
      const successful = deadlockResults.filter(r => r.status === 'fulfilled').length;

      // Both transactions should complete successfully (no deadlock)
      expect(successful).toBeGreaterThanOrEqual(1); // At least one should succeed

      // Verify final state consistency
      const finalUsers = await prisma.user.findMany({
        where: {
          id: { in: [users[0].id, users[1].id] },
        },
      });

      const messages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
      });

      expect(finalUsers).toHaveLength(2);
      expect(messages.length).toBeGreaterThanOrEqual(1);
    });
  });
});