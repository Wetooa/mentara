"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import { UserSearchBar, User } from "@/components/search";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleUserSelect = (user: User) => {
    // Navigate to user profile or handle user selection
    console.log("Selected user:", user);
    // For now, we'll just log the user. In a real app, you might navigate to their profile
    router.push(`/client/profile/${user.id}`);
  };

  const handleLogout = () => {
    logout();
  };

  // Navigation menu items
  const navItems = [
    {
      name: "Dashboard",
      path: "/client",
      icon: "/icons/dashboard.svg",
      id: "dashboard",
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
    <div className="flex h-screen w-full bg-white">
      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 z-10 h-full w-[70px] flex-col items-center border-r border-gray-200 bg-white py-4">
        {/* Logo */}
        <Link href="/client" className="mb-8 px-2">
          <Image
            src="/icons/mentara/mentara-icon.png"
            alt="Mentara Logo"
            width={50}
            height={50}
            priority
          />
        </Link>

        {/* Navigation Items */}
        <div className="flex flex-1 flex-col items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex h-12 w-12 flex-col items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? "bg-green-100 text-green-800"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <div className="flex flex-col items-center justify-center">
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={24}
                    height={24}
                    className={isActive ? "text-green-800" : "text-gray-500"}
                  />
                  <span className="mt-1 text-center text-[10px]">
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
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-green-100 text-green-800"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Image
                        src={item.icon}
                        alt={item.name}
                        width={20}
                        height={20}
                        className={
                          isActive ? "text-green-800" : "text-gray-500"
                        }
                      />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="border-t p-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Area - Responsive padding */}
      <div className="flex flex-1 flex-col w-full h-screen md:pl-[70px]">
        {/* Top Header - Responsive */}
        <header className="fixed top-0 right-0 z-20 flex h-[60px] w-full md:w-[calc(100%-70px)] items-center justify-between border-b border-gray-200 bg-white px-4">
          {/* Mobile menu button and logo */}
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

          {/* Search Bar - Hidden on mobile */}
          <div className="relative mx-4 hidden flex-1 md:block">
            <UserSearchBar
              placeholder="Search users (clients, therapists, moderators)..."
              onUserSelect={handleUserSelect}
              showRoleFilter={false}
              className="w-full"
            />
          </div>

          {/* User Area */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative text-gray-700 hover:text-green-700 p-2">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[10px] text-white">
                3
              </span>
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden text-sm font-medium text-gray-700 sm:block">
                User
              </span>
              <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                <Image
                  src="/avatar-placeholder.png"
                  alt="User Avatar"
                  width={32}
                  height={32}
                />
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:block p-2 text-gray-700 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Search Bar - Shows below header on mobile */}
        <div className="md:hidden fixed top-[60px] left-0 right-0 z-10 bg-white border-b px-4 py-2">
          <UserSearchBar
            placeholder="Search users..."
            onUserSelect={handleUserSelect}
            showRoleFilter={false}
            className="w-full"
          />
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
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 ${
                    isActive ? "text-green-800" : "text-gray-500"
                  }`}
                >
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={20}
                    height={20}
                    className={isActive ? "text-green-800" : "text-gray-500"}
                  />
                  <span className="text-[10px] mt-1 truncate max-w-[60px]">
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
