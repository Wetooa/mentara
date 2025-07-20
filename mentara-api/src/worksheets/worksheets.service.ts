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

    // Transform the inline arrays into the expected format for backward compatibility
    return {
      ...worksheet,
      materials: worksheet.materialUrls.map((url, index) => ({
        id: `material-${index}`,
        filename: worksheet.materialNames[index] || 'Unknown',
        url,
        fileType: 'application/octet-stream',
        fileSize: worksheet.materialSizes[index] || 0,
      })),
      submissions: worksheet.submissionUrls.map((url, index) => ({
        id: `submission-${index}`,
        filename: worksheet.submissionNames[index] || 'Unknown',
        url,
        fileType: 'application/octet-stream',
        fileSize: worksheet.submissionSizes[index] || 0,
        submittedAt: worksheet.submittedAt,
      })),
    };
  }

  async create(
    data: WorksheetCreateInputDto,
    clientId: string,
    therapistId: string,
    files: Express.Multer.File[] = [],
  ) {
    // Create the worksheet
    const worksheet = await this.prisma.worksheet.create({
      data: {
        title: data.title,
        instructions: data.instructions,
        description: data.description,
        dueDate: data.dueDate || new Date(),
        status: (data as any).status || 'ASSIGNED',
        isCompleted: (data as any).isCompleted || false,
        clientId,
        therapistId,
        // Files are now handled separately via upload endpoint
        // These arrays will be populated when files are uploaded
        materialUrls: [],
        materialNames: [],
        materialSizes: [],
        submissionUrls: [],
        submissionNames: [],
        submissionSizes: [],
      },
    });

    // Return the newly created worksheet
    return this.findById(worksheet.id);
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

    // Delete the worksheet (files in Supabase Storage should be cleaned up separately if needed)
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

    // Note: File uploads are now handled separately via the upload endpoint
    // This method now primarily handles text-based submissions
    // The worksheet has already been updated with file attachments if any

    // Update the worksheet with submission data
    const updatedWorksheet = await this.prisma.worksheet.update({
      where: { id: data.worksheetId },
      data: {
        // Store text-based responses or notes
        feedback: (data as any).notes || null,
        // Mark as completed if specified
        isCompleted: data.isCompleted || false,
        status: data.isCompleted ? 'COMPLETED' : 'ASSIGNED',
        submittedAt: data.isCompleted ? new Date() : null,
      },
    });

    return {
      id: updatedWorksheet.id,
      worksheetId: data.worksheetId,
      clientId,
      status: updatedWorksheet.status,
      submittedAt: updatedWorksheet.submittedAt,
    };
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

    // Update worksheet with submission data and mark as completed
    const updatedWorksheet = await this.prisma.worksheet.update({
      where: { id },
      data: {
        feedback: (data as any).notes || null,
        isCompleted: true,
        status: 'COMPLETED',
        submittedAt: new Date(),
        // File attachments are handled separately via upload endpoint
      },
    });

    return {
      worksheetId: id,
      submissionId: id, // Use worksheet ID as submission ID since they're now unified
      status: updatedWorksheet.status,
      submittedAt: updatedWorksheet.submittedAt,
      message: 'Worksheet submitted successfully',
    };
  }

  async deleteSubmission(id: string) {
    // Since submissions are now inline, we reset the worksheet submission status
    const worksheet = await this.prisma.worksheet.findUnique({
      where: { id },
    });

    if (!worksheet) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    // Reset submission status
    await this.prisma.worksheet.update({
      where: { id },
      data: {
        isCompleted: false,
        status: 'ASSIGNED',
        submittedAt: null,
        feedback: null,
        // Clear submission files but keep materials
        submissionUrls: [],
        submissionNames: [],
        submissionSizes: [],
      },
    });

    return { success: true, message: 'Submission reset successfully' };
  }
}
