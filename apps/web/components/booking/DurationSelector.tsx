"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DurationOption {
  id: string;
  name: string;
  duration: number; // in minutes
  description?: string;
}

interface DurationSelectorProps {
  durations: DurationOption[];
  selectedDuration: DurationOption | null;
  onSelect: (duration: DurationOption) => void;
  className?: string;
}

export function DurationSelector({
  durations,
  selectedDuration,
  onSelect,
  className,
}: Readonly<DurationSelectorProps>) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Select Session Duration</h3>
        {selectedDuration && (
          <Badge variant="secondary" className="ml-2">
            {selectedDuration.duration} minutes
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {durations.map((duration) => {
          const isSelected = selectedDuration?.id === duration.id;

          return (
            <Card
              key={duration.id}
              className={cn(
                "cursor-pointer transition-all duration-200",
                isSelected
                  ? "ring-2 ring-primary bg-primary/5 border-primary shadow-md"
                  : "hover:bg-gray-50 hover:shadow-sm border-gray-200"
              )}
              onClick={() => onSelect(duration)}
            >
              <CardContent className="p-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Clock
                    className={cn(
                      "h-5 w-5",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <div>
                    <div
                      className={cn(
                        "font-semibold text-lg",
                        isSelected && "text-primary"
                      )}
                    >
                      {duration.duration}
                    </div>
                    <div className="text-xs text-muted-foreground">minutes</div>
                  </div>
                  {duration.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {duration.description}
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                        ✓
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!selectedDuration && (
        <p className="text-sm text-muted-foreground text-center mt-2">
          👆 Select a duration to see available time slots
        </p>
      )}
    </div>
  );
}
