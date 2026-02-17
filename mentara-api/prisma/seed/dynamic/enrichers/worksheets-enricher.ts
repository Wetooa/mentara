/**
 * Worksheets Enricher
 * Ensures therapists have created worksheets and clients have assignments
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class WorksheetsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'Worksheet');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Ensure therapists have created worksheets
    const therapists = await this.prisma.therapist.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: true,
        _count: { select: { worksheets: true } },
      },
    });

    for (const therapist of therapists) {
      try {
        const missing = Math.max(0, 3 - therapist._count.worksheets);
        if (missing > 0) {
          added += await this.ensureTherapistHasWorksheets(
            therapist.userId,
            missing,
          );
        }
      } catch (error) {
        errors++;
      }
    }

    // Ensure clients with therapists have worksheet assignments
    const clientsWithTherapists = await this.prisma.client.findMany({
      where: {
        assignedTherapists: {
          some: { status: 'active' },
        },
      },
      include: {
        user: true,
        assignedTherapists: {
          where: { status: 'active' },
          take: 1,
        },
        _count: { select: { worksheets: true } },
      },
    });

    for (const client of clientsWithTherapists) {
      try {
        const missing = Math.max(0, 4 - client._count.worksheets);
        if (missing > 0 && client.assignedTherapists.length > 0) {
          added += await this.ensureClientHasAssignments(
            client.userId,
            client.assignedTherapists[0].therapistId,
            missing,
          );
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

  async ensureTherapistHasWorksheets(
    therapistId: string,
    minWorksheets: number,
  ): Promise<number> {
    const rel = await this.prisma.clientTherapist.findFirst({
      where: { therapistId, status: 'active' },
      select: { clientId: true },
    });
    if (!rel) return 0;

    const templates = [
      { title: 'Daily Mood Tracker', instructions: 'Mood Monitoring worksheet.' },
      { title: 'Cognitive Behavioral Thought Record', instructions: 'CBT thought record.' },
      { title: 'Anxiety Exposure Hierarchy', instructions: 'Anxiety management steps.' },
      { title: 'Gratitude Journal', instructions: 'Positive psychology journaling.' },
      { title: 'Sleep Hygiene Assessment', instructions: 'Sleep health assessment.' },
      { title: 'Mindfulness Body Scan', instructions: 'Mindfulness exercise.' },
      { title: 'Values Clarification Exercise', instructions: 'Life purpose values.' },
    ];

    for (let i = 0; i < minWorksheets; i++) {
      const template = templates[i % templates.length];
      const dueDate = this.randomPastDate(60);

      await this.prisma.worksheet.create({
        data: {
          clientId: rel.clientId,
          therapistId,
          title: `${template.title} - ${i + 1}`,
          instructions: template.instructions,
          dueDate,
        },
      });
    }

    return minWorksheets;
  }

  async ensureClientHasAssignments(
    clientId: string,
    therapistId: string,
    minAssignments: number,
  ): Promise<number> {
    const existing = await this.prisma.worksheet.count({
      where: { clientId, therapistId },
    });
    const missing = Math.max(0, minAssignments - existing);
    if (missing === 0) return 0;

    const templates = [
      { title: 'Daily Mood Tracker', instructions: 'Track your mood and note triggers.' },
      { title: 'Thought Record', instructions: 'Complete the cognitive thought record.' },
      { title: 'Anxiety Exposure Hierarchy', instructions: 'List steps and rate anxiety levels.' },
      { title: 'Gratitude & Reflection', instructions: 'Reflect and submit by due date.' },
    ];

    for (let i = 0; i < missing; i++) {
      const t = templates[i % templates.length];
      const dueDate = this.randomPastDate(30);
      await this.prisma.worksheet.create({
        data: {
          clientId,
          therapistId,
          title: t.title,
          instructions: t.instructions,
          dueDate,
        },
      });
    }

    return missing;
  }
}
