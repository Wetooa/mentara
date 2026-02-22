"use client";

import React from "react";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface MobileProgressHeaderProps {
  title: string;
  progress: number;
  currentSection: string;
  onMenuClick: () => void;
  onPreviousSection?: () => void;
  onNextSection?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function MobileProgressHeader({
  title,
  progress,
  currentSection,
  onMenuClick,
  onPreviousSection,
  onNextSection,
  hasPrevious = false,
  hasNext = false,
}: MobileProgressHeaderProps) {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      {/* Main header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="text-green-700 hover:text-green-900 hover:bg-green-100"
            data-testid="mobile-menu-button"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h1>
            <p className="text-sm text-gray-600 truncate">
              {currentSection}
            </p>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            {progress}%
          </span>
          <div className="w-12">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between px-4 pb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousSection}
          disabled={!hasPrevious || !onPreviousSection}
          className="flex items-center gap-2"
          data-testid="mobile-previous-button"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={onNextSection}
          disabled={!hasNext || !onNextSection}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          data-testid="mobile-next-button"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default MobileProgressHeader;