import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PreAssessmentService } from './pre-assessment.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { AiServiceClient } from './services/ai-service.client';
import * as PreAssessmentUtils from './pre-assessment.utils';

// Mock the utility functions
jest.mock('./pre-assessment.utils', () => ({
  calculateAllScores: jest.fn(),
  generateSeverityLevels: jest.fn(),
}));

describe('PreAssessmentService', () => {
  let service: PreAssessmentService;
  let prismaService: any;
  let aiServiceClient: any;
  let loggerSpy: jest.SpyInstance;

  // Mock data
  const mockUser = {
    id: 'user-123',
    isActive: true,
  };

  const mockClient = {
    userId: 'user-123',
  };

  const mockValidQuestionnaires = ['Anxiety', 'Depression', 'Stress'];
  const mockValidAnswers = [
    [2, 3, 1, 4, 2, 3, 1], // Anxiety: 7 questions
    [1, 2, 3, 2, 1, 4, 3, 2, 1], // Depression: 9 questions
    [3, 4, 2, 1, 3, 4, 2, 1, 3, 2], // Stress: 10 questions
  ];

  const mockValidAnswerMatrix = [
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 1],
    [3, 4, 5, 1, 2],
  ];

  const mockCalculatedScores = {
    Anxiety: { score: 15, severity: 'moderate' },
    Depression: { score: 12, severity: 'mild' },
    Stress: { score: 18, severity: 'high' },
  };

  const mockSeverityLevels = {
    Anxiety: 'moderate',
    Depression: 'mild',
    Stress: 'high',
  };

  const mockPreAssessment = {
    id: 'assessment-123',
    clientId: 'user-123',
    questionnaires: mockValidQuestionnaires,
    answers: mockValidAnswers,
    answerMatrix: mockValidAnswerMatrix,
    scores: { Anxiety: 15, Depression: 12, Stress: 18 },
    severityLevels: mockSeverityLevels,
    aiEstimate: { hasAnxiety: true, hasDepression: false },
    createdAt: new Date('2024-01-15T00:00:00Z'),
    updatedAt: new Date('2024-01-15T00:00:00Z'),
  };

  const mockAiResponse = {
    success: true,
    predictions: { hasAnxiety: true, hasDepression: false, hasStress: true },
    responseTime: 150,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
      },
      client: {
        findUnique: jest.fn(),
      },
      preAssessment: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const mockAiServiceClient = {
      predict: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreAssessmentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AiServiceClient,
          useValue: mockAiServiceClient,
        },
      ],
    }).compile();

    service = module.get<PreAssessmentService>(PreAssessmentService);
    prismaService = module.get(PrismaService);
    aiServiceClient = module.get(AiServiceClient);

    // Setup utility mocks
    (PreAssessmentUtils.calculateAllScores as jest.Mock).mockReturnValue(
      mockCalculatedScores,
    );
    (PreAssessmentUtils.generateSeverityLevels as jest.Mock).mockReturnValue(
      mockSeverityLevels,
    );

    // Setup logger spy
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPreAssessment', () => {
    const validCreateData = {
      questionnaires: mockValidQuestionnaires,
      answers: mockValidAnswers,
      answerMatrix: mockValidAnswerMatrix,
      scores: { Anxiety: 15, Depression: 12, Stress: 18 },
      severityLevels: mockSeverityLevels,
      aiEstimate: { hasAnxiety: true, hasDepression: false },
    };

    beforeEach(() => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.client.findUnique.mockResolvedValue(mockClient);
      prismaService.preAssessment.findUnique.mockResolvedValue(null); // No existing assessment
      prismaService.preAssessment.create.mockResolvedValue(mockPreAssessment);
      aiServiceClient.predict.mockResolvedValue(mockAiResponse);
    });

    it('should create a pre-assessment successfully', async () => {
      const result = await service.createPreAssessment(
        'user-123',
        validCreateData,
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123', isActive: true },
        select: { id: true, isActive: true },
      });
      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        select: { userId: true },
      });
      expect(prismaService.preAssessment.create).toHaveBeenCalledWith({
        data: {
          clientId: 'user-123',
          questionnaires: mockValidQuestionnaires,
          answers: mockValidAnswers,
          answerMatrix: mockValidAnswerMatrix,
          scores: validCreateData.scores,
          severityLevels: validCreateData.severityLevels,
          aiEstimate: expect.any(Object),
        },
      });
      expect(result).toEqual(mockPreAssessment);
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createPreAssessment('nonexistent-user', validCreateData),
      ).rejects.toThrow(new NotFoundException('User not found or inactive'));
    });

    it('should throw NotFoundException when user is inactive', async () => {
      // Override the beforeEach mock for this specific test
      prismaService.user.findUnique.mockReset();
      prismaService.user.findUnique.mockResolvedValue(null); // Inactive users return null from WHERE clause

      await expect(
        service.createPreAssessment('user-123', validCreateData),
      ).rejects.toThrow(new NotFoundException('User not found or inactive'));
    });

    it('should throw NotFoundException when client profile not found', async () => {
      prismaService.client.findUnique.mockResolvedValue(null);

      await expect(
        service.createPreAssessment('user-123', validCreateData),
      ).rejects.toThrow(new NotFoundException('Client profile not found'));
    });

    it('should throw BadRequestException when pre-assessment already exists', async () => {
      prismaService.preAssessment.findUnique.mockResolvedValue(
        mockPreAssessment,
      );

      await expect(
        service.createPreAssessment('user-123', validCreateData),
      ).rejects.toThrow(
        new BadRequestException('Pre-assessment already exists for this user'),
      );
    });

    it('should calculate scores when not provided', async () => {
      const dataWithoutScores = {
        questionnaires: mockValidQuestionnaires,
        answers: mockValidAnswers,
        answerMatrix: mockValidAnswerMatrix,
        scores: undefined, // Explicitly undefined to trigger calculation
        severityLevels: undefined, // Explicitly undefined to trigger calculation
        aiEstimate: {},
      };

      await service.createPreAssessment('user-123', dataWithoutScores);

      expect(PreAssessmentUtils.calculateAllScores).toHaveBeenCalledWith(
        mockValidQuestionnaires,
        mockValidAnswers,
      );
      expect(PreAssessmentUtils.generateSeverityLevels).toHaveBeenCalledWith(
        mockCalculatedScores,
      );
    });

    it('should handle AI prediction successfully', async () => {
      // Create flat answers array with exactly 201 values
      const flatAnswers = new Array(201).fill(0).map((_, i) => i % 5);
      const dataWith201Values = {
        questionnaires: ['Test'],
        answers: [flatAnswers],
        answerMatrix: [flatAnswers],
        scores: {},
        severityLevels: {},
        aiEstimate: {},
      };

      await service.createPreAssessment('user-123', dataWith201Values);

      expect(aiServiceClient.predict).toHaveBeenCalledWith(flatAnswers);
    });

    it('should continue without AI prediction when AI service fails', async () => {
      aiServiceClient.predict.mockResolvedValue({
        success: false,
        error: 'AI service unavailable',
      });

      const result = await service.createPreAssessment(
        'user-123',
        validCreateData,
      );

      expect(result).toBeDefined();
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Pre-assessment created successfully'),
      );
    });

    it('should handle validation errors for invalid answer types', async () => {
      const invalidData = {
        ...validCreateData,
        answers: [['invalid', 'data']], // Invalid answer types
      };

      // Should throw because validation happens before AI processing
      await expect(
        service.createPreAssessment('user-123', invalidData),
      ).rejects.toThrow(BadRequestException);
    });

    describe('Input validation', () => {
      it('should validate questionnaires array', async () => {
        const invalidData = {
          ...validCreateData,
          questionnaires: 'invalid-string',
        };

        await expect(
          service.createPreAssessment('user-123', invalidData),
        ).rejects.toThrow(BadRequestException);
      });

      it('should validate empty questionnaires array', async () => {
        const invalidData = {
          ...validCreateData,
          questionnaires: [],
        };

        await expect(
          service.createPreAssessment('user-123', invalidData),
        ).rejects.toThrow(
          new BadRequestException('At least one questionnaire is required'),
        );
      });

      it('should validate questionnaires and answers alignment', async () => {
        const mismatchedData = {
          ...validCreateData,
          questionnaires: ['Anxiety', 'Depression'], // 2 questionnaires
          answers: [[1, 2, 3]], // 1 answer array
        };

        await expect(
          service.createPreAssessment('user-123', mismatchedData),
        ).rejects.toThrow(
          new BadRequestException(
            'Number of questionnaires must match number of answer arrays',
          ),
        );
      });

      it('should validate answer values are numbers', async () => {
        const invalidData = {
          ...validCreateData,
          answers: [[1, 2, 'invalid', 4]], // Invalid answer type
        };

        await expect(
          service.createPreAssessment('user-123', invalidData),
        ).rejects.toThrow(BadRequestException);
      });

      it('should validate answer values are in range', async () => {
        const invalidData = {
          ...validCreateData,
          answers: [[1, 2, 15, 4]], // Value out of range (0-10)
        };

        await expect(
          service.createPreAssessment('user-123', invalidData),
        ).rejects.toThrow(BadRequestException);
      });

      it('should validate answer values are finite', async () => {
        const invalidData = {
          ...validCreateData,
          answers: [[1, 2, Infinity, 4]], // Infinite value
        };

        await expect(
          service.createPreAssessment('user-123', invalidData),
        ).rejects.toThrow(BadRequestException);
      });

      it('should validate questionnaire names are strings', async () => {
        const invalidData = {
          ...validCreateData,
          questionnaires: ['Valid', 123, 'Another'], // Invalid questionnaire type
        };

        await expect(
          service.createPreAssessment('user-123', invalidData),
        ).rejects.toThrow(BadRequestException);
      });

      it('should warn about unknown questionnaire types', async () => {
        const dataWithUnknownQuestionnaire = {
          ...validCreateData,
          questionnaires: ['Anxiety', 'UnknownType'],
          answers: [
            [1, 2, 3],
            [4, 5, 6],
          ], // Match the questionnaire count
        };

        await service.createPreAssessment(
          'user-123',
          dataWithUnknownQuestionnaire,
        );

        expect(Logger.prototype.warn).toHaveBeenCalledWith(
          'Unknown questionnaire type: UnknownType',
        );
      });
    });

    describe('Error handling', () => {
      it('should handle database errors gracefully', async () => {
        prismaService.preAssessment.create.mockRejectedValue(
          new Error('Database error'),
        );

        await expect(
          service.createPreAssessment('user-123', validCreateData),
        ).rejects.toThrow(InternalServerErrorException);
      });

      it('should preserve specific exception types', async () => {
        const notFoundError = new NotFoundException('User not found');
        prismaService.user.findUnique.mockRejectedValue(notFoundError);

        await expect(
          service.createPreAssessment('user-123', validCreateData),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('getPreAssessmentByUserId', () => {
    it('should return pre-assessment for valid user ID', async () => {
      prismaService.preAssessment.findUnique.mockResolvedValue(
        mockPreAssessment,
      );

      const result = await service.getPreAssessmentByUserId('user-123');

      expect(prismaService.preAssessment.findUnique).toHaveBeenCalledWith({
        where: { clientId: 'user-123' },
      });
      expect(result).toEqual(mockPreAssessment);
    });

    it('should throw NotFoundException when pre-assessment not found', async () => {
      prismaService.preAssessment.findUnique.mockResolvedValue(null);

      await expect(
        service.getPreAssessmentByUserId('user-123'),
      ).rejects.toThrow(new NotFoundException('Pre-assessment not found'));
    });

    it('should handle database errors', async () => {
      prismaService.preAssessment.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.getPreAssessmentByUserId('user-123'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getPreAssessmentByClientId', () => {
    it('should return pre-assessment with client and user data', async () => {
      const mockPreAssessmentWithClient = {
        ...mockPreAssessment,
        client: {
          user: mockUser,
        },
      };
      prismaService.preAssessment.findUnique.mockResolvedValue(
        mockPreAssessmentWithClient,
      );

      const result = await service.getPreAssessmentByClientId('user-123');

      expect(prismaService.preAssessment.findUnique).toHaveBeenCalledWith({
        where: { clientId: 'user-123' },
        include: { client: { include: { user: true } } },
      });
      expect(result).toEqual(mockPreAssessmentWithClient);
    });

    it('should throw NotFoundException when pre-assessment not found', async () => {
      prismaService.preAssessment.findUnique.mockResolvedValue(null);

      await expect(
        service.getPreAssessmentByClientId('user-123'),
      ).rejects.toThrow(new NotFoundException('Pre-assessment not found'));
    });
  });

  describe('updatePreAssessment', () => {
    const updateData = {
      questionnaires: ['Anxiety', 'Stress'],
      answers: [
        [1, 2, 3],
        [4, 5, 6],
      ],
      answerMatrix: [
        [1, 2],
        [3, 4],
      ],
    };

    beforeEach(() => {
      prismaService.client.findUnique.mockResolvedValue(mockClient);
      prismaService.preAssessment.update.mockResolvedValue(mockPreAssessment);
    });

    it('should update pre-assessment successfully', async () => {
      const result = await service.updatePreAssessment('user-123', updateData);

      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
      expect(prismaService.preAssessment.update).toHaveBeenCalledWith({
        where: { clientId: 'user-123' },
        data: {
          questionnaires: updateData.questionnaires,
          answers: updateData.answers,
          answerMatrix: updateData.answerMatrix,
          scores: expect.any(Object),
          severityLevels: expect.any(Object),
        },
      });
      expect(result).toEqual(mockPreAssessment);
    });

    it('should use provided scores when valid', async () => {
      const dataWithScores = {
        ...updateData,
        scores: { Anxiety: 20, Stress: 15 },
        severityLevels: { Anxiety: 'high', Stress: 'moderate' },
      };

      await service.updatePreAssessment('user-123', dataWithScores);

      expect(prismaService.preAssessment.update).toHaveBeenCalledWith({
        where: { clientId: 'user-123' },
        data: expect.objectContaining({
          scores: { Anxiety: 20, Stress: 15 },
          severityLevels: { Anxiety: 'high', Stress: 'moderate' },
        }),
      });
    });

    it('should calculate scores when questionnaires and answers provided without scores', async () => {
      await service.updatePreAssessment('user-123', updateData);

      expect(PreAssessmentUtils.calculateAllScores).toHaveBeenCalledWith(
        updateData.questionnaires,
        updateData.answers,
      );
      expect(PreAssessmentUtils.generateSeverityLevels).toHaveBeenCalledWith(
        mockCalculatedScores,
      );
    });

    it('should throw NotFoundException when client not found', async () => {
      prismaService.client.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePreAssessment('user-123', updateData),
      ).rejects.toThrow(new NotFoundException('Client not found'));
    });

    it('should handle invalid scores gracefully', async () => {
      const dataWithInvalidScores = {
        ...updateData,
        scores: 'invalid-scores',
        severityLevels: { valid: 'levels' },
      };

      await service.updatePreAssessment('user-123', dataWithInvalidScores);

      expect(prismaService.preAssessment.update).toHaveBeenCalledWith({
        where: { clientId: 'user-123' },
        data: expect.objectContaining({
          scores: expect.any(Object), // Should be calculated scores
          severityLevels: { valid: 'levels' },
        }),
      });
    });

    it('should handle invalid severity levels gracefully', async () => {
      const dataWithInvalidLevels = {
        ...updateData,
        scores: { Anxiety: 15 },
        severityLevels: 123, // Invalid type
      };

      await service.updatePreAssessment('user-123', dataWithInvalidLevels);

      expect(prismaService.preAssessment.update).toHaveBeenCalledWith({
        where: { clientId: 'user-123' },
        data: expect.objectContaining({
          scores: { Anxiety: 15 },
          severityLevels: expect.any(Object), // Should be calculated levels
        }),
      });
    });
  });

  describe('deletePreAssessment', () => {
    it('should delete pre-assessment successfully', async () => {
      prismaService.preAssessment.delete.mockResolvedValue(mockPreAssessment);

      const result = await service.deletePreAssessment('user-123');

      expect(prismaService.preAssessment.delete).toHaveBeenCalledWith({
        where: { clientId: 'user-123' },
      });
      expect(result).toBeNull();
    });

    it('should handle deletion errors', async () => {
      prismaService.preAssessment.delete.mockRejectedValue(
        new Error('Delete failed'),
      );

      await expect(service.deletePreAssessment('user-123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('flattenAnswers', () => {
    it('should flatten 2D array correctly', () => {
      const answers = [
        [1, 2, 3],
        [4, 5],
        [6, 7, 8, 9],
      ];
      // Access private method through service instance
      const result = (service as any).flattenAnswers(answers);

      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should validate flattened array is not empty', () => {
      const emptyAnswers = [[], [], []];

      expect(() => (service as any).flattenAnswers(emptyAnswers)).toThrow(
        new BadRequestException('Flattened answers array cannot be empty'),
      );
    });

    it('should validate all values are finite numbers', () => {
      const invalidAnswers = [
        [1, 2, NaN],
        [4, 5],
      ];

      expect(() => (service as any).flattenAnswers(invalidAnswers)).toThrow(
        new BadRequestException('All answer values must be finite numbers'),
      );
    });

    it('should warn when not exactly 201 values for AI prediction', () => {
      const shortAnswers = [[1, 2, 3]];
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      (service as any).flattenAnswers(shortAnswers);

      expect(warnSpy).toHaveBeenCalledWith(
        'Expected 201 values for AI prediction, got 3',
      );
    });
  });

  describe('validateAnswersStructure', () => {
    it('should pass validation for valid answers structure', () => {
      const validAnswers = [
        [1, 2, 3],
        [4, 5, 6],
      ];

      expect(() =>
        (service as any).validateAnswersStructure(validAnswers),
      ).not.toThrow();
    });

    it('should throw error for non-array input', () => {
      expect(() =>
        (service as any).validateAnswersStructure('invalid'),
      ).toThrow(new BadRequestException('Answers must be an array of arrays'));
    });

    it('should throw error for empty answers array', () => {
      expect(() => (service as any).validateAnswersStructure([])).toThrow(
        new BadRequestException('Answers array cannot be empty'),
      );
    });

    it('should throw error for non-array questionnaire answers', () => {
      const invalidAnswers = [[1, 2, 3], 'invalid', [4, 5, 6]]; // First element is valid numbers

      expect(() =>
        (service as any).validateAnswersStructure(invalidAnswers),
      ).toThrow(
        new BadRequestException('Questionnaire 1 answers must be an array'),
      );
    });

    it('should throw error for empty questionnaire answers', () => {
      const invalidAnswers = [[1, 2, 3], [], [4, 5, 6]];

      expect(() =>
        (service as any).validateAnswersStructure(invalidAnswers),
      ).toThrow(
        new BadRequestException('Questionnaire 1 cannot have empty answers'),
      );
    });

    it('should throw error for out-of-range values', () => {
      const invalidAnswers = [
        [1, 2, 15],
        [4, 5, 6],
      ]; // 15 is out of range

      expect(() =>
        (service as any).validateAnswersStructure(invalidAnswers),
      ).toThrow(
        new BadRequestException(
          'Answer value out of range (0-10) at questionnaire 0, question 2: 15',
        ),
      );
    });

    it('should throw error for negative values', () => {
      const invalidAnswers = [
        [1, 2, -1],
        [4, 5, 6],
      ]; // -1 is out of range

      expect(() =>
        (service as any).validateAnswersStructure(invalidAnswers),
      ).toThrow(
        new BadRequestException(
          'Answer value out of range (0-10) at questionnaire 0, question 2: -1',
        ),
      );
    });
  });

  describe('validateQuestionnaires', () => {
    it('should pass validation for valid questionnaires', () => {
      const validQuestionnaires = ['Anxiety', 'Depression', 'Stress'];

      expect(() =>
        (service as any).validateQuestionnaires(validQuestionnaires),
      ).not.toThrow();
    });

    it('should throw error for non-array input', () => {
      expect(() => (service as any).validateQuestionnaires('invalid')).toThrow(
        new BadRequestException('Questionnaires must be an array'),
      );
    });

    it('should throw error for empty questionnaires array', () => {
      expect(() => (service as any).validateQuestionnaires([])).toThrow(
        new BadRequestException('At least one questionnaire is required'),
      );
    });

    it('should throw error for non-string questionnaire names', () => {
      const invalidQuestionnaires = ['Valid', 123, 'Another'];

      expect(() =>
        (service as any).validateQuestionnaires(invalidQuestionnaires),
      ).toThrow(
        new BadRequestException(
          'All questionnaire names must be non-empty strings',
        ),
      );
    });

    it('should throw error for empty string questionnaire names', () => {
      const invalidQuestionnaires = ['Valid', '', 'Another'];

      expect(() =>
        (service as any).validateQuestionnaires(invalidQuestionnaires),
      ).toThrow(
        new BadRequestException(
          'All questionnaire names must be non-empty strings',
        ),
      );
    });
  });

  describe('AI Service Integration', () => {
    it('should handle successful AI prediction', async () => {
      aiServiceClient.predict.mockResolvedValue(mockAiResponse);

      const result = await (service as any).getAiEstimate(
        new Array(201).fill(1),
      );

      expect(result).toEqual(mockAiResponse.predictions);
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'AI prediction completed successfully in 150ms',
      );
    });

    it('should handle AI prediction failure', async () => {
      const failureResponse = { success: false, error: 'Model unavailable' };
      aiServiceClient.predict.mockResolvedValue(failureResponse);

      const result = await (service as any).getAiEstimate(
        new Array(201).fill(1),
      );

      expect(result).toBeNull();
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        'AI prediction failed: Model unavailable',
      );
    });

    it('should handle AI service exceptions', async () => {
      aiServiceClient.predict.mockRejectedValue(new Error('Network error'));

      const result = await (service as any).getAiEstimate(
        new Array(201).fill(1),
      );

      expect(result).toBeNull();
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'AI model prediction error:',
        'Network error',
      );
    });

    it('should handle AI service timeout', async () => {
      aiServiceClient.predict.mockRejectedValue(new Error('Timeout'));

      const result = await (service as any).getAiEstimate(
        new Array(201).fill(1),
      );

      expect(result).toBeNull();
    });
  });

  describe('Edge Cases and Performance', () => {
    it('should handle large questionnaire arrays', async () => {
      const largeAnswers = new Array(50).fill([1, 2, 3, 4, 5]);
      const largeQuestionnaires = new Array(50).fill('Stress');

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.client.findUnique.mockResolvedValue(mockClient);
      prismaService.preAssessment.findUnique.mockResolvedValue(null);
      prismaService.preAssessment.create.mockResolvedValue(mockPreAssessment);

      const result = await service.createPreAssessment('user-123', {
        questionnaires: largeQuestionnaires,
        answers: largeAnswers,
        answerMatrix: largeAnswers,
        scores: {},
        severityLevels: {},
        aiEstimate: {},
      });

      expect(result).toBeDefined();
    });

    it('should handle concurrent creation attempts', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.client.findUnique.mockResolvedValue(mockClient);
      prismaService.preAssessment.findUnique.mockResolvedValue(null);
      prismaService.preAssessment.create.mockResolvedValue(mockPreAssessment);

      const validData = {
        questionnaires: ['Anxiety'],
        answers: [[1, 2, 3]],
        answerMatrix: [[1, 2, 3]],
        scores: {},
        severityLevels: {},
        aiEstimate: {},
      };

      // Simulate concurrent requests
      const promises = [
        service.createPreAssessment('user-123', validData),
        service.createPreAssessment('user-123', validData),
      ];

      const results = await Promise.all(promises);
      expect(results).toHaveLength(2);
    });

    it('should handle null and undefined in scores validation', () => {
      const isValidScores = (service as any).isValidScores;

      expect(isValidScores(null)).toBe(false);
      expect(isValidScores(undefined)).toBe(false);
      expect(isValidScores({})).toBe(true);
      expect(isValidScores({ test: 5 })).toBe(true);
      expect(isValidScores({ test: 'invalid' })).toBe(false);
    });

    it('should handle null and undefined in severity levels validation', () => {
      const isValidSeverityLevels = (service as any).isValidSeverityLevels;

      expect(isValidSeverityLevels(null)).toBe(false);
      expect(isValidSeverityLevels(undefined)).toBe(false);
      expect(isValidSeverityLevels({})).toBe(true);
      expect(isValidSeverityLevels({ test: 'mild' })).toBe(true);
      expect(isValidSeverityLevels({ test: 123 })).toBe(false);
    });
  });
});
