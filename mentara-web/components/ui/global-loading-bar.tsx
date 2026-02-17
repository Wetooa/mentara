"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAggregatedLoading } from '@/store/loading/globalLoadingStore';
import { LoadingBarProps } from '@/store/loading/types';

const GlobalLoadingBar: React.FC<LoadingBarProps> = ({
  className,
  height = 3,
  color = 'green',
  position = 'top',
  showPercentage = false,
  minimumDuration = 300,
}) => {
  const { isVisible, progress, primaryOperation } = useAggregatedLoading();
  const [shouldShow, setShouldShow] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle visibility with minimum duration
  useEffect(() => {
    let showTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;

    if (isVisible && !shouldShow) {
      // Show immediately when loading starts
      setShouldShow(true);
      setIsAnimating(true);
    } else if (!isVisible && shouldShow) {
      // Keep showing for minimum duration after loading completes
      hideTimer = setTimeout(() => {
        setShouldShow(false);
        setIsAnimating(false);
        setDisplayProgress(0);
      }, minimumDuration);
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isVisible, shouldShow, minimumDuration]);

  // Smooth progress updates
  useEffect(() => {
    if (!shouldShow) return;

    let animationFrame: number;
    const targetProgress = isVisible ? progress : 100;
    
    const animate = () => {
      setDisplayProgress(current => {
        const diff = targetProgress - current;
        const step = Math.max(1, Math.abs(diff) * 0.1);
        
        if (Math.abs(diff) < 0.5) {
          return targetProgress;
        }
        
        return diff > 0 ? current + step : current - step;
      });
      
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [progress, isVisible, shouldShow]);

  // Color variants using community colors
  const colorVariants = {
    green: {
      bg: 'bg-gradient-to-r from-community-accent/70 via-community-accent to-community-accent/90',
      glow: 'shadow-[0_0_10px_oklch(var(--community-accent)/0.6)]',
      error: 'bg-gradient-to-r from-red-500/70 via-red-500 to-red-500/90',
    },
    blue: {
      bg: 'bg-gradient-to-r from-community-calm/70 via-community-calm to-community-calm/90',
      glow: 'shadow-[0_0_10px_oklch(var(--community-calm)/0.6)]',
      error: 'bg-gradient-to-r from-red-500/70 via-red-500 to-red-500/90',
    },
    red: {
      bg: 'bg-gradient-to-r from-red-500/70 via-red-500 to-red-500/90',
      glow: 'shadow-[0_0_10px_rgba(239,68,68,0.6)]',
      error: 'bg-gradient-to-r from-red-600/70 via-red-600 to-red-600/90',
    },
    yellow: {
      bg: 'bg-gradient-to-r from-yellow-500/70 via-yellow-500 to-yellow-500/90',
      glow: 'shadow-[0_0_10px_rgba(234,179,8,0.6)]',
      error: 'bg-gradient-to-r from-red-500/70 via-red-500 to-red-500/90',
    },
  };

  const currentColor = colorVariants[color];
  const isError = primaryOperation?.state === 'error';
  
  if (!shouldShow) return null;

  return (
    <>
      {/* Loading bar container */}
      <div
        className={cn(
          'fixed left-0 right-0 z-[9999] overflow-hidden',
          position === 'top' ? 'top-0' : 'bottom-0',
          className
        )}
        style={{ height: `${height}px` }}
      >
        {/* Background bar */}
        <div 
          className="absolute inset-0 bg-black/5 backdrop-blur-sm"
          style={{ height: `${height}px` }}
        />
        
        {/* Progress bar */}
        <div
          className={cn(
            'absolute left-0 top-0 transition-all duration-300 ease-out',
            isError ? currentColor.error : currentColor.bg,
            isAnimating && currentColor.glow,
            'transform-gpu' // Use GPU acceleration
          )}
          style={{
            width: `${displayProgress}%`,
            height: `${height}px`,
            transition: 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        />

        {/* Shimmer effect for active loading */}
        {isAnimating && !isError && (
          <div
            className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
            style={{
              animation: 'shimmer 2s infinite linear',
              transform: 'translateX(-100%)',
            }}
          />
        )}
      </div>

      {/* Optional percentage display */}
      {showPercentage && shouldShow && (
        <div
          className={cn(
            'fixed z-[9999] text-xs font-medium text-community-accent-foreground',
            'bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm',
            position === 'top' ? 'top-2 right-2' : 'bottom-2 right-2'
          )}
        >
          {Math.round(displayProgress)}%
        </div>
      )}

      {/* Error message display */}
      {isError && primaryOperation?.message && (
        <div
          className={cn(
            'fixed z-[9999] text-xs font-medium text-red-700',
            'bg-red-50/90 backdrop-blur-sm rounded-md px-3 py-2 shadow-sm border border-red-200',
            position === 'top' ? 'top-8 right-2' : 'bottom-8 right-2',
            'animate-in slide-in-from-top-2 duration-300'
          )}
        >
          {primaryOperation.message}
        </div>
      )}
    </>
  );
};

export default GlobalLoadingBar;

// Custom CSS for shimmer animation (to be added to globals.css)
export const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
}
`;