import { clerkClient } from "@clerk/nextjs/server";
import { generateSecurePassword } from "./utils";

// Types
export type UserRole = "user" | "therapist" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  metadata?: Record<string, unknown>;
}

// Helper functions
export async function createUserAccount({
  email,
  password,
  firstName,
  lastName,
  role,
  metadata = {},
}: {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  metadata?: Record<string, unknown>;
}): Promise<AuthUser | null> {
  try {
    // Generate password if not provided
    const userPassword = password || generateSecurePassword(12);

    const clerk = await clerkClient();

    // Create user in Clerk
    const clerkUser = await clerk.users.createUser({
      emailAddress: [email],
      password: userPassword,
      firstName,
      lastName,
      publicMetadata: {
        role,
        ...metadata,
      },
    });

    return {
      id: clerkUser.id,
      email: email,
      role,
      firstName,
      lastName,
      metadata: {
        ...metadata,
        clerkId: clerkUser.id,
      },
    };
  } catch (error) {
    console.error("Failed to create user account:", error);
    return null;
  }
}

export async function updateUserRole(userId: string, role: UserRole) {
  try {
    const clerk = await clerkClient();
    await clerk.users.updateUser(userId, {
      publicMetadata: {
        role,
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to update user role:", error);
    return false;
  }
}

export async function deleteUserAccount(userId: string) {
  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(userId);
    return true;
  } catch (error) {
    console.error("Failed to delete user account:", error);
    return false;
  }
}

// Role-based access control
export function hasRole(
  user: AuthUser | null,
  requiredRole: UserRole
): boolean {
  if (!user) return false;
  return user.role === requiredRole;
}

export function hasAnyRole(user: AuthUser | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

// Utility to extract role from Clerk sessionClaims or publicMetadata
export function getUserRoleFromPublicMetadata(
  sessionClaimsOrUser: any
): UserRole | null {
  if (!sessionClaimsOrUser) return null;
  // Clerk sessionClaims: { publicMetadata: { role: ... } }
  if (
    sessionClaimsOrUser.publicMetadata &&
    sessionClaimsOrUser.publicMetadata.role
  ) {
    return sessionClaimsOrUser.publicMetadata.role as UserRole;
  }
  // Clerk user object: { publicMetadata: { role: ... } }
  if (
    sessionClaimsOrUser.user &&
    sessionClaimsOrUser.user.publicMetadata &&
    sessionClaimsOrUser.user.publicMetadata.role
  ) {
    return sessionClaimsOrUser.user.publicMetadata.role as UserRole;
  }
  return null;
}
