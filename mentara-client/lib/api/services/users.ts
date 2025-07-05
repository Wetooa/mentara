import { AxiosInstance } from 'axios';

// Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'client' | 'therapist' | 'moderator' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface FirstSignInResponse {
  isFirstSignIn: boolean;
}

// User service factory
export const createUserService = (client: AxiosInstance) => ({
  // Get all users
  getAll: (): Promise<User[]> =>
    client.get('/users'),

  // Get user by ID
  getOne: (id: string): Promise<User> =>
    client.get(`/users/${id}`),

  // Create new user
  create: (data: CreateUserRequest): Promise<User> =>
    client.post('/users', data),

  // Update user
  update: (id: string, data: UpdateUserRequest): Promise<User> =>
    client.put(`/users/${id}`, data),

  // Delete user
  delete: (id: string): Promise<void> =>
    client.delete(`/users/${id}`),

  // Check if user is signing in for the first time
  isFirstSignIn: (userId: string): Promise<FirstSignInResponse> =>
    client.get(`/users/is-first-signin/${userId}`),
});

export type UserService = ReturnType<typeof createUserService>;