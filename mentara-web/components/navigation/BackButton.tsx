"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getParentRoute, getDashboardRoute, getRoleFromPath } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils";

export interface BackButtonProps {
  /**
   * Custom label for the back button (default: "Back")
   */
  label?: string;
  /**
   * Custom href to navigate to (if not provided, will use smart fallback)
   */
  href?: string;
  /**
   * Fallback route if parent route cannot be determined
   */
  fallbackRoute?: string;
  /**
   * Whether to show keyboard shortcut hint
   */
  showKeyboardHint?: boolean;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Variant of the button
   */
  variant?: "default" | "outline" | "ghost" | "link";
  /**
   * Size of the button
   */
  size?: "default" | "sm" | "lg" | "icon";
  /**
   * Callback when back button is clicked
   */
  onClick?: () => void;
}

export function BackButton({
  label = "Back",
  href,
  fallbackRoute,
  showKeyboardHint = false,
  className,
  variant = "ghost",
  size = "default",
  onClick,
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine the back route
  const getBackRoute = (): string => {
    // If custom href provided, use it
    if (href) {
      return href;
    }

    // Try to get parent route
    const parentRoute = getParentRoute(pathname);
    if (parentRoute && parentRoute !== pathname) {
      return parentRoute;
    }

    // Fallback to dashboard for the role
    if (fallbackRoute) {
      return fallbackRoute;
    }

    const role = getRoleFromPath(pathname);
    if (role) {
      return getDashboardRoute(role);
    }

    // Ultimate fallback
    return "/";
  };

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(getBackRoute());
    }
  };

  // Keyboard shortcut support (Backspace or Escape)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if not typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Backspace (when not in input) or Escape
      if (event.key === "Backspace" && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
        // Check if we're not at the root
        if (pathname !== "/" && pathname.split("/").filter(Boolean).length > 1) {
          event.preventDefault();
          handleBack();
        }
      } else if (event.key === "Escape") {
        // Escape key - only if explicitly enabled
        if (showKeyboardHint) {
          event.preventDefault();
          handleBack();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname, onClick, showKeyboardHint]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={cn("flex items-center gap-2", className)}
      title={showKeyboardHint ? `${label} (Backspace)` : label}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
      {showKeyboardHint && (
        <span className="ml-2 text-xs text-muted-foreground opacity-70">
          (Backspace)
        </span>
      )}
    </Button>
  );
}
