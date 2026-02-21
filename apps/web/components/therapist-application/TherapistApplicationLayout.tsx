"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { MobileDrawer } from "@/components/ui/mobile-drawer";
import { MobileProgressHeader } from "@/components/ui/mobile-progress-header";
import { SidebarContent } from "@/components/therapist-application/SidebarContent";
import { useIsMobile } from "@/hooks/utils/useMobile";
import type { ApplicationSection } from "@/types/therapist-application";
import type { CompletionStatus } from "@/types/therapist-application";

interface TherapistApplicationLayoutProps {
  children: React.ReactNode;
  sections: ApplicationSection[];
  sectionCompletions: Record<string, CompletionStatus>;
  openSections: Set<string>;
  displayProgress: number;
  currentSectionIndex: number;
  currentSection?: ApplicationSection;
  onToggleSection: (sectionId: string) => void;
  onMobileMenuClick: () => void;
  onMobileDrawerClose: () => void;
  onGoToNextSection: () => void;
  onGoToPreviousSection: () => void;
  onShowRestartModal: () => void;
  mobileDrawerOpen: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
}

/**
 * Layout component for therapist application page
 * Handles responsive layout with sidebar and mobile navigation
 */
export function TherapistApplicationLayout({
  children,
  sections,
  sectionCompletions,
  openSections,
  displayProgress,
  currentSectionIndex,
  currentSection,
  onToggleSection,
  onMobileMenuClick,
  onMobileDrawerClose,
  onGoToNextSection,
  onGoToPreviousSection,
  onShowRestartModal,
  mobileDrawerOpen,
  hasPrevious,
  hasNext,
}: TherapistApplicationLayoutProps) {
  const isMobile = useIsMobile();

  // Memoized sidebar content props to prevent unnecessary re-renders
  const sidebarContentProps = useMemo(
    () => ({
      displayProgress,
      sections,
      sectionCompletions,
      openSections,
      toggleSection: onToggleSection,
      isMobile,
      setMobileDrawerOpen: onMobileMenuClick,
      setShowRestartModal: onShowRestartModal,
    }),
    [
      displayProgress,
      sections,
      sectionCompletions,
      openSections,
      onToggleSection,
      isMobile,
      onMobileMenuClick,
      onShowRestartModal,
    ]
  );

  return (
    <div className="w-full min-h-screen bg-secondary/5">
      {/* Mobile Header - Only shown on mobile */}
      {isMobile && (
        <MobileProgressHeader
          title="Therapist Application"
          progress={displayProgress}
          currentSection={currentSection?.title || ""}
          onMenuClick={onMobileMenuClick}
          onPreviousSection={onGoToPreviousSection}
          onNextSection={onGoToNextSection}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        />
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <MobileDrawer
          isOpen={mobileDrawerOpen}
          onClose={onMobileDrawerClose}
          title="Application Progress"
        >
          <SidebarContent {...sidebarContentProps} />
        </MobileDrawer>
      )}

      <div className={`flex ${isMobile ? "flex-col" : "flex-row"}`}>
        {/* Desktop Sidebar - Only shown on desktop */}
        {!isMobile && (
          <div
            className="w-1/5 bg-secondary/10 p-6 flex flex-col sticky top-0 h-screen shadow-sm border-r border-secondary/20"
            data-testid="sidebar"
          >
            <SidebarContent {...sidebarContentProps} />
          </div>
        )}

        {/* Main Content */}
        <div
          className={`${isMobile ? "w-full" : "w-4/5"} flex justify-center ${isMobile ? "p-4" : "p-8"}`}
          data-testid="main-content"
        >
          <div className="w-full max-w-4xl">
            {/* Desktop Header - Hidden on mobile since we have mobile header */}
            {!isMobile && (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-secondary mb-2">
                  Therapist Application
                </h1>
                <p className="text-secondary/80">
                  Complete all sections below to submit your application to join
                  the Mentara therapist network.
                </p>
              </div>
            )}

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

