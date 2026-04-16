import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { Therapist, Prisma } from '@prisma/client';
import { CreateTherapistDto, UpdateTherapistDto } from './types';

@Injectable()
export class TherapistService {
  constructor(private prisma: PrismaService) {}

  async findAll(limit = 10, offset = 0, status?: string): Promise<Therapist[]> {
    try {
      const where: Prisma.TherapistWhereInput = {};
      if (status) {
        where.status = status as any;
      }

      return await this.prisma.therapist.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch therapists: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findOne(userId: string): Promise<Therapist> {
    try {
      const therapist = await this.prisma.therapist.findUnique({
        where: { userId },
        include: {
          user: true,
        },
      });

      if (!therapist) {
        throw new NotFoundException(`Therapist with ID ${userId} not found`);
      }

      return therapist;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch therapist: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async create(data: CreateTherapistDto): Promise<Therapist> {
    try {
      const { expirationDateOfLicense, practiceStartDate, ...rest } = data;

      return await this.prisma.therapist.create({
        data: {
          ...rest,
          expirationDateOfLicense: new Date(expirationDateOfLicense),
          practiceStartDate: new Date(practiceStartDate),
          treatmentSuccessRates: data.treatmentSuccessRates || {},
        },
        include: {
          user: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create therapist profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async update(userId: string, data: UpdateTherapistDto): Promise<Therapist> {
    try {
      const { expirationDateOfLicense, practiceStartDate, ...rest } = data;
      
      const updateData: Prisma.TherapistUpdateInput = {
        ...rest,
      } as any;

      if (expirationDateOfLicense) {
        updateData.expirationDateOfLicense = new Date(expirationDateOfLicense);
      }
      if (practiceStartDate) {
        updateData.practiceStartDate = new Date(practiceStartDate);
      }

      return await this.prisma.therapist.update({
        where: { userId },
        data: updateData,
        include: {
          user: true,
        },
      });
    } catch (error) {
      // Check if not found
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Therapist with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to update therapist profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async remove(userId: string): Promise<{ success: boolean }> {
    try {
      await this.prisma.therapist.delete({
        where: { userId },
      });
      return { success: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Therapist with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to delete therapist profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
