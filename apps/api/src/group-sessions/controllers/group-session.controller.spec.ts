import { Test, TestingModule } from '@nestjs/testing';
import { GroupSessionController } from './group-session.controller';
import { GroupSessionService } from '../services/group-session.service';
import { GroupSessionInvitationService } from '../services/group-session-invitation.service';
import { GroupSessionParticipantService } from '../services/group-session-participant.service';
import { GroupSessionNotificationService } from '../services/group-session-notification.service';
import { JwtAuthGuard } from '../../auth/core/guards/jwt-auth.guard';

describe('GroupSessionController', () => {
  let controller: GroupSessionController;

  const mockGroupSession = { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn() };
  const mockInvitation = {};
  const mockParticipant = {};
  const mockNotification = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupSessionController],
      providers: [
        { provide: GroupSessionService, useValue: mockGroupSession },
        { provide: GroupSessionInvitationService, useValue: mockInvitation },
        { provide: GroupSessionParticipantService, useValue: mockParticipant },
        { provide: GroupSessionNotificationService, useValue: mockNotification },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get(GroupSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
