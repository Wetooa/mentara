import { clerkClient } from "@clerk/nextjs/server";
import { generateSecurePassword } from "./utils";
import * as emailjs from "@emailjs/nodejs";

// EmailJS configuration
const emailjsConfig = {
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "",
  privateKey: process.env.EMAILJS_PRIVATE_KEY || "",
};

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
export async function sendVerificationEmail(
  email: string,
  template: string,
  params: Record<string, unknown>
) {
  try {
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
      template,
      params,
      emailjsConfig
    );
    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
}

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

    // Create user in Clerk
    const clerkUser = await clerkClient.users.createUser({
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
    await clerkClient.users.updateUser(userId, {
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
    await clerkClient.users.deleteUser(userId);
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
