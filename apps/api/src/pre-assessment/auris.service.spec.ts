import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { AurisService } from './auris.service';
import { PreAssessmentService } from './pre-assessment.service';

describe('AurisService', () => {
  let service: AurisService;
  let httpService: { post: jest.Mock };
  let preAssessmentService: {
    createAnonymousPreAssessment: jest.Mock;
    createPreAssessment: jest.Mock;
  };

  beforeEach(async () => {
    httpService = {
      post: jest.fn(),
    };

    preAssessmentService = {
      createAnonymousPreAssessment: jest.fn(),
      createPreAssessment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AurisService,
        {
          provide: HttpService,
          useValue: httpService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'OLLAMA_BASE_URL':
                  return 'http://localhost:11434';
                case 'OLLAMA_MODEL':
                  return 'gemma4:31b-cloud';
                default:
                  return undefined;
              }
            }),
          },
        },
        {
          provide: PreAssessmentService,
          useValue: preAssessmentService,
        },
      ],
    }).compile();

    service = module.get(AurisService);
  });

  it('creates a local chatbot session without calling the external provider', async () => {
    const session = await service.createSession();

    expect(session.session_id).toEqual(expect.any(String));
    expect(session.opening_message).toContain('Mentara');
    expect(httpService.post).not.toHaveBeenCalled();
  });

  it('sends the conversation to Ollama and returns the mapped chatbot response', async () => {
    httpService.post.mockReturnValue(
      of({
        data: {
          message: {
            content: JSON.stringify({
              assistantResponse:
                'Thanks for sharing that. Can you tell me how long you have felt this way?',
              state: {
                assessmentPhase: 'ASSESSMENT',
                completionReason: 'collecting_context',
                requiresCrisisProtocol: false,
                extractedData: {
                  currentConcerns: ['persistent sadness'],
                },
                candidateScales: ['PHQ-9'],
              },
              isComplete: false,
            }),
          },
        },
      }),
    );

    const created = await service.createSession();
    const response = await service.chat(
      undefined,
      created.session_id,
      'I have been feeling low for a while.',
    );

    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:11434/api/chat',
      expect.objectContaining({
        model: 'gemma4:31b-cloud',
        stream: false,
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({
            role: 'user',
            content: 'I have been feeling low for a while.',
          }),
        ]),
      }),
      expect.any(Object),
    );
    expect(response.response).toContain('Thanks for sharing that');
    expect(response.state.assessment_phase).toBe('ASSESSMENT');
    expect(response.state.is_complete).toBe(false);
    expect(preAssessmentService.createAnonymousPreAssessment).not.toHaveBeenCalled();
  });

  it('persists anonymous results when Ollama marks the assessment complete', async () => {
    httpService.post.mockReturnValue(
      of({
        data: {
          message: {
            content: JSON.stringify({
              assistantResponse:
                'Thank you. I have enough information to summarize your assessment.',
              state: {
                assessmentPhase: 'COMPLETE',
                completionReason: 'assessment_complete',
                requiresCrisisProtocol: false,
                extractedData: {
                  currentConcerns: ['anxiety', 'sleep disruption'],
                },
                candidateScales: ['GAD-7'],
              },
              isComplete: true,
              results: {
                assessmentId: 'assessment-123',
                completedAt: '2026-04-16T00:00:00.000Z',
                questionnaireScores: {
                  gad7: { score: 12, severity: 'moderate' },
                },
                context: {
                  pastTherapyExperiences: ['brief counseling'],
                  medicationHistory: ['none'],
                  accessibilityNeeds: ['captions'],
                },
              },
            }),
          },
        },
      }),
    );

    const created = await service.createSession();
    const response = await service.chat(
      undefined,
      created.session_id,
      'I also get anxious and my sleep has been poor.',
    );

    expect(response.state.is_complete).toBe(true);
    expect(response.results?.data.questionnaireScores.gad7.score).toBe(12);
    expect(preAssessmentService.createAnonymousPreAssessment).toHaveBeenCalledWith(
      expect.objectContaining({
        assessmentId: created.session_id,
        method: 'CHATBOT',
        accessibilityNeeds: 'captions',
        medicationHistory: 'none',
        pastTherapyExperiences: 'brief counseling',
      }),
    );
  });

  it('rejects unknown sessions', async () => {
    await expect(
      service.chat(undefined, 'missing-session', 'Hello?'),
    ).rejects.toThrow(NotFoundException);
  });
});
