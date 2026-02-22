"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { generateBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

export interface PageBreadcrumbsProps {
  /**
   * Optional context for dynamic segments (e.g., session title, worksheet title)
   */
  context?: {
    sessionTitle?: string;
    worksheetTitle?: string;
    patientName?: string;
    postTitle?: string;
    userName?: string;
  };
  /**
   * Custom className for the breadcrumb container
   */
  className?: string;
  /**
   * Maximum number of breadcrumbs to show (default: all)
   * If exceeded, will show first, ellipsis, and last items
   */
  maxItems?: number;
}

export function PageBreadcrumbs({
  context,
  className,
  maxItems,
}: PageBreadcrumbsProps) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname, context);

  // Don't show breadcrumbs if we're at the dashboard or root
  if (breadcrumbs.length === 0 || breadcrumbs.length === 1) {
    return null;
  }

  // Apply maxItems if specified
  let displayBreadcrumbs = breadcrumbs;
  if (maxItems && breadcrumbs.length > maxItems) {
    const first = breadcrumbs[0];
    const last = breadcrumbs[breadcrumbs.length - 1];
    displayBreadcrumbs = [first, last];
  }

  return (
    <nav aria-label="Breadcrumb navigation" className={cn("mb-4", className)}>
      <Breadcrumb>
        <BreadcrumbList>
          {displayBreadcrumbs.map((crumb, index) => {
            const isLast = index === displayBreadcrumbs.length - 1;

            return (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="max-w-[200px] md:max-w-none truncate" aria-current="page">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link 
                        href={crumb.href} 
                        className="max-w-[200px] md:max-w-none truncate min-h-[44px] md:min-h-0 flex items-center touch-manipulation"
                        aria-label={`Navigate to ${crumb.label}`}
                      >
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator aria-hidden="true" />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
}
