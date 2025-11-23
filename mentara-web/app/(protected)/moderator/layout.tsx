"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Shield,
  AlertTriangle,
  Users,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { UserDisplay } from "@/components/common/UserDisplay";
import { IncomingCallNotificationContainer } from "@/components/video-calls/IncomingCallNotification";
import { UnifiedSidebar } from "@/components/layout/UnifiedSidebar";


export default function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const { logout, user } = useAuth();

  // Load sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('moderator-sidebar-expanded');
    if (saved !== null) {
      setIsSidebarExpanded(JSON.parse(saved));
    }
  }, []);


  const navItems = [
    {
      name: "Dashboard",
      path: "/moderator",
      icon: "/icons/dashboard.svg",
      id: "dashboard",
    },
    {
      name: "Content Moderation",
      path: "/moderator/content",
      icon: "/icons/community.svg",
      id: "content",
    },
    {
      name: "Reports",
      path: "/moderator/reports",
      icon: "/icons/messages.svg",
      id: "reports",
    },
    {
      name: "Users",
      path: "/moderator/users",
      icon: "/icons/therapist.svg",
      id: "users",
    },
    {
      name: "Audit Logs",
      path: "/moderator/audit-logs",
      icon: "/icons/worksheets.svg",
      id: "audit-logs",
    },
    {
      name: "Profile",
      path: "/moderator/profile",
      icon: "/icons/sessions.svg",
      id: "profile",
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <UnifiedSidebar
        navItems={navItems}
        role="moderator"
        defaultExpanded={true}
        activeColor="orange"
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
                />
                <span className="text-lg font-semibold text-gray-900">Moderator</span>
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
                  const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "relative group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300",
                        isActive
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-700 hover:bg-orange-50/50 hover:text-orange-600"
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
                            ? "text-orange-600"
                            : "text-gray-700 group-hover:text-orange-600"
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
      <div className={cn(
        "flex flex-1 flex-col w-full h-screen transition-all duration-300",
        "md:ml-0",
        isSidebarExpanded ? "md:ml-64" : "md:ml-[70px]"
      )}>
        {/* Top Header - Responsive */}
        <header className={cn(
          "fixed top-0 right-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 backdrop-blur-md px-4 shadow-sm transition-all duration-300",
          "md:w-[calc(100%-256px)]",
          !isSidebarExpanded && "md:w-[calc(100%-70px)]",
          "w-full"
        )}>
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
            <span className="text-lg font-semibold text-gray-900">Moderator</span>
          </div>

          {/* Desktop title */}
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900">
              {navItems.find(item => 
                pathname === item.path || pathname.startsWith(`${item.path}/`)
              )?.name || "Dashboard"}
            </h1>
          </div>

          {/* Search Bar - Placeholder for future implementation */}
          <div className="relative mx-4 hidden flex-1 max-w-md md:block">
            <div className="relative">
              <div className="w-full h-10 bg-background/80 backdrop-blur-sm border-0 shadow-lg ring-1 ring-border/50 rounded-xl px-4 text-sm placeholder:text-muted-foreground/70 focus-within:ring-2 focus-within:ring-orange-300 focus-within:shadow-xl transition-all duration-300 flex items-center text-gray-500">
                <Search className="h-4 w-4 mr-2" />
                Search moderation functions...
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 rounded-xl pointer-events-none" />
            </div>
          </div>

          {/* Moderator User Info and Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex">
                <UserDisplay
                  variant="name-only"
                  showRole={true}
                  textClassName="flex flex-col items-end text-gray-900"
                  className="gap-1"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative group p-0">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-orange-100 to-orange-200 ring-2 ring-border/50 group-hover:ring-orange-300 transition-all duration-300 shadow-sm group-hover:shadow-md">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={user?.avatarUrl} alt={user?.firstName || "Moderator"} className="transition-transform duration-300 group-hover:scale-110" />
                        <AvatarFallback className="bg-orange-100 text-orange-700">
                          {user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || "M"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {/* Online status indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background shadow-sm" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Moderator Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/moderator/profile" className="cursor-pointer">
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
        <main className="flex-1 w-full h-full pt-16 pb-16 md:pb-0 overflow-y-auto bg-gray-50">
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
                      ? "text-orange-600"
                      : "text-gray-600 hover:text-orange-600"
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
                        ? "text-orange-600 font-medium"
                        : "text-gray-600 group-hover:text-orange-600"
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