"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileUrl, cn } from "@/lib/utils";
import { DashboardPageMetadata } from "@/components/metadata/SimplePageMetadata";
import { UserDisplay } from "@/components/common/UserDisplay";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UnifiedSidebar } from "@/components/layout/UnifiedSidebar";
import { getSidebarStorageKey, getStorageItem } from "@/lib/config/storage";

// Lazy load heavy layout components
const NotificationDropdown = dynamic(() => import("@/components/notifications/NotificationDropdown").then(mod => ({ default: mod.NotificationDropdown })), {
  ssr: false,
  loading: () => <div className="w-10 h-10 rounded-xl" />
});

const IncomingCallNotificationContainer = dynamic(() => import("@/components/video-calls/IncomingCallNotification").then(mod => ({ default: mod.IncomingCallNotificationContainer })), {
  ssr: false,
  loading: () => null
});

const LayoutOmniSearchBar = dynamic(() => import("@/components/search").then(mod => ({ default: mod.LayoutOmniSearchBar })), {
  ssr: false,
  loading: () => <div className="h-10 w-full rounded-xl bg-muted animate-pulse" />
});

// Lazy load heavy floating tools component
const FloatingToolsButton = dynamic(() => import("@/components/microservices/FloatingToolsButton").then(mod => ({ default: mod.FloatingToolsButton })), {
  ssr: false,
  loading: () => null // No loading indicator for floating button
});

// Lazy load floating messages component
const FloatingMessagesButton = dynamic(() => import("@/components/messaging/FloatingMessagesButton").then(mod => ({ default: mod.FloatingMessagesButton })), {
  ssr: false,
  loading: () => null // No loading indicator for floating button
});

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Load sidebar state synchronously to match sidebar's initial state
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    return getStorageItem(getSidebarStorageKey('client'), false);
  });

  const handleLogout = () => {
    logout();
  };

  const handleAvatarClick = () => {
    if (user) {
      const profileUrl = getProfileUrl(user.role, user.id);
      router.push(profileUrl);
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/client",
      icon: "/icons/dashboard.svg",
      id: "dashboard",
    },
    {
      name: "Sessions",
      path: "/client/sessions",
      icon: "/icons/sessions.svg",
      id: "sessions",
    },
    {
      name: "Therapist",
      path: "/client/therapist",
      icon: "/icons/therapist.svg",
      id: "therapist",
    },
    {
      name: "Community",
      path: "/client/community",
      icon: "/icons/community.svg",
      id: "community",
    },
    {
      name: "Messages",
      path: "/client/messages",
      icon: "/icons/messages.svg",
      id: "messages",
    },
    {
      name: "Worksheets",
      path: "/client/worksheets",
      icon: "/icons/worksheets.svg",
      id: "worksheets",
    },
  ];

  return (
    <>
      <DashboardPageMetadata role="client" />

      <div className="flex h-screen w-full bg-white">
        <UnifiedSidebar
          navItems={navItems}
          role="client"
          defaultExpanded={false}
          activeColor="primary"
          onToggle={setIsSidebarExpanded}
        />

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="fixed inset-0 z-50 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <nav 
              className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg flex flex-col"
              role="navigation"
              aria-label="Main navigation"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <Image
                  src="/mentara-landscape.png"
                  alt="Mentara"
                  width={120}
                  height={28}
                  priority
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="min-h-[44px] min-w-[44px] p-2 text-gray-500 hover:text-gray-700 active:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close mobile menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 px-4 py-6">
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.id}
                        href={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`relative group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        }`}
                      >
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={20}
                      height={20}
                      loading="lazy"
                      className={`transition-all duration-300 ${
                        isActive
                          ? "text-primary scale-110"
                          : "text-muted-foreground group-hover:text-primary group-hover:scale-105"
                      }`}
                    />
                        <span
                          className={`font-medium transition-all duration-300 ${
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-primary"
                          }`}
                        >
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-border/50 p-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 w-full shadow-sm hover:shadow-md ring-1 ring-border/50 hover:ring-red-200 group"
                >
                  <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </nav>
          </div>
        )}

        <div
          className={cn(
            "flex flex-1 flex-col w-full h-full transition-all duration-300",
            isSidebarExpanded ? "md:pl-64" : "md:pl-[70px]"
          )}
        >
          <header
            className={cn(
              "fixed top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 transition-all duration-300",
              isSidebarExpanded 
                ? "md:left-64 md:right-0 md:w-auto" 
                : "md:left-[70px] md:right-0 md:w-auto"
            )}
          >
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="min-h-[44px] min-w-[44px] p-2 text-gray-700 hover:text-gray-900 active:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Image
                src="/mentara-landscape.png"
                alt="Mentara"
                width={100}
                height={24}
                priority
                loading="eager"
                className="h-6"
              />
            </div>
            <div className="relative mx-4 hidden flex-1 md:flex md:items-center">
              <LayoutOmniSearchBar
                placeholder="Search therapists, posts, communities..."
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationDropdown
                variant="default"
                maxNotifications={5}
                showConnectionStatus={true}
                className="p-2 rounded-xl bg-background/80 backdrop-blur-sm hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-300 shadow-sm hover:shadow-md ring-1 ring-border/50 hover:ring-primary/30"
              />
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex">
                  <UserDisplay
                    variant="name-only"
                    showRole={true}
                    textClassName="flex flex-col items-end"
                    className="gap-1"
                  />
                </div>
                <button
                  className="relative group cursor-pointer"
                  onClick={handleAvatarClick}
                  title="View Profile"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-border/50 group-hover:ring-primary/30 transition-all duration-300 shadow-sm group-hover:shadow-md">
                    <AvatarImage 
                      src={user?.avatarUrl} 
                      alt="User Avatar"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold text-sm">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
                        : user?.firstName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background shadow-sm" />
                </button>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center justify-center p-2 rounded-xl bg-background/80 backdrop-blur-sm hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-all duration-300 shadow-sm hover:shadow-md ring-1 ring-border/50 hover:ring-red-200"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Mobile Omnisearch Bar - Shows below header on mobile */}
          <div className="md:hidden fixed top-[60px] left-0 right-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-3 shadow-sm">
            <LayoutOmniSearchBar
              placeholder="Search therapists, posts..."
              className="w-full"
            />
          </div>

          {/* Main Content - Responsive padding */}
          <main id="main-content" className="flex-1 w-full h-full pt-[60px] md:pt-[60px] pb-16 md:pb-0 bg-gray-100" tabIndex={-1}>
            <div className="md:hidden h-[50px]" />{" "}
            {/* Extra space for mobile search */}
            {children}
          </main>

          {/* Video Call Notifications - Fixed position in upper right */}
          <IncomingCallNotificationContainer />

          {/* Floating Tools Button - Available on most pages except dashboard */}
          {pathname !== "/client" && pathname !== "/client/" ? (
            <FloatingToolsButton />
          ) : null}

          {/* Floating Messages Button - Available on all pages */}
          <FloatingMessagesButton />

          {/* Mobile Bottom Navigation */}
          <nav 
            className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 safe-area-inset-bottom"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-around py-2">
              {navItems.slice(0, 5).map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`relative group flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground active:text-primary active:bg-primary/10"
                    }`}
                    aria-label={item.name}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={20}
                      height={20}
                      loading="lazy"
                      className={`transition-all duration-300 ${
                        isActive
                          ? "text-primary scale-110"
                          : "text-muted-foreground group-hover:text-primary group-hover:scale-105"
                      }`}
                    />
                    <span
                      className={`text-[10px] mt-1 truncate max-w-[60px] transition-all duration-300 ${
                        isActive
                          ? "text-primary font-medium"
                          : "text-muted-foreground group-hover:text-primary"
                      }`}
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
    </>
  );
}
