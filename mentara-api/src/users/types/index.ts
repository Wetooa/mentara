/**
 * User Module Types - Central exports for user types and DTOs
 */

// Export all user DTOs
export * from './user.dto';

// Re-export commonly used types for convenience
export type {
  UserIdParam,
  DeactivateUserDto,
  UpdateUserRequest,
  UserDto,
} from './user.dto';