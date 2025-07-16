import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import {
  WorksheetCreateInputDto,
  WorksheetSubmissionCreateInputDto,
  WorksheetUpdateInputDto,
} from 'mentara-commons';

@Injectable()
export class WorksheetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId?: string,
    therapistId?: string,
    status?: string,
  ): Promise<any[]> {
    const where = {};

    if (userId) {
      where['clientId'] = userId; // Use clientId for proper relation
    }

    if (therapistId) {
      where['therapistId'] = therapistId;
    }

    if (status) {
      where['status'] = status;
    }

    const worksheets = await this.prisma.worksheet.findMany({
      where,
      include: {
        materials: true,
        submissions: true,
        client: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        therapist: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return worksheets;
  }

  async findById(id: string) {
    const worksheet = await this.prisma.worksheet.findUnique({
      where: { id },
      include: {
        materials: true,
        submissions: true,
        client: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        therapist: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
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

  async create(
    data: WorksheetCreateInputDto,
    clientId: string,
    therapistId: string,
    files: Express.Multer.File[] = [],
  ) {
    // Start a transaction to create the worksheet and any materials
    return this.prisma.$transaction(async (prisma) => {
      // Create the worksheet
      const worksheet = await prisma.worksheet.create({
        data: {
          title: data.title,
          instructions: data.instructions,
          description: data.description,
          dueDate: data.dueDate || new Date(),
          status: (data as any).status || 'assigned',
          isCompleted: (data as any).isCompleted || false,
          clientId,
          therapistId,
          // Note: File handling is now done in the controller
          // The controller passes already-uploaded file URLs
        },
      });

      // Return the newly created worksheet with materials
      return this.findById(worksheet.id);
    });
  }

  async update(id: string, data: WorksheetUpdateInputDto) {
    // Check if worksheet exists
    const exists = await this.prisma.worksheet.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    // Update the worksheet
    await this.prisma.worksheet.update({
      where: { id },
      data,
    });

    // Return the updated worksheet
    return this.findById(id);
  }

  async delete(id: string) {
    // Check if worksheet exists
    const exists = await this.prisma.worksheet.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    // Delete the worksheet (cascade will delete materials and submissions)
    await this.prisma.worksheet.delete({
      where: { id },
    });

    return { success: true, message: 'Worksheet deleted successfully' };
  }

  async addSubmission(
    data: WorksheetSubmissionCreateInputDto,
    clientId: string,
  ) {
    // Check if worksheet exists
    const worksheet = await this.prisma.worksheet.findUnique({
      where: { id: data.worksheetId },
      include: { client: true },
    });

    if (!worksheet) {
      throw new NotFoundException(
        `Worksheet with ID ${data.worksheetId} not found`,
      );
    }

    // Create the submission
    const submission = await this.prisma.worksheetSubmission.create({
      data: {
        worksheetId: data.worksheetId,
        clientId,
        content: (data as any).content || null,
        filename: (data as any).filename || 'submission.txt',
        url: (data as any).url || '',
        fileType: (data as any).fileType || 'text/plain',
      },
    });

    return submission;
  }

  async submitWorksheet(
    id: string,
    data: WorksheetSubmissionCreateInputDto,
    clientId: string,
  ) {
    // Check if worksheet exists
    const worksheet = await this.prisma.worksheet.findUnique({
      where: { id },
    });

    if (!worksheet) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    // Use transaction to ensure all operations succeed or fail together
    return this.prisma.$transaction(async (prisma) => {
      await prisma.worksheetSubmission.create({
        data: {
          worksheetId: id,
          clientId,
          content: (data as any).content || null,
          filename: (data as any).filename || 'submission.txt',
          url: (data as any).url || '',
          fileType: (data as any).fileType || 'text/plain',
        },
      });

      // Update worksheet status if completing submission
      await prisma.worksheet.update({
        where: { id },
        data: {
          isCompleted: true,
          status: 'completed',
          submittedAt: new Date(),
        },
      });

      // Return the updated worksheet
      return this.findById(id);
    });
  }

  async deleteSubmission(id: string) {
    // Check if submission exists
    const submission = await this.prisma.worksheetSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }

    // Delete the submission
    await this.prisma.worksheetSubmission.delete({
      where: { id },
    });

    return { success: true, message: 'Submission deleted successfully' };
  }
}
