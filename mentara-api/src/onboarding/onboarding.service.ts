import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';

export interface OnboardingStep {
  step: string;
  completed: boolean;
  completedAt?: Date;
  required: boolean;
}

export interface OnboardingStatus {
  userId: string;
  role: string;
  overallProgress: number;
  steps: OnboardingStep[];
  isComplete: boolean;
  nextStep?: string;
}

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getRequiredStepsForRole(role: string): string[] {
    const baseSteps = ['profile_setup', 'email_verification'];

    switch (role) {
      case 'client':
        return [...baseSteps, 'pre_assessment', 'community_assignment'];
      case 'therapist':
        return [
          ...baseSteps,
          'license_verification',
          'profile_completion',
          'availability_setup',
        ];
      case 'admin':
        return [...baseSteps, 'admin_training'];
      case 'moderator':
        return [...baseSteps, 'moderation_training', 'community_assignment'];
      default:
        return baseSteps;
    }
  }

  async getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          client: {
            include: {
              preAssessment: true,
            },
          },
          memberships: true,
          therapist: true,
          admin: true,
          moderator: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const requiredSteps = this.getRequiredStepsForRole(user.role);
      const steps: OnboardingStep[] = [];

      // Check each required step
      for (const stepName of requiredSteps) {
        const stepStatus = await this.checkStepCompletion(user, stepName);
        steps.push({
          step: stepName,
          completed: stepStatus.completed,
          completedAt: stepStatus.completedAt,
          required: true,
        });
      }

      const completedSteps = steps.filter((s) => s.completed).length;
      const overallProgress = Math.round((completedSteps / steps.length) * 100);
      const isComplete = completedSteps === steps.length;
      const nextStep = steps.find((s) => !s.completed)?.step;

      return {
        userId,
        role: user.role,
        overallProgress,
        steps,
        isComplete,
        nextStep,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get onboarding status for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  private async checkStepCompletion(
    user: any,
    stepName: string,
  ): Promise<{ completed: boolean; completedAt?: Date }> {
    switch (stepName) {
      case 'profile_setup': {
        const hasBasicInfo = user.firstName && user.lastName && user.email;
        return {
          completed: hasBasicInfo,
          completedAt: hasBasicInfo ? user.updatedAt : undefined,
        };
      }

      case 'email_verification': {
        return {
          completed: user.emailVerified,
          completedAt: user.emailVerified ? user.updatedAt : undefined,
        };
      }

      case 'pre_assessment': {
        const hasPreAssessment = user.client?.preAssessment;
        return {
          completed: !!hasPreAssessment,
          completedAt: hasPreAssessment
            ? user.client.preAssessment.createdAt
            : undefined,
        };
      }

      case 'community_assignment': {
        const hasCommunityMemberships = user.memberships?.length > 0;
        return {
          completed: hasCommunityMemberships,
          completedAt: hasCommunityMemberships
            ? user.memberships[0].joinedAt
            : undefined,
        };
      }

      case 'license_verification': {
        const hasVerifiedLicense = user.therapist?.licenseVerified;
        return {
          completed: !!hasVerifiedLicense,
          completedAt: hasVerifiedLicense
            ? user.therapist.licenseVerifiedAt
            : undefined,
        };
      }

      case 'profile_completion': {
        const hasCompleteProfile =
          user.therapist &&
          user.therapist.areasOfExpertise?.length > 0 &&
          user.therapist.therapeuticApproachesUsedList?.length > 0;
        return {
          completed: !!hasCompleteProfile,
          completedAt: hasCompleteProfile
            ? user.therapist.updatedAt
            : undefined,
        };
      }

      case 'availability_setup': {
        const hasAvailability =
          await this.prisma.therapistAvailability.findFirst({
            where: { therapistId: user.id },
          });
        return {
          completed: !!hasAvailability,
          completedAt: hasAvailability ? hasAvailability.createdAt : undefined,
        };
      }

      case 'admin_training': {
        // For now, assume admin training is complete if they have admin permissions
        return {
          completed: !!user.admin,
          completedAt: user.admin ? user.admin.createdAt : undefined,
        };
      }

      case 'moderation_training': {
        // For now, assume moderation training is complete if they have moderator permissions
        return {
          completed: !!user.moderator,
          completedAt: user.moderator ? user.moderator.createdAt : undefined,
        };
      }

      default:
        return { completed: false };
    }
  }

  async markStepCompleted(
    userId: string,
    stepName: string,
  ): Promise<OnboardingStatus> {
    try {
      // In a real implementation, you might want to validate that the step is actually completed
      // before marking it as such. For now, we'll just recalculate the status.

      this.logger.log(
        `Marking step ${stepName} as completed for user ${userId}`,
      );

      // Log onboarding step completion (alternative to audit log)
      this.logger.log(
        `Onboarding step completed - userId: ${userId}, step: ${stepName}, timestamp: ${new Date().toISOString()}`,
        'OnboardingAudit'
      );

      return await this.getOnboardingStatus(userId);
    } catch (error) {
      this.logger.error(
        `Failed to mark step ${stepName} as completed for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  async validateOnboardingCompleteness(userId: string): Promise<{
    isComplete: boolean;
    missingSteps: string[];
    canProceed: boolean;
  }> {
    try {
      const status = await this.getOnboardingStatus(userId);
      const missingSteps = status.steps
        .filter((step) => step.required && !step.completed)
        .map((step) => step.step);

      const canProceed = status.overallProgress >= 80; // Allow some flexibility

      return {
        isComplete: status.isComplete,
        missingSteps,
        canProceed,
      };
    } catch (error) {
      this.logger.error(
        `Failed to validate onboarding completeness for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  async getOnboardingInsights(): Promise<{
    totalUsers: number;
    completeOnboarding: number;
    incompleteOnboarding: number;
    averageProgress: number;
    commonDropoffSteps: string[];
  }> {
    try {
      const allUsers = await this.prisma.user.findMany({
        include: {
          client: {
            include: {
              preAssessment: true,
            },
          },
          memberships: true,
          therapist: true,
          admin: true,
          moderator: true,
        },
      });

      let totalProgress = 0;
      let completeCount = 0;
      const stepCompletionCounts: Record<string, number> = {};

      for (const user of allUsers) {
        const status = await this.getOnboardingStatus(user.id);
        totalProgress += status.overallProgress;

        if (status.isComplete) {
          completeCount++;
        }

        // Track step completion for dropout analysis
        for (const step of status.steps) {
          if (!stepCompletionCounts[step.step]) {
            stepCompletionCounts[step.step] = 0;
          }
          if (step.completed) {
            stepCompletionCounts[step.step]++;
          }
        }
      }

      const averageProgress =
        allUsers.length > 0 ? totalProgress / allUsers.length : 0;

      // Find steps with lowest completion rates (potential dropoff points)
      const commonDropoffSteps = Object.entries(stepCompletionCounts)
        .sort(([, a], [, b]) => a - b)
        .slice(0, 3)
        .map(([step]) => step);

      return {
        totalUsers: allUsers.length,
        completeOnboarding: completeCount,
        incompleteOnboarding: allUsers.length - completeCount,
        averageProgress,
        commonDropoffSteps,
      };
    } catch (error) {
      this.logger.error('Failed to get onboarding insights:', error);
      throw error;
    }
  }
}
