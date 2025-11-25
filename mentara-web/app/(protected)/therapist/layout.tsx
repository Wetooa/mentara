"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UnifiedSidebar } from "@/components/layout/UnifiedSidebar";

// Lazy load heavy layout components
const LayoutOmniSearchBar = dynamic(() => import("@/components/search").then(mod => ({ default: mod.LayoutOmniSearchBar })), {
  ssr: false,
  loading: () => <div className="h-10 w-full rounded-xl bg-muted animate-pulse" />
});

const NotificationDropdown = dynamic(() => import("@/components/notifications/NotificationDropdown").then(mod => ({ default: mod.NotificationDropdown })), {
  ssr: false,
  loading: () => <div className="w-10 h-10 rounded-xl" />
});

const IncomingCallNotificationContainer = dynamic(() => import("@/components/video-calls/IncomingCallNotification").then(mod => ({ default: mod.IncomingCallNotificationContainer })), {
  ssr: false,
  loading: () => null
});
import { Button } from "@/components/ui/button";
import { cn, getProfileUrl } from "@/lib/utils";

// Lazy load heavy floating tools component
const FloatingToolsButton = dynamic(() => import("@/components/microservices/FloatingToolsButton").then(mod => ({ default: mod.FloatingToolsButton })), {
  ssr: false,
  loading: () => null // No loading indicator for floating button
});

export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Handle avatar click to navigate to profile
  const handleAvatarClick = () => {
    if (user) {
      const profileUrl = getProfileUrl(user.role, user.id);
      router.push(profileUrl);
    }
  };


  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation menu items for therapist
  const navItems = [
    {
      name: "Dashboard",
      path: "/therapist",
      icon: "/icons/dashboard.svg",
      id: "dashboard",
    },
    {
      name: "Clients",
      path: "/therapist/patients",
      icon: "/icons/therapist.svg", // Using therapist icon for clients
      id: "patients",
    },
    {
      name: "Sessions",
      path: "/therapist/schedule", // Renamed Schedule to Sessions
      icon: "/icons/sessions.svg",
      id: "sessions",
    },
    {
      name: "Community",
      path: "/therapist/community",
      icon: "/icons/community.svg",
      id: "community",
    },
    {
      name: "Messages",
      path: "/therapist/messages",
      icon: "/icons/messages.svg",
      id: "messages",
    },
    {
      name: "Worksheets",
      path: "/therapist/worksheets",
      icon: "/icons/worksheets.svg",
      id: "worksheets",
    },
  ];

  return (
    <div className="flex h-screen w-full bg-white">
      <UnifiedSidebar
        navItems={navItems}
        role="therapist"
        defaultExpanded={false}
        activeColor="secondary"
        onToggle={setIsSidebarExpanded}
      />

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <nav className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Image
                  src="/mentara-icon.png"
                  alt="Mentara Logo"
                  width={32}
                  height={32}
                  priority
                  loading="eager"
                />
                <span className="text-lg font-semibold text-gray-900">
                  Therapist
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 px-4 py-6">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.path ||
                    pathname.startsWith(`${item.path}/`);
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "relative group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300",
                        isActive
                          ? "bg-secondary/10 text-secondary"
                          : "text-gray-700 hover:bg-secondary/5 hover:text-secondary"
                      )}
                    >
                      <Image
                        src={item.icon}
                        alt={item.name}
                        width={20}
                        height={20}
                        className={cn(
                          "transition-all duration-300",
                          isActive
                            ? "scale-110"
                            : "group-hover:scale-105"
                        )}
                      />
                      <span
                        className={cn(
                          "font-medium transition-all duration-300",
                          isActive
                            ? "text-secondary"
                            : "text-gray-700 group-hover:text-secondary"
                        )}
                      >
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-200 p-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 w-full shadow-sm hover:shadow-md ring-1 ring-gray-200 hover:ring-red-200 group"
              >
                <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Area - Responsive padding */}
      <div
        className={cn(
          "flex flex-1 flex-col w-full h-screen transition-all duration-300",
          isSidebarExpanded ? "md:ml-64" : "md:ml-[70px]"
        )}
      >
        {/* Top Header - Responsive width */}
        <header
          className={cn(
            "fixed top-0 right-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 backdrop-blur-md px-4 shadow-sm w-full transition-all duration-300",
            isSidebarExpanded ? "md:w-[calc(100%-256px)]" : "md:w-[calc(100%-70px)]"
          )}
        >
          {/* Mobile menu button and title */}
          <div className="flex items-center gap-3 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-700 hover:text-gray-900"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-lg font-semibold text-gray-900">
              Therapist
            </span>
          </div>

          {/* Omnisearch Bar - Hidden on mobile, extends full width */}
          <div className="relative mx-4 hidden flex-1 md:block">
            <LayoutOmniSearchBar
              placeholder="Search clients, colleagues, posts..."
              className="w-full"
            />
          </div>

          {/* User Area */}
          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationDropdown
              variant="default"
              maxNotifications={5}
              showConnectionStatus={true}
              className="p-2 rounded-xl bg-background/80 backdrop-blur-sm hover:bg-secondary/5 text-gray-600 hover:text-secondary transition-all duration-300 shadow-sm hover:shadow-md ring-1 ring-border/50 hover:ring-secondary/30"
            />

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "Therapist"}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {user?.role || "therapist"}
                </span>
              </div>

              <button
                onClick={handleAvatarClick}
                className="relative group focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:ring-offset-2 rounded-full transition-all duration-300"
                title="Go to profile"
              >
                <div className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-secondary/20 to-secondary/10 ring-2 ring-border/50 group-hover:ring-secondary/30 transition-all duration-300 shadow-sm group-hover:shadow-md cursor-pointer">
                  <Image
                    src={user?.avatarUrl || "/avatar-placeholder.png"}
                    alt="User Avatar"
                    width={36}
                    height={36}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
                {/* Online status indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background shadow-sm" />
              </button>

              <button
                onClick={handleLogout}
                className="hidden md:flex items-center justify-center p-2 rounded-xl bg-background/80 backdrop-blur-sm hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all duration-300 shadow-sm hover:shadow-md ring-1 ring-border/50 hover:ring-red-200"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Omnisearch Bar - Shows below header on mobile */}
        <div className="md:hidden fixed top-16 left-0 right-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-3 shadow-sm">
          <LayoutOmniSearchBar
            placeholder="Search clients, posts..."
            className="w-full"
          />
        </div>

        {/* Main Content - Responsive padding */}
        <main id="main-content" className="flex-1 w-full h-full pt-16 md:pt-16 pb-16 md:pb-0 overflow-y-auto bg-gray-50" tabIndex={-1}>
          <div className="md:hidden h-[50px]" />{" "}
          {/* Extra space for mobile search */}
          {children}
        </main>

        {/* Video Call Notifications - Fixed position in upper right */}
        <IncomingCallNotificationContainer />

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex items-center justify-around py-2">
            {navItems.slice(0, 5).map((item) => {
              const isActive =
                pathname === item.path || pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={cn(
                    "relative group flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-0",
                    isActive
                      ? "text-secondary"
                      : "text-gray-600 hover:text-secondary"
                  )}
                >
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={20}
                    height={20}
                    className={cn(
                      "transition-all duration-300",
                      isActive
                        ? "scale-110"
                        : "group-hover:scale-105"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] mt-1 truncate max-w-[60px] transition-all duration-300",
                      isActive
                        ? "text-secondary font-medium"
                        : "text-gray-600 group-hover:text-secondary"
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Floating Tools Button - Available on most pages except dashboard */}
      {pathname !== "/therapist" && pathname !== "/therapist/" ? (
        <FloatingToolsButton />
      ) : null}
    </div>
  );
}
