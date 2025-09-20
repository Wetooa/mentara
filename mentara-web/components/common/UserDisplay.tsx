"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserDisplayProps {
  variant?: "full" | "avatar-only" | "name-only";
  showDropdown?: boolean;
  className?: string;
  avatarClassName?: string;
  textClassName?: string;
  showRole?: boolean;
}

/**
 * Reusable component for displaying user information (name, avatar, role).
 * Handles loading states and provides fallbacks when profile data is not available.
 */
export function UserDisplay({
  variant = "full",
  showDropdown = false,
  className,
  avatarClassName,
  textClassName,
  showRole = false,
}: UserDisplayProps) {
  const { user, logout } = useAuth();

  // Generate initials from first and last name
  const getInitials = (): string => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    // Fallback to first letter of role
    return user?.role?.charAt(0).toUpperCase() || "U";
  };

  // Get display name with fallback
  const getDisplayName = (): string => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    // Fallback to role-based display
    const roleName = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User";
    return roleName;
  };

  // Get role display text
  const getRoleDisplay = (): string => {
    if (!user?.role) return "";
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  const displayName = getDisplayName();
  const initials = getInitials();
  const roleDisplay = getRoleDisplay();

  // Avatar component
  const avatarComponent = (
    <Avatar className={cn("h-8 w-8", avatarClassName)}>
      {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={displayName} />}
      <AvatarFallback className="text-sm font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  // Text component
  const textComponent = (
    <div className={cn("flex flex-col", textClassName)}>
      <span className="text-sm font-medium leading-none">{displayName}</span>
      {showRole && (
        <span className="text-xs text-muted-foreground mt-1">{roleDisplay}</span>
      )}
    </div>
  );

  // Content based on variant
  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      {(variant === "full" || variant === "avatar-only") && avatarComponent}
      {(variant === "full" || variant === "name-only") && textComponent}
    </div>
  );

  // If dropdown is enabled, wrap in dropdown menu
  if (showDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto p-2 justify-start hover:bg-accent/50"
          >
            {content}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return content;
}

/**
 * Simplified user display component for headers and navigation
 */
export function HeaderUserDisplay() {
  return (
    <UserDisplay
      variant="full"
      showDropdown={true}
      className="ml-auto"
      showRole={true}
    />
  );
}

/**
 * Compact user display for mobile or constrained spaces
 */
export function CompactUserDisplay() {
  return (
    <UserDisplay
      variant="avatar-only"
      showDropdown={true}
      avatarClassName="h-6 w-6"
    />
  );
}

/**
 * User display with loading state for when profile data is still being fetched
 */
export function UserDisplayWithLoading() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="flex flex-col gap-1">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-3 w-16 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return <HeaderUserDisplay />;
}