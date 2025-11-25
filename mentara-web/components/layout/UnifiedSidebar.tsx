"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSidebarStorageKey, getStorageItem, setStorageItem } from "@/lib/config/storage";

export interface NavItem {
  name: string;
  path: string;
  icon: string;
  id: string;
}

export interface UnifiedSidebarProps {
  navItems: NavItem[];
  role: "client" | "therapist" | "admin" | "moderator";
  logoPath?: string;
  logoAlt?: string;
  defaultExpanded?: boolean;
  storageKey?: string;
  activeColor?: "primary" | "secondary" | "red" | "orange";
  onToggle?: (expanded: boolean) => void;
}

const SIDEBAR_WIDTH_EXPANDED = 256; // 64 * 4 = 256px
const SIDEBAR_WIDTH_COLLAPSED = 70;

export function UnifiedSidebar({
  navItems,
  role,
  logoPath = "/icons/mentara/mentara-icon.png",
  logoAlt = "Mentara Logo",
  defaultExpanded = false,
  storageKey,
  activeColor = "primary",
  onToggle,
}: UnifiedSidebarProps) {
  const pathname = usePathname();
  const key = storageKey || getSidebarStorageKey(role);
  
  // Load sidebar state synchronously on initial render
  const [isExpanded, setIsExpanded] = useState(() => {
    return getStorageItem(key, defaultExpanded);
  });

  // Notify parent of initial state on mount
  useEffect(() => {
    const initialExpanded = getStorageItem(key, defaultExpanded);
    onToggle?.(initialExpanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Save sidebar state to localStorage
  const toggleSidebar = useCallback(() => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    setStorageItem(key, newState);
    onToggle?.(newState);
  }, [isExpanded, key, onToggle]);

  // Keyboard shortcut (Cmd/Ctrl+B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key === "b" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const getColorClasses = () => {
    switch (activeColor) {
      case "primary":
        return {
          active: "text-primary bg-primary/15",
          hover: "hover:text-primary hover:bg-primary/10",
          indicator: "bg-primary",
          text: "text-primary",
        };
      case "secondary":
        return {
          active: "text-secondary bg-secondary/10",
          hover: "hover:text-secondary hover:bg-secondary/5",
          indicator: "bg-secondary",
          text: "text-secondary",
        };
      case "red":
        return {
          active: "text-red-600 bg-red-100",
          hover: "hover:text-red-600 hover:bg-red-50",
          indicator: "bg-red-600",
          text: "text-red-600",
        };
      case "orange":
        return {
          active: "text-orange-600 bg-orange-50",
          hover: "hover:text-orange-600 hover:bg-orange-50/50",
          indicator: "bg-orange-600",
          text: "text-orange-600",
        };
      default:
        return {
          active: "text-primary bg-primary/15",
          hover: "hover:text-primary hover:bg-primary/10",
          indicator: "bg-primary",
          text: "text-primary",
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <nav
      className={cn(
        "hidden md:flex fixed left-0 top-0 z-30 h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-[70px]"
      )}
      aria-label={`${role} navigation`}
      role="navigation"
    >
      {/* Header with Logo and Toggle */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        <Link
          href={`/${role}`}
          className={cn(
            "flex items-center transition-all duration-300",
            isExpanded ? "" : "justify-center"
          )}
          aria-label={`${role} dashboard home`}
        >
          <Image
            src={logoPath}
            alt={logoAlt}
            width={32}
            height={32}
            priority
            className="flex-shrink-0"
          />
          {isExpanded && (
            <span className="ml-3 text-lg font-semibold text-gray-900 transition-all duration-300 capitalize">
              {role}
            </span>
          )}
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 transition-all duration-300 flex-shrink-0"
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={isExpanded}
          aria-controls="sidebar-navigation-items"
        >
          {isExpanded ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Items */}
      <div 
        id="sidebar-navigation-items"
        className="flex flex-1 flex-col gap-2 overflow-y-auto p-4"
        role="list"
        aria-label="Navigation menu"
      >
        {navItems.map((item) => {
          // Special handling for dashboard - only match exact path or /client/
          // Other routes match if pathname starts with the item path
          const isActive =
            item.path === "/client"
              ? pathname === "/client" || pathname === "/client/"
              : pathname === item.path || pathname.startsWith(`${item.path}/`);

          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                "relative group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 ease-in-out",
                isActive
                  ? `${colorClasses.active} shadow-sm`
                  : `text-gray-700 ${colorClasses.hover}`,
                !isExpanded && "justify-center px-2"
              )}
              title={!isExpanded ? item.name : undefined}
              aria-label={item.name}
              aria-current={isActive ? "page" : undefined}
              role="listitem"
            >
              {/* Left accent indicator */}
              <div
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300 ease-in-out",
                  colorClasses.indicator,
                  isActive
                    ? "h-8 opacity-100"
                    : "h-0 opacity-0 group-hover:h-5 group-hover:opacity-100"
                )}
              />

              {/* Background highlight */}
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-400 ease-in-out",
                  isActive
                    ? `${colorClasses.active.replace("text-", "")} rounded-xl scale-100`
                    : "bg-transparent rounded-full scale-75 group-hover:rounded-xl group-hover:scale-100"
                )}
              />

              <div className="relative z-10 flex items-center gap-3">
                <div
                  className={cn(
                    "transition-all duration-300 flex-shrink-0",
                    isActive
                      ? `${colorClasses.text} scale-110`
                      : "text-gray-500 group-hover:scale-110"
                  )}
                >
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={20}
                    height={20}
                    className="transition-all duration-300"
                  />
                </div>

                {isExpanded && (
                  <span
                    className={cn(
                      "transition-all duration-300",
                      isActive
                        ? colorClasses.text
                        : "text-gray-700 group-hover:" + colorClasses.text
                    )}
                  >
                    {item.name}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        {isExpanded ? (
          <p className="text-xs text-gray-500 text-center">
            © 2025 Mentara {role.charAt(0).toUpperCase() + role.slice(1)}
          </p>
        ) : (
          <div className="flex justify-center">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                colorClasses.indicator,
                "opacity-30"
              )}
            />
          </div>
        )}
      </div>
    </nav>
  );
}

export default UnifiedSidebar;

