// Local user types for JWT authentication system

export interface UserListParams {
  limit?: number;
  offset?: number;
  emailAddress?: string[];
  query?: string;
  orderBy?: 'created_at' | 'last_active_at' | 'email_address';
}

export interface UpdateUserParams {
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  emailAddress?: string;
  password?: string;
}

export interface CreateUserParams {
  emailAddress: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'client' | 'therapist' | 'admin' | 'moderator';
}
