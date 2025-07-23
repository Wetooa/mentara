"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileUrl } from "@/lib/utils";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { UserSearchBar, User } from "@/components/search";
import { DashboardPageMetadata } from "@/components/metadata/SimplePageMetadata";
import { UserDisplay } from "@/components/common/UserDisplay";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  console.log("Current user:", user);

  const handleUserSelect = (user: User) => {
    console.log("Selected user:", user);
    router.push(`/client/profile/${user.id}`);
  };

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
        <nav className="hidden md:flex fixed left-0 top-0 z-10 h-full w-[70px] flex-col items-center border-r border-gray-200 bg-white py-4">
          <Link href="/client" className="mb-8 px-2">
            <Image
              src="/icons/mentara/mentara-icon.png"
              alt="Mentara Logo"
              width={50}
              height={50}
              priority
              className="hover:scale-110 transition-transform duration-300"
            />
          </Link>
          <div className="flex flex-1 flex-col items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`relative group flex h-14 w-14 flex-col items-center justify-center transition-all duration-300 ease-in-out ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  <div
                    className={`absolute inset-0 transition-all duration-400 ease-in-out ${
                      isActive
                        ? "bg-primary/15 rounded-2xl scale-100"
                        : "bg-transparent rounded-full scale-75 group-hover:bg-primary/10 group-hover:rounded-2xl group-hover:scale-100"
                    }`}
                  />
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-primary rounded-r-full transition-all duration-300 ease-in-out ${
                      isActive
                        ? "h-8 opacity-100"
                        : "h-0 opacity-0 group-hover:h-5 group-hover:opacity-100"
                    }`}
                  />
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={24}
                      height={24}
                      className={`transition-all duration-300 ${
                        isActive
                          ? "text-primary scale-110"
                          : "text-muted-foreground group-hover:text-primary group-hover:scale-110"
                      }`}
                    />
                    <span
                      className={`mt-1 text-center text-[9px] font-medium transition-all duration-300 ${
                        isActive
                          ? "text-primary opacity-100"
                          : "text-muted-foreground opacity-75 group-hover:text-primary group-hover:opacity-100"
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                </Link>
              );
            })}
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
                <Image
                  src="/mentara-landscape.png"
                  alt="Mentara"
                  width={120}
                  height={28}
                  priority
                />
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

        <div className="flex flex-1 flex-col w-full h-screen md:pl-[70px]">
          <header className="fixed top-0 right-0 z-20 flex h-[60px] w-full md:w-[calc(100%-70px)] items-center justify-between border-b border-gray-200 bg-white px-4">
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-gray-700 hover:text-gray-900"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Image
                src="/mentara-landscape.png"
                alt="Mentara"
                width={100}
                height={24}
                priority
              />
            </div>
            <div className="relative mx-4 hidden flex-1 md:block">
              <div className="relative">
                <UserSearchBar
                  placeholder="Search users (clients, therapists, moderators)..."
                  onUserSelect={handleUserSelect}
                  showRoleFilter={false}
                  className="w-full h-10 bg-background/80 backdrop-blur-sm border-0 shadow-lg ring-1 ring-border/50 rounded-2xl px-4 text-sm placeholder:text-muted-foreground/70 focus-within:ring-2 focus-within:ring-primary/30 focus-within:shadow-xl transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-2xl pointer-events-none" />
              </div>
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
                  <div className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 ring-2 ring-border/50 group-hover:ring-primary/30 transition-all duration-300 shadow-sm group-hover:shadow-md">
                    <Image
                      src={user?.avatarUrl || "/icons/avatar-placeholder.svg"}
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

          {/* Mobile Search Bar - Shows below header on mobile */}
          <div className="md:hidden fixed top-[60px] left-0 right-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-3 shadow-sm">
            <div className="relative">
              <UserSearchBar
                placeholder="Search users..."
                onUserSelect={handleUserSelect}
                showRoleFilter={false}
                className="w-full h-10 bg-background/80 backdrop-blur-sm border-0 shadow-md ring-1 ring-border/50 rounded-2xl px-4 text-sm placeholder:text-muted-foreground/70 focus-within:ring-2 focus-within:ring-primary/30 focus-within:shadow-lg transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-2xl pointer-events-none" />
            </div>
          </div>

          {/* Main Content - Responsive padding */}
          <main className="flex-1 w-full h-full pt-[60px] md:pt-[60px] pb-16 md:pb-0 overflow-y-auto bg-gray-100">
            <div className="md:hidden h-[50px]" />{" "}
            {/* Extra space for mobile search */}
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200">
            <div className="flex items-center justify-around py-2">
              {navItems.slice(0, 5).map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`relative group flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-0 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={20}
                      height={20}
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
