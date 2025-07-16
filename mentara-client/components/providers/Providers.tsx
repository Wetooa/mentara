"use client";

import { ReactNode } from "react";
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
  );
}

export default Providers;
