import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { RoleUtils } from '../utils/role-utils';
import { AdminAuthGuard } from '../guards/admin-auth.guard';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, RoleUtils, AdminAuthGuard],
  exports: [AdminService],
})
export class AdminModule { }
