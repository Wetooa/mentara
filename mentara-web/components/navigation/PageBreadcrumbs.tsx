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
    <Breadcrumb className={cn("mb-4", className)}>
      <BreadcrumbList>
        {displayBreadcrumbs.map((crumb, index) => {
          const isLast = index === displayBreadcrumbs.length - 1;

          return (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="max-w-[200px] truncate">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href} className="max-w-[200px] truncate">
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
