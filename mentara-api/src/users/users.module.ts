import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { RoleUtils } from 'src/utils/role-utils';
import { AdminAuthGuard } from 'src/guards/admin-auth.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, RoleUtils, AdminAuthGuard],
  exports: [UsersService],
})
export class UsersModule {}
