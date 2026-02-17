"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableColumns,
  faUser,
  faUsers,
  faGear,
  faFlag,
} from "@fortawesome/free-solid-svg-icons";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function AdminSidebar({
  activeSection,
  setActiveSection,
}: AdminSidebarProps) {
  return (
    <div className="flex flex-col h-full py-4 px-2 space-y-4">
      <div className="text-lg font-semibold px-4 mb-4">Admin Dashboard</div>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex items-center gap-2 text-base font-medium text-gray-800 py-2 px-4 rounded-md hover:bg-gray-100">
              <FontAwesomeIcon icon={faTableColumns} className="w-4 h-4" />
              <p>Dashboard</p>
              <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>

          <CollapsibleContent>
            <SidebarGroupContent className="pl-9 mt-1 space-y-1">
              <Link
                href="/admin"
                className="block text-sm text-gray-600 py-1 hover:text-gray-900"
              >
                Overview
              </Link>
              <Link
                href="/admin/analytics"
                className="block text-sm text-gray-600 py-1 hover:text-gray-900"
              >
                Analytics
              </Link>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger
              className={`flex items-center gap-2 text-base font-medium py-2 px-4 rounded-md hover:bg-gray-100 ${activeSection.includes("therapist") ? "bg-gray-100 text-gray-900" : "text-gray-800"}`}
            >
              <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
              <p>Therapists</p>
              <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>

          <CollapsibleContent>
            <SidebarGroupContent className="pl-9 mt-1 space-y-1">
              <button
                className={`block text-sm py-1 w-full text-left ${activeSection === "therapist-applications" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setActiveSection("therapist-applications")}
              >
                Applications
              </button>
              <button
                className={`block text-sm py-1 w-full text-left ${activeSection === "active-therapists" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setActiveSection("active-therapists")}
              >
                Active Therapists
              </button>
              <button
                className={`block text-sm py-1 w-full text-left ${activeSection === "therapist-reports" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setActiveSection("therapist-reports")}
              >
                Reported Therapists
              </button>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger
              className={`flex items-center gap-2 text-base font-medium py-2 px-4 rounded-md hover:bg-gray-100 ${activeSection.includes("user") ? "bg-gray-100 text-gray-900" : "text-gray-800"}`}
            >
              <FontAwesomeIcon icon={faUsers} className="w-4 h-4" />
              <p>Users</p>
              <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>

          <CollapsibleContent>
            <SidebarGroupContent className="pl-9 mt-1 space-y-1">
              <button
                className={`block text-sm py-1 w-full text-left ${activeSection === "user-management" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setActiveSection("user-management")}
              >
                User Management
              </button>
              <button
                className={`block text-sm py-1 w-full text-left ${activeSection === "banned-users" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setActiveSection("banned-users")}
              >
                Banned Users
              </button>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger
              className={`flex items-center gap-2 text-base font-medium py-2 px-4 rounded-md hover:bg-gray-100 ${activeSection.includes("report") || activeSection.includes("content") ? "bg-gray-100 text-gray-900" : "text-gray-800"}`}
            >
              <FontAwesomeIcon icon={faFlag} className="w-4 h-4" />
              <p>Reports & Content</p>
              <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>

          <CollapsibleContent>
            <SidebarGroupContent className="pl-9 mt-1 space-y-1">
              <button
                className={`block text-sm py-1 w-full text-left ${activeSection === "reports-overview" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setActiveSection("reports-overview")}
              >
                Reports Overview
              </button>
              <button
                className={`block text-sm py-1 w-full text-left ${activeSection === "reported-posts" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setActiveSection("reported-posts")}
              >
                Reported Posts
              </button>
              <button
                className={`block text-sm py-1 w-full text-left ${activeSection === "reported-comments" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setActiveSection("reported-comments")}
              >
                Reported Comments
              </button>
              <button
                className={`block text-sm py-1 w-full text-left ${activeSection === "content-search" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setActiveSection("content-search")}
              >
                Content Search
              </button>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <div className="pt-4 mt-auto">
        <button className="flex items-center gap-2 text-base font-medium text-gray-800 py-2 px-4 rounded-md hover:bg-gray-100 w-full">
          <FontAwesomeIcon icon={faGear} className="w-4 h-4" />
          <p>Settings</p>
        </button>
      </div>
    </div>
  );
}
