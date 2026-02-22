import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { PaginatedResponseDto, createPaginationMeta } from 'src/common/dto/api-response.dto';
import type {
  JournalEntryCreateInputDto,
  JournalEntryUpdateInputDto,
} from './types/journal.dto';

@Injectable()
export class JournalService {
  private readonly logger = new Logger(JournalService.name);

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
  ): Promise<PaginatedResponseDto<ReturnType<typeof this.formatEntry>>> {
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

    const formattedEntries = entries.map((entry) => this.formatEntry(entry));
    const meta = createPaginationMeta(total, page, limit);

    return PaginatedResponseDto.success(formattedEntries, meta);
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

  private formatEntry(entry: {
    id: string;
    userId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: entry.id,
      userId: entry.userId,
      content: entry.content,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    };
  }
}

