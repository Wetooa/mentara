import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  CreateAdminDto,
  UpdateAdminDto,
  AdminResponseDto,
} from './dto/admin.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) { }

  async findAll(): Promise<AdminResponseDto[]> {
    try {
      const admins = await this.prisma.admin.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return admins.map((admin) => ({
        userId: admin.userId,
        permissions: admin.permissions,
        adminLevel: admin.adminLevel,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      }));
    } catch (error) {
      this.logger.error('Failed to retrieve admins:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<AdminResponseDto | null> {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { userId: id },
      });

      if (!admin) {
        return null;
      }

      return {
        userId: admin.userId,
        permissions: admin.permissions,
        adminLevel: admin.adminLevel,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve admin ${id}:`, error);
      throw error;
    }
  }

  async create(data: CreateAdminDto): Promise<AdminResponseDto> {
    try {
      // First check if user exists
      const userExists = await this.prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!userExists) {
        throw new NotFoundException(`User with ID ${data.userId} not found`);
      }

      // Check if admin already exists
      const existingAdmin = await this.prisma.admin.findUnique({
        where: { userId: data.userId },
      });

      if (existingAdmin) {
        throw new ConflictException(`User ${data.userId} is already an admin`);
      }

      const admin = await this.prisma.admin.create({
        data: {
          userId: data.userId,
          permissions: data.permissions,
          adminLevel: data.adminLevel ?? 'admin',
        },
      });

      this.logger.log(`Created admin for user ${data.userId}`);

      return {
        userId: admin.userId,
        permissions: admin.permissions,
        adminLevel: admin.adminLevel,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `User ${data.userId} is already an admin`,
          );
        }
        if (error.code === 'P2003') {
          throw new NotFoundException(`User with ID ${data.userId} not found`);
        }
      }

      this.logger.error('Failed to create admin:', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateAdminDto): Promise<AdminResponseDto> {
    try {
      const admin = await this.prisma.admin.update({
        where: { userId: id },
        data: {
          permissions: data.permissions,
          adminLevel: data.adminLevel,
        },
      });

      this.logger.log(`Updated admin ${id}`);

      return {
        userId: admin.userId,
        permissions: admin.permissions,
        adminLevel: admin.adminLevel,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Admin with ID ${id} not found`);
        }
      }

      this.logger.error(`Failed to update admin ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.admin.delete({ where: { userId: id } });
      this.logger.log(`Deleted admin ${id}`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Admin with ID ${id} not found`);
        }
      }

      this.logger.error(`Failed to delete admin ${id}:`, error);
      throw error;
    }
  }
}
