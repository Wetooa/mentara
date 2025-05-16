import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { Community, Prisma } from '@prisma/client';

@Injectable()
export class CommunitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Community[]> {
    return this.prisma.community.findMany();
  }

  async findOne(id: string): Promise<Community | null> {
    return this.prisma.community.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.CommunityCreateInput): Promise<Community> {
    return this.prisma.community.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.CommunityUpdateInput,
  ): Promise<Community> {
    return this.prisma.community.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Community> {
    return this.prisma.community.delete({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Community[]> {
    return this.prisma.community.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });
  }
}
