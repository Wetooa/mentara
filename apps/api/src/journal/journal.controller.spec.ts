import { Test, TestingModule } from '@nestjs/testing';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';

describe('JournalController', () => {
  let controller: JournalController;
  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JournalController],
      providers: [{ provide: JournalService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get(JournalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to service', async () => {
    mockService.findAll.mockResolvedValue({ items: [], total: 0 });
    const pagination = { page: 1, limit: 20, skip: 0 };
    await controller.findAll('user-1', pagination);
    expect(mockService.findAll).toHaveBeenCalledWith('user-1', 1, 20);
  });
});
