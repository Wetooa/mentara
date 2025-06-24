import { useRole } from "@/hooks/useRole";
import { UserRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

interface WithRoleProps {
  requiredRole: UserRole | UserRole[];
  fallbackUrl?: string;
  children: React.ReactNode;
}

export function WithRole({
  requiredRole,
  fallbackUrl = "/",
  children,
}: WithRoleProps) {
  const { canAccess } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!canAccess(requiredRole)) {
      toast.error("You don't have permission to access this page.");
      router.push(fallbackUrl);
    }
  }, [canAccess, requiredRole, fallbackUrl, router]);

  if (!canAccess(requiredRole)) {
    return null;
  }

  return <>{children}</>;
}

export function withRole<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole: UserRole | UserRole[],
  fallbackUrl?: string
) {
  return function WithRoleWrapper(props: P) {
    return (
      <WithRole requiredRole={requiredRole} fallbackUrl={fallbackUrl}>
        <WrappedComponent {...props} />
      </WithRole>
    );
  };
} 