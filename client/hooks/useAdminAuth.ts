import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminAuth {
  isAdmin: boolean;
  isLoading: boolean;
  adminData: {
    id?: string;
    role?: string;
    permissions?: string[];
  } | null;
}

export function useAdminAuth(): AdminAuth {
  const { isLoaded, userId } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoaded || !userId) {
        setIsLoading(false);
        setIsAdmin(false);
        return;
      }

      try {
        // Call our admin authentication endpoint
        const response = await fetch("/api/admin/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(true);
          setAdminData(data.admin);
        } else {
          // If not authorized as admin, set admin status to false
          setIsAdmin(false);
          setAdminData(null);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        setAdminData(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [isLoaded, userId]);

  return { isAdmin, isLoading, adminData };
}

// Function to redirect non-admin users
export function useAdminRequired() {
  const { isAdmin, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/admin-login");
    }
  }, [isAdmin, isLoading, router]);

  return { isAdmin, isLoading };
}
