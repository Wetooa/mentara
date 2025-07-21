"use client";

import React from "react";
import { AuthErrorBoundary } from "@/lib/errors";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-b from-white to-tertiary/50 w-full h-full flex items-center justify-center">
      <AuthErrorBoundary
        fallbackTitle="Authentication Error"
        fallbackMessage="There was a problem with authentication. Please try signing in again."
        showRetryButton={true}
        showHomeButton={false}
        onRetry={() => window.location.reload()}
        onHome={() => window.location.href = "/auth/sign-in"}
      >
        {children}
      </AuthErrorBoundary>
    </div>
  );
}
