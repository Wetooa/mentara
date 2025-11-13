import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Services
import { GroupSessionService } from './services/group-session.service';
import { GroupSessionInvitationService } from './services/group-session-invitation.service';
import { GroupSessionParticipantService } from './services/group-session-participant.service';
import { AvailabilityCheckService } from './services/availability-check.service';
import { ScheduleService } from './services/schedule.service';
import { GroupSessionNotificationService } from './services/group-session-notification.service';

// Controllers
import { GroupSessionController } from './controllers/group-session.controller';
import { GroupSessionTherapistController } from './controllers/group-session-therapist.controller';
import { ScheduleController } from './controllers/schedule.controller';

@Module({
  controllers: [
    GroupSessionController,
    GroupSessionTherapistController,
    ScheduleController,
  ],
  providers: [
    PrismaClient,
    EventEmitter2,
    GroupSessionService,
    GroupSessionInvitationService,
    GroupSessionParticipantService,
    AvailabilityCheckService,
    ScheduleService,
    GroupSessionNotificationService,
  ],
  exports: [
    GroupSessionService,
    GroupSessionInvitationService,
    GroupSessionParticipantService,
    AvailabilityCheckService,
    ScheduleService,
  ],
})
export class GroupSessionsModule {}
