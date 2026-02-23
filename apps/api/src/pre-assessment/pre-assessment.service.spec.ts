import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PreAssessmentService } from './pre-assessment.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { CreatePreAssessmentDto, PreAssessmentMethod } from './types/pre-assessment.dto';

describe('PreAssessmentService', () => {
  let service: PreAssessmentService;
  let prismaService: any;

  // Mock data
  const mockClient = {
    userId: 'user-123',
  };

  const mockPreAssessmentData: CreatePreAssessmentDto = {
    assessmentId: null,
    method: 'CHECKLIST' as PreAssessmentMethod,
    completedAt: new Date(),
    data: {
      questionnaireScores: {
        anxiety: { score: 10, severity: 'mild' },
      },
      documents: {
        soapAnalysisUrl: 'http://soap.url',
        conversationHistoryUrl: 'http://history.url',
      },
    },
    pastTherapyExperiences: 'Previous therapy for anxiety',
    medicationHistory: 'None',
    accessibilityNeeds: 'None',
  };

  const mockPrismaResponse = {
    id: 'assessment-123',
    clientId: 'user-123',
    method: 'CHECKLIST',
    data: mockPreAssessmentData.data,
    pastTherapyExperiences: 'Previous therapy for anxiety',
    medicationHistory: 'None',
    accessibilityNeeds: 'None',
    soapAnalysisUrl: 'http://soap.url',
    conversationHistoryUrl: 'http://history.url',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      client: {
        findUnique: jest.fn(),
      },
      preAssessment: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreAssessmentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PreAssessmentService>(PreAssessmentService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPreAssessment', () => {
    it('should create a new pre-assessment if none exists', async () => {
      prismaService.client.findUnique.mockResolvedValue(mockClient);
      prismaService.preAssessment.findFirst.mockResolvedValue(null);
      prismaService.preAssessment.create.mockResolvedValue(mockPrismaResponse);

      const result = await service.createPreAssessment('user-123', mockPreAssessmentData);

      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        select: { userId: true },
      });
      expect(prismaService.preAssessment.create).toHaveBeenCalled();
      expect(result).toEqual(mockPrismaResponse);
    });

    it('should update an existing pre-assessment if it exists', async () => {
      prismaService.client.findUnique.mockResolvedValue(mockClient);
      prismaService.preAssessment.findFirst.mockResolvedValue(mockPrismaResponse);
      prismaService.preAssessment.update.mockResolvedValue(mockPrismaResponse);

      const result = await service.createPreAssessment('user-123', mockPreAssessmentData);

      expect(prismaService.preAssessment.update).toHaveBeenCalledWith({
        where: { id: mockPrismaResponse.id },
        data: expect.objectContaining({
          pastTherapyExperiences: 'Previous therapy for anxiety',
        }),
      });
      expect(result).toEqual(mockPrismaResponse);
    });

    it('should throw NotFoundException if client profile is not found', async () => {
      prismaService.client.findUnique.mockResolvedValue(null);

      await expect(
        service.createPreAssessment('user-123', mockPreAssessmentData),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      prismaService.client.findUnique.mockRejectedValue(new Error('DB Error'));

      await expect(
        service.createPreAssessment('user-123', mockPreAssessmentData),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getPreAssessmentByClientId', () => {
    it('should return the latest assessment', async () => {
      prismaService.preAssessment.findFirst.mockResolvedValue(mockPrismaResponse);

      const result = await service.getPreAssessmentByClientId('user-123');

      expect(prismaService.preAssessment.findFirst).toHaveBeenCalledWith({
        where: { clientId: 'user-123' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockPrismaResponse);
    });

    it('should throw NotFoundException if no assessment is found', async () => {
      prismaService.preAssessment.findFirst.mockResolvedValue(null);

      await expect(
        service.getPreAssessmentByClientId('user-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
