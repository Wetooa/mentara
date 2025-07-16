import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';

@Injectable()
export class EnhancedWorksheetsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorksheet(id: string) {
    const worksheet = await this.prisma.worksheet.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        therapist: {
          select: {
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!worksheet) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    return worksheet;
  }

  async getAllWorksheets(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [worksheets, total] = await Promise.all([
      this.prisma.worksheet.findMany({
        skip: offset,
        take: limit,
        include: {
          client: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          therapist: {
            select: {
              userId: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.worksheet.count(),
    ]);

    return {
      worksheets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Simple stub methods - worksheets are just simple files
  async joinCollaboration(data: any) {
    return { success: true };
  }

  async leaveCollaboration(worksheetId: string, userId: string) {
    return { success: true };
  }

  async getActiveCollaborators(worksheetId: string) {
    return [];
  }

  async updateCursorPosition(
    worksheetId: string,
    userId: string,
    position: any,
  ) {
    return { success: true };
  }

  async autoSave(data: any) {
    return { success: true, id: 'stub', lastSaved: new Date() };
  }

  async addComment(data: any) {
    return { id: 'stub', content: data.content, createdAt: new Date() };
  }

  async resolveComment(commentId: string, userId: string) {
    return { id: commentId, resolved: true };
  }

  async applyOperation(worksheetId: string, versionId: string, operation: any) {
    return { success: true, operationId: 'stub' };
  }
}
