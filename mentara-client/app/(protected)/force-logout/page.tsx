"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function ForceLogoutPage() {
  const { logout, isLoading } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-700">
          {isLoading ? "Logging out..." : "Force logout initiated..."}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Please wait while we sign you out
        </p>
      </div>
    </div>
  );
}
