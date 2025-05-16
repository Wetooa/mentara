import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { TherapistApplication, Prisma } from '@prisma/client';

@Injectable()
export class TherapistApplicationService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    status?: string;
    skip?: number;
    take?: number;
  }): Promise<{ applications: TherapistApplication[]; total: number }> {
    const { status, skip, take } = params;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const applications = await this.prisma.therapistApplication.findMany({
      where,
      orderBy: { submissionDate: 'desc' },
      skip: skip || 0,
      take: take || 100,
    });

    const total = await this.prisma.therapistApplication.count({ where });

    return { applications, total };
  }

  async findOne(id: string): Promise<TherapistApplication | null> {
    return this.prisma.therapistApplication.findUnique({
      where: { id },
    });
  }

  async create(
    data: Prisma.TherapistApplicationCreateInput,
  ): Promise<TherapistApplication> {
    return this.prisma.therapistApplication.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.TherapistApplicationUpdateInput,
  ): Promise<TherapistApplication> {
    return this.prisma.therapistApplication.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<TherapistApplication> {
    return this.prisma.therapistApplication.delete({
      where: { id },
    });
  }

  async isUserAdmin(clerkUserId: string): Promise<boolean> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { clerkUserId },
    });
    return !!admin;
  }
}
