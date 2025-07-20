import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { ILLNESS_COMMUNITIES } from '../config/community-configs';

interface PreAssessmentScores {
  [key: string]: number;
}

interface SeverityLevels {
  [key: string]: string;
}

@Injectable()
export class CommunityAssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Maps questionnaire types to community slugs based on mental health conditions
   */
  private readonly QUESTIONNAIRE_TO_COMMUNITY_MAP = {
    // Depression-related assessments
    'phq-9': 'depression-support',
    'mood-disorder': 'depression-support',

    // Anxiety-related assessments
    'gad-7-anxiety': 'anxiety-warriors',
    'social-phobia': 'social-anxiety-support',
    'panic-disorder': 'anxiety-warriors',
    phobia: 'phobia-support',

    // Stress-related assessments
    'perceived-stress-scale': 'stress-support',
    burnout: 'burnout-recovery',

    // Sleep-related assessments
    insomnia: 'insomnia-support',

    // Trauma-related assessments
    ptsd: 'ptsd-support',

    // OCD-related assessments
    'obsessional-compulsive': 'ocd-support',

    // ADHD-related assessments
    adhd: 'adhd-support',

    // Eating disorder assessments
    'binge-eating': 'eating-disorder-recovery',

    // Substance use assessments
    alcohol: 'substance-recovery-support',
    'drug-abuse': 'substance-recovery-support',
  };

  /**
   * Severity thresholds for community assignment
   * Only assign to communities if severity is moderate or higher
   */
  private readonly SEVERITY_THRESHOLD = {
    minimal: false,
    mild: false,
    moderate: true,
    severe: true,
    'very-severe': true,
  };

  /**
   * Auto-assign communities to a user based on their pre-assessment results
   */
  async assignCommunitiesToUser(userId: string): Promise<string[]> {
    console.log(`🔄 Auto-assigning communities for user: ${userId}`);

    // Get user's pre-assessment data
    const userAssessment = await this.prisma.preAssessment.findFirst({
      where: { clientId: userId },
      select: {
        answers: true,
      },
    });

    if (!userAssessment) {
      console.log(`⚠️  No pre-assessment found for user: ${userId}`);
      return [];
    }

    // Extract scores and severity levels from answers JSON
    const assessmentData = userAssessment.answers as any;
    if (!assessmentData || typeof assessmentData !== 'object') {
      console.log(`⚠️  Invalid assessment data for user: ${userId}`);
      return [];
    }

    const scores = assessmentData.scores as PreAssessmentScores;
    const severityLevels = assessmentData.severityLevels as SeverityLevels;

    if (!scores || !severityLevels) {
      console.log(`⚠️  Missing scores or severity levels for user: ${userId}`);
      return [];
    }
    const assignedCommunities: string[] = [];

    // Iterate through questionnaire results and assign communities
    for (const [questionnaire] of Object.entries(scores)) {
      const severity = severityLevels[questionnaire];
      const communitySlug = this.QUESTIONNAIRE_TO_COMMUNITY_MAP[questionnaire];

      // Skip if no community mapping or severity is too low
      if (!communitySlug || !this.SEVERITY_THRESHOLD[severity?.toLowerCase()]) {
        continue;
      }

      // Find the community
      const community = await this.prisma.community.findUnique({
        where: { slug: communitySlug },
      });

      if (!community) {
        console.log(`⚠️  Community not found for slug: ${communitySlug}`);
        continue;
      }

      // Check if user is already a member
      const existingMembership = await this.prisma.membership.findUnique({
        where: {
          userId_communityId: {
            userId: userId,
            communityId: community.id,
          },
        },
      });

      if (existingMembership) {
        console.log(`⏭️  User already member of: ${community.name}`);
        continue;
      }

      // Create membership
      try {
        await this.prisma.membership.create({
          data: {
            userId: userId,
            communityId: community.id,
            joinedAt: new Date(),
          },
        });

        assignedCommunities.push(community.name);
        console.log(
          `✅ Assigned user to community: ${community.name} (${severity} ${questionnaire})`,
        );
      } catch (error) {
        console.error(
          `❌ Failed to assign community ${community.name}:`,
          error,
        );
      }
    }

    // Always assign to general support communities
    await this.assignGeneralSupportCommunities(userId);

    console.log(
      `🎯 Auto-assignment complete. Assigned ${assignedCommunities.length} communities.`,
    );
    return assignedCommunities;
  }

  /**
   * Assign user to general support communities regardless of assessment results
   */
  private async assignGeneralSupportCommunities(userId: string): Promise<void> {
    const generalCommunities = ['Support Circle', 'Mindfulness & Meditation'];

    for (const communityName of generalCommunities) {
      const community = await this.prisma.community.findFirst({
        where: { name: communityName },
      });

      if (!community) continue;

      // Check if user is already a member
      const existingMembership = await this.prisma.membership.findUnique({
        where: {
          userId_communityId: {
            userId: userId,
            communityId: community.id,
          },
        },
      });

      if (existingMembership) continue;

      try {
        await this.prisma.membership.create({
          data: {
            userId: userId,
            communityId: community.id,
            joinedAt: new Date(),
          },
        });
        console.log(`✅ Assigned user to general community: ${community.name}`);
      } catch (error) {
        console.error(
          `❌ Failed to assign general community ${community.name}:`,
          error,
        );
      }
    }
  }

  /**
   * Get communities a user should be assigned to based on their assessment (preview mode)
   */
  async getRecommendedCommunities(userId: string): Promise<string[]> {
    const userAssessment = await this.prisma.preAssessment.findFirst({
      where: { clientId: userId },
      select: {
        answers: true,
      },
    });

    if (!userAssessment) {
      return [];
    }

    // Extract scores and severity levels from answers JSON
    const assessmentData = userAssessment.answers as any;
    if (!assessmentData || typeof assessmentData !== 'object') {
      return [];
    }

    const scores = assessmentData.scores as PreAssessmentScores;
    const severityLevels = assessmentData.severityLevels as SeverityLevels;

    if (!scores || !severityLevels) {
      return [];
    }
    const recommendedCommunities: string[] = [];

    for (const [questionnaire] of Object.entries(scores)) {
      const severity = severityLevels[questionnaire];
      const communitySlug = this.QUESTIONNAIRE_TO_COMMUNITY_MAP[questionnaire];

      if (communitySlug && this.SEVERITY_THRESHOLD[severity?.toLowerCase()]) {
        const community = ILLNESS_COMMUNITIES.find(
          (c) => c.slug === communitySlug,
        );
        if (community) {
          recommendedCommunities.push(community.name);
        }
      }
    }

    return recommendedCommunities;
  }

  /**
   * Bulk assign communities to multiple users (useful for existing users)
   */
  async bulkAssignCommunities(
    userIds: string[],
  ): Promise<{ [userId: string]: string[] }> {
    const results: { [userId: string]: string[] } = {};

    for (const userId of userIds) {
      try {
        results[userId] = await this.assignCommunitiesToUser(userId);
      } catch (error) {
        console.error(`Error assigning communities to user ${userId}:`, error);
        results[userId] = [];
      }
    }

    return results;
  }
}
