import { AxiosInstance } from 'axios';
import {
  User,
  CreateUserRequest,
  CreateUserRequestSchema,
  UpdateUserRequest,
  UpdateUserRequestSchema,
  FirstSignInResponse,
  UserIdParam,
  UserIdParamSchema,
} from 'mentara-commons';

// Re-export commons types for backward compatibility
export type { User, CreateUserRequest, UpdateUserRequest, FirstSignInResponse, UserIdParam };

// User service factory
export const createUserService = (client: AxiosInstance) => ({
  // Get all users (admin only)
  getAll: (): Promise<User[]> =>
    client.get('/users'),

  // Get all users including inactive (admin only)  
  getAllIncludingInactive: (): Promise<User[]> =>
    client.get('/users/all-including-inactive'),

  // Get user by ID with Zod validation
  getOne: async (id: string): Promise<User> => {
    const validatedId = UserIdParamSchema.parse({ id });
    return client.get(`/users/${validatedId.id}`);
  },

  // Create new user with Zod validation (handled by auth service)
  create: async (data: CreateUserRequest): Promise<User> => {
    const validatedData = CreateUserRequestSchema.parse(data);
    return client.post('/users', validatedData);
  },

  // Update user with Zod validation
  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const validatedId = UserIdParamSchema.parse({ id });
    const validatedData = UpdateUserRequestSchema.parse(data);
    return client.put(`/users/${validatedId.id}`, validatedData);
  },

  // Delete/deactivate user with ID validation
  delete: async (id: string): Promise<{ message: string }> => {
    const validatedId = UserIdParamSchema.parse({ id });
    return client.delete(`/users/${validatedId.id}`);
  },

  // Admin deactivate user with reason and ID validation
  deactivate: async (id: string, reason?: string): Promise<{ message: string }> => {
    const validatedId = UserIdParamSchema.parse({ id });
    // Note: Should add DeactivateUserDtoSchema when available in commons
    return client.post(`/users/${validatedId.id}/deactivate`, { reason });
  },

  // Admin reactivate user with ID validation
  reactivate: async (id: string): Promise<{ message: string }> => {
    const validatedId = UserIdParamSchema.parse({ id });
    return client.post(`/users/${validatedId.id}/reactivate`);
  },
});

export type UserService = ReturnType<typeof createUserService>;