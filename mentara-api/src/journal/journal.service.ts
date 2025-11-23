import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import type {
  JournalEntryCreateInputDto,
  JournalEntryUpdateInputDto,
} from './types/journal.dto';

@Injectable()
export class JournalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createDto: JournalEntryCreateInputDto,
  ): Promise<any> {
    const entry = await this.prisma.journalEntry.create({
      data: {
        userId,
        content: createDto.content,
      },
    });

    return this.formatEntry(entry);
  }

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ entries: any[]; total: number; page: number; limit: number; hasMore: boolean }> {
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.journalEntry.count({
        where: { userId },
      }),
    ]);

    return {
      entries: entries.map((entry) => this.formatEntry(entry)),
      total,
      page,
      limit,
      hasMore: skip + entries.length < total,
    };
  }

  async findOne(userId: string, id: string): Promise<any> {
    const entry = await this.prisma.journalEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    if (entry.userId !== userId) {
      throw new ForbiddenException('You do not have access to this journal entry');
    }

    return this.formatEntry(entry);
  }

  async update(
    userId: string,
    id: string,
    updateDto: JournalEntryUpdateInputDto,
  ): Promise<any> {
    // Verify ownership
    const existing = await this.findOne(userId, id);

    const entry = await this.prisma.journalEntry.update({
      where: { id },
      data: {
        content: updateDto.content,
      },
    });

    return this.formatEntry(entry);
  }

  async delete(userId: string, id: string): Promise<void> {
    // Verify ownership
    await this.findOne(userId, id);

    await this.prisma.journalEntry.delete({
      where: { id },
    });
  }

  private formatEntry(entry: any) {
    return {
      id: entry.id,
      userId: entry.userId,
      content: entry.content,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    };
  }
}

