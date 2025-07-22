import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { RoleUtils } from 'src/utils/role-utils';
import { EventBusService } from '../common/events/event-bus.service';

@Module({
  controllers: [UsersController, ProfileController],
  providers: [
    UsersService,
    ProfileService,
    PrismaService,
    RoleUtils,
    EventBusService,
  ],
  exports: [UsersService, ProfileService],
})
export class UsersModule {}
