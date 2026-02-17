/**
 * Pre-Assessments Enricher
 * Ensures clients have completed initial assessments
 */

import { Prisma, PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class AssessmentsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'PreAssessment');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    const clients = await this.prisma.client.findMany({
      include: {
        _count: { select: { preAssessments: true } },
      },
    });

    for (const client of clients) {
      try {
        const missing = Math.max(0, 2 - client._count.preAssessments);
        for (let i = 0; i < missing; i++) {
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
    const mock = this.getMockAssessmentAnswers();
    await this.prisma.preAssessment.create({
      data: {
        clientId,
        answers: mock.answers as Prisma.InputJsonValue,
        scores: mock.scores as Prisma.InputJsonValue,
        severityLevels: mock.severityLevels as Prisma.InputJsonValue,
        aiEstimate: mock.aiEstimate as Prisma.InputJsonValue,
      },
    });

    return 1;
  }

  private getMockAssessmentAnswers() {
    return {
      answers: [2, 3, 2, 2, 3, 2, 2, 1, 2, 1],
      scores: { depression: 2, anxiety: 3, stress: 2 },
      severityLevels: { overall: 'MODERATE' },
      aiEstimate: {
        recommendedTherapyTypes: ['CBT', 'Mindfulness'],
        severityLevel: 'MODERATE',
        urgencyScore: 5,
        riskFactors: [],
      },
    };
  }
}
