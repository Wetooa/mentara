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
  ChevronDown,
  Menu,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
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
import { useRoleCheck } from "@/hooks/auth/useRoleCheck";


export default function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoading, isAuthorized } = useRoleCheck("moderator");

  // Moderator data - simplified since we only need display info
  const moderator = {
    name: "Moderator",
    email: "moderator@mentara.com",
    avatarUrl: "/icons/user-avatar.png",
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/moderator",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Content Moderation",
      href: "/moderator/content",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      title: "Reports",
      href: "/moderator/reports",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      title: "Users",
      href: "/moderator/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Audit Logs",
      href: "/moderator/audit-logs",
      icon: <History className="h-5 w-5" />,
    },
    {
      title: "Profile",
      href: "/moderator/profile",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const handleLogout = async () => {
    try {
      // Clear token and redirect to sign-in
      localStorage.removeItem("token");
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Show loading state while checking authorization
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  // If not authorized, the hook handles redirection automatically
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-gray-200 fixed inset-y-0">
        <div className="flex h-16 items-center border-b px-6">
          <Logo />
        </div>

        <div className="flex flex-col justify-between flex-1 overflow-y-auto">
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span
                    className={cn(
                      "mr-3",
                      isActive ? "text-orange-600" : "text-gray-500"
                    )}
                  >
                    {item.icon}
                  </span>
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <p className="text-xs text-gray-500">© 2025 Mentara Moderator</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden mr-2">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[270px]">
                  <div className="flex h-16 items-center border-b px-6">
                    <Logo />
                  </div>

                  <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            isActive
                              ? "bg-orange-50 text-orange-600"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          <span
                            className={cn(
                              "mr-3",
                              isActive ? "text-orange-600" : "text-gray-500"
                            )}
                          >
                            {item.icon}
                          </span>
                          {item.title}
                        </Link>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>

              <h1 className="text-lg font-semibold md:hidden">Mentara Moderator</h1>
              <h1 className="text-lg font-semibold hidden md:block">
                {navItems.find(
                  (item) =>
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)
                )?.title || "Dashboard"}
              </h1>
            </div>

            {/* Moderator User Info and Actions */}
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={moderator.avatarUrl} alt={moderator.name} />
                      <AvatarFallback>{moderator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-sm font-medium text-left">
                      {moderator.name}
                      <ChevronDown className="ml-1 h-4 w-4 inline" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/moderator/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}