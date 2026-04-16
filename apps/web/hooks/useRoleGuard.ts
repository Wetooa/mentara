import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/auth";

/**
 * useRoleGuard — A hook for layout-level role protection.
 * 
 * It ensures:
 * 1. The user is authenticated.
 * 2. The user has the required role.
 * 
 * If not authenticated, redirects to sign-in.
 * If unauthorized role, redirects to their respective dashboard or landing.
 */
export function useRoleGuard(allowedRole: UserRole) {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            const signInUrl = new URL("/auth/sign-in", window.location.origin);
            signInUrl.searchParams.set("redirect", pathname);
            router.push(signInUrl.pathname + signInUrl.search);
            return;
        }

        if (user && user.role !== allowedRole) {
            // Unauthorized for this specific role layout — redirect to their own dashboard
            switch (user.role) {
                case "admin":
                    router.push("/admin/dashboard");
                    break;
                case "therapist":
                    router.push("/therapist/dashboard");
                    break;
                case "moderator":
                    router.push("/moderator/dashboard");
                    break;
                case "client":
                default:
                    router.push("/client/dashboard");
                    break;
            }
        }
    }, [user, isAuthenticated, isLoading, allowedRole, router, pathname]);

    return { isLoading, isAuthenticated, user, logout };
}
