"use client";

import React, { useState } from "react";
import { Calendar, FileText, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SessionWorksheetActionsProps {
  conversationId?: string;
  therapistId?: string;
  clientId?: string;
  className?: string;
}

export function SessionWorksheetActions({
  conversationId,
  therapistId,
  clientId,
  className,
}: SessionWorksheetActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleScheduleSession = () => {
    setIsOpen(false);
    if (clientId && therapistId) {
      router.push(`/client/booking?therapistId=${therapistId}`);
    } else {
      router.push("/client/booking");
    }
  };

  const handleViewSessions = () => {
    setIsOpen(false);
    router.push("/client/sessions");
  };

  const handleAssignWorksheet = () => {
    setIsOpen(false);
    if (clientId) {
      router.push(`/therapist/worksheets?clientId=${clientId}`);
    } else {
      router.push("/therapist/worksheets");
    }
  };

  const handleViewWorksheets = () => {
    setIsOpen(false);
    router.push("/client/worksheets");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn("h-9 w-9 rounded-full", className)}
          aria-label="Session and worksheet actions"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700 px-2 py-1">
            Quick Actions
          </p>
          
          {/* Session Actions */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-auto py-2 px-3"
              onClick={handleScheduleSession}
            >
              <Calendar className="h-3.5 w-3.5 mr-2 text-primary" />
              Schedule Session
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-auto py-2 px-3"
              onClick={handleViewSessions}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-2 text-gray-600" />
              View Sessions
            </Button>
          </div>

          <div className="border-t my-1" />

          {/* Worksheet Actions */}
          <div className="space-y-1">
            {therapistId && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-auto py-2 px-3"
                onClick={handleAssignWorksheet}
              >
                <FileText className="h-3.5 w-3.5 mr-2 text-primary" />
                Assign Worksheet
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-auto py-2 px-3"
              onClick={handleViewWorksheets}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-2 text-gray-600" />
              View Worksheets
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

