import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PreAssessmentController } from './pre-assessment.controller';
import { PreAssessmentService } from './pre-assessment.service';
import { AurisService } from './auris.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import {
  AurisChatDto,
  CreatePreAssessmentDto,
  PreAssessmentMethod,
} from './types/pre-assessment.dto';

describe('PreAssessmentController', () => {
  let controller: PreAssessmentController;
  let service: PreAssessmentService;
  let aurisService: {
    createSession: jest.Mock;
    chat: jest.Mock;
    endSession: jest.Mock;
  };

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
    aurisService = {
      createSession: jest.fn(),
      chat: jest.fn(),
      endSession: jest.fn(),
    };

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
        {
          provide: AurisService,
          useValue: aurisService,
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

  describe('chatbot endpoints', () => {
    it('should create a chatbot session', async () => {
      aurisService.createSession.mockResolvedValue({
        session_id: 'session-123',
        opening_message: 'Welcome to Mentara.',
      });

      await expect(controller.createSession('user-123')).resolves.toEqual({
        session_id: 'session-123',
        opening_message: 'Welcome to Mentara.',
      });
      expect(aurisService.createSession).toHaveBeenCalledWith('user-123');
    });

    it('should send a chatbot message', async () => {
      const payload: AurisChatDto = {
        sessionId: 'session-123',
        message: 'I feel overwhelmed lately.',
      };

      aurisService.chat.mockResolvedValue({
        response: 'Thanks for telling me that.',
        state: {
          assessment_phase: 'ASSESSMENT',
          completion_reason: 'collecting_context',
          total_questions_asked: 1,
          message_count: 2,
          is_complete: false,
          requires_crisis_protocol: false,
          extracted_data: {},
          identified_questionnaires: {},
          candidate_scales: [],
        },
      });

      await expect(controller.chat('user-123', payload)).resolves.toMatchObject({
        response: 'Thanks for telling me that.',
      });
      expect(aurisService.chat).toHaveBeenCalledWith(
        'user-123',
        'session-123',
        'I feel overwhelmed lately.',
      );
    });

    it('should end a chatbot session', async () => {
      aurisService.endSession.mockResolvedValue({
        response: 'Your assessment is complete.',
        state: {
          assessment_phase: 'COMPLETE',
          completion_reason: 'session_ended_by_user',
          total_questions_asked: 3,
          message_count: 6,
          is_complete: true,
          requires_crisis_protocol: false,
          extracted_data: {},
          identified_questionnaires: {},
          candidate_scales: ['PHQ-9'],
        },
      });

      await expect(
        controller.endSession('user-123', 'session-123'),
      ).resolves.toMatchObject({
        response: 'Your assessment is complete.',
      });
      expect(aurisService.endSession).toHaveBeenCalledWith(
        'user-123',
        'session-123',
      );
    });
  });
});