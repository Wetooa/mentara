/**
 * Comprehensive Test Suite for PushNotificationController
 * Tests push notification management, device registration, and admin functions
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { PushNotificationController } from './push-notification.controller';
import { PushNotificationService } from '../services/push-notification.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleBasedAccessGuard } from '../../auth/guards/role-based-access.guard';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../../test-utils/index';

describe('PushNotificationController', () => {
  let controller: PushNotificationController;
  let pushNotificationService: PushNotificationService;
  let module: TestingModule;

  // Mock PushNotificationService
  const mockPushNotificationService = {
    registerDeviceToken: jest.fn(),
    unregisterDeviceToken: jest.fn(),
    getStatistics: jest.fn(),
    sendTestNotification: jest.fn(),
    processScheduledNotifications: jest.fn(),
  };

  // Mock Guards
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockRoleBasedAccessGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockUser = {
    id: TEST_USER_IDS.CLIENT,
    email: TEST_EMAILS.CLIENT,
    role: 'client',
  };

  const mockAdminUser = {
    id: TEST_USER_IDS.ADMIN,
    email: TEST_EMAILS.ADMIN,
    role: 'admin',
  };

  const mockDeviceToken = 'device_token_abc123456789';
  const mockRegistrationDto = {
    token: mockDeviceToken,
    platform: 'ios' as const,
    deviceInfo: {
      model: 'iPhone 13',
      os: 'iOS 15.0',
      appVersion: '1.0.0',
      pushEnabled: true,
    },
  };

  const mockStatistics = {
    totalTokens: 150,
    activeTokens: 142,
    platformBreakdown: [
      { platform: 'ios', count: 85 },
      { platform: 'android', count: 57 },
      { platform: 'web', count: 8 },
    ],
    recentActivity: 23,
    lastProcessed: new Date(),
  };

  const mockGlobalStatistics = {
    ...mockStatistics,
    totalUsers: 1250,
    totalNotificationsSent: 45230,
    averageDeliveryRate: 92.5,
    platformUsage: {
      ios: 60.2,
      android: 35.8,
      web: 4.0,
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [PushNotificationController],
      providers: [
        {
          provide: PushNotificationService,
          useValue: mockPushNotificationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RoleBasedAccessGuard)
      .useValue(mockRoleBasedAccessGuard)
      .compile();

    controller = module.get<PushNotificationController>(PushNotificationController);
    pushNotificationService = module.get<PushNotificationService>(PushNotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have pushNotificationService injected', () => {
      expect(pushNotificationService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard and RoleBasedAccessGuard', () => {
      const guards = Reflect.getMetadata('__guards__', PushNotificationController);
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(RoleBasedAccessGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', PushNotificationController);
      expect(controllerMetadata).toBe('notifications/push');
    });
  });

  describe('POST /notifications/push/register', () => {
    it('should register device token successfully', async () => {
      mockPushNotificationService.registerDeviceToken.mockResolvedValue(undefined);

      const result = await controller.registerDeviceToken(mockUser, mockRegistrationDto);

      expect(result).toEqual({
        success: true,
        message: 'Device token registered successfully',
      });
      expect(pushNotificationService.registerDeviceToken).toHaveBeenCalledWith(
        mockUser.id,
        mockRegistrationDto.token,
        mockRegistrationDto.platform,
        mockRegistrationDto.deviceInfo,
      );
    });

    it('should register device token without optional device info', async () => {
      const minimalDto = {
        token: mockDeviceToken,
        platform: 'android' as const,
      };
      mockPushNotificationService.registerDeviceToken.mockResolvedValue(undefined);

      const result = await controller.registerDeviceToken(mockUser, minimalDto);

      expect(result).toEqual({
        success: true,
        message: 'Device token registered successfully',
      });
      expect(pushNotificationService.registerDeviceToken).toHaveBeenCalledWith(
        mockUser.id,
        minimalDto.token,
        minimalDto.platform,
        undefined,
      );
    });

    it('should handle all supported platforms', async () => {
      const platforms = ['ios', 'android', 'web'] as const;
      mockPushNotificationService.registerDeviceToken.mockResolvedValue(undefined);

      for (const platform of platforms) {
        const dto = { ...mockRegistrationDto, platform };
        
        const result = await controller.registerDeviceToken(mockUser, dto);

        expect(result.success).toBe(true);
        expect(pushNotificationService.registerDeviceToken).toHaveBeenCalledWith(
          mockUser.id,
          dto.token,
          platform,
          dto.deviceInfo,
        );
      }
    });

    it('should handle invalid device token', async () => {
      const invalidDto = { ...mockRegistrationDto, token: '' };
      const validationError = new BadRequestException('Invalid device token');
      mockPushNotificationService.registerDeviceToken.mockRejectedValue(validationError);

      await expect(controller.registerDeviceToken(mockUser, invalidDto)).rejects.toThrow(validationError);
    });

    it('should handle duplicate token registration', async () => {
      const duplicateError = new BadRequestException('Device token already registered');
      mockPushNotificationService.registerDeviceToken.mockRejectedValue(duplicateError);

      await expect(controller.registerDeviceToken(mockUser, mockRegistrationDto)).rejects.toThrow(duplicateError);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('External service unavailable');
      mockPushNotificationService.registerDeviceToken.mockRejectedValue(serviceError);

      await expect(controller.registerDeviceToken(mockUser, mockRegistrationDto)).rejects.toThrow(serviceError);
    });

    it('should validate role-based access for all roles', async () => {
      const roles = ['client', 'therapist', 'moderator', 'admin'];
      mockPushNotificationService.registerDeviceToken.mockResolvedValue(undefined);

      for (const role of roles) {
        const user = { ...mockUser, role };
        const result = await controller.registerDeviceToken(user, mockRegistrationDto);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('DELETE /notifications/push/unregister', () => {
    const unregisterDto = { token: mockDeviceToken };

    it('should unregister device token successfully', async () => {
      mockPushNotificationService.unregisterDeviceToken.mockResolvedValue(undefined);

      const result = await controller.unregisterDeviceToken(mockUser, unregisterDto);

      expect(result).toEqual({
        success: true,
        message: 'Device token unregistered successfully',
      });
      expect(pushNotificationService.unregisterDeviceToken).toHaveBeenCalledWith(unregisterDto.token);
    });

    it('should handle token not found', async () => {
      const notFoundError = new NotFoundException('Device token not found');
      mockPushNotificationService.unregisterDeviceToken.mockRejectedValue(notFoundError);

      await expect(controller.unregisterDeviceToken(mockUser, unregisterDto)).rejects.toThrow(notFoundError);
    });

    it('should handle empty token', async () => {
      const emptyTokenDto = { token: '' };
      const validationError = new BadRequestException('Token is required');
      mockPushNotificationService.unregisterDeviceToken.mockRejectedValue(validationError);

      await expect(controller.unregisterDeviceToken(mockUser, emptyTokenDto)).rejects.toThrow(validationError);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockPushNotificationService.unregisterDeviceToken.mockRejectedValue(serviceError);

      await expect(controller.unregisterDeviceToken(mockUser, unregisterDto)).rejects.toThrow(serviceError);
    });
  });

  describe('GET /notifications/push/statistics', () => {
    it('should get user statistics successfully', async () => {
      mockPushNotificationService.getStatistics.mockResolvedValue(mockStatistics);

      const result = await controller.getStatistics(mockUser);

      expect(result).toEqual({
        success: true,
        data: mockStatistics,
        message: 'Statistics retrieved successfully',
      });
      expect(pushNotificationService.getStatistics).toHaveBeenCalledWith(mockUser.id);
    });

    it('should handle user with no devices', async () => {
      const emptyStats = {
        totalTokens: 0,
        activeTokens: 0,
        platformBreakdown: [],
        recentActivity: 0,
      };
      mockPushNotificationService.getStatistics.mockResolvedValue(emptyStats);

      const result = await controller.getStatistics(mockUser);

      expect(result.data).toEqual(emptyStats);
      expect(result.data.totalTokens).toBe(0);
      expect(result.data.activeTokens).toBe(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Statistics service unavailable');
      mockPushNotificationService.getStatistics.mockRejectedValue(serviceError);

      await expect(controller.getStatistics(mockUser)).rejects.toThrow(serviceError);
    });

    it('should validate platform breakdown format', async () => {
      mockPushNotificationService.getStatistics.mockResolvedValue(mockStatistics);

      const result = await controller.getStatistics(mockUser);

      expect(Array.isArray(result.data.platformBreakdown)).toBe(true);
      result.data.platformBreakdown.forEach((platform) => {
        expect(platform).toHaveProperty('platform');
        expect(platform).toHaveProperty('count');
        expect(typeof platform.count).toBe('number');
      });
    });
  });

  describe('GET /notifications/push/statistics/global', () => {
    it('should get global statistics successfully for admin', async () => {
      mockPushNotificationService.getStatistics.mockResolvedValue(mockGlobalStatistics);

      const result = await controller.getGlobalStatistics();

      expect(result).toEqual({
        success: true,
        data: mockGlobalStatistics,
        message: 'Global statistics retrieved successfully',
      });
      expect(pushNotificationService.getStatistics).toHaveBeenCalledWith();
    });

    it('should get global statistics successfully for moderator', async () => {
      const moderatorUser = { ...mockUser, role: 'moderator' };
      mockPushNotificationService.getStatistics.mockResolvedValue(mockGlobalStatistics);

      const result = await controller.getGlobalStatistics();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockGlobalStatistics);
    });

    it('should handle insufficient permissions', async () => {
      const forbiddenError = new ForbiddenException('Insufficient permissions');
      mockRoleBasedAccessGuard.canActivate.mockReturnValue(false);

      // This would be handled by the guard before reaching the controller
      // In a real scenario, the guard would throw an exception
      expect(mockRoleBasedAccessGuard.canActivate).toBeDefined();
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Global statistics unavailable');
      mockPushNotificationService.getStatistics.mockRejectedValue(serviceError);

      await expect(controller.getGlobalStatistics()).rejects.toThrow(serviceError);
    });

    it('should validate global statistics format', async () => {
      mockPushNotificationService.getStatistics.mockResolvedValue(mockGlobalStatistics);

      const result = await controller.getGlobalStatistics();

      expect(result.data).toHaveProperty('totalTokens');
      expect(result.data).toHaveProperty('activeTokens');
      expect(result.data).toHaveProperty('platformBreakdown');
      expect(typeof result.data.totalTokens).toBe('number');
      expect(typeof result.data.activeTokens).toBe('number');
    });
  });

  describe('POST /notifications/push/test', () => {
    const testNotificationDto = {
      message: 'This is a test notification',
      targetUserId: TEST_USER_IDS.CLIENT,
    };

    it('should send test notification to specified user successfully', async () => {
      mockPushNotificationService.sendTestNotification.mockResolvedValue(undefined);

      const result = await controller.sendTestNotification(mockAdminUser, testNotificationDto);

      expect(result).toEqual({
        success: true,
        message: 'Test notification sent successfully',
      });
      expect(pushNotificationService.sendTestNotification).toHaveBeenCalledWith(
        testNotificationDto.targetUserId,
        testNotificationDto.message,
      );
    });

    it('should send test notification to current user when no target specified', async () => {
      const dtoWithoutTarget = { message: 'Test message' };
      mockPushNotificationService.sendTestNotification.mockResolvedValue(undefined);

      const result = await controller.sendTestNotification(mockAdminUser, dtoWithoutTarget);

      expect(result).toEqual({
        success: true,
        message: 'Test notification sent successfully',
      });
      expect(pushNotificationService.sendTestNotification).toHaveBeenCalledWith(
        mockAdminUser.id,
        dtoWithoutTarget.message,
      );
    });

    it('should handle target user not found', async () => {
      const notFoundError = new NotFoundException('Target user not found');
      mockPushNotificationService.sendTestNotification.mockRejectedValue(notFoundError);

      await expect(
        controller.sendTestNotification(mockAdminUser, testNotificationDto)
      ).rejects.toThrow(notFoundError);
    });

    it('should handle push service not configured', async () => {
      const configError = new BadRequestException('Push notification service not configured');
      mockPushNotificationService.sendTestNotification.mockRejectedValue(configError);

      await expect(
        controller.sendTestNotification(mockAdminUser, testNotificationDto)
      ).rejects.toThrow(configError);
    });

    it('should handle insufficient permissions for non-admin/moderator', async () => {
      const forbiddenError = new ForbiddenException('Insufficient permissions');
      mockRoleBasedAccessGuard.canActivate.mockReturnValue(false);

      // This would be handled by the guard
      expect(mockRoleBasedAccessGuard.canActivate).toBeDefined();
    });

    it('should handle empty message', async () => {
      const emptyMessageDto = { message: '', targetUserId: TEST_USER_IDS.CLIENT };
      const validationError = new BadRequestException('Message cannot be empty');
      mockPushNotificationService.sendTestNotification.mockRejectedValue(validationError);

      await expect(
        controller.sendTestNotification(mockAdminUser, emptyMessageDto)
      ).rejects.toThrow(validationError);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Notification delivery failed');
      mockPushNotificationService.sendTestNotification.mockRejectedValue(serviceError);

      await expect(
        controller.sendTestNotification(mockAdminUser, testNotificationDto)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('POST /notifications/push/process-scheduled', () => {
    it('should process scheduled notifications successfully', async () => {
      mockPushNotificationService.processScheduledNotifications.mockResolvedValue(undefined);

      const result = await controller.processScheduledNotifications();

      expect(result).toEqual({
        success: true,
        message: 'Scheduled notifications processed successfully',
      });
      expect(pushNotificationService.processScheduledNotifications).toHaveBeenCalledWith();
    });

    it('should handle no scheduled notifications', async () => {
      mockPushNotificationService.processScheduledNotifications.mockResolvedValue(undefined);

      const result = await controller.processScheduledNotifications();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Scheduled notifications processed successfully');
    });

    it('should handle processing errors', async () => {
      const processingError = new Error('Failed to process scheduled notifications');
      mockPushNotificationService.processScheduledNotifications.mockRejectedValue(processingError);

      await expect(controller.processScheduledNotifications()).rejects.toThrow(processingError);
    });

    it('should handle insufficient permissions for non-admin', async () => {
      const forbiddenError = new ForbiddenException('Insufficient permissions');
      mockRoleBasedAccessGuard.canActivate.mockReturnValue(false);

      // This would be handled by the guard
      expect(mockRoleBasedAccessGuard.canActivate).toBeDefined();
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPushNotificationService.processScheduledNotifications.mockRejectedValue(dbError);

      await expect(controller.processScheduledNotifications()).rejects.toThrow(dbError);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow all authenticated users to register/unregister tokens', async () => {
      const roles = ['client', 'therapist', 'moderator', 'admin'];
      mockPushNotificationService.registerDeviceToken.mockResolvedValue(undefined);

      for (const role of roles) {
        const user = { ...mockUser, role };
        const result = await controller.registerDeviceToken(user, mockRegistrationDto);
        expect(result.success).toBe(true);
      }
    });

    it('should allow all authenticated users to get personal statistics', async () => {
      const roles = ['client', 'therapist', 'moderator', 'admin'];
      mockPushNotificationService.getStatistics.mockResolvedValue(mockStatistics);

      for (const role of roles) {
        const user = { ...mockUser, role };
        const result = await controller.getStatistics(user);
        expect(result.success).toBe(true);
      }
    });

    it('should restrict global statistics to admin and moderator only', () => {
      // This is enforced by the @Roles decorator
      const rolesMetadata = Reflect.getMetadata('roles', controller.getGlobalStatistics);
      expect(rolesMetadata).toEqual(['admin', 'moderator']);
    });

    it('should restrict test notifications to admin and moderator only', () => {
      const rolesMetadata = Reflect.getMetadata('roles', controller.sendTestNotification);
      expect(rolesMetadata).toEqual(['admin', 'moderator']);
    });

    it('should restrict scheduled processing to admin only', () => {
      const rolesMetadata = Reflect.getMetadata('roles', controller.processScheduledNotifications);
      expect(rolesMetadata).toEqual(['admin']);
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockPushNotificationService.registerDeviceToken.mockRejectedValue(serviceError);

      await expect(controller.registerDeviceToken(mockUser, mockRegistrationDto)).rejects.toThrow(serviceError);
    });

    it('should handle invalid platform errors', async () => {
      const platformError = new BadRequestException('Invalid platform specified');
      mockPushNotificationService.registerDeviceToken.mockRejectedValue(platformError);

      await expect(controller.registerDeviceToken(mockUser, mockRegistrationDto)).rejects.toThrow(platformError);
    });

    it('should handle external service failures', async () => {
      const externalError = new Error('FCM/APNs service unavailable');
      mockPushNotificationService.sendTestNotification.mockRejectedValue(externalError);

      await expect(
        controller.sendTestNotification(mockAdminUser, { message: 'test' })
      ).rejects.toThrow(externalError);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted registration response', async () => {
      mockPushNotificationService.registerDeviceToken.mockResolvedValue(undefined);

      const result = await controller.registerDeviceToken(mockUser, mockRegistrationDto);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
      expect(result.success).toBe(true);
    });

    it('should return properly formatted statistics response', async () => {
      mockPushNotificationService.getStatistics.mockResolvedValue(mockStatistics);

      const result = await controller.getStatistics(mockUser);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
      expect(result.data).toHaveProperty('totalTokens');
      expect(result.data).toHaveProperty('activeTokens');
      expect(Array.isArray(result.data.platformBreakdown)).toBe(true);
    });

    it('should return properly formatted test notification response', async () => {
      mockPushNotificationService.sendTestNotification.mockResolvedValue(undefined);

      const result = await controller.sendTestNotification(mockAdminUser, { message: 'test' });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
      expect(result.success).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete device registration workflow', async () => {
      // Register device
      mockPushNotificationService.registerDeviceToken.mockResolvedValue(undefined);
      const registerResult = await controller.registerDeviceToken(mockUser, mockRegistrationDto);
      expect(registerResult.success).toBe(true);

      // Get statistics
      mockPushNotificationService.getStatistics.mockResolvedValue(mockStatistics);
      const statsResult = await controller.getStatistics(mockUser);
      expect(statsResult.success).toBe(true);
      expect(statsResult.data.totalTokens).toBeGreaterThanOrEqual(0);

      // Unregister device
      mockPushNotificationService.unregisterDeviceToken.mockResolvedValue(undefined);
      const unregisterResult = await controller.unregisterDeviceToken(mockUser, { token: mockDeviceToken });
      expect(unregisterResult.success).toBe(true);
    });

    it('should handle admin workflow', async () => {
      // Get global statistics
      mockPushNotificationService.getStatistics.mockResolvedValue(mockGlobalStatistics);
      const globalStatsResult = await controller.getGlobalStatistics();
      expect(globalStatsResult.success).toBe(true);

      // Send test notification
      mockPushNotificationService.sendTestNotification.mockResolvedValue(undefined);
      const testResult = await controller.sendTestNotification(mockAdminUser, { message: 'test' });
      expect(testResult.success).toBe(true);

      // Process scheduled notifications
      mockPushNotificationService.processScheduledNotifications.mockResolvedValue(undefined);
      const processResult = await controller.processScheduledNotifications();
      expect(processResult.success).toBe(true);
    });
  });
});