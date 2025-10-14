/**
 * Pre-Assessments Enricher
 * Ensures clients have completed initial assessments
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class AssessmentsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'PreAssessment');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Ensure all clients have at least 2 assessments (initial + follow-up)
    const clients = await this.prisma.client.findMany({
      include: {
        user: true,
        preAssessment: true,
      },
    });

    for (const client of clients) {
      try {
        if (!client.preAssessment) {
          added += await this.createPreAssessment(client.userId);
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

  async createPreAssessment(clientId: string): Promise<number> {
    // Create basic pre-assessment with mock answers
    const assessment = await this.prisma.preAssessment.create({
      data: {
        userId: clientId,
        answers: this.getMockAssessmentAnswers(),
        completedAt: this.randomPastDate(90),
        aiEvaluationData: {
          recommendedTherapyTypes: ['CBT', 'Mindfulness'],
          severityLevel: 'MODERATE',
          urgencyScore: 5,
          riskFactors: [],
        },
      },
    });

    return 1;
  }

  private getMockAssessmentAnswers(): any {
    return {
      q1_depression: 2,
      q2_anxiety: 3,
      q3_stress: 2,
      q4_sleep: 2,
      q5_motivation: 3,
      q6_socialWithdrawal: 2,
      q7_concentration: 2,
      q8_appetite: 1,
      q9_selfWorth: 2,
      q10_hopelessness: 1,
    };
  }
}
