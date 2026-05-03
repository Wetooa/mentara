import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PresenceService } from './presence.service';
import { PrismaService } from '../providers/prisma-client.provider';

describe('PresenceService', () => {
  let service: PresenceService;
  const mockPrisma = {};
  const mockEmitter = { emit: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PresenceService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventEmitter2, useValue: mockEmitter },
      ],
    }).compile();
    service = module.get(PresenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('markOnline emits user.online', async () => {
    await service.markOnline('user-1', 'sess');
    expect(mockEmitter.emit).toHaveBeenCalledWith('user.online', {
      userId: 'user-1',
      sessionId: 'sess',
    });
  });
});
