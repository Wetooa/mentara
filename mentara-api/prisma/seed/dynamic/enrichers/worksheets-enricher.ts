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
          added += await this.ensureTherapistHasWorksheets(therapist.userId, missing);
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
        const missing = Math.max(0, 1 - client._count.worksheets);
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

    return { table: this.tableName, itemsAdded: added, itemsUpdated: 0, errors };
  }

  async ensureTherapistHasWorksheets(therapistId: string, minWorksheets: number): Promise<number> {
    const templates = [
      { title: 'Daily Mood Tracker', category: 'Mood Monitoring', duration: 10 },
      { title: 'Cognitive Behavioral Thought Record', category: 'CBT', duration: 20 },
      { title: 'Anxiety Exposure Hierarchy', category: 'Anxiety Management', duration: 30 },
      { title: 'Gratitude Journal', category: 'Positive Psychology', duration: 15 },
      { title: 'Sleep Hygiene Assessment', category: 'Sleep Health', duration: 25 },
      { title: 'Mindfulness Body Scan', category: 'Mindfulness', duration: 25 },
      { title: 'Values Clarification Exercise', category: 'Life Purpose', duration: 35 },
    ];

    for (let i = 0; i < minWorksheets; i++) {
      const template = templates[i % templates.length];

      await this.prisma.worksheet.create({
        data: {
          title: `${template.title} - ${i + 1}`,
          description: `Therapeutic worksheet for ${template.category}`,
          category: template.category,
          therapistId,
          estimatedDuration: template.duration,
          createdAt: this.randomPastDate(120),
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
    // Get therapist's worksheets
    const worksheets = await this.prisma.worksheet.findMany({
      where: { therapistId },
      take: minAssignments,
    });

    if (worksheets.length === 0) {
      // Create worksheets first
      await this.ensureTherapistHasWorksheets(therapistId, minAssignments);
      return this.ensureClientHasAssignments(clientId, therapistId, minAssignments);
    }

    const random = this.getRandom(clientId, 'worksheet-assignments');

    for (let i = 0; i < Math.min(minAssignments, worksheets.length); i++) {
      const worksheet = worksheets[i];

      // Check if already assigned
      const existing = await this.prisma.worksheet.findFirst({
        where: {
          id: worksheet.id,
          clientId,
        },
      });

      if (!existing) {
        // Assign worksheet to client
        await this.prisma.worksheet.update({
          where: { id: worksheet.id },
          data: { clientId },
        });
      }
    }

    return Math.min(minAssignments, worksheets.length);
  }
}

