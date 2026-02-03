import { SetMetadata } from '@nestjs/common';

// Role-based decorators
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Specific role decorators for convenience
export const AdminOnly = () => SetMetadata(ROLES_KEY, ['admin']);
export const ModeratorOnly = () => SetMetadata(ROLES_KEY, ['moderator']);
export const TherapistOnly = () => SetMetadata(ROLES_KEY, ['therapist']);
export const ClientOnly = () => SetMetadata(ROLES_KEY, ['client']);

// Combined role decorators
const ModeratorOrAdmin = () =>
  SetMetadata(ROLES_KEY, ['moderator', 'admin']);
const TherapistOrAdmin = () =>
  SetMetadata(ROLES_KEY, ['therapist', 'admin']);

// Permission-based decorators
const PERMISSIONS_KEY = 'permissions';
const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// Resource ownership decorator
const RESOURCE_OWNER_KEY = 'resource_owner';
const AllowResourceOwner = (paramName: string = 'id') =>
  SetMetadata(RESOURCE_OWNER_KEY, paramName);

// Combined decorators for common scenarios
const AdminOrResourceOwner =
  (paramName: string = 'id') =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(ROLES_KEY, ['admin'])(target, propertyKey, descriptor);
    SetMetadata(RESOURCE_OWNER_KEY, paramName)(target, propertyKey, descriptor);
  };

const TherapistOrResourceOwner =
  (paramName: string = 'id') =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(ROLES_KEY, ['therapist', 'admin'])(
      target,
      propertyKey,
      descriptor,
    );
    SetMetadata(RESOURCE_OWNER_KEY, paramName)(target, propertyKey, descriptor);
  };

// Therapy session access (therapist assigned to client or admin)
const TherapySessionAccess = () =>
  RequirePermissions('sessions:read:own', 'sessions:read:all');

// Assessment access (client's own assessments, assigned therapist, or admin)
const AssessmentAccess = () =>
  RequirePermissions(
    'assessments:read:own',
    'assessments:read:assigned',
    'assessments:read:all',
  );

// Moderation access (moderators and admins)
const ModerationAccess = () =>
  RequirePermissions(
    'posts:moderate',
    'communities:moderate',
    'messages:moderate',
  );
