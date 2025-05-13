import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";

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
  const api = useApi();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoaded || !userId) {
        setIsLoading(false);
        setIsAdmin(false);
        return;
      }

      try {
        // Use the API client to check admin status
        const data = await api.admin.checkAdmin();

        setIsAdmin(true);
        setAdminData(data.admin);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        setAdminData(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [isLoaded, userId, api]);

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
