"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard,
  Users, 
  MessageSquare, 
  FileText, 
  Calendar,
  UserCheck,
  Community,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserSearchBar, User as SearchUser } from "@/components/search";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { Button } from "@/components/ui/button";
import { cn, getProfileUrl } from "@/lib/utils";


export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

  // Handle user selection from search
  const handleUserSelect = (user: SearchUser) => {
    console.log("Selected user:", user);
    // Navigate to patient profile if it's a client, or handle other user types
    if (user.role === "client") {
      router.push(`/therapist/patients/${user.id}`);
    }
  };

  // Sidebar state management
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('therapist-sidebar-expanded');
    if (saved !== null) {
      setIsSidebarExpanded(JSON.parse(saved));
    }
  }, []);

  // Save sidebar state to localStorage
  const toggleSidebar = () => {
    const newState = !isSidebarExpanded;
    setIsSidebarExpanded(newState);
    localStorage.setItem('therapist-sidebar-expanded', JSON.stringify(newState));
  };

  // Navigation menu items for therapist
  const navItems = [
    {
      name: "Dashboard",
      path: "/therapist/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      id: "dashboard",
    },
    {
      name: "Patients",
      path: "/therapist/patients",
      icon: <Users className="h-5 w-5" />,
      id: "patients",
    },
    {
      name: "Messages",
      path: "/therapist/messages",
      icon: <MessageSquare className="h-5 w-5" />,
      id: "messages",
    },
    {
      name: "Worksheets",
      path: "/therapist/worksheets",
      icon: <FileText className="h-5 w-5" />,
      id: "worksheets",
    },
    {
      name: "Schedule",
      path: "/therapist/schedule",
      icon: <Calendar className="h-5 w-5" />,
      id: "schedule",
    },
    {
      name: "Requests",
      path: "/therapist/requests",
      icon: <UserCheck className="h-5 w-5" />,
      id: "requests",
    },
    {
      name: "Community",
      path: "/therapist/community",
      icon: <Community className="h-5 w-5" />,
      id: "community",
    },
  ];

  return (
    <div className="flex h-screen w-full bg-white">
      {/* Desktop Sidebar Navigation */}
      <nav className={cn(
        "hidden md:flex fixed left-0 top-0 z-10 h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out",
        isSidebarExpanded ? "w-64" : "w-[70px]"
      )}>
        {/* Header with Logo and Toggle */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <Link 
            href="/therapist/dashboard" 
            className={cn(
              "flex items-center transition-all duration-300",
              isSidebarExpanded ? "" : "justify-center"
            )}
          >
            <Image
              src="/mentara-icon.png"
              alt="Mentara Logo"
              width={32}
              height={32}
              priority
              className="flex-shrink-0"
            />
            {isSidebarExpanded && (
              <span className="ml-3 text-lg font-semibold text-gray-900 transition-all duration-300">
                Therapist
              </span>
            )}
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "h-8 w-8 transition-all duration-300",
              !isSidebarExpanded && "opacity-0 hover:opacity-100"
            )}
          >
            {isSidebarExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.id}
                href={item.path}
                className={cn(
                  "relative group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 ease-in-out",
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-600",
                  !isSidebarExpanded && "justify-center px-2"
                )}
                title={!isSidebarExpanded ? item.name : undefined}
              >
                {/* Left accent indicator */}
                <div
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-blue-600 rounded-r-full transition-all duration-300 ease-in-out",
                    isActive
                      ? "h-8 opacity-100"
                      : "h-0 opacity-0 group-hover:h-5 group-hover:opacity-100"
                  )}
                />
                
                {/* Discord-style bevel background */}
                <div
                  className={cn(
                    "absolute inset-0 transition-all duration-400 ease-in-out",
                    isActive
                      ? "bg-blue-50 rounded-xl scale-100"
                      : "bg-transparent rounded-full scale-75 group-hover:bg-blue-50/50 group-hover:rounded-xl group-hover:scale-100"
                  )}
                />

                <div className="relative z-10 flex items-center gap-3">
                  <div
                    className={cn(
                      "transition-all duration-300",
                      isActive
                        ? "text-blue-600 scale-110"
                        : "text-gray-500 group-hover:text-blue-600 group-hover:scale-110"
                    )}
                  >
                    {item.icon}
                  </div>
                  
                  {isSidebarExpanded && (
                    <span
                      className={cn(
                        "transition-all duration-300",
                        isActive
                          ? "text-blue-600"
                          : "text-gray-700 group-hover:text-blue-600"
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
          {isSidebarExpanded ? (
            <p className="text-xs text-gray-500 text-center">© 2025 Mentara Therapist</p>
          ) : (
            <div className="flex justify-center">
              <div className="h-2 w-2 rounded-full bg-gray-300" />
            </div>
          )}
        </div>
      </nav>

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
                <span className="text-lg font-semibold text-gray-900">Therapist</span>
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
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-blue-50/50 hover:text-blue-600"
                      )}
                    >
                      <div
                        className={cn(
                          "transition-all duration-300",
                          isActive
                            ? "text-blue-600 scale-110"
                            : "text-gray-500 group-hover:text-blue-600 group-hover:scale-105"
                        )}
                      >
                        {item.icon}
                      </div>
                      <span
                        className={cn(
                          "font-medium transition-all duration-300",
                          isActive
                            ? "text-blue-600"
                            : "text-gray-700 group-hover:text-blue-600"
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
        <header className="fixed top-0 right-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 backdrop-blur-md px-4 shadow-sm" 
          style={{
            width: isSidebarExpanded 
              ? 'calc(100% - 256px)' 
              : 'calc(100% - 70px)',
            ...(window.innerWidth < 768 && { width: '100%' })
          }}
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
            <span className="text-lg font-semibold text-gray-900">Therapist</span>
          </div>

          {/* Desktop title */}
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900">
              {navItems.find(item => 
                pathname === item.path || pathname.startsWith(`${item.path}/`)
              )?.name || "Dashboard"}
            </h1>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="relative mx-4 hidden flex-1 max-w-md md:block">
            <div className="relative">
              <UserSearchBar
                placeholder="Search patients, colleagues..."
                onUserSelect={handleUserSelect}
                showRoleFilter={false}
                className="w-full h-10 bg-background/80 backdrop-blur-sm border-0 shadow-lg ring-1 ring-border/50 rounded-xl px-4 text-sm placeholder:text-muted-foreground/70 focus-within:ring-2 focus-within:ring-blue-300 focus-within:shadow-xl transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 rounded-xl pointer-events-none" />
            </div>
          </div>

          {/* User Area */}
          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationDropdown 
              variant="default" 
              maxNotifications={5} 
              showConnectionStatus={true}
              className="p-2 rounded-xl bg-background/80 backdrop-blur-sm hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md ring-1 ring-border/50 hover:ring-blue-200"
            />

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Therapist"}
                </span>
                <span className="text-xs text-gray-500 capitalize">{user?.role || "therapist"}</span>
              </div>

              <button 
                onClick={handleAvatarClick}
                className="relative group focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 rounded-full transition-all duration-300"
                title="Go to profile"
              >
                <div className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-border/50 group-hover:ring-blue-300 transition-all duration-300 shadow-sm group-hover:shadow-md cursor-pointer">
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

        {/* Mobile Search Bar - Shows below header on mobile */}
        <div className="md:hidden fixed top-16 left-0 right-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-3 shadow-sm">
          <div className="relative">
            <UserSearchBar
              placeholder="Search patients..."
              onUserSelect={handleUserSelect}
              showRoleFilter={false}
              className="w-full h-10 bg-background/80 backdrop-blur-sm border-0 shadow-md ring-1 ring-border/50 rounded-xl px-4 text-sm placeholder:text-muted-foreground/70 focus-within:ring-2 focus-within:ring-blue-300 focus-within:shadow-lg transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 rounded-xl pointer-events-none" />
          </div>
        </div>

        {/* Main Content - Responsive padding */}
        <main className="flex-1 w-full h-full pt-16 md:pt-16 pb-16 md:pb-0 overflow-y-auto bg-gray-50">
          <div className="md:hidden h-[50px]" /> {/* Extra space for mobile search */}
          {children}
        </main>

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
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  )}
                >
                  <div
                    className={cn(
                      "transition-all duration-300",
                      isActive
                        ? "text-blue-600 scale-110"
                        : "text-gray-600 group-hover:text-blue-600 group-hover:scale-105"
                    )}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] mt-1 truncate max-w-[60px] transition-all duration-300",
                      isActive
                        ? "text-blue-600 font-medium"
                        : "text-gray-600 group-hover:text-blue-600"
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
