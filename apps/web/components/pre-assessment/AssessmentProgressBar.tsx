'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AssessmentProgressBarProps {
  progress: number; // 0-100
  answeredQuestions?: number;
  totalQuestions?: number;
  className?: string;
}

export function AssessmentProgressBar({
  progress,
  answeredQuestions,
  totalQuestions,
  className,
}: AssessmentProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("w-full bg-gray-50/80 border-b border-gray-200/50 sticky top-18 z-40 backdrop-blur-sm box-border", className)}>
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-4 min-h-[4rem] flex flex-col justify-center">
        <div className="flex items-center justify-between mb-2 gap-2 min-h-[1.25rem]">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-visible">
            <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Assessment Progress</span>
            {answeredQuestions !== undefined && totalQuestions !== undefined && (
              <span className="text-xs text-gray-500 whitespace-nowrap">
                ({answeredQuestions}/{totalQuestions})
              </span>
            )}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-primary whitespace-nowrap flex-shrink-0">
            {Math.round(clampedProgress)}%
          </span>
        </div>
        
        <div className="w-full h-2 sm:h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${clampedProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary rounded-full shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}

