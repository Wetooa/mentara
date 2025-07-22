"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  AlertTriangle,
  Search,
  Settings,
  UserCheck,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getProfileUrl } from "@/lib/utils";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const { user, logout } = useAuth();

  // Load sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-expanded');
    if (saved !== null) {
      setIsSidebarExpanded(JSON.parse(saved));
    }
  }, []);

  // Save sidebar state to localStorage
  const toggleSidebar = () => {
    const newState = !isSidebarExpanded;
    setIsSidebarExpanded(newState);
    localStorage.setItem('admin-sidebar-expanded', JSON.stringify(newState));
  };


  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "User Management",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Therapist Applications",
      href: "/admin/therapist-applications",
      icon: <UserCheck className="h-5 w-5" />,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      title: "Content Search",
      href: "/admin/content/search",
      icon: <Search className="h-5 w-5" />,
    },
    {
      title: "Content Management",
      href: "/admin/content",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Audit Logs",
      href: "/admin/audit-logs",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Desktop Sidebar Navigation */}
      <nav className={cn(
        "hidden md:flex fixed left-0 top-0 z-10 h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out",
        isSidebarExpanded ? "w-64" : "w-[70px]"
      )}>
        {/* Header with Logo and Toggle */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <Link 
            href="/admin" 
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
                Admin
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
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 ease-in-out",
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-700 hover:bg-blue-50/50 hover:text-blue-600",
                  !isSidebarExpanded && "justify-center px-2"
                )}
                title={!isSidebarExpanded ? item.title : undefined}
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
                      {item.title}
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
            <p className="text-xs text-gray-500 text-center">© 2025 Mentara Admin</p>
          ) : (
            <div className="flex justify-center">
              <div className="h-2 w-2 rounded-full bg-blue-300" />
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
                <span className="text-lg font-semibold text-gray-900">Admin</span>
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
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
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
                        {item.title}
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
            <span className="text-lg font-semibold text-gray-900">Admin</span>
          </div>

          {/* Desktop title */}
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900">
              {navItems.find(item => 
                pathname === item.href || pathname.startsWith(`${item.href}/`)
              )?.title || "Dashboard"}
            </h1>
          </div>

          {/* Search Bar - Placeholder for future implementation */}
          <div className="relative mx-4 hidden flex-1 max-w-md md:block">
            <div className="relative">
              <div className="w-full h-10 bg-background/80 backdrop-blur-sm border-0 shadow-lg ring-1 ring-border/50 rounded-xl px-4 text-sm placeholder:text-muted-foreground/70 focus-within:ring-2 focus-within:ring-blue-300 focus-within:shadow-xl transition-all duration-300 flex items-center text-gray-500">
                <Search className="h-4 w-4 mr-2" />
                Search admin functions...
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 rounded-xl pointer-events-none" />
            </div>
          </div>

          {/* Admin User Info and Actions */}
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
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-border/50 group-hover:ring-blue-300 transition-all duration-300 shadow-sm group-hover:shadow-md">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={admin.avatarUrl} alt={admin.name} className="transition-transform duration-300 group-hover:scale-110" />
                        <AvatarFallback className="bg-blue-100 text-blue-700">{admin.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    {/* Online status indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background shadow-sm" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/profile" className="cursor-pointer">
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
        <main className="flex-1 w-full h-full pt-16 overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
