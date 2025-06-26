<<<<<<< HEAD
=======
// Types
>>>>>>> 370c253f5291a6f156c41c45aa1da22a5b06d279
export type UserRole = "client" | "therapist" | "moderator" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  metadata?: Record<string, unknown>;
}
