"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Navigation menu items
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "/icons/dashboard.svg",
      id: "dashboard",
    },
    {
      name: "Therapist",
      path: "/main/therapist",
      icon: "/icons/therapist.svg",
      id: "therapist",
    },
    {
      name: "Community",
      path: "/main/community",
      icon: "/icons/community.svg",
      id: "community",
    },
    {
      name: "Messages",
      path: "/main/messages",
      icon: "/icons/messages.svg",
      id: "messages",
    },
    {
      name: "Worksheets",
      path: "/main/worksheets",
      icon: "/icons/worksheets.svg",
      id: "worksheets",
    },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Left Sidebar Navigation */}
      <nav className="flex w-[70px] flex-col items-center border-r border-gray-200 bg-white py-4">
        {/* Logo */}
        <Link href="/dashboard" className="mb-8 px-2">
          <Image
            src="/mentara-icon.png"
            alt="Mentara Logo"
            width={50}
            height={50}
            priority
          />
        </Link>

        {/* Navigation Items */}
        <div className="flex flex-1 flex-col items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname.includes(item.path);
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

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-[50px] items-center justify-between border-b border-gray-200 bg-white px-4">
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Mentara"
                className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
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
          </div>
        </header>

        {/* Main Content - Grey Area for Children */}
        <main className="flex-1 overflow-auto bg-gray-100">{children}</main>
      </div>
    </div>
  );
}
