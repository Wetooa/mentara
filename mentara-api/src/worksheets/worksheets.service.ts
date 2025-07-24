import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import type {
  WorksheetCreateInputDto,
  WorksheetSubmissionCreateInputDto,
  WorksheetUpdateInputDto,
} from './types';

import { SupabaseStorageService } from 'src/common/services/supabase-storage.service';

@Injectable()
export class WorksheetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async findAll(
    userId?: string,
    therapistId?: string,
    status?: string,
    limit?: number,
  ): Promise<{ worksheets: any[]; total: number; hasMore: boolean }> {
    const where = {};

    if (userId) {
      where['clientId'] = userId; // Use clientId for proper relation
    }

    if (therapistId) {
      where['therapistId'] = therapistId;
    }

    // Handle status filtering with dynamic overdue calculation
    if (status) {
      if (status === 'OVERDUE' || status === 'overdue' || status === 'past_due') {
        // Dynamic overdue: worksheets that are ASSIGNED but past due date
        where['status'] = 'ASSIGNED';
        where['dueDate'] = {
          lt: new Date(), // Due date is in the past
        };
      } else if (status === 'upcoming') {
        // Upcoming: worksheets that are ASSIGNED and not yet due
        where['status'] = 'ASSIGNED';
        where['dueDate'] = {
          gte: new Date(), // Due date is in the future or today
        };
      } else {
        // Static status filtering for other cases
        where['status'] = status.toUpperCase();
      }
    }

    // Get total count for pagination
    const total = await this.prisma.worksheet.count({ where });

    // Apply limit if specified
    const take = limit ? Number(limit) : undefined;

    const worksheets = await this.prisma.worksheet.findMany({
      where,
      take,
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
        submission: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasMore = limit ? worksheets.length >= limit : false;

    return {
      worksheets,
      total,
      hasMore,
    };
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
        submission: true,
      },
    });

    if (!worksheet) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    // Add submission data if exists
    return {
      ...worksheet,
      materials: worksheet.materialUrls.map((url, index) => ({
        id: `material-${index}`,
        filename: worksheet.materialNames[index] || 'Unknown',
        url,
        fileType: 'application/octet-stream',
        fileSize: 0, // File size not available in current schema
      })),
      submission: worksheet.submission || null,
    };
  }

  async create(
    data: WorksheetCreateInputDto,
    userId: string,
    therapistId: string,
    files: Express.Multer.File[] = [],
  ) {
    let materialUrls: string[] = [];
    let materialNames: string[] = [];

    // If files are provided, upload them first
    if (files && files.length > 0) {
      const allowedMimeTypes = [
        'application/pdf', // PDF files
        'application/msword', // DOC files
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX files
        'text/plain', // Text files
        'image/jpeg', // JPEG images
        'image/png', // PNG images
      ];

      for (const file of files) {
        // Validate file
        const validation = this.supabaseStorageService.validateFile(
          file,
          10 * 1024 * 1024, // 10MB limit for worksheet materials
          allowedMimeTypes,
        );

        if (!validation.isValid) {
          throw new BadRequestException(`File validation failed for ${file.originalname}: ${validation.error}`);
        }

        // Upload file to Supabase Storage
        const uploadResult = await this.supabaseStorageService.uploadFile(
          file,
          SupabaseStorageService.getSupportedBuckets().WORKSHEETS,
        );

        materialUrls.push(uploadResult.url);
        materialNames.push(file.originalname);
      }
    }

    // Create the worksheet
    const worksheet = await this.prisma.worksheet.create({
      data: {
        title: data.title,
        instructions: data.instructions || '',
        dueDate: data.dueDate || new Date(),
        status: (data as any).status || 'ASSIGNED',
        clientId: userId,
        therapistId,
        materialUrls,
        materialNames,
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

  async updateByTherapist(id: string, therapistId: string, data: WorksheetUpdateInputDto) {
    // Check if worksheet exists and belongs to the therapist
    const worksheet = await this.prisma.worksheet.findUnique({
      where: { id },
    });

    if (!worksheet) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    // Verify therapist ownership
    if (worksheet.therapistId !== therapistId) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`); // Use NotFoundException to avoid revealing ownership info
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

    // Create a submission using the WorksheetSubmission model
    const submission = await this.prisma.worksheetSubmission.create({
      data: {
        worksheetId: data.worksheetId,
        fileUrls: (data as any).fileUrls || [],
        fileNames: (data as any).fileNames || [],
        fileSizes: (data as any).fileSizes || [],
        feedback: (data as any).notes || null,
      },
    });

    // Update the worksheet status to SUBMITTED
    const updatedWorksheet = await this.prisma.worksheet.update({
      where: { id: data.worksheetId },
      data: {
        status: 'SUBMITTED',
      },
    });

    return {
      id: submission.id,
      worksheetId: data.worksheetId,
      clientId,
      status: updatedWorksheet.status,
      submittedAt: submission.submittedAt,
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
      include: { submission: true },
    });

    if (!worksheet) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    // Create or update submission
    let submission;
    if (worksheet.submission) {
      // Update existing submission
      submission = await this.prisma.worksheetSubmission.update({
        where: { worksheetId: id },
        data: {
          fileUrls: (data as any).fileUrls || [],
          fileNames: (data as any).fileNames || [],
          fileSizes: (data as any).fileSizes || [],
          feedback: (data as any).notes || null,
        },
      });
    } else {
      // Create new submission
      submission = await this.prisma.worksheetSubmission.create({
        data: {
          worksheetId: id,
          fileUrls: (data as any).fileUrls || [],
          fileNames: (data as any).fileNames || [],
          fileSizes: (data as any).fileSizes || [],
          feedback: (data as any).notes || null,
        },
      });
    }

    // Update worksheet status to SUBMITTED
    const updatedWorksheet = await this.prisma.worksheet.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
      },
    });

    return {
      worksheetId: id,
      submissionId: submission.id,
      status: updatedWorksheet.status,
      submittedAt: submission.submittedAt,
      message: 'Worksheet submitted successfully',
    };
  }

  async deleteSubmission(id: string) {
    // Find worksheet with submission
    const worksheet = await this.prisma.worksheet.findUnique({
      where: { id },
      include: { submission: true },
    });

    if (!worksheet) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    if (!worksheet.submission) {
      throw new NotFoundException(`No submission found for worksheet with ID ${id}`);
    }

    // Delete the submission
    await this.prisma.worksheetSubmission.delete({
      where: { worksheetId: id },
    });

    // Reset worksheet status back to ASSIGNED
    await this.prisma.worksheet.update({
      where: { id },
      data: {
        status: 'ASSIGNED',
      },
    });

    return { success: true, message: 'Submission deleted successfully' };
  }

  async markAsReviewedByTherapist(id: string, therapistId: string, feedback?: string) {
    // Check if worksheet exists and belongs to the therapist
    const worksheet = await this.prisma.worksheet.findUnique({
      where: { id },
      include: { submission: true },
    });

    if (!worksheet) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    // Verify therapist ownership
    if (worksheet.therapistId !== therapistId) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    // Mark worksheet as reviewed
    await this.prisma.worksheet.update({
      where: { id },
      data: {
        status: 'REVIEWED',
      },
    });

    // Update submission with feedback if provided and submission exists
    if (feedback && worksheet.submission) {
      await this.prisma.worksheetSubmission.update({
        where: { worksheetId: id },
        data: {
          feedback,
        },
      });
    }

    return {
      success: true,
      message: 'Worksheet marked as reviewed successfully',
      data: await this.findById(id),
    };
  }

  async turnInWorksheet(id: string, clientId: string) {
    // Check if worksheet exists and belongs to the client
    const worksheet = await this.prisma.worksheet.findUnique({
      where: { id },
      include: { submission: true },
    });

    if (!worksheet) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    // Verify client ownership
    if (worksheet.clientId !== clientId) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    // If submission already exists, just update the worksheet status
    if (worksheet.submission) {
      await this.prisma.worksheet.update({
        where: { id },
        data: {
          status: 'SUBMITTED',
        },
      });
      
      return {
        success: true,
        message: 'Worksheet turned in successfully',
        data: await this.findById(id),
      };
    }

    // Create new submission (empty submission to indicate "turned in")
    await this.prisma.worksheetSubmission.create({
      data: {
        worksheetId: id,
        fileUrls: [],
        fileNames: [],
        fileSizes: [],
      },
    });

    // Update worksheet status to SUBMITTED
    await this.prisma.worksheet.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
      },
    });

    return {
      success: true,
      message: 'Worksheet turned in successfully',
      data: await this.findById(id),
    };
  }

  async unturnInWorksheet(id: string, clientId: string) {
    // Check if worksheet exists and belongs to the client
    const worksheet = await this.prisma.worksheet.findUnique({
      where: { id },
      include: { submission: true },
    });

    if (!worksheet) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    // Verify client ownership
    if (worksheet.clientId !== clientId) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    // Check if there's a submission to delete
    if (!worksheet.submission) {
      throw new BadRequestException('Worksheet has not been turned in');
    }

    // Delete the submission
    await this.prisma.worksheetSubmission.delete({
      where: { worksheetId: id },
    });

    // Reset worksheet status back to ASSIGNED
    await this.prisma.worksheet.update({
      where: { id },
      data: {
        status: 'ASSIGNED',
      },
    });

    return {
      success: true,
      message: 'Worksheet turned back in for editing',
      data: await this.findById(id),
    };
  }
}
