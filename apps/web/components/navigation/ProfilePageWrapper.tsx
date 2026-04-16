"use client";

import { ReactNode } from "react";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { BackButton } from "./BackButton";

interface ProfilePageWrapperProps {
  children: ReactNode;
}

export function ProfilePageWrapper({ children }: ProfilePageWrapperProps) {
  return (
    <>
      <div className="space-y-4 mb-6">
        <PageBreadcrumbs />
        <BackButton label="Back" variant="ghost" />
      </div>
      {children}
    </>
  );
}

