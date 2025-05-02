"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Navigation menu items for therapist
  const navItems = [
    {
      name: "Dashboard",
      path: "/therapist/dashboard",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="3"
            width="7"
            height="7"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="14"
            y="3"
            width="7"
            height="7"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="3"
            y="14"
            width="7"
            height="7"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="14"
            y="14"
            width="7"
            height="7"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
      id: "dashboard",
    },
    {
      name: "Patient",
      path: "/therapist/patients",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="9"
            cy="9"
            r="4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 3.13C17.7699 3.58317 19.0078 5.17885 19.0078 7.005C19.0078 8.83115 17.7699 10.4268 16 10.88"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      id: "patient",
    },
    {
      name: "Community",
      path: "/therapist/community",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17 19H13V15H19V10C19 8.89543 18.1046 8 17 8H7C5.89543 8 5 8.89543 5 10V15H11V19H7C5.89543 19 5 18.1046 5 17V7C5 5.89543 5.89543 5 7 5H17C18.1046 5 19 5.89543 19 7V17C19 18.1046 18.1046 19 17 19Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="9"
            cy="12"
            r="1.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="15"
            cy="12"
            r="1.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      id: "community",
    },
    {
      name: "Messages",
      path: "/therapist/messages",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      id: "messages",
    },
    {
      name: "Worksheets",
      path: "/therapist/worksheets",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 2V8H20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 13H8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 17H8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 9H8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      id: "worksheets",
    },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Left Sidebar Navigation */}
      <nav className="flex w-[60px] flex-col items-center border-r border-gray-200 bg-gray-100 py-4">
        {/* Logo */}
        <Link href="/therapist/dashboard" className="mb-6">
          <Image
            src="/mentara-icon.png"
            alt="Mentara Logo"
            width={32}
            height={32}
            priority
          />
        </Link>

        {/* Navigation Items */}
        <div className="flex flex-1 flex-col items-center space-y-6">
          {navItems.map((item) => {
            const isActive = pathname.includes(item.path);
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex h-14 w-full flex-col items-center justify-center transition-colors`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`p-1.5 rounded-md ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:text-primary"
                    }`}
                  >
                    {React.cloneElement(item.icon as React.ReactElement, {
                      className: "h-5 w-5",
                    })}
                  </div>
                  <span
                    className={`mt-1 text-center text-[10px] ${
                      isActive ? "text-primary font-medium" : "text-gray-600"
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

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 bg-primary text-white h-14">
          <div className="flex items-center">
            {/* Search Bar */}
            <div className="relative ml-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Search Mentara"
                  className="w-72 rounded-full bg-white/20 py-1.5 pl-9 pr-4 text-white placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-white/30"
                />
              </div>
            </div>
          </div>

          {/* User Area */}
          <div className="flex items-center space-x-4">
            <button className="relative text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                2
              </span>
            </button>

            <div className="flex items-center">
              <span className="mr-2 text-white">Therafi</span>
              <div className="h-8 w-8 overflow-hidden rounded-full bg-white">
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

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
