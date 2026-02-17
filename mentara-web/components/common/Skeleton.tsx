"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "default" | "text" | "circular" | "rectangular";
  animation?: "pulse" | "wave" | "none";
}

/**
 * Skeleton loader component for better perceived performance
 * Provides visual feedback while content is loading
 */
export function Skeleton({
  className,
  variant = "default",
  animation = "pulse",
  ...props
}: SkeletonProps) {
  const baseClasses = "bg-muted animate-pulse";
  
  const variantClasses = {
    default: "rounded-md",
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      aria-busy="true"
      aria-label="Loading content"
      role="status"
      {...props}
    />
  );
}

/**
 * Pre-built skeleton components for common use cases
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 space-y-3", className)}>
      <Skeleton variant="rectangular" className="h-4 w-3/4" />
      <Skeleton variant="rectangular" className="h-4 w-full" />
      <Skeleton variant="rectangular" className="h-4 w-5/6" />
    </div>
  );
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return <Skeleton variant="circular" className={sizeClasses[size]} />;
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonAvatar size="md" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-4 w-3/4" />
            <Skeleton variant="text" className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonMessage({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-3", className)}>
      <SkeletonAvatar size="sm" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="h-4 w-1/4" />
        <Skeleton variant="rectangular" className="h-16 w-3/4 rounded-lg" />
        <Skeleton variant="text" className="h-3 w-1/6" />
      </div>
    </div>
  );
}

export function SkeletonTherapistCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 border rounded-lg space-y-3", className)}>
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-5 w-1/2" />
          <Skeleton variant="text" className="h-4 w-1/3" />
        </div>
      </div>
      <Skeleton variant="rectangular" className="h-20 w-full rounded" />
      <div className="flex gap-2">
        <Skeleton variant="text" className="h-6 w-20 rounded-full" />
        <Skeleton variant="text" className="h-6 w-20 rounded-full" />
        <Skeleton variant="text" className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

