"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { ToastProvider } from "@/contexts/ToastContext";
import { UserSearchBar, User } from "@/components/search";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleUserSelect = (user: User) => {
    // Navigate to user profile or handle user selection
    console.log('Selected user:', user);
    // For now, we'll just log the user. In a real app, you might navigate to their profile
    // router.push(`/user/profile/${user.id}`);
  };

  // Navigation menu items
  const navItems = [
    {
      name: "Dashboard",
      path: "/user",
      icon: "/icons/dashboard.svg",
      id: "dashboard",
    },
    {
      name: "Therapist",
      path: "/user/therapist",
      icon: "/icons/therapist.svg",
      id: "therapist",
    },
    {
      name: "Community",
      path: "/user/community",
      icon: "/icons/community.svg",
      id: "community",
    },
    {
      name: "Messages",
      path: "/user/messages",
      icon: "/icons/messages.svg",
      id: "messages",
    },
    {
      name: "Worksheets",
      path: "/user/worksheets",
      icon: "/icons/worksheets.svg",
      id: "worksheets",
    },
  ];

  return (
    <ToastProvider>
      <div className="flex h-screen w-full bg-white">
        {/* Left Sidebar Navigation - Now fixed */}
        <nav className="fixed left-0 top-0 z-10 flex h-full w-[70px] flex-col items-center border-r border-gray-200 bg-white py-4">
          {/* Logo */}
          <Link href="/dashboard" className="mb-8 px-2">
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

        {/* Main Content Area - With left padding to account for fixed sidebar */}
        <div className="flex flex-1 flex-col w-full h-screen pl-[70px]">
          {/* Top Header - Now fixed */}
          <header className="fixed top-0 right-0 z-10 flex h-[50px] w-[calc(100%-70px)] items-center justify-between border-b border-gray-200 bg-white px-4">
            {/* Logo for mobile */}
            <div className="flex items-center gap-2 md:hidden">
              <Image
                src="/mentara-landscape.png"
                alt="Mentara"
                width={120}
                height={28}
                priority
              />
            </div>

            {/* Search Bar */}
            <div className="relative mx-4 hidden flex-1 md:block">
              <UserSearchBar
                placeholder="Search users (clients, therapists, moderators)..."
                onUserSelect={handleUserSelect}
                showRoleFilter={false}
                className="w-full"
              />
            </div>

            {/* User Area */}
            <div className="flex items-center gap-4">
              <button className="relative text-gray-700 hover:text-green-700">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[10px] text-white">
                  3
                </span>
              </button>

              <div className="flex items-center gap-2">
                <span className="hidden text-sm font-medium text-gray-700 md:block">
                  Tristan
                </span>
                <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                  <Image
                    src="/avatar-placeholder.png"
                    alt="User Avatar"
                    width={32}
                    height={32}
                  />
                </div>
              </div>

              {/* FIX: dummy User Authentication Buttons */}
              <SignedOut>
                <SignInButton />
                <SignUpButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>

          {/* Main Content - With top padding to account for fixed header */}
          <main className="flex-1 w-full h-full pt-[50px] overflow-y-auto bg-gray-100">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
