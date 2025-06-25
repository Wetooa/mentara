import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { TherapistApplication, Prisma } from '@prisma/client';
import { RoleUtils } from 'src/utils/role-utils';

@Injectable()
export class TherapistApplicationService {
  constructor(
    private prisma: PrismaService,
    private roleUtils: RoleUtils,
  ) {}

  async findAll(params: {
    status?: string;
    skip?: number;
    take?: number;
  }): Promise<{ applications: TherapistApplication[]; total: number }> {
    const { status, skip = 0, take = 100 } = params;

    const where: Prisma.TherapistApplicationWhereInput = {};
    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      this.prisma.therapistApplication.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.therapistApplication.count({ where }),
    ]);

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

  async isUserAdmin(clerkId: string): Promise<boolean> {
    return this.roleUtils.isUserAdmin(clerkId);
  }
}
