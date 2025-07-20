import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type UserRole = "client" | "therapist" | "moderator" | "admin";

interface UseRoleCheckResult {
  isLoading: boolean;
  isAuthorized: boolean;
  userRole: UserRole | null;
  userId: string | null;
}

/**
 * Secure role checking hook that validates user permissions via backend API
 * Replaces localStorage-based role checking with secure token-based validation
 * 
 * @param requiredRole - The role required to access the current route
 * @returns Object with loading state, authorization status, and user data
 */
export function useRoleCheck(requiredRole: UserRole): UseRoleCheckResult {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const router = useRouter();
  const api = useApi();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        setIsLoading(true);
        
        // Check if token exists in localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          // No token - redirect to sign in
          router.push("/auth/sign-in");
          return;
        }

        // Validate role via secure backend endpoint
        const response = await api.auth.getUserRole();
        const { role, userId: fetchedUserId } = response;
        
        setUserRole(role as UserRole);
        setUserId(fetchedUserId);

        // Check if user has required role
        if (role === requiredRole) {
          setIsAuthorized(true);
        } else {
          // User has different role - redirect to their appropriate dashboard
          setIsAuthorized(false);
          
          // Show unauthorized toast notification
          toast({
            title: "Access Denied",
            description: `You don't have permission to access this area. Redirecting to your dashboard...`,
            variant: "destructive",
          });

          // Redirect based on actual user role
          const redirectPath = getRoleRedirectPath(role as UserRole);
          router.push(redirectPath);
        }
      } catch (error) {
        console.error("Role check failed:", error);
        setIsAuthorized(false);
        setUserRole(null);
        setUserId(null);
        
        // Authentication failed - redirect to sign in
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue.",
          variant: "destructive",
        });
        
        router.push("/auth/sign-in");
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [requiredRole, router, api.auth, toast]);

  return {
    isLoading,
    isAuthorized,
    userRole,
    userId,
  };
}

/**
 * Get the appropriate redirect path based on user role
 */
function getRoleRedirectPath(role: UserRole): string {
  switch (role) {
    case "client":
      return "/client";
    case "therapist":
      return "/therapist";
    case "moderator":
      return "/moderator";
    case "admin":
      return "/admin";
    default:
      return "/auth/sign-in";
  }
}