"use client";

import React, { useState } from "react";
import {
  Search,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { IncomingCallNotificationContainer } from "@/components/video-calls/IncomingCallNotification";
import Image from "next/image";
import { UnifiedSidebar } from "@/components/layout/UnifiedSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { logout, user } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: "/icons/dashboard.svg",
      id: "dashboard",
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: "/icons/therapist.svg", // Using therapist icon for users management
      id: "users",
    },
    {
      name: "Applications",
      path: "/admin/therapist-applications",
      icon: "/icons/sessions.svg", // Using sessions icon for applications
      id: "applications",
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: "/icons/worksheets.svg", // Using worksheets icon for analytics
      id: "analytics",
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: "/icons/community.svg", // Using community icon for reports
      id: "reports",
    },
    {
      name: "Content",
      path: "/admin/content",
      icon: "/icons/messages.svg", // Using messages icon for content
      id: "content",
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <UnifiedSidebar
        navItems={navItems}
        role="admin"
        defaultExpanded={false}
        activeColor="red"
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
                  src="/icons/mentara/mentara-icon.png"
                  alt="Mentara Logo"
                  width={32}
                  height={32}
                  priority
                />
                <span className="text-lg font-semibold text-gray-900">
                  Admin
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
                          ? "bg-red-50 text-red-600"
                          : "text-gray-700 hover:bg-red-50/50 hover:text-red-600"
                      )}
                    >
                      <div
                        className={cn(
                          "transition-all duration-300",
                          isActive
                            ? "text-red-600 scale-110"
                            : "text-gray-500 group-hover:text-red-600 group-hover:scale-105"
                        )}
                      >
                        <Image
                          src={item.icon}
                          alt={item.name}
                          width={20}
                          height={20}
                        />
                      </div>
                      <span
                        className={cn(
                          "font-medium transition-all duration-300",
                          isActive
                            ? "text-red-600"
                            : "text-gray-700 group-hover:text-red-600"
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
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-700 hover:text-gray-900"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-lg font-semibold text-gray-900">Admin</span>
          </div>

          {/* Desktop title */}
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900">
              {navItems.find(
                (item) =>
                  pathname === item.path || pathname.startsWith(`${item.path}/`)
              )?.name || "Dashboard"}
            </h1>
          </div>

          {/* Search Bar - Placeholder for future implementation */}
          <div className="relative mx-4 hidden flex-1 max-w-md md:block">
            <div className="relative">
              <div className="w-full h-10 bg-background/80 backdrop-blur-sm border-0 shadow-lg ring-1 ring-border/50 rounded-xl px-4 text-sm placeholder:text-muted-foreground/70 focus-within:ring-2 focus-within:ring-red-300 focus-within:shadow-xl transition-all duration-300 flex items-center text-gray-500">
                <Search className="h-4 w-4 mr-2" />
                Search admin functions...
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 rounded-xl pointer-events-none" />
            </div>
          </div>

          {/* Admin User Info and Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "Admin"}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {user?.role || "admin"}
                </span>
              </div>

              <button
                className="relative group focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 rounded-full transition-all duration-300"
                title="Admin Profile"
              >
                <div className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-red-100 to-red-200 ring-2 ring-border/50 group-hover:ring-red-300 transition-all duration-300 shadow-sm group-hover:shadow-md cursor-pointer">
                  <Image
                    src={user?.avatarUrl || "/avatar-placeholder.png"}
                    alt="Admin Avatar"
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

        {/* Main Content - Responsive padding */}
        <main id="main-content" className="flex-1 w-full h-full pt-16 pb-16 md:pb-0 overflow-y-auto bg-gray-50" tabIndex={-1}>
          <div className="p-4 md:p-6">{children}</div>
        </main>

        {/* Video Call Notifications - Fixed position in upper right */}
        <IncomingCallNotificationContainer />

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex items-center justify-around py-2">
            {navItems.slice(0, 5).map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={cn(
                    "relative group flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-0",
                    isActive
                      ? "text-red-600"
                      : "text-gray-600 hover:text-red-600"
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
                        ? "text-red-600 font-medium"
                        : "text-gray-600 group-hover:text-red-600"
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
    </div>
  );
}
