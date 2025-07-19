import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { ModerationService, ModerationResult, ModerationContext } from './moderation.service';
import { Logger } from '@nestjs/common';

describe('ModerationService', () => {
  let service: ModerationService;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;
  let loggerSpy: jest.SpyInstance;

  // Mock data structures
  const mockDate = new Date('2024-01-15T10:00:00Z');

  const mockSafeModerationResult: ModerationResult = {
    classification: 'safe',
    confidence: 0.95,
    mentalHealthContext: false,
    flags: [],
    processingTime: 150,
  };

  const mockToxicModerationResult: ModerationResult = {
    classification: 'toxic',
    confidence: 0.87,
    mentalHealthContext: false,
    flags: ['profanity', 'harassment'],
    processingTime: 200,
  };

  const mockCrisisModerationResult: ModerationResult = {
    classification: 'crisis',
    confidence: 0.92,
    mentalHealthContext: true,
    crisisLevel: 'critical',
    immediateEscalation: true,
    flags: ['self_harm', 'suicide_ideation'],
    processingTime: 180,
  };

  const mockSpamModerationResult: ModerationResult = {
    classification: 'spam',
    confidence: 0.78,
    mentalHealthContext: false,
    flags: ['repetitive_content', 'promotional'],
    processingTime: 120,
  };

  const mockPostContext: ModerationContext = {
    context: 'post',
    userId: 'user-123',
    userRole: 'client',
    communityId: 'community-456',
    timestamp: mockDate,
  };

  const mockCommentContext: ModerationContext = {
    context: 'comment',
    userId: 'user-789',
    userRole: 'therapist',
    communityId: 'community-456',
    timestamp: mockDate,
  };

  const mockMessageContext: ModerationContext = {
    context: 'message',
    userId: 'user-111',
    userRole: 'client',
    conversationId: 'conversation-222',
    timestamp: mockDate,
  };

  const mockTherapyContext: ModerationContext = {
    context: 'therapy',
    userId: 'user-333',
    userRole: 'client',
    conversationId: 'session-444',
    timestamp: mockDate,
  };

  beforeEach(async () => {
    const mockHttpService = {
      post: jest.fn(),
      get: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModerationService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ModerationService>(ModerationService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);

    // Mock configuration
    configService.get
      .mockReturnValueOnce('http://localhost:5001') // MODERATION_API_URL
      .mockReturnValueOnce(true) // MODERATION_ENABLED
      .mockReturnValueOnce(5000); // MODERATION_TIMEOUT

    // Setup logger spies
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    // Mock Date constructor for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Configuration', () => {
    it('should initialize with default configuration values', () => {
      const mockConfigWithDefaults = jest.fn();
      mockConfigWithDefaults
        .mockReturnValueOnce(undefined) // MODERATION_API_URL (should use default)
        .mockReturnValueOnce(undefined) // MODERATION_ENABLED (should use default)
        .mockReturnValueOnce(undefined); // MODERATION_TIMEOUT (should use default)

      expect(service).toBeDefined();
    });

    it('should handle custom configuration values', () => {
      const customService = new ModerationService(
        httpService,
        {
          get: jest.fn()
            .mockReturnValueOnce('https://custom-api.example.com')
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(10000),
        } as any
      );

      expect(customService).toBeDefined();
    });
  });

  describe('classifyContent', () => {
    beforeEach(() => {
      httpService.post.mockReturnValue(of({
        data: mockSafeModerationResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));
    });

    it('should classify safe content successfully', async () => {
      const text = 'This is a positive and helpful message about mental health recovery.';
      const result = await service.classifyContent(text, mockPostContext);

      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/v1/classify',
        {
          text,
          context: 'post',
          user_id: 'user-123',
          user_role: 'client',
          conversation_id: undefined,
          community_id: 'community-456',
          timestamp: mockDate.toISOString(),
        },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      expect(result).toEqual(
        expect.objectContaining({
          classification: 'safe',
          confidence: 0.95,
          mentalHealthContext: false,
          flags: [],
          processingTime: expect.any(Number),
        })
      );
    });

    it('should classify toxic content and log warning', async () => {
      httpService.post.mockReturnValue(of({
        data: mockToxicModerationResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      const toxicText = 'This is harmful and offensive content.';
      const result = await service.classifyContent(toxicText, mockPostContext);

      expect(result.classification).toBe('toxic');
      expect(result.confidence).toBe(0.87);
      expect(result.flags).toContain('profanity');
      expect(result.flags).toContain('harassment');

      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        'TOXIC CONTENT DETECTED: User user-123 in post',
        expect.objectContaining({
          text: toxicText.substring(0, 100),
          confidence: 0.87,
          flags: ['profanity', 'harassment'],
        })
      );
    });

    it('should classify crisis content and log critical warning', async () => {
      httpService.post.mockReturnValue(of({
        data: mockCrisisModerationResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      const crisisText = 'I am having thoughts of self-harm and need immediate help.';
      const result = await service.classifyContent(crisisText, mockPostContext);

      expect(result.classification).toBe('crisis');
      expect(result.crisisLevel).toBe('critical');
      expect(result.immediateEscalation).toBe(true);
      expect(result.flags).toContain('self_harm');
      expect(result.flags).toContain('suicide_ideation');

      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        'CRISIS DETECTED: User user-123 in post',
        expect.objectContaining({
          text: crisisText.substring(0, 100),
          crisisLevel: 'critical',
          confidence: 0.92,
          flags: ['self_harm', 'suicide_ideation'],
        })
      );
    });

    it('should classify spam content successfully', async () => {
      httpService.post.mockReturnValue(of({
        data: mockSpamModerationResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      const spamText = 'Buy now! Amazing deals! Click here! Limited time offer!';
      const result = await service.classifyContent(spamText, mockPostContext);

      expect(result.classification).toBe('spam');
      expect(result.confidence).toBe(0.78);
      expect(result.flags).toContain('repetitive_content');
      expect(result.flags).toContain('promotional');
    });

    it('should return safe result when moderation is disabled', async () => {
      const disabledService = new ModerationService(
        httpService,
        {
          get: jest.fn()
            .mockReturnValueOnce('http://localhost:5001')
            .mockReturnValueOnce(false) // MODERATION_ENABLED = false
            .mockReturnValueOnce(5000),
        } as any
      );

      const result = await disabledService.classifyContent('Any text', mockPostContext);

      expect(result).toEqual({
        classification: 'safe',
        confidence: 0.5,
        mentalHealthContext: false,
        flags: [],
        processingTime: 0,
      });

      expect(httpService.post).not.toHaveBeenCalled();
    });

    it('should handle HTTP service errors gracefully', async () => {
      const httpError = new Error('Network error');
      httpService.post.mockReturnValue(throwError(() => httpError));

      const result = await service.classifyContent('Test text', mockPostContext);

      expect(result).toEqual({
        classification: 'safe',
        confidence: 0.5,
        mentalHealthContext: false,
        flags: ['service_unavailable'],
        processingTime: 0,
      });

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Moderation service error:',
        httpError
      );
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Timeout');
      timeoutError.name = 'TimeoutError';
      httpService.post.mockReturnValue(throwError(() => timeoutError));

      const result = await service.classifyContent('Test text', mockPostContext);

      expect(result.classification).toBe('safe');
      expect(result.flags).toContain('service_unavailable');
    });

    it('should handle malformed API responses', async () => {
      httpService.post.mockReturnValue(of({
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      const result = await service.classifyContent('Test text', mockPostContext);

      expect(result.classification).toBe('safe');
      expect(result.flags).toContain('service_unavailable');
    });

    it('should measure processing time accurately', async () => {
      const mockResponseDelay = 250;
      
      httpService.post.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              data: mockSafeModerationResult,
              status: 200,
              statusText: 'OK',
              headers: {},
              config: {},
            } as any);
          }, mockResponseDelay);
        });
      }) as any;

      const startTime = Date.now();
      jest.advanceTimersByTime(mockResponseDelay);
      const result = await service.classifyContent('Test text', mockPostContext);

      expect(result.processingTime).toBeGreaterThanOrEqual(mockResponseDelay);
    });

    it('should handle empty and whitespace-only text', async () => {
      const emptyTexts = ['', '   ', '\n\t\r', '    \n    '];

      for (const text of emptyTexts) {
        await service.classifyContent(text, mockPostContext);

        expect(httpService.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ text }),
          expect.any(Object)
        );
      }
    });

    it('should handle very long text content', async () => {
      const longText = 'a'.repeat(10000);

      await service.classifyContent(longText, mockPostContext);

      expect(httpService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ text: longText }),
        expect.any(Object)
      );
    });

    it('should handle special characters and Unicode', async () => {
      const specialTexts = [
        'Text with émojis 😊🔥💪',
        'Chinese characters: 你好世界',
        'Arabic text: مرحبا بالعالم',
        'HTML tags: <script>alert("test")</script>',
        'SQL injection: "; DROP TABLE users; --',
        'JSON: {"key": "value", "nested": {"array": [1,2,3]}}',
      ];

      for (const text of specialTexts) {
        await service.classifyContent(text, mockPostContext);

        expect(httpService.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ text }),
          expect.any(Object)
        );
      }
    });
  });

  describe('checkCrisisContent', () => {
    it('should detect critical crisis content', async () => {
      httpService.post.mockReturnValue(of({
        data: mockCrisisModerationResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      const crisisText = 'I want to end my life';
      const isCrisis = await service.checkCrisisContent(crisisText, mockPostContext);

      expect(isCrisis).toBe(true);
    });

    it('should detect immediate escalation content', async () => {
      const escalationResult = {
        ...mockSafeModerationResult,
        immediateEscalation: true,
      };

      httpService.post.mockReturnValue(of({
        data: escalationResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      const escalationText = 'I need help immediately';
      const isCrisis = await service.checkCrisisContent(escalationText, mockPostContext);

      expect(isCrisis).toBe(true);
    });

    it('should not detect crisis in safe content', async () => {
      httpService.post.mockReturnValue(of({
        data: mockSafeModerationResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      const safeText = 'I am feeling better today';
      const isCrisis = await service.checkCrisisContent(safeText, mockPostContext);

      expect(isCrisis).toBe(false);
    });

    it('should handle different crisis levels', async () => {
      const crisisLevels = ['low', 'medium', 'high', 'critical'];

      for (const level of crisisLevels) {
        const crisisResult = {
          ...mockCrisisModerationResult,
          crisisLevel: level as any,
          immediateEscalation: level === 'critical',
        };

        httpService.post.mockReturnValue(of({
          data: crisisResult,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        } as any));

        const isCrisis = await service.checkCrisisContent(`Crisis level ${level}`, mockPostContext);

        if (level === 'critical') {
          expect(isCrisis).toBe(true);
        } else {
          expect(isCrisis).toBe(false);
        }
      }
    });

    it('should handle service errors during crisis check', async () => {
      httpService.post.mockReturnValue(throwError(() => new Error('Service error')));

      const isCrisis = await service.checkCrisisContent('Test text', mockPostContext);

      expect(isCrisis).toBe(false); // Should default to false on error
    });
  });

  describe('batchClassify', () => {
    const mockBatchItems = [
      { text: 'Safe content 1', context: mockPostContext },
      { text: 'Safe content 2', context: mockCommentContext },
      { text: 'Toxic content', context: mockMessageContext },
      { text: 'Crisis content', context: mockTherapyContext },
    ];

    beforeEach(() => {
      httpService.post.mockReturnValue(of({
        data: [
          mockSafeModerationResult,
          mockSafeModerationResult,
          mockToxicModerationResult,
          mockCrisisModerationResult,
        ],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));
    });

    it('should process batch classification successfully', async () => {
      const results = await service.batchClassify(mockBatchItems);

      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/v1/classify/batch',
        {
          items: [
            {
              text: 'Safe content 1',
              context: 'post',
              user_id: 'user-123',
              user_role: 'client',
              conversation_id: undefined,
              community_id: 'community-456',
              timestamp: mockDate.toISOString(),
            },
            {
              text: 'Safe content 2',
              context: 'comment',
              user_id: 'user-789',
              user_role: 'therapist',
              conversation_id: undefined,
              community_id: 'community-456',
              timestamp: mockDate.toISOString(),
            },
            {
              text: 'Toxic content',
              context: 'message',
              user_id: 'user-111',
              user_role: 'client',
              conversation_id: 'conversation-222',
              community_id: undefined,
              timestamp: mockDate.toISOString(),
            },
            {
              text: 'Crisis content',
              context: 'therapy',
              user_id: 'user-333',
              user_role: 'client',
              conversation_id: 'session-444',
              community_id: undefined,
              timestamp: mockDate.toISOString(),
            },
          ],
        },
        {
          timeout: 10000, // 2x normal timeout for batch
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      expect(results).toHaveLength(4);
      expect(results[0].classification).toBe('safe');
      expect(results[1].classification).toBe('safe');
      expect(results[2].classification).toBe('toxic');
      expect(results[3].classification).toBe('crisis');
    });

    it('should return safe results when moderation is disabled', async () => {
      const disabledService = new ModerationService(
        httpService,
        {
          get: jest.fn()
            .mockReturnValueOnce('http://localhost:5001')
            .mockReturnValueOnce(false) // MODERATION_ENABLED = false
            .mockReturnValueOnce(5000),
        } as any
      );

      const results = await disabledService.batchClassify(mockBatchItems);

      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result.classification).toBe('safe');
        expect(result.confidence).toBe(0.5);
      });

      expect(httpService.post).not.toHaveBeenCalled();
    });

    it('should handle batch processing errors', async () => {
      httpService.post.mockReturnValue(throwError(() => new Error('Batch processing error')));

      const results = await service.batchClassify(mockBatchItems);

      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result.classification).toBe('safe');
        expect(result.flags).toContain('service_unavailable');
      });

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Batch moderation service error:',
        expect.any(Error)
      );
    });

    it('should handle empty batch', async () => {
      const results = await service.batchClassify([]);

      expect(results).toEqual([]);
      expect(httpService.post).not.toHaveBeenCalled();
    });

    it('should handle large batch sizes efficiently', async () => {
      const largeBatch = Array.from({ length: 1000 }, (_, i) => ({
        text: `Content item ${i}`,
        context: mockPostContext,
      }));

      const largeBatchResponse = Array.from({ length: 1000 }, () => mockSafeModerationResult);

      httpService.post.mockReturnValue(of({
        data: largeBatchResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      const startTime = Date.now();
      const results = await service.batchClassify(largeBatch);
      const endTime = Date.now();

      expect(results).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(2000); // Should be reasonably fast
    });

    it('should calculate average processing time correctly', async () => {
      const mockProcessingTime = 400;
      
      httpService.post.mockReturnValue(of({
        data: [mockSafeModerationResult, mockToxicModerationResult],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      jest.advanceTimersByTime(mockProcessingTime);
      
      const results = await service.batchClassify(mockBatchItems.slice(0, 2));

      results.forEach(result => {
        expect(result.processingTime).toBeCloseTo(mockProcessingTime / 2, 0);
      });
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when service is available', async () => {
      httpService.get.mockReturnValue(of({
        data: { status: 'ok' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      const health = await service.healthCheck();

      expect(httpService.get).toHaveBeenCalledWith(
        'http://localhost:5001/health',
        { timeout: 5000 }
      );

      expect(health).toEqual({
        status: 'healthy',
        responseTime: expect.any(Number),
      });
    });

    it('should return disabled status when moderation is disabled', async () => {
      const disabledService = new ModerationService(
        httpService,
        {
          get: jest.fn()
            .mockReturnValueOnce('http://localhost:5001')
            .mockReturnValueOnce(false) // MODERATION_ENABLED = false
            .mockReturnValueOnce(5000),
        } as any
      );

      const health = await disabledService.healthCheck();

      expect(health).toEqual({ status: 'disabled' });
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should return unhealthy status when service is unavailable', async () => {
      const serviceError = new Error('Service unavailable');
      httpService.get.mockReturnValue(throwError(() => serviceError));

      const health = await service.healthCheck();

      expect(health).toEqual({
        status: 'unhealthy',
        error: 'Service unavailable',
      });

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Moderation service health check failed:',
        serviceError
      );
    });

    it('should handle timeout errors in health check', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      httpService.get.mockReturnValue(throwError(() => timeoutError));

      const health = await service.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.error).toBe('Request timeout');
    });

    it('should measure response time accurately', async () => {
      const mockDelay = 300;
      
      httpService.get.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              data: { status: 'ok' },
              status: 200,
              statusText: 'OK',
              headers: {},
              config: {},
            } as any);
          }, mockDelay);
        });
      }) as any;

      jest.advanceTimersByTime(mockDelay);
      const health = await service.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.responseTime).toBeGreaterThanOrEqual(mockDelay);
    });
  });

  describe('getStats', () => {
    const mockStats = {
      requestCount: 1500,
      averageResponseTime: 185.5,
      errorRate: 2.3,
      crisisDetections: 12,
    };

    beforeEach(() => {
      httpService.get.mockReturnValue(of({
        data: mockStats,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));
    });

    it('should return service statistics when enabled', async () => {
      const stats = await service.getStats();

      expect(httpService.get).toHaveBeenCalledWith(
        'http://localhost:5001/api/v1/stats',
        { timeout: 5000 }
      );

      expect(stats).toEqual(mockStats);
    });

    it('should return zero stats when moderation is disabled', async () => {
      const disabledService = new ModerationService(
        httpService,
        {
          get: jest.fn()
            .mockReturnValueOnce('http://localhost:5001')
            .mockReturnValueOnce(false) // MODERATION_ENABLED = false
            .mockReturnValueOnce(5000),
        } as any
      );

      const stats = await disabledService.getStats();

      expect(stats).toEqual({
        requestCount: 0,
        averageResponseTime: 0,
        errorRate: 0,
        crisisDetections: 0,
      });

      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should return error stats when service fails', async () => {
      httpService.get.mockReturnValue(throwError(() => new Error('Stats service error')));

      const stats = await service.getStats();

      expect(stats).toEqual({
        requestCount: 0,
        averageResponseTime: 0,
        errorRate: 100,
        crisisDetections: 0,
      });

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Failed to get moderation stats:',
        expect.any(Error)
      );
    });

    it('should handle malformed stats response', async () => {
      httpService.get.mockReturnValue(of({
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      const stats = await service.getStats();

      expect(stats.errorRate).toBe(100);
    });
  });

  describe('Context Creation Methods', () => {
    it('should create post context correctly', () => {
      const context = service.createPostContext('user-123', 'client', 'community-456');

      expect(context).toEqual({
        context: 'post',
        userId: 'user-123',
        userRole: 'client',
        communityId: 'community-456',
        timestamp: mockDate,
      });
    });

    it('should create post context without community', () => {
      const context = service.createPostContext('user-123', 'client');

      expect(context).toEqual({
        context: 'post',
        userId: 'user-123',
        userRole: 'client',
        communityId: undefined,
        timestamp: mockDate,
      });
    });

    it('should create comment context correctly', () => {
      const context = service.createCommentContext('user-789', 'therapist', 'community-456');

      expect(context).toEqual({
        context: 'comment',
        userId: 'user-789',
        userRole: 'therapist',
        communityId: 'community-456',
        timestamp: mockDate,
      });
    });

    it('should create message context correctly', () => {
      const context = service.createMessageContext('user-111', 'client', 'conversation-222');

      expect(context).toEqual({
        context: 'message',
        userId: 'user-111',
        userRole: 'client',
        conversationId: 'conversation-222',
        timestamp: mockDate,
      });
    });

    it('should create therapy context correctly', () => {
      const context = service.createTherapyContext('user-333', 'client', 'session-444');

      expect(context).toEqual({
        context: 'therapy',
        userId: 'user-333',
        userRole: 'client',
        conversationId: 'session-444',
        timestamp: mockDate,
      });
    });

    it('should handle special characters in context parameters', () => {
      const specialUserId = 'user-🔒-∆∑©';
      const specialCommunityId = 'community-测试-#$%';

      const context = service.createPostContext(specialUserId, 'client', specialCommunityId);

      expect(context.userId).toBe(specialUserId);
      expect(context.communityId).toBe(specialCommunityId);
    });

    it('should create contexts with different user roles', () => {
      const roles = ['client', 'therapist', 'moderator', 'admin'];

      roles.forEach(role => {
        const context = service.createPostContext('user-123', role, 'community-456');
        expect(context.userRole).toBe(role);
      });
    });
  });

  describe('createSafeResult (private method testing via public methods)', () => {
    it('should create safe result with default values', async () => {
      const disabledService = new ModerationService(
        httpService,
        {
          get: jest.fn()
            .mockReturnValueOnce('http://localhost:5001')
            .mockReturnValueOnce(false) // MODERATION_ENABLED = false
            .mockReturnValueOnce(5000),
        } as any
      );

      const result = await disabledService.classifyContent('test', mockPostContext);

      expect(result).toEqual({
        classification: 'safe',
        confidence: 0.5,
        mentalHealthContext: false,
        flags: [],
        processingTime: 0,
      });
    });

    it('should create safe result with overrides on error', async () => {
      httpService.post.mockReturnValue(throwError(() => new Error('Service error')));

      const result = await service.classifyContent('test', mockPostContext);

      expect(result).toEqual({
        classification: 'safe',
        confidence: 0.5,
        mentalHealthContext: false,
        flags: ['service_unavailable'],
        processingTime: 0,
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent classification requests', async () => {
      httpService.post.mockReturnValue(of({
        data: mockSafeModerationResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      const concurrentRequests = Array.from({ length: 10 }, (_, i) =>
        service.classifyContent(`Content ${i}`, mockPostContext)
      );

      const results = await Promise.all(concurrentRequests);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.classification).toBe('safe');
      });
      expect(httpService.post).toHaveBeenCalledTimes(10);
    });

    it('should handle mixed success and failure scenarios', async () => {
      httpService.post
        .mockReturnValueOnce(of({ data: mockSafeModerationResult, status: 200 } as any))
        .mockReturnValueOnce(throwError(() => new Error('Network error')))
        .mockReturnValueOnce(of({ data: mockToxicModerationResult, status: 200 } as any));

      const requests = [
        service.classifyContent('Safe content', mockPostContext),
        service.classifyContent('Error content', mockPostContext),
        service.classifyContent('Toxic content', mockPostContext),
      ];

      const results = await Promise.all(requests);

      expect(results[0].classification).toBe('safe');
      expect(results[1].classification).toBe('safe'); // Error fallback
      expect(results[1].flags).toContain('service_unavailable');
      expect(results[2].classification).toBe('toxic');
    });

    it('should handle API response with missing fields', async () => {
      const incompleteResponse = {
        classification: 'safe',
        // Missing confidence, flags, etc.
      };

      httpService.post.mockReturnValue(of({
        data: incompleteResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      const result = await service.classifyContent('test', mockPostContext);

      expect(result.classification).toBe('safe');
      expect(result).toHaveProperty('processingTime');
    });

    it('should handle very large text processing', async () => {
      const veryLargeText = 'x'.repeat(100000); // 100KB text

      httpService.post.mockReturnValue(of({
        data: mockSafeModerationResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      const result = await service.classifyContent(veryLargeText, mockPostContext);

      expect(result.classification).toBe('safe');
      expect(httpService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ text: veryLargeText }),
        expect.any(Object)
      );
    });

    it('should handle network instability gracefully', async () => {
      const networkErrors = [
        'ECONNRESET',
        'ENOTFOUND',
        'ETIMEDOUT',
        'ECONNREFUSED',
      ];

      for (const errorCode of networkErrors) {
        const networkError = new Error(errorCode);
        networkError.name = errorCode;
        
        httpService.post.mockReturnValue(throwError(() => networkError));

        const result = await service.classifyContent('test', mockPostContext);

        expect(result.classification).toBe('safe');
        expect(result.flags).toContain('service_unavailable');
      }
    });

    it('should handle malformed context objects', async () => {
      httpService.post.mockReturnValue(of({
        data: mockSafeModerationResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      const malformedContext = {
        context: 'post',
        userId: null,
        userRole: undefined,
        timestamp: 'invalid-date',
      } as any;

      const result = await service.classifyContent('test', malformedContext);

      expect(result.classification).toBe('safe');
      expect(httpService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          user_id: null,
          user_role: undefined,
          timestamp: 'invalid-date',
        }),
        expect.any(Object)
      );
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle high-frequency classification requests', async () => {
      httpService.post.mockReturnValue(of({
        data: mockSafeModerationResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      const highFrequencyRequests = Array.from({ length: 100 }, (_, i) =>
        service.classifyContent(`High frequency content ${i}`, mockPostContext)
      );

      const startTime = Date.now();
      const results = await Promise.all(highFrequencyRequests);
      const endTime = Date.now();

      expect(results).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(httpService.post).toHaveBeenCalledTimes(100);
    });

    it('should handle memory-intensive batch operations', async () => {
      const largeBatch = Array.from({ length: 1000 }, (_, i) => ({
        text: `Memory intensive content ${i} `.repeat(100), // ~3KB per item
        context: mockPostContext,
      }));

      httpService.post.mockReturnValue(of({
        data: Array(1000).fill(mockSafeModerationResult),
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any));

      const initialMemory = process.memoryUsage().heapUsed;
      const results = await service.batchClassify(largeBatch);
      const finalMemory = process.memoryUsage().heapUsed;

      expect(results).toHaveLength(1000);
      
      // Memory increase should be reasonable (less than 50MB for this test)
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should handle service degradation gracefully', async () => {
      // Simulate service degradation with increasing response times
      let callCount = 0;
      httpService.post.mockImplementation(() => {
        const delay = Math.min(callCount * 100, 2000); // Increasing delay up to 2s
        callCount++;
        
        return new Promise(resolve => {
          setTimeout(() => {
            if (delay > 1000) {
              throw new Error('Service degraded');
            }
            resolve({
              data: mockSafeModerationResult,
              status: 200,
              statusText: 'OK',
              headers: {},
              config: {},
            } as any);
          }, delay);
        });
      }) as any;

      const requests = Array.from({ length: 15 }, (_, i) =>
        service.classifyContent(`Degradation test ${i}`, mockPostContext)
      );

      const results = await Promise.allSettled(requests);

      // Some should succeed (early ones), some should fail (later ones)
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      expect(successful).toBeGreaterThan(0);
      expect(failed).toBeGreaterThan(0);
    });
  });
});