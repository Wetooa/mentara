"use client";

import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "./ThemeProvider";
import QueryProvider from "./QueryProvider";
import { ApiAuthProvider } from "./ApiAuthProvider";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Main providers wrapper that combines all app-level providers
 * Used in the root layout to wrap the entire application
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryProvider>
          <ApiAuthProvider>{children}</ApiAuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default Providers;
