import { Injectable } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { Moderator, Prisma } from '@prisma/client';

@Injectable()
export class ModeratorService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Moderator[]> {
    return await this.prisma.moderator.findMany();
  }

  async findOne(userId: string) {
    return this.prisma.moderator.findUnique({ where: { userId } });
  }

  async create(data: Prisma.ModeratorCreateInput) {
    return await this.prisma.moderator.create({ data });
  }

  async update(userId: string, data: Prisma.ModeratorUpdateInput) {
    return await this.prisma.moderator.update({ where: { userId }, data });
  }

  async remove(userId: string) {
    return await this.prisma.moderator.delete({ where: { userId } });
  }
}
