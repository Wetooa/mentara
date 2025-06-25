import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { clerkId },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateByClerkId(
    clerkId: string,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { clerkId },
      data,
    });
  }

  async remove(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async removeByClerkId(clerkId: string): Promise<User> {
    return this.prisma.user.delete({
      where: { clerkId },
    });
  }

  async isFirstSignIn(clerkId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });
    return !user;
  }

  async getUserRole(clerkId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { role: true },
    });
    return user?.role || null;
  }
}
