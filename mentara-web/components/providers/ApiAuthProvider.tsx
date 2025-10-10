"use client";

import { useApiAuth } from "@/hooks/auth/useApiAuth";
import { ReactNode } from "react";

interface ApiAuthProviderProps {
  children: ReactNode;
}

/**
 * Provider component that sets up API authentication
 * Should be used once at the app level
 */
export function ApiAuthProvider({ children }: ApiAuthProviderProps) {
  useApiAuth(); // This sets up the globalTokenProvider

  return <>{children}</>;
}

export default ApiAuthProvider;
