import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleBasedAccessGuard } from '../auth/guards/role-based-access.guard';

describe('Role-Based Access Control Validation', () => {
  let guard: RoleBasedAccessGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleBasedAccessGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RoleBasedAccessGuard>(RoleBasedAccessGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockContext = (user: any): ExecutionContext => {
    const mockRequest = {
      user,
      userRole: user?.role,
      userId: user?.userId,
      params: {},
      body: {},
      path: '/test',
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  describe('Client Role Validation', () => {
    const clientUser = {
      userId: 'client-123',
      role: 'client',
      email: 'client@test.com',
    };

    it('should allow client to access own resources', () => {
      const context = createMockContext(clientUser);
      context.switchToHttp().getRequest().params.id = 'client-123';

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(['assessments:read:own']) // permissions
        .mockReturnValueOnce(null) // min_role
        .mockReturnValueOnce('id'); // resource_owner_param

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny client access to admin functions', () => {
      const context = createMockContext(clientUser);

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(['admin:access']) // permissions
        .mockReturnValueOnce(null) // min_role
        .mockReturnValueOnce(null); // resource_owner_param

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny client access to other client resources', () => {
      const context = createMockContext(clientUser);
      context.switchToHttp().getRequest().params.id = 'other-client-456';

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(null) // permissions
        .mockReturnValueOnce(null) // min_role
        .mockReturnValueOnce('id'); // resource_owner_param

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('Therapist Role Validation', () => {
    const therapistUser = {
      userId: 'therapist-123',
      role: 'therapist',
      email: 'therapist@test.com',
    };

    it('should allow therapist to access therapist functions', () => {
      const context = createMockContext(therapistUser);

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(['sessions:create']) // permissions
        .mockReturnValueOnce(null) // min_role
        .mockReturnValueOnce(null); // resource_owner_param

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow therapist to access assigned client data', () => {
      const context = createMockContext(therapistUser);
      context.switchToHttp().getRequest().params.clientId = 'client-456';

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(['assessments:read:assigned']) // permissions
        .mockReturnValueOnce(null) // min_role
        .mockReturnValueOnce(null); // resource_owner_param

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny therapist access to admin functions', () => {
      const context = createMockContext(therapistUser);

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(['admin:system-config']) // permissions
        .mockReturnValueOnce(null) // min_role
        .mockReturnValueOnce(null); // resource_owner_param

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('Moderator Role Validation', () => {
    const moderatorUser = {
      userId: 'moderator-123',
      role: 'moderator',
      email: 'moderator@test.com',
    };

    it('should allow moderator to access moderation functions', () => {
      const context = createMockContext(moderatorUser);

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(['posts:moderate']) // permissions
        .mockReturnValueOnce(null) // min_role
        .mockReturnValueOnce(null); // resource_owner_param

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow moderator to access community resources', () => {
      const context = createMockContext(moderatorUser);
      context.switchToHttp().getRequest().path = '/communities/123/posts';
      context.switchToHttp().getRequest().params.id = 'post-456';

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(null) // permissions
        .mockReturnValueOnce(null) // min_role
        .mockReturnValueOnce('id'); // resource_owner_param

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny moderator access to system admin functions', () => {
      const context = createMockContext(moderatorUser);

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(['admin:system-config']) // permissions
        .mockReturnValueOnce(null) // min_role
        .mockReturnValueOnce(null); // resource_owner_param

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('Admin Role Validation', () => {
    const adminUser = {
      userId: 'admin-123',
      role: 'admin',
      email: 'admin@test.com',
    };

    it('should allow admin to access all functions', () => {
      const context = createMockContext(adminUser);

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(['admin:system-config']) // permissions
        .mockReturnValueOnce(null) // min_role
        .mockReturnValueOnce(null); // resource_owner_param

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow admin to access any resource', () => {
      const context = createMockContext(adminUser);
      context.switchToHttp().getRequest().params.id = 'any-resource-123';

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(null) // permissions
        .mockReturnValueOnce(null) // min_role
        .mockReturnValueOnce('id'); // resource_owner_param

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow admin minimum role access', () => {
      const context = createMockContext(adminUser);

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(null) // permissions
        .mockReturnValueOnce('admin') // min_role
        .mockReturnValueOnce(null); // resource_owner_param

      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('Role Hierarchy Validation', () => {
    it('should respect role hierarchy for minimum role requirements', () => {
      const moderatorUser = {
        userId: 'moderator-123',
        role: 'moderator',
        email: 'moderator@test.com',
      };

      const context = createMockContext(moderatorUser);

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(null) // permissions
        .mockReturnValueOnce('therapist') // min_role (moderator > therapist)
        .mockReturnValueOnce(null); // resource_owner_param

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access when role is below minimum requirement', () => {
      const clientUser = {
        userId: 'client-123',
        role: 'client',
        email: 'client@test.com',
      };

      const context = createMockContext(clientUser);

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(null) // permissions
        .mockReturnValueOnce('therapist') // min_role (client < therapist)
        .mockReturnValueOnce(null); // resource_owner_param

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('No Authentication Validation', () => {
    it('should deny access when no user is provided', () => {
      const context = createMockContext(null);

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(['users:read:own']) // permissions
        .mockReturnValueOnce(null) // min_role
        .mockReturnValueOnce(null); // resource_owner_param

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should deny access when user has no role', () => {
      const userWithoutRole = {
        userId: 'user-123',
        email: 'user@test.com',
      };

      const context = createMockContext(userWithoutRole);

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(['users:read:own']) // permissions
        .mockReturnValueOnce(null) // min_role
        .mockReturnValueOnce(null); // resource_owner_param

      expect(guard.canActivate(context)).toBe(false);
    });
  });
});

describe('Permission Helper Functions', () => {
  describe('getUserPermissions', () => {
    it('should return correct permissions for client role', () => {
      const permissions = RoleBasedAccessGuard.getUserPermissions('client');
      expect(permissions).toContain('assessments:create:own');
      expect(permissions).toContain('sessions:read:own');
      expect(permissions).not.toContain('admin:access');
    });

    it('should return correct permissions for admin role', () => {
      const permissions = RoleBasedAccessGuard.getUserPermissions('admin');
      expect(permissions).toContain('admin:access');
      expect(permissions).toContain('users:delete');
      expect(permissions.length).toBeGreaterThan(10);
    });
  });

  describe('canAccessResource', () => {
    it('should allow admin to access any resource', () => {
      const canAccess = RoleBasedAccessGuard.canAccessResource('admin', 'users:delete');
      expect(canAccess).toBe(true);
    });

    it('should allow resource owner to access their own resource', () => {
      const canAccess = RoleBasedAccessGuard.canAccessResource(
        'client', 
        'assessments:read:own', 
        'user-123', 
        'user-123'
      );
      expect(canAccess).toBe(true);
    });

    it('should deny access to unauthorized resource', () => {
      const canAccess = RoleBasedAccessGuard.canAccessResource(
        'client', 
        'admin:access'
      );
      expect(canAccess).toBe(false);
    });
  });
});

// Integration test for common scenarios
describe('Role-Based Access Integration Tests', () => {
  let guard: RoleBasedAccessGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleBasedAccessGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RoleBasedAccessGuard>(RoleBasedAccessGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const scenarios = [
    {
      name: 'Client accessing own assessment',
      user: { userId: 'client-123', role: 'client' },
      permissions: ['assessments:read:own'],
      resourceOwnerParam: 'userId',
      resourceId: 'client-123',
      shouldPass: true,
    },
    {
      name: 'Client accessing other client assessment',
      user: { userId: 'client-123', role: 'client' },
      permissions: ['assessments:read:own'],
      resourceOwnerParam: 'userId',
      resourceId: 'client-456',
      shouldPass: false,
    },
    {
      name: 'Therapist creating session',
      user: { userId: 'therapist-123', role: 'therapist' },
      permissions: ['sessions:create'],
      resourceOwnerParam: null,
      resourceId: null,
      shouldPass: true,
    },
    {
      name: 'Therapist accessing admin functions',
      user: { userId: 'therapist-123', role: 'therapist' },
      permissions: ['admin:access'],
      resourceOwnerParam: null,
      resourceId: null,
      shouldPass: false,
    },
    {
      name: 'Moderator accessing moderation functions',
      user: { userId: 'moderator-123', role: 'moderator' },
      permissions: ['posts:moderate'],
      resourceOwnerParam: null,
      resourceId: null,
      shouldPass: true,
    },
    {
      name: 'Admin accessing everything',
      user: { userId: 'admin-123', role: 'admin' },
      permissions: ['admin:system-config'],
      resourceOwnerParam: 'id',
      resourceId: 'any-resource',
      shouldPass: true,
    },
  ];

  scenarios.forEach(scenario => {
    it(scenario.name, () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: scenario.user,
            userRole: scenario.user.role,
            userId: scenario.user.userId,
            params: { [scenario.resourceOwnerParam || 'id']: scenario.resourceId },
            body: {},
            path: '/test',
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      jest.spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(scenario.permissions)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(scenario.resourceOwnerParam);

      if (scenario.shouldPass) {
        expect(guard.canActivate(context)).toBe(true);
      } else {
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      }
    });
  });
});