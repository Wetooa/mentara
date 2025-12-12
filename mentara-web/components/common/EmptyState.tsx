"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  illustration?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  illustration,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {illustration ? (
        <div className="mb-6" aria-hidden="true">{illustration}</div>
      ) : Icon ? (
        <div className="mb-4 p-4 rounded-full bg-muted" aria-hidden="true">
          <Icon className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
        </div>
      ) : null}

      <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm md:text-base text-muted-foreground max-w-md mb-6">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex gap-3 flex-wrap justify-center">
          {action && (
            <Button 
              onClick={action.onClick} 
              size="sm"
              className="min-h-[44px] md:min-h-0 touch-manipulation"
              aria-label={action.label}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              size="sm"
              className="min-h-[44px] md:min-h-0 touch-manipulation"
              aria-label={secondaryAction.label}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

