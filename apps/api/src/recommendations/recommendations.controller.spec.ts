import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';

describe('RecommendationsController', () => {
  let controller: RecommendationsController;
  const mockService = {
    getTherapistRecommendations: jest.fn(),
    getCommunityRecommendations: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendationsController],
      providers: [{ provide: RecommendationsService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get(RecommendationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getTherapistRecommendations delegates to service', async () => {
    mockService.getTherapistRecommendations.mockResolvedValue({ therapists: [] });
    await controller.getTherapistRecommendations('u1');
    expect(mockService.getTherapistRecommendations).toHaveBeenCalledWith('u1');
  });
});
