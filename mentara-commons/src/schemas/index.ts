export * from "./messaging";
export * from "./analytics";
export * from "./billing";
export * from "./communities";
export * from "./notifications";
export * from "./onboarding";
export * from "./worksheets";
export * from "./pre-assessment";
export * from "./client";
export * from "./comments";
export * from "./posts";
export * from "./admin";
export * from "./moderator";
export * from "./therapist";
export * from "./search";
export * from "./auth";
export * from "./booking";
export * from "./review";
export * from "./dashboard";
export * from "./meetings";

// User schemas (selective exports to avoid conflicts with auth)
export {
  UserRoleSchema,
  UserSchema,
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
  FirstSignInResponseSchema,
  RolePermissionsSchema,
  RegisterClientDtoSchema,
  UpdateClientDtoSchema,
  DeactivateUserDtoSchema,
  UserDeactivationResponseDtoSchema,
  UserIdParamSchema,
  UserResponseSchema,
  SuccessMessageResponseSchema,
  ApiResponseSchema,
  PaginationMetaSchema,
  PaginatedResponseSchema,
  UserProfileResponseSchema,
  // Types
  type UserRole,
  type User,
  type CreateUserRequest,
  type UpdateUserRequest,
  type FirstSignInResponse,
  type RolePermissions,
  type RegisterClientDto,
  type UpdateClientDto,
  type DeactivateUserDto,
  type UserDeactivationResponseDto,
  type UserIdParam,
  type UserResponse,
  type SuccessMessageResponse,
  type ApiResponse,
  type PaginationMeta,
  type PaginatedResponse,
  type UserProfileResponse
} from "./user";

// Re-export zod for convenience
export { z } from "zod";
