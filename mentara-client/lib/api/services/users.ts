import { AxiosInstance } from 'axios';
import type { User, CreateUserRequest, UpdateUserRequest, FirstSignInResponse } from 'mentara-commons';

// Re-export types for backward compatibility
export type { User, CreateUserRequest, UpdateUserRequest, FirstSignInResponse };

// User service factory
export const createUserService = (client: AxiosInstance) => ({
  // Get all users (admin only)
  getAll: (): Promise<User[]> =>
    client.get('/users'),

  // Get all users including inactive (admin only)  
  getAllIncludingInactive: (): Promise<User[]> =>
    client.get('/users/all-including-inactive'),

  // Get user by ID
  getOne: (id: string): Promise<User> =>
    client.get(`/users/${id}`),

  // Create new user (handled by auth service)
  create: (data: CreateUserRequest): Promise<User> =>
    client.post('/users', data),

  // Update user
  update: (id: string, data: UpdateUserRequest): Promise<User> =>
    client.put(`/users/${id}`, data),

  // Delete/deactivate user
  delete: (id: string): Promise<{ message: string }> =>
    client.delete(`/users/${id}`),

  // Admin deactivate user with reason
  deactivate: (id: string, reason?: string): Promise<{ message: string }> =>
    client.post(`/users/${id}/deactivate`, { reason }),

  // Admin reactivate user
  reactivate: (id: string): Promise<{ message: string }> =>
    client.post(`/users/${id}/reactivate`),
});;

export type UserService = ReturnType<typeof createUserService>;