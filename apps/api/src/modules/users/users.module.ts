import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { RoleUtils } from 'src/utils/role-utils';
import { EventBusService } from '../../common/events/event-bus.service';

@Module({
  imports: [ConfigModule],
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
