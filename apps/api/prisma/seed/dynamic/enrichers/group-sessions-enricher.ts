/**
 * Group Sessions Enricher
 * Creates group therapy sessions and webinars for communities with therapist invitations.
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';
import { TEST_THERAPISTS } from '../../fixtures/test-accounts';

export class GroupSessionsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'GroupTherapySession');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Ensure every community has at least one therapist member so sessions can be created
    const therapistId = TEST_THERAPISTS[0]?.id;
    if (therapistId) {
      const communityIds = await this.prisma.community.findMany({
        select: { id: true },
      });
      for (const { id: communityId } of communityIds) {
        try {
          const therapistMemberCount = await this.prisma.membership.count({
            where: {
              communityId,
              user: { role: 'therapist' },
            },
          });
          if (therapistMemberCount > 0) continue;
          await this.prisma.membership.create({
            data: {
              userId: therapistId,
              communityId,
              joinedAt: this.randomPastDate(60),
            },
          });
        } catch {
          errors++;
        }
      }
    }

    // Ensure at least 10 group sessions (events + webinars) per community
    const MIN_SESSIONS_PER_COMMUNITY = 10;
    const communities = await this.prisma.community.findMany({
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
        // Only create if community has moderator and at least one therapist member
        if (
          community.moderatorCommunities.length > 0 &&
          community.memberships.length >= 1
        ) {
          const existingSessions = await this.prisma.groupTherapySession.count({
            where: { communityId: community.id },
          });

          const missing = Math.max(0, MIN_SESSIONS_PER_COMMUNITY - existingSessions);
          if (missing > 0) {
            added += await this.ensureCommunityHasGroupSessions(
              community,
              missing,
            );
          }

          // Ensure at least one webinar per community (idempotent)
          const webinarCount = await this.prisma.groupTherapySession.count({
            where: {
              communityId: community.id,
              sessionFormat: 'webinar',
            },
          });
          if (webinarCount === 0) {
            added += await this.ensureCommunityHasWebinar(community);
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

  /** Derive theme key from community slug for title/description matching. */
  private getThemeFromSlug(slug: string): string {
    const s = slug.toLowerCase();
    if (s.includes('anxiety')) return 'anxiety';
    if (s.includes('depression')) return 'depression';
    if (s.includes('adhd')) return 'adhd';
    if (s.includes('stress') || s.includes('burnout')) return 'stress';
    if (s.includes('insomnia') || s.includes('sleep')) return 'sleep';
    if (s.includes('panic')) return 'panic';
    if (s.includes('bipolar') || s.includes('mood')) return 'mood';
    if (s.includes('ocd')) return 'ocd';
    if (s.includes('ptsd') || s.includes('trauma')) return 'trauma';
    if (s.includes('social') && s.includes('anxiety')) return 'social-anxiety';
    if (s.includes('phobia')) return 'phobia';
    if (s.includes('eating') || s.includes('binge')) return 'eating';
    if (s.includes('alcohol') || s.includes('substance') || s.includes('drug') || s.includes('recovery')) return 'substance';
    return 'general';
  }

  private async ensureCommunityHasGroupSessions(
    community: any,
    minSessions: number,
  ): Promise<number> {
    let created = 0;
    const random = this.getRandom(community.id, 'group-sessions');
    const theme = this.getThemeFromSlug(community.slug ?? '');

    // Get moderator
    const moderator = community.moderatorCommunities[0].moderator;

    // Get therapist members
    const therapistMembers = community.memberships;

    const sessionTemplatesByTheme: Record<string, Array<{
      title: string;
      description: string;
      sessionType: 'VIRTUAL' | 'IN_PERSON';
      duration: number;
      maxParticipants: number;
      sessionFormat: 'group-therapy' | 'webinar';
    }>> = {
      anxiety: [
        { title: 'Anxiety Management Group', description: 'A supportive group focused on anxiety coping strategies and peer support.', sessionType: 'VIRTUAL', duration: 60, maxParticipants: 15, sessionFormat: 'group-therapy' },
        { title: 'Worry & Rumination Skills', description: 'Learn to reduce worry and rumination with evidence-based techniques.', sessionType: 'VIRTUAL', duration: 60, maxParticipants: 12, sessionFormat: 'group-therapy' },
        { title: 'Calm & Grounding Practice', description: 'Grounding and breathing techniques for anxiety relief.', sessionType: 'IN_PERSON', duration: 60, maxParticipants: 20, sessionFormat: 'group-therapy' },
        { title: 'Social Anxiety Check-in', description: 'Safe space to practice and discuss social anxiety strategies.', sessionType: 'VIRTUAL', duration: 90, maxParticipants: 10, sessionFormat: 'group-therapy' },
      ],
      depression: [
        { title: 'Depression Support Circle', description: 'Group therapy for individuals dealing with depression.', sessionType: 'VIRTUAL', duration: 90, maxParticipants: 12, sessionFormat: 'group-therapy' },
        { title: 'Behavioral Activation Group', description: 'Build activity and mood through structured behavioral activation.', sessionType: 'VIRTUAL', duration: 60, maxParticipants: 15, sessionFormat: 'group-therapy' },
        { title: 'Hope & Meaning Group', description: 'Explore hope and meaning with others who understand.', sessionType: 'IN_PERSON', duration: 60, maxParticipants: 12, sessionFormat: 'group-therapy' },
        { title: 'Depression Coping Skills', description: 'Practical coping skills and peer support for depression.', sessionType: 'VIRTUAL', duration: 75, maxParticipants: 10, sessionFormat: 'group-therapy' },
      ],
      adhd: [
        { title: 'ADHD Strategies Group', description: 'Share and learn strategies for focus, organization, and time management.', sessionType: 'VIRTUAL', duration: 60, maxParticipants: 15, sessionFormat: 'group-therapy' },
        { title: 'ADHD Peer Support', description: 'Peer support and accountability for living well with ADHD.', sessionType: 'VIRTUAL', duration: 60, maxParticipants: 12, sessionFormat: 'group-therapy' },
        { title: 'Focus & Structure Workshop', description: 'Structured session on building focus and daily structure.', sessionType: 'IN_PERSON', duration: 90, maxParticipants: 10, sessionFormat: 'group-therapy' },
        { title: 'ADHD Check-in & Tips', description: 'Weekly check-in and tip-sharing for ADHD management.', sessionType: 'VIRTUAL', duration: 45, maxParticipants: 15, sessionFormat: 'group-therapy' },
      ],
      stress: [
        { title: 'Stress Relief Group', description: 'Coping strategies and relaxation for stress and burnout.', sessionType: 'VIRTUAL', duration: 60, maxParticipants: 15, sessionFormat: 'group-therapy' },
        { title: 'Mindfulness for Stress', description: 'Mindfulness and breathing for stress reduction.', sessionType: 'IN_PERSON', duration: 60, maxParticipants: 20, sessionFormat: 'group-therapy' },
      ],
      sleep: [
        { title: 'Sleep & Insomnia Support', description: 'Group support for sleep issues and insomnia strategies.', sessionType: 'VIRTUAL', duration: 60, maxParticipants: 12, sessionFormat: 'group-therapy' },
        { title: 'Sleep Hygiene Workshop', description: 'Evidence-based sleep hygiene and wind-down practices.', sessionType: 'VIRTUAL', duration: 75, maxParticipants: 15, sessionFormat: 'group-therapy' },
      ],
      mood: [
        { title: 'Mood Stability Group', description: 'Support for mood regulation and stability.', sessionType: 'VIRTUAL', duration: 90, maxParticipants: 10, sessionFormat: 'group-therapy' },
        { title: 'Bipolar Support Circle', description: 'Peer support for individuals with bipolar disorder.', sessionType: 'VIRTUAL', duration: 60, maxParticipants: 12, sessionFormat: 'group-therapy' },
      ],
      trauma: [
        { title: 'Trauma Recovery Group', description: 'Safe space for trauma survivors to share and heal.', sessionType: 'VIRTUAL', duration: 90, maxParticipants: 10, sessionFormat: 'group-therapy' },
        { title: 'PTSD Support Session', description: 'Structured support for PTSD symptoms and coping.', sessionType: 'VIRTUAL', duration: 60, maxParticipants: 12, sessionFormat: 'group-therapy' },
      ],
      general: [
        { title: 'Support Group', description: 'A supportive group session for peer connection and sharing.', sessionType: 'VIRTUAL', duration: 60, maxParticipants: 15, sessionFormat: 'group-therapy' },
        { title: 'Mindfulness & Meditation Group', description: 'Guided mindfulness and meditation with therapeutic support.', sessionType: 'IN_PERSON', duration: 60, maxParticipants: 20, sessionFormat: 'group-therapy' },
        { title: 'Wellness Check-in', description: 'Weekly check-in and wellness strategies.', sessionType: 'VIRTUAL', duration: 45, maxParticipants: 15, sessionFormat: 'group-therapy' },
      ],
    };
    const defaultTemplates = sessionTemplatesByTheme.general!;
    const sessionTemplates = sessionTemplatesByTheme[theme] ?? defaultTemplates;

    for (let i = 0; i < minSessions; i++) {
      const template = sessionTemplates[i % sessionTemplates.length]!;

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
          sessionFormat: template.sessionFormat,
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

  /**
   * Create one webinar for the community if none exist (idempotent).
   * Title and description match the community theme (slug).
   */
  private async ensureCommunityHasWebinar(community: any): Promise<number> {
    const random = this.getRandom(community.id, 'webinar');
    const theme = this.getThemeFromSlug(community.slug ?? '');
    const moderator = community.moderatorCommunities[0].moderator;
    const therapistMembers = community.memberships;

    const webinarByTheme: Record<string, Array<{ title: string; description: string; duration: number; maxParticipants: number }>> = {
      anxiety: [
        { title: 'Understanding Anxiety – Webinar', description: 'Educational webinar on anxiety: symptoms, treatment options, and coping strategies. Q&A included.', duration: 60, maxParticipants: 50 },
        { title: 'Managing Anxiety in Daily Life – Webinar', description: 'Practical strategies for anxiety: breathing, cognitive reframing, and when to seek support.', duration: 60, maxParticipants: 50 },
      ],
      depression: [
        { title: 'Understanding Depression – Webinar', description: 'Educational webinar on depression: symptoms, treatment options, and coping strategies. Q&A included.', duration: 60, maxParticipants: 50 },
        { title: 'Depression & Behavioral Activation – Webinar', description: 'How behavioral activation can help with depression; practical steps and Q&A.', duration: 75, maxParticipants: 50 },
      ],
      adhd: [
        { title: 'ADHD 101 – Webinar', description: 'Understanding ADHD: how it affects daily life and evidence-based strategies. Q&A included.', duration: 60, maxParticipants: 50 },
        { title: 'ADHD Strategies That Work – Webinar', description: 'Practical organization, focus, and time-management strategies for ADHD.', duration: 60, maxParticipants: 50 },
      ],
      stress: [
        { title: 'Stress & Burnout – Webinar', description: 'Understanding stress and burnout; recovery strategies and self-care. Q&A included.', duration: 60, maxParticipants: 50 },
      ],
      sleep: [
        { title: 'Sleep & Insomnia – Webinar', description: 'Evidence-based sleep hygiene and insomnia strategies. Q&A included.', duration: 60, maxParticipants: 50 },
      ],
      mood: [
        { title: 'Mood Disorders & Stability – Webinar', description: 'Understanding mood disorders and strategies for stability. Q&A included.', duration: 60, maxParticipants: 50 },
      ],
      trauma: [
        { title: 'Understanding PTSD & Trauma – Webinar', description: 'Educational webinar on trauma and PTSD: symptoms, treatment, and healing. Q&A included.', duration: 75, maxParticipants: 50 },
      ],
      general: [
        { title: 'Mental Wellness Basics – Webinar', description: 'Introduction to mental wellness and when to seek support. Q&A included.', duration: 60, maxParticipants: 50 },
      ],
    };
    const options = webinarByTheme[theme] ?? webinarByTheme.general!;
    const template = options[random.nextInt(options.length)] ?? options[0];
    const scheduledAt = new Date(
      Date.now() + random.next() * 30 * 24 * 60 * 60 * 1000,
    );
    scheduledAt.setHours(10 + random.nextInt(8), 0, 0, 0);

    const numTherapists = Math.min(
      2,
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

    const session = await this.prisma.groupTherapySession.create({
      data: {
        title: template.title,
        description: template.description,
        communityId: community.id,
        createdById: moderator.userId,
        sessionType: 'VIRTUAL',
        sessionFormat: 'webinar',
        scheduledAt,
        duration: template.duration,
        maxParticipants: template.maxParticipants,
        virtualLink: `https://meet.mentara.dev/webinar-${random.nextInt(10000)}`,
        location: null,
        locationAddress: null,
        status: 'APPROVED',
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

    return 1;
  }
}
