import { useState } from "react";
import { SessionCard } from "./SessionCard";
import { SessionFilters } from "./SessionFilters";
import { SessionStats } from "./SessionStats";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, AlertCircle, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessions, useSessionFilters, useClientSideSessionFilter } from "@/hooks/sessions";
import type { Meeting } from "@/lib/api/services/meetings";

interface SessionsListProps {
  showFilters?: boolean;
  showStats?: boolean;
  defaultStatus?: Meeting["status"];
  limit?: number;
  variant?: 'default' | 'compact';
  showJoinButtons?: boolean;
  showTherapistInfo?: boolean;
  showClientInfo?: boolean;
  onSessionClick?: (session: Meeting) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const listVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      staggerChildren: 0.05
    }
  }
};

export function SessionsList({
  showFilters = true,
  showStats = false,
  defaultStatus,
  limit = 20,
  variant = 'default',
  showJoinButtons = false,
  showTherapistInfo = true,
  showClientInfo = false,
  onSessionClick
}: SessionsListProps) {
  const {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    queryOptions,
    hasActiveFilters,
    activeFilterCount,
    presetFilters
  } = useSessionFilters({
    status: defaultStatus,
    limit,
  });

  const {
    data: sessions = [],
    isLoading,
    error,
    refetch,
    isRefetching
  } = useSessions(queryOptions);

  // Client-side filtering for search and additional filters
  const filteredSessions = useClientSideSessionFilter(sessions, filters);

  const handleRetry = () => {
    refetch();
  };

  const handleSessionClick = (session: Meeting) => {
    if (onSessionClick) {
      onSessionClick(session);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        )}
        
        {showFilters && <Skeleton className="h-16" />}
        
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={variant === 'compact' ? "h-16" : "h-32"} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {showStats && <SessionStats />}
        
        <Alert className="border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load sessions. Please try again.</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRefetching}
              className="ml-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  // Empty state
  if (!isLoading && filteredSessions.length === 0) {
    const hasFilters = hasActiveFilters;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {showStats && <SessionStats />}
        
        {showFilters && (
          <SessionFilters
            filters={filters}
            onFiltersChange={setFilters}
            onFilterUpdate={updateFilter}
            onReset={resetFilters}
            activeFilterCount={activeFilterCount}
            presetFilters={presetFilters}
          />
        )}

        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              {hasFilters ? 'No sessions found' : 'No sessions yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasFilters 
                ? 'Try adjusting your filters to find more sessions.'
                : 'Your sessions will appear here once they are scheduled.'
              }
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {showStats && <SessionStats />}
      
      {showFilters && (
        <SessionFilters
          filters={filters}
          onFiltersChange={setFilters}
          onFilterUpdate={updateFilter}
          onReset={resetFilters}
          activeFilterCount={activeFilterCount}
          presetFilters={presetFilters}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} found
            {hasActiveFilters && (
              <>
                {' '}• {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
              </>
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRetry}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <motion.div
        variants={listVariants}
        className={`space-y-${variant === 'compact' ? '2' : '4'}`}
      >
        <AnimatePresence mode="wait">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onClick={() => handleSessionClick(session)}
              showJoinButton={showJoinButtons}
              showTherapistInfo={showTherapistInfo}
              showClientInfo={showClientInfo}
              variant={variant}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredSessions.length >= (filters.limit || 20) && (
        <div className="text-center py-4">
          <Button
            variant="outline"
            onClick={() => updateFilter('limit', (filters.limit || 20) + 20)}
          >
            Load More Sessions
          </Button>
        </div>
      )}
    </motion.div>
  );
}