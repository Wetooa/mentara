import { Injectable } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.admin.findMany();
  }

  findOne(id: string) {
    return this.prisma.admin.findUnique({ where: { id } });
  }

  create(data: any) {
    return this.prisma.admin.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.admin.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.admin.delete({ where: { id } });
  }
}
