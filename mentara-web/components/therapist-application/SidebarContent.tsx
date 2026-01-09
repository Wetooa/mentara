"use client";

import React, { memo } from "react";
import { CheckCircle, ChevronDown, ChevronRight, X } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MentaraLogo } from "@/components/common/MentaraLogo";

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  estimatedTime: string;
  fields: string[];
  isRequired: boolean;
}

interface SectionCompletion {
  completed: number;
  total: number;
  percentage: number;
}

interface SidebarContentProps {
  displayProgress: number;
  sections: Section[];
  sectionCompletions: Record<string, SectionCompletion>;
  openSections: Set<string>;
  toggleSection: (sectionId: string) => void;
  isMobile: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  setShowRestartModal: (show: boolean) => void;
}

export const SidebarContent = memo(function SidebarContent({
  displayProgress,
  sections,
  sectionCompletions,
  openSections,
  toggleSection,
  isMobile,
  setMobileDrawerOpen,
  setShowRestartModal,
}: SidebarContentProps) {
  return (
    <>
      <div className="mb-8">
        <MentaraLogo
          href="/about"
          variant="landscape"
          width={250}
          height={100}
          showGradient={true}
        />
      </div>

      <div className="mt-4 mb-8">
        <p className="text-sm text-secondary/70 mb-1">You&apos;re working on</p>
        <h1 className="text-2xl font-bold text-secondary">Application</h1>
      </div>

      {/* Overall Progress */}
      <div className="mb-6" data-testid="overall-progress">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-secondary">
            Overall Progress
          </span>
          <span className="text-sm text-secondary/80">{displayProgress}%</span>
        </div>
        <Progress value={displayProgress} className="h-2" />
      </div>

      {/* Section List */}
      <div className="space-y-3 flex-1">
        {sections.map((section) => {
          const completion = sectionCompletions[section.id];
          const isOpen = openSections.has(section.id);
          const isCompleted = completion.percentage === 100;

          return (
            <div
              key={section.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isOpen
                  ? "bg-secondary/20 border-secondary/40"
                  : isCompleted
                    ? "bg-secondary/10 border-secondary/30"
                    : "bg-white border-secondary/20 hover:bg-secondary/5"
              }`}
              onClick={() => {
                // Open the section if it's not already open
                if (!isOpen) {
                  toggleSection(section.id);
                }
                // Close mobile drawer when clicking on section
                if (isMobile) {
                  setMobileDrawerOpen(false);
                }
                // Smooth scroll to the section
                setTimeout(() => {
                  const element = document.getElementById(
                    `section-${section.id}`
                  );
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }, 100); // Small delay to allow section to open
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 ${isCompleted ? "text-secondary" : "text-secondary/50"}`}
                >
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm text-secondary truncate">
                      {section.title}
                    </h3>
                    {isCompleted && (
                      <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-secondary/70">
                      {completion.completed}/{completion.total} complete
                    </span>
                    <span className="text-xs text-secondary/70">
                      {completion.percentage}%
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-auto space-y-3">
        {/* Restart Form Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowRestartModal(true)}
          className="w-full min-h-[44px] h-auto px-3 py-2 text-xs border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 touch-manipulation"
        >
          <X className="w-4 h-4 mr-2" />
          Restart Form
        </Button>

        <div className="text-xs text-gray-500">
          Form saves automatically as you type
        </div>

        <div className="text-xs text-gray-500">
          © {new Date().getFullYear()} Mentara. All rights reserved.
        </div>
      </div>
    </>
  );
});