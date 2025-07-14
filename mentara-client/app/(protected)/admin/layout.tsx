"use client";

import React, { useState } from "react";
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
import { useClerk, useUser } from "@clerk/nextjs";
import { useRole } from "@/hooks/useRole";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin } = useRole();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();

  // Admin data from Clerk user
  const admin = {
    name:
      user?.fullName || user?.primaryEmailAddress?.emailAddress || "Admin User",
    email: user?.primaryEmailAddress?.emailAddress || "admin@mentara.com",
    avatarUrl: user?.imageUrl || "/icons/user-avatar.png",
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
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const handleLogout = async () => {
    try {
      // Use Clerk's signOut method to properly sign out the user
      await signOut();

      // After successful logout, redirect to main page
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if there's an error, try to redirect to main page
      router.push("/");
    }
  };

  // Show loading state while user data is loading
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // If not an admin, redirect to main page (middleware should handle this)
  if (!isAdmin) {
    router.push("/");
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
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span
                    className={cn(
                      "mr-3",
                      isActive ? "text-blue-600" : "text-gray-500"
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
            <p className="text-xs text-gray-500">© 2025 Mentara Admin</p>
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
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          <span
                            className={cn(
                              "mr-3",
                              isActive ? "text-blue-600" : "text-gray-500"
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

              <h1 className="text-lg font-semibold md:hidden">Mentara Admin</h1>
              <h1 className="text-lg font-semibold hidden md:block">
                {navItems.find(
                  (item) =>
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)
                )?.title || "Dashboard"}
              </h1>
            </div>

            {/* Admin User Info and Actions */}
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={admin.avatarUrl} alt={admin.name} />
                      <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-sm font-medium text-left">
                      {admin.name}
                      <ChevronDown className="ml-1 h-4 w-4 inline" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/profile">Profile</Link>
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
