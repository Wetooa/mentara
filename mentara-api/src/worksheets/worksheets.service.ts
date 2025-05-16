import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  CreateWorksheetDto,
  UpdateWorksheetDto,
  CreateSubmissionDto,
  SubmitWorksheetDto,
} from './dto/worksheet.dto';

@Injectable()
export class WorksheetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string, therapistId?: string, status?: string) {
    const where = {};

    if (userId) {
      where['userId'] = userId;
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
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    });

    // Transform the data to match the expected format for the client
    return worksheets.map((worksheet) => ({
      id: worksheet.id,
      title: worksheet.title,
      therapistName: `${worksheet.therapist.firstName} ${worksheet.therapist.lastName}`,
      patientName: `${worksheet.user.firstName} ${worksheet.user.lastName}`,
      date: worksheet.dueDate.toISOString(),
      status: worksheet.status,
      isCompleted: worksheet.isCompleted,
      instructions: worksheet.instructions,
      materials: worksheet.materials.map((material) => ({
        id: material.id,
        filename: material.filename,
        url: material.url,
      })),
      myWork: worksheet.submissions.map((submission) => ({
        id: submission.id,
        filename: submission.filename,
        url: submission.url,
      })),
      submittedAt: worksheet.submittedAt?.toISOString(),
      feedback: worksheet.feedback,
    }));
  }

  async findById(id: string) {
    const worksheet = await this.prisma.worksheet.findUnique({
      where: { id },
      include: {
        materials: true,
        submissions: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
    });

    if (!worksheet) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    // Transform to match expected client format
    return {
      id: worksheet.id,
      title: worksheet.title,
      therapistName: `${worksheet.therapist.firstName} ${worksheet.therapist.lastName}`,
      patientName: `${worksheet.user.firstName} ${worksheet.user.lastName}`,
      date: worksheet.dueDate.toISOString(),
      status: worksheet.status,
      isCompleted: worksheet.isCompleted,
      instructions: worksheet.instructions,
      materials: worksheet.materials.map((material) => ({
        id: material.id,
        filename: material.filename,
        url: material.url,
      })),
      myWork: worksheet.submissions.map((submission) => ({
        id: submission.id,
        filename: submission.filename,
        url: submission.url,
      })),
      submittedAt: worksheet.submittedAt?.toISOString(),
      feedback: worksheet.feedback,
    };
  }

  async create(data: CreateWorksheetDto) {
    // Start a transaction to create the worksheet and any materials
    return this.prisma.$transaction(async (prisma) => {
      // Create the worksheet
      const worksheet = await prisma.worksheet.create({
        data: {
          title: data.title,
          instructions: data.instructions,
          dueDate: new Date(data.dueDate),
          userId: data.userId,
          therapistId: data.therapistId,
        },
      });

      // Create materials if provided
      if (data.materials && data.materials.length > 0) {
        await Promise.all(
          data.materials.map((material) =>
            prisma.worksheetMaterial.create({
              data: {
                ...material,
                worksheetId: worksheet.id,
              },
            }),
          ),
        );
      }

      // Return the newly created worksheet with materials
      return this.findById(worksheet.id);
    });
  }

  async update(id: string, data: UpdateWorksheetDto) {
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
      data: {
        ...(data.title && { title: data.title }),
        ...(data.instructions && { instructions: data.instructions }),
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
        ...(data.status && { status: data.status }),
        ...(data.isCompleted !== undefined && {
          isCompleted: data.isCompleted,
        }),
        ...(data.submittedAt && { submittedAt: new Date(data.submittedAt) }),
        ...(data.feedback && { feedback: data.feedback }),
      },
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

  async addSubmission(data: CreateSubmissionDto) {
    // Check if worksheet exists
    const worksheet = await this.prisma.worksheet.findUnique({
      where: { id: data.worksheetId },
    });

    if (!worksheet) {
      throw new NotFoundException(
        `Worksheet with ID ${data.worksheetId} not found`,
      );
    }

    // Create the submission
    const submission = await this.prisma.worksheetSubmission.create({
      data: {
        filename: data.filename,
        url: data.url,
        fileSize: data.fileSize,
        fileType: data.fileType,
        worksheetId: data.worksheetId,
      },
    });

    return submission;
  }

  async submitWorksheet(id: string, data: SubmitWorksheetDto) {
    // Check if worksheet exists
    const worksheet = await this.prisma.worksheet.findUnique({
      where: { id },
    });

    if (!worksheet) {
      throw new NotFoundException(`Worksheet with ID ${id} not found`);
    }

    // Use transaction to ensure all operations succeed or fail together
    return this.prisma.$transaction(async (prisma) => {
      // Add all submissions
      if (data.submissions && data.submissions.length > 0) {
        await Promise.all(
          data.submissions.map((submission) =>
            prisma.worksheetSubmission.create({
              data: {
                filename: submission.filename,
                url: submission.url,
                fileSize: submission.fileSize,
                fileType: submission.fileType,
                worksheetId: id,
              },
            }),
          ),
        );
      }

      // Update worksheet status if completing submission
      if (data.complete) {
        await prisma.worksheet.update({
          where: { id },
          data: {
            isCompleted: true,
            status: 'completed',
            submittedAt: new Date(),
          },
        });
      }

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
