import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import {
  WorksheetResponse,
  WorksheetCreateInputDto,
  WorksheetSubmissionCreateInputDto,
  WorksheetUpdateInputDto,
} from 'src/schema/worksheet';

@Injectable()
export class WorksheetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId?: string,
    therapistId?: string,
    status?: string,
  ): Promise<WorksheetResponse[]> {
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

    // Transform the data to match the expected format for the client
    // return worksheets.map((worksheet) => ({
    //   id: worksheet.id,
    //   title: worksheet.title,
    //   therapistName: worksheet.therapist
    //     ? `${worksheet.therapist.user.firstName} ${worksheet.therapist.user.lastName}`
    //     : 'Unknown Therapist',
    //   patientName: `${worksheet.client.user.firstName} ${worksheet.client.user.lastName}`,
    //   date: worksheet.createdAt.toISOString(),
    //   status: worksheet.status,
    //   isCompleted: worksheet.isCompleted,
    //   instructions: worksheet.instructions,
    //   materials: worksheet.materials.map((material) => ({
    //     id: material.id,
    //     filename: material.filename,
    //     url: material.url,
    //   })),
    //   myWork: worksheet.submissions.map((submission) => ({
    //     id: submission.id,
    //     filename: submission.filename,
    //     url: submission.url,
    //   })),
    //   submittedAt: worksheet.submittedAt?.toISOString(),
    //   feedback: worksheet.feedback,
    // }));
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

    // Transform to match expected client format
    // return {
    //   id: worksheet.id,
    //   title: worksheet.title,
    //   therapistName: worksheet.therapist
    //     ? `${worksheet.therapist.user.firstName} ${worksheet.therapist.user.lastName}`
    //     : 'Unknown Therapist',
    //   patientName: `${worksheet.client.user.firstName} ${worksheet.client.user.lastName}`,
    //   date: worksheet.createdAt.toISOString(),
    //   status: worksheet.status,
    //   isCompleted: worksheet.isCompleted,
    //   instructions: worksheet.instructions,
    //   materials: worksheet.materials.map((material) => ({
    //     id: material.id,
    //     filename: material.filename,
    //     url: material.url,
    //   })),
    //   myWork: worksheet.submissions.map((submission) => ({
    //     id: submission.id,
    //     filename: submission.filename,
    //     url: submission.url,
    //   })),
    //   submittedAt: worksheet.submittedAt?.toISOString(),
    //   feedback: worksheet.feedback,
    // };
    return worksheet;
  }

  async create(data: WorksheetCreateInputDto) {
    // Start a transaction to create the worksheet and any materials
    return this.prisma.$transaction(async (prisma) => {
      // Create the worksheet
      const worksheet = await prisma.worksheet.create({
        data,
      });

      // // Create materials if provided
      // if (data.materials && data.materials.connect.length > 0) {
      //   await Promise.all(
      //     data.materials.map((material) =>
      //       prisma.worksheetMaterial.create({
      //         data: {
      //           ...material,
      //           worksheetId: worksheet.id,
      //         },
      //       }),
      //     ),
      //   );
      // }

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

  async addSubmission(data: WorksheetSubmissionCreateInputDto) {
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
      data,
    });

    return submission;
  }

  async submitWorksheet(id: string, data: WorksheetSubmissionCreateInputDto) {
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
      // if (data.submissions && data.submissions.length > 0) {
      //   await Promise.all(
      //     data.submissions.map((submission) =>
      //       prisma.worksheetSubmission.create({
      //         data: {
      //           filename: submission.filename,
      //           url: submission.url,
      //           fileSize: submission.fileSize,
      //           fileType: submission.fileType,
      //           worksheetId: id,
      //           clientId: worksheet.clientId, // Use the worksheet's clientId
      //         },
      //       }),
      //     ),
      //   );
      // }
      await prisma.worksheetSubmission.create({
        data: {
          ...data,
          worksheetId: id,
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
