/**
 * Client-Therapist Relationships Enricher
 * Ensures therapists have minimum clients and vice versa
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class RelationshipsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'ClientTherapist');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Ensure therapists have minimum clients (priority)
    const therapists = await this.prisma.therapist.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: true,
        _count: { select: { assignedClients: true } },
      },
    });

    for (const therapist of therapists) {
      try {
        const missing = Math.max(0, 2 - therapist._count.assignedClients);
        if (missing > 0) {
          added += await this.ensureTherapistHasClients(therapist.userId, missing);
        }
      } catch (error) {
        errors++;
      }
    }

    return { table: this.tableName, itemsAdded: added, itemsUpdated: 0, errors };
  }

  async ensureTherapistHasClients(therapistId: string, minClients: number): Promise<number> {
    const existing = await this.prisma.clientTherapist.count({
      where: { therapistId },
    });

    const missing = minClients - existing;
    if (missing <= 0) return 0;

    // Find clients without this therapist
    const availableClients = await this.prisma.client.findMany({
      where: {
        assignedTherapists: {
          none: { therapistId },
        },
      },
      take: missing,
    });

    for (const client of availableClients) {
      await this.prisma.clientTherapist.create({
        data: {
          clientId: client.userId,
          therapistId,
          status: 'active',
          assignedAt: this.randomPastDate(90),
        },
      });
    }

    return availableClients.length;
  }

  async ensureClientHasTherapist(clientId: string): Promise<number> {
    const existing = await this.prisma.clientTherapist.findFirst({
      where: { clientId },
    });

    if (existing) return 0;

    // Find available therapist
    const therapist = await this.prisma.therapist.findFirst({
      where: { status: 'APPROVED' },
      orderBy: {
        assignedClients: {
          _count: 'asc', // Therapist with fewest clients
        },
      },
    });

    if (!therapist) return 0;

    await this.prisma.clientTherapist.create({
      data: {
        clientId,
        therapistId: therapist.userId,
        status: 'active',
        assignedAt: this.randomPastDate(60),
      },
    });

    return 1;
  }
}

