import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { RoleUtils } from 'src/utils/role-utils';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, RoleUtils],
  exports: [UsersService],
})
export class UsersModule {}
