import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PreAssessmentController } from './pre-assessment.controller';
import { PreAssessmentService } from './pre-assessment.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { CreatePreAssessmentDto, PreAssessmentMethod } from './types/pre-assessment.dto';

describe('PreAssessmentController', () => {
  let controller: PreAssessmentController;
  let service: PreAssessmentService;

  const mockPreAssessment = {
    id: 'assessment-123',
    clientId: 'user-123',
    method: 'CHECKLIST',
    data: {},
    pastTherapyExperiences: null,
    medicationHistory: null,
    accessibilityNeeds: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateDto: CreatePreAssessmentDto = {
    assessmentId: null,
    method: 'CHECKLIST' as PreAssessmentMethod,
    completedAt: new Date(),
    data: { questionnaireScores: {} },
    pastTherapyExperiences: 'None',
    medicationHistory: 'None',
    accessibilityNeeds: 'None',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreAssessmentController],
      providers: [
        {
          provide: PreAssessmentService,
          useValue: {
            createPreAssessment: jest.fn(),
            createAnonymousPreAssessment: jest.fn(),
            getPreAssessmentByClientId: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PreAssessmentController>(PreAssessmentController);
    service = module.get<PreAssessmentService>(PreAssessmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPreAssessment', () => {
    it('should create an assessment successfully', async () => {
      (service.createPreAssessment as jest.Mock).mockResolvedValue(mockPreAssessment);

      const result = await controller.createPreAssessment('user-123', mockCreateDto);

      expect(result).toEqual({
        id: 'assessment-123',
        message: 'Pre-assessment created successfully',
      });
      expect(service.createPreAssessment).toHaveBeenCalledWith('user-123', mockCreateDto);
    });

    it('should throw InternalServerErrorException on service error', async () => {
      (service.createPreAssessment as jest.Mock).mockRejectedValue(new Error('Service Error'));

      await expect(
        controller.createPreAssessment('user-123', mockCreateDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('createAnonymousPreAssessment', () => {
    it('should create an anonymous assessment successfully', async () => {
      const mockAnonymousResponse = { ...mockPreAssessment, clientId: null };
      (service.createAnonymousPreAssessment as jest.Mock).mockResolvedValue(mockAnonymousResponse);

      const result = await controller.createAnonymousPreAssessment(mockCreateDto);

      expect(result).toEqual({
        id: 'assessment-123',
        message: 'Anonymous pre-assessment created successfully',
      });
      expect(service.createAnonymousPreAssessment).toHaveBeenCalledWith(mockCreateDto);
    });

    it('should throw InternalServerErrorException on service error', async () => {
      (service.createAnonymousPreAssessment as jest.Mock).mockRejectedValue(new Error('Service Error'));

      await expect(
        controller.createAnonymousPreAssessment(mockCreateDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getPreAssessment', () => {
    it('should return assessment for valid user', async () => {
      (service.getPreAssessmentByClientId as jest.Mock).mockResolvedValue(mockPreAssessment);

      const result = await controller.getPreAssessment('user-123');

      expect(result).toEqual(mockPreAssessment);
      expect(service.getPreAssessmentByClientId).toHaveBeenCalledWith('user-123');
    });

    it('should re-throw NotFoundException', async () => {
      (service.getPreAssessmentByClientId as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(controller.getPreAssessment('user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on unknown error', async () => {
      (service.getPreAssessmentByClientId as jest.Mock).mockRejectedValue(new Error('Unknown Error'));

      await expect(controller.getPreAssessment('user-123')).rejects.toThrow(InternalServerErrorException);
    });
  });
});