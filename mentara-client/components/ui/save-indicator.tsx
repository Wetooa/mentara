"use client";

import React from "react";
import { Save, Loader2, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useTherapistForm from "@/store/therapistform";

interface SaveIndicatorProps {
  onManualSave?: () => void;
  className?: string;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({
  onManualSave,
  className = "",
}) => {
  const {
    isAutoSaving,
    autoSaveEnabled,
    lastSaved,
    toggleAutoSave,
  } = useTherapistForm();

  const getTimeSinceLastSave = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = now.getTime() - new Date(lastSaved).getTime();
    
    if (diff < 60000) {
      return `${Math.floor(diff / 1000)}s ago`;
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else {
      return `${Math.floor(diff / 3600000)}h ago`;
    }
  };

  const getSaveStatusIcon = () => {
    if (isAutoSaving) {
      return <Loader2 className="h-3 w-3 animate-spin" />;
    } else if (lastSaved) {
      return <Check className="h-3 w-3" />;
    } else {
      return <Clock className="h-3 w-3" />;
    }
  };

  const getSaveStatusText = () => {
    if (isAutoSaving) {
      return "Saving...";
    } else if (lastSaved) {
      const timeAgo = getTimeSinceLastSave();
      return `Saved ${timeAgo}`;
    } else {
      return "Not saved";
    }
  };

  const getSaveStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (isAutoSaving) {
      return "secondary";
    } else if (lastSaved) {
      return "default";
    } else {
      return "destructive";
    }
  };

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Save Status Badge */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={getSaveStatusVariant()} className="flex items-center gap-1">
              {getSaveStatusIcon()}
              <span className="text-xs">{getSaveStatusText()}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {autoSaveEnabled 
                ? "Auto-save is enabled. Form saves automatically every 30 seconds."
                : "Auto-save is disabled. Use manual save button."
              }
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Manual Save Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onManualSave}
              disabled={isAutoSaving}
              className="h-8 px-2"
            >
              <Save className="h-3 w-3" />
              <span className="ml-1 hidden sm:inline">Save</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save form progress manually</p>
          </TooltipContent>
        </Tooltip>

        {/* Auto-save Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={autoSaveEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleAutoSave}
              className="h-8 px-2"
            >
              <Clock className="h-3 w-3" />
              <span className="ml-1 hidden sm:inline">
                Auto-save {autoSaveEnabled ? "ON" : "OFF"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {autoSaveEnabled 
                ? "Disable automatic saving"
                : "Enable automatic saving every 30 seconds"
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};