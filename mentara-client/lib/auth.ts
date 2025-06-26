export type UserRole = "client" | "therapist" | "moderator" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  metadata?: Record<string, unknown>;
}
