'use client';

import React from 'react';
import { Clock, X, Search, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRecentSearches, RecentSearch } from './hooks/useRecentSearches';

interface RecentSearchesProps {
  onSearchSelect: (query: string) => void;
  onUserSelect?: (user: any) => void;
  className?: string;
  maxItems?: number;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  onSearchSelect,
  onUserSelect,
  className = '',
  maxItems = 5,
}) => {
  const { 
    recentSearches, 
    removeRecentSearch, 
    clearRecentSearches 
  } = useRecentSearches();

  const displayedSearches = recentSearches.slice(0, maxItems);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleSearchClick = (search: RecentSearch) => {
    if (search.user && onUserSelect) {
      onUserSelect(search.user);
    } else {
      onSearchSelect(search.query);
    }
  };

  const handleRemoveSearch = (e: React.MouseEvent, searchId: string) => {
    e.stopPropagation();
    removeRecentSearch(searchId);
  };

  if (recentSearches.length === 0) {
    return (
      <div className={cn('bg-background border border-border rounded-md shadow-lg p-4', className)}>
        <div className="flex items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <Clock className="w-6 h-6" />
            <span className="text-sm">No recent searches</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-background border border-border rounded-md shadow-lg', className)} role="region" aria-labelledby="recent-searches-heading">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span id="recent-searches-heading" className="text-sm font-medium">Recent Searches</span>
          <Badge variant="secondary" className="text-xs">
            {recentSearches.length}
          </Badge>
        </div>
        
        {recentSearches.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearRecentSearches}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
            aria-label="Clear all recent searches"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Recent Searches List */}
      <div className="max-h-64 overflow-y-auto" role="list" aria-label="Recent searches">
        {displayedSearches.map((search) => (
          <div
            key={search.id}
            className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors border-b border-border/50 last:border-b-0"
            onClick={() => handleSearchClick(search)}
            role="listitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSearchClick(search);
              }
            }}
            aria-label={`Recent search: ${search.query}${search.user ? `, found ${search.user.firstName} ${search.user.lastName}` : ''}, ${formatTimeAgo(search.timestamp)}`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {search.query}
                </p>
                
                {search.user && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Found: {search.user.firstName} {search.user.lastName}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {search.user.role}
                    </Badge>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTimeAgo(search.timestamp)}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleRemoveSearch(e, search.id)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
              aria-label={`Remove search: ${search.query}`}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Show More Link */}
      {recentSearches.length > maxItems && (
        <div className="p-3 border-t border-border text-center">
          <span className="text-xs text-muted-foreground">
            +{recentSearches.length - maxItems} more searches
          </span>
        </div>
      )}
    </div>
  );
};

export default RecentSearches;