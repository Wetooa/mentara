import { Test, TestingModule } from '@nestjs/testing';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';

describe('CommunitiesController', () => {
  let controller: CommunitiesController;
  const mockService: Partial<jest.Mocked<CommunitiesService>> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    getRooms: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunitiesController],
      providers: [{ provide: CommunitiesService, useValue: mockService }],
    }).compile();
    controller = module.get(CommunitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll passes query params to service', async () => {
    mockService.findAll?.mockResolvedValue([] as never);
    await controller.findAll(5, 1, 'anxiety');
    expect(mockService.findAll).toHaveBeenCalledWith(5, 1, 'anxiety');
  });
});
