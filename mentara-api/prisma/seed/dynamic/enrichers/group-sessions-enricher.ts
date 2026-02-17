/**
 * Group Sessions Enricher
 * Creates group therapy sessions for communities with therapist invitations
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class GroupSessionsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'GroupTherapySession');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Create 1-2 group sessions per community
    const communities = await this.prisma.community.findMany({
      take: 10,
      include: {
        moderatorCommunities: {
          include: {
            moderator: true,
          },
        },
        memberships: {
          where: {
            user: { role: 'therapist' },
          },
          include: { user: { select: { id: true } } },
          take: 5,
        },
      },
    });

    for (const community of communities) {
      try {
        // Only create if community has moderator and therapists
        if (
          community.moderatorCommunities.length > 0 &&
          community.memberships.length >= 2
        ) {
          const existingSessions = await this.prisma.groupTherapySession.count({
            where: { communityId: community.id },
          });

          const missing = Math.max(0, 2 - existingSessions);
          if (missing > 0) {
            added += await this.ensureCommunityHasGroupSessions(
              community,
              missing,
            );
          }
        }
      } catch (error) {
        errors++;
      }
    }

    return {
      table: this.tableName,
      itemsAdded: added,
      itemsUpdated: 0,
      errors,
    };
  }

  private async ensureCommunityHasGroupSessions(
    community: any,
    minSessions: number,
  ): Promise<number> {
    let created = 0;
    const random = this.getRandom(community.id, 'group-sessions');

    // Get moderator
    const moderator = community.moderatorCommunities[0].moderator;

    // Get therapist members
    const therapistMembers = community.memberships;

    const sessionTemplates = [
      {
        title: 'Anxiety Management Group',
        description:
          'A supportive group session focused on anxiety coping strategies and peer support.',
        sessionType: 'VIRTUAL' as const,
        duration: 60,
        maxParticipants: 15,
      },
      {
        title: 'Depression Support Circle',
        description:
          'Group therapy session for individuals dealing with depression.',
        sessionType: 'VIRTUAL' as const,
        duration: 90,
        maxParticipants: 12,
      },
      {
        title: 'Mindfulness & Meditation Group',
        description:
          'Guided mindfulness and meditation practice with therapeutic support.',
        sessionType: 'IN_PERSON' as const,
        duration: 60,
        maxParticipants: 20,
      },
      {
        title: 'Trauma Recovery Group',
        description:
          'Safe space for trauma survivors to share and heal together.',
        sessionType: 'VIRTUAL' as const,
        duration: 90,
        maxParticipants: 10,
      },
    ];

    for (let i = 0; i < minSessions && i < sessionTemplates.length; i++) {
      const template = sessionTemplates[i];

      // Random date in next 30 days
      const scheduledAt = new Date(
        Date.now() + random.next() * 30 * 24 * 60 * 60 * 1000,
      );

      // Set to reasonable hour (10 AM - 6 PM)
      scheduledAt.setHours(10 + random.nextInt(8), 0, 0, 0);

      const numTherapists = Math.min(
        2 + random.nextInt(2),
        therapistMembers.length,
      );
      const selectedTherapists: { userId: string }[] = [];
      const therapistsCopy = [...therapistMembers];

      for (let j = 0; j < numTherapists; j++) {
        const index = random.nextInt(therapistsCopy.length);
        const m = therapistsCopy[index];
        selectedTherapists.push({ userId: m.user.id });
        therapistsCopy.splice(index, 1);
      }

      // Create session
      const session = await this.prisma.groupTherapySession.create({
        data: {
          title: template.title,
          description: template.description,
          communityId: community.id,
          createdById: moderator.userId,
          sessionType: template.sessionType,
          scheduledAt,
          duration: template.duration,
          maxParticipants: template.maxParticipants,
          virtualLink:
            template.sessionType === 'VIRTUAL'
              ? `https://meet.mentara.dev/group-${random.nextInt(10000)}`
              : null,
          location:
            template.sessionType === 'IN_PERSON'
              ? 'Mentara Wellness Center'
              : null,
          locationAddress:
            template.sessionType === 'IN_PERSON'
              ? '123 Wellness Ave, Mental Health District'
              : null,
          status: 'APPROVED', // Auto-approve for testing
        },
      });

      for (const t of selectedTherapists) {
        await this.prisma.groupSessionTherapistInvitation.create({
          data: {
            sessionId: session.id,
            therapistId: t.userId,
            status: 'ACCEPTED',
            respondedAt: new Date(),
          },
        });
      }

      const excludedUserIds = [
        moderator.userId,
        ...selectedTherapists.map((t) => t.userId),
      ];
      const otherMembers = await this.prisma.membership.findMany({
        where: {
          communityId: community.id,
          userId: { notIn: excludedUserIds },
        },
        take: 15,
      });

      const numParticipants = Math.min(
        3 + random.nextInt(6),
        otherMembers.length,
        template.maxParticipants,
      );

      for (let j = 0; j < numParticipants; j++) {
        const member = otherMembers[j];
        if (member) {
          await this.prisma.groupSessionParticipant.create({
            data: {
              sessionId: session.id,
              userId: member.userId,
              attendanceStatus: 'REGISTERED',
              joinedAt: this.randomDateAfter(session.createdAt, 7),
            },
          });
        }
      }

      created++;
    }

    return created;
  }
}
