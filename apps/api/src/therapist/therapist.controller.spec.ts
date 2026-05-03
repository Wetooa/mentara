import { Test, TestingModule } from '@nestjs/testing';
import { TherapistController } from './therapist.controller';
import { TherapistService } from './therapist.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';

describe('TherapistController', () => {
  let controller: TherapistController;
  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TherapistController],
      providers: [{ provide: TherapistService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get(TherapistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to service', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll('10', '0', undefined);
    expect(mockService.findAll).toHaveBeenCalledWith(10, 0, undefined);
  });
});
