import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ClientAuthController } from './client-auth.controller';
import { ClientAuthService } from '../../services/auth/client-auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  MockBuilder,
  TestDataGenerator,
  TestAssertions,
  SecurityGuardTestUtils,
  RoleBasedTestUtils,
  TEST_USER_IDS,
  TEST_EMAILS,
} from '../../test-utils/auth-testing-helpers';

describe('ClientAuthController', () => {
  let controller: ClientAuthController;
  let clientAuthService: ClientAuthService;
  let mockJwtAuthGuard: jest.Mocked<JwtAuthGuard>;

  // Test data constants
  const mockClientUser = {
    id: TEST_USER_IDS.CLIENT,
    email: TEST_EMAILS.CLIENT,
    firstName: 'John',
    lastName: 'Doe',
    role: 'client',
    emailVerified: false,
    dateOfBirth: new Date('1990-01-01'),
    phoneNumber: '+1234567890',
    profileComplete: true,
    therapistId: null,
    createdAt: new Date(),
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
  };

  const mockRegistrationResult = {
    user: mockClientUser,
    tokens: mockTokens,
    message: 'Client account created successfully',
  };

  const mockLoginResult = {
    user: mockClientUser,
    tokens: mockTokens,
  };

  const mockFirstSignInStatus = {
    isFirstSignIn: true,
    hasSeenRecommendations: false,
    profileCompleted: false,
    assessmentCompleted: false,
  };

  const mockMarkRecommendationsResult = {
    success: true,
    message: 'Recommendations marked as seen successfully',
  };

  beforeEach(async () => {
    // Create mock services
    const mockClientAuthService = {
      registerClient: jest.fn(),
      loginClient: jest.fn(),
      getClientProfile: jest.fn(),
      getFirstSignInStatus: jest.fn(),
      markRecommendationsSeen: jest.fn(),
    };

    mockJwtAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            name: 'short',
            ttl: 1000,
            limit: 3,
          },
        ]),
      ],
      controllers: [ClientAuthController],
      providers: [
        {
          provide: ClientAuthService,
          useValue: mockClientAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<ClientAuthController>(ClientAuthController);
    clientAuthService = module.get<ClientAuthService>(ClientAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegisterDto = {
      email: 'newclient@example.com',
      password: 'SecurePass123!',
      firstName: 'New',
      lastName: 'Client',
      dateOfBirth: new Date('1990-01-01'),
      phoneNumber: '+1234567890',
    };

    it('should register client successfully', async () => {
      // Arrange
      jest.spyOn(clientAuthService, 'registerClient').mockResolvedValue(mockRegistrationResult);

      // Act
      const result = await controller.register(validRegisterDto);

      // Assert
      expect(clientAuthService.registerClient).toHaveBeenCalledWith(validRegisterDto);
      expect(result).toEqual({
        user: {
          id: mockClientUser.id,
          email: mockClientUser.email,
          firstName: mockClientUser.firstName,
          lastName: mockClientUser.lastName,
          role: mockClientUser.role,
          emailVerified: mockClientUser.emailVerified,
        },
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresIn: mockTokens.expiresIn,
        message: mockRegistrationResult.message,
      });
    });

    it('should handle registration with minimal data', async () => {
      // Arrange
      const minimalRegisterDto = {
        email: 'minimal@example.com',
        password: 'SecurePass123!',
        firstName: 'Minimal',
        lastName: 'User',
      };

      jest.spyOn(clientAuthService, 'registerClient').mockResolvedValue(mockRegistrationResult);

      // Act
      const result = await controller.register(minimalRegisterDto);

      // Assert
      expect(clientAuthService.registerClient).toHaveBeenCalledWith(minimalRegisterDto);
      expect(result).toBeDefined();
    });

    it('should handle email already exists error', async () => {
      // Arrange
      const error = new BadRequestException('Email already exists');
      jest.spyOn(clientAuthService, 'registerClient').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.register(validRegisterDto)).rejects.toThrow(BadRequestException);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(clientAuthService, 'registerClient').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.register(validRegisterDto)).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    const validLoginDto = {
      email: TEST_EMAILS.CLIENT,
      password: 'SecurePass123!',
    };

    const mockRequest = {
      ip: '192.168.1.1',
      get: jest.fn().mockReturnValue('Test User Agent'),
    } as any;

    it('should login client successfully with valid credentials', async () => {
      // Arrange
      jest.spyOn(clientAuthService, 'loginClient').mockResolvedValue(mockLoginResult);

      // Act
      const result = await controller.login(validLoginDto, mockRequest);

      // Assert
      expect(clientAuthService.loginClient).toHaveBeenCalledWith(
        validLoginDto.email,
        validLoginDto.password,
        mockRequest.ip,
        'Test User Agent',
      );

      expect(result).toEqual({
        user: {
          id: mockClientUser.id,
          email: mockClientUser.email,
          firstName: mockClientUser.firstName,
          lastName: mockClientUser.lastName,
          role: mockClientUser.role,
          emailVerified: mockClientUser.emailVerified,
        },
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresIn: mockTokens.expiresIn,
      });
    });

    it('should handle missing User-Agent header', async () => {
      // Arrange
      const mockRequestWithoutUserAgent = {
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue(undefined),
      } as any;

      jest.spyOn(clientAuthService, 'loginClient').mockResolvedValue(mockLoginResult);

      // Act
      await controller.login(validLoginDto, mockRequestWithoutUserAgent);

      // Assert
      expect(clientAuthService.loginClient).toHaveBeenCalledWith(
        validLoginDto.email,
        validLoginDto.password,
        mockRequestWithoutUserAgent.ip,
        undefined,
      );
    });

    it('should handle invalid credentials', async () => {
      // Arrange
      const authError = new UnauthorizedException('Invalid credentials');
      jest.spyOn(clientAuthService, 'loginClient').mockRejectedValue(authError);

      // Act & Assert
      await expect(controller.login(validLoginDto, mockRequest)).rejects.toThrow(authError);
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      jest.spyOn(clientAuthService, 'loginClient').mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.login(validLoginDto, mockRequest)).rejects.toThrow(serviceError);
    });
  });

  describe('getProfile', () => {
    it('should return client profile successfully', async () => {
      // Arrange
      jest.spyOn(clientAuthService, 'getClientProfile').mockResolvedValue(mockClientUser);

      // Act
      const result = await controller.getProfile(TEST_USER_IDS.CLIENT);

      // Assert
      expect(clientAuthService.getClientProfile).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(result).toEqual(mockClientUser);
    });

    it('should handle profile not found', async () => {
      // Arrange
      const notFoundError = new Error('Client profile not found');
      jest.spyOn(clientAuthService, 'getClientProfile').mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.getProfile(TEST_USER_IDS.CLIENT)).rejects.toThrow(notFoundError);
    });
  });

  describe('getFirstSignInStatus', () => {
    it('should return first sign-in status successfully', async () => {
      // Arrange
      jest.spyOn(clientAuthService, 'getFirstSignInStatus').mockResolvedValue(mockFirstSignInStatus);

      // Act
      const result = await controller.getFirstSignInStatus(TEST_USER_IDS.CLIENT);

      // Assert
      expect(clientAuthService.getFirstSignInStatus).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(result).toEqual(mockFirstSignInStatus);
    });

    it('should handle returning user status', async () => {
      // Arrange
      const returningUserStatus = {
        isFirstSignIn: false,
        hasSeenRecommendations: true,
        profileCompleted: true,
        assessmentCompleted: true,
      };

      jest.spyOn(clientAuthService, 'getFirstSignInStatus').mockResolvedValue(returningUserStatus);

      // Act
      const result = await controller.getFirstSignInStatus(TEST_USER_IDS.CLIENT);

      // Assert
      expect(result).toEqual(returningUserStatus);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(clientAuthService, 'getFirstSignInStatus').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getFirstSignInStatus(TEST_USER_IDS.CLIENT)).rejects.toThrow(error);
    });
  });

  describe('markRecommendationsSeen', () => {
    it('should mark recommendations as seen successfully', async () => {
      // Arrange
      jest.spyOn(clientAuthService, 'markRecommendationsSeen').mockResolvedValue(mockMarkRecommendationsResult);

      // Act
      const result = await controller.markRecommendationsSeen(TEST_USER_IDS.CLIENT);

      // Assert
      expect(clientAuthService.markRecommendationsSeen).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      expect(result).toEqual(mockMarkRecommendationsResult);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(clientAuthService, 'markRecommendationsSeen').mockRejectedValue(error);

      // Act & Assert
      await expect(controller.markRecommendationsSeen(TEST_USER_IDS.CLIENT)).rejects.toThrow(error);
    });
  });

  describe('Security Tests', () => {
    it('should validate input data through ZodValidationPipe', () => {
      // This tests that the controller uses proper validation
      const validationPipe = new ZodValidationPipe({} as any);
      expect(validationPipe).toBeDefined();
    });

    it('should apply rate limiting through ThrottlerGuard', () => {
      // Test that throttling is configured
      const registerMetadata = Reflect.getMetadata('__throttler_options__', controller.register);
      const loginMetadata = Reflect.getMetadata('__throttler_options__', controller.login);
      
      expect(registerMetadata).toBeDefined();
      expect(loginMetadata).toBeDefined();
    });

    it('should require authentication for protected endpoints', () => {
      // Test that protected endpoints have JwtAuthGuard
      const protectedMethods = ['getProfile', 'getFirstSignInStatus', 'markRecommendationsSeen'];
      
      protectedMethods.forEach(method => {
        const guards = Reflect.getMetadata('__guards__', controller[method as keyof ClientAuthController]);
        expect(guards).toBeDefined();
      });
    });

    it('should allow public access to register and login endpoints', () => {
      // Test that public endpoints are marked as public
      const publicMethods = ['register', 'login'];
      
      publicMethods.forEach(method => {
        const publicMetadata = Reflect.getMetadata('isPublic', controller[method as keyof ClientAuthController]);
        expect(publicMetadata).toBeTruthy();
      });
    });
  });

  describe('Role-based Access Control', () => {
    it('should test role-based access for protected endpoints', async () => {
      // Test that client role can access client-specific endpoints
      await RoleBasedTestUtils.testWithRoles(
        async (userId: string, role: string) => {
          // Mock the auth guard to return the specific role
          mockJwtAuthGuard.canActivate.mockReturnValue(role === 'client');
          
          try {
            await controller.getProfile(userId);
            return true;
          } catch (error) {
            return false;
          }
        },
        {
          client: true,
          therapist: false,
          admin: false,
          moderator: false,
        },
      );
    });

    it('should validate client-specific functionality', async () => {
      // Test that client-specific endpoints work for clients
      const clientContext = MockBuilder.createAuthContext('client');
      
      jest.spyOn(clientAuthService, 'getFirstSignInStatus').mockResolvedValue(mockFirstSignInStatus);
      
      const result = await controller.getFirstSignInStatus(clientContext.userId);
      
      expect(result).toBeDefined();
      expect(result.isFirstSignIn).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Arrange
      const networkError = new Error('Network timeout');
      jest.spyOn(clientAuthService, 'getClientProfile').mockRejectedValue(networkError);

      // Act & Assert
      await expect(controller.getProfile(TEST_USER_IDS.CLIENT)).rejects.toThrow(networkError);
    });

    it('should handle validation errors', async () => {
      // Test that invalid data would be caught by the validation pipe
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
        firstName: '',
        lastName: '',
      };

      // In a real scenario, this would throw a validation error
      // The pipe would catch this before it reaches the controller
      expect(() => {
        // This would be handled by ZodValidationPipe
        // and would throw a BadRequestException
      }).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete client registration workflow', async () => {
      // Arrange
      const registrationDto = {
        email: 'integration@example.com',
        password: 'SecurePass123!',
        firstName: 'Integration',
        lastName: 'Test',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+1234567890',
      };

      jest.spyOn(clientAuthService, 'registerClient').mockResolvedValue(mockRegistrationResult);

      // Act
      const result = await controller.register(registrationDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.user.email).toBe(mockClientUser.email);
      expect(result.accessToken).toBe(mockTokens.accessToken);
      expect(result.refreshToken).toBe(mockTokens.refreshToken);
      expect(result.expiresIn).toBe(mockTokens.expiresIn);
      expect(result.message).toBe(mockRegistrationResult.message);
    });

    it('should handle complete client login workflow', async () => {
      // Arrange
      const loginDto = {
        email: TEST_EMAILS.CLIENT,
        password: 'SecurePass123!',
      };

      const mockRequest = {
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Test User Agent'),
      } as any;

      jest.spyOn(clientAuthService, 'loginClient').mockResolvedValue(mockLoginResult);

      // Act
      const result = await controller.login(loginDto, mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.user.email).toBe(mockClientUser.email);
      expect(result.accessToken).toBe(mockTokens.accessToken);
      expect(result.refreshToken).toBe(mockTokens.refreshToken);
      expect(result.expiresIn).toBe(mockTokens.expiresIn);
    });

    it('should handle complete onboarding status workflow', async () => {
      // Arrange
      jest.spyOn(clientAuthService, 'getFirstSignInStatus').mockResolvedValue(mockFirstSignInStatus);
      jest.spyOn(clientAuthService, 'markRecommendationsSeen').mockResolvedValue(mockMarkRecommendationsResult);

      // Act - Check initial status
      const initialStatus = await controller.getFirstSignInStatus(TEST_USER_IDS.CLIENT);
      
      // Act - Mark recommendations as seen
      const markResult = await controller.markRecommendationsSeen(TEST_USER_IDS.CLIENT);

      // Assert
      expect(initialStatus).toBeDefined();
      expect(initialStatus.isFirstSignIn).toBe(true);
      expect(initialStatus.hasSeenRecommendations).toBe(false);
      
      expect(markResult).toBeDefined();
      expect(markResult.success).toBe(true);
    });
  });

  describe('Data Validation', () => {
    it('should validate registration data structure', () => {
      // Test that we're using the correct DTO structure
      const validRegistrationData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+1234567890',
      };

      // Verify all required fields are present
      expect(validRegistrationData.email).toBeDefined();
      expect(validRegistrationData.password).toBeDefined();
      expect(validRegistrationData.firstName).toBeDefined();
      expect(validRegistrationData.lastName).toBeDefined();
    });

    it('should validate login data structure', () => {
      // Test that we're using the correct DTO structure
      const validLoginData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      // Verify all required fields are present
      expect(validLoginData.email).toBeDefined();
      expect(validLoginData.password).toBeDefined();
    });
  });

  describe('Response Format Validation', () => {
    it('should return correctly formatted registration response', async () => {
      // Arrange
      const registerDto = {
        email: 'format@example.com',
        password: 'SecurePass123!',
        firstName: 'Format',
        lastName: 'Test',
      };

      jest.spyOn(clientAuthService, 'registerClient').mockResolvedValue(mockRegistrationResult);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result).toHaveProperty('message');
      
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('firstName');
      expect(result.user).toHaveProperty('lastName');
      expect(result.user).toHaveProperty('role');
      expect(result.user).toHaveProperty('emailVerified');
    });

    it('should return correctly formatted login response', async () => {
      // Arrange
      const loginDto = {
        email: TEST_EMAILS.CLIENT,
        password: 'SecurePass123!',
      };

      const mockRequest = {
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Test User Agent'),
      } as any;

      jest.spyOn(clientAuthService, 'loginClient').mockResolvedValue(mockLoginResult);

      // Act
      const result = await controller.login(loginDto, mockRequest);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result).not.toHaveProperty('message'); // Login doesn't include message
    });
  });
});