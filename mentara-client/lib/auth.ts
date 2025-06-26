import { createClerkClient } from "@clerk/nextjs/server";

// Types
export type UserRole = "client" | "therapist" | "moderator" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  metadata?: Record<string, unknown>;
}

// Utility to extract role from Clerk sessionClaims or publicMetadata
export async function getUserRoleFromPublicMetadata(
  userId: string
): Promise<UserRole | null> {
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  const user = await clerkClient.users.getUser(userId);
  return user?.publicMetadata.role as UserRole;
}
