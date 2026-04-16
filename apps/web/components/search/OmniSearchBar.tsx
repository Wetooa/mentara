'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export type EntityType = 'users' | 'therapists' | 'posts' | 'comments' | 'communities' | 'worksheets' | 'messages';

export interface OmniSearchFilters {
  entityTypes: EntityType[];
  showFilters: boolean;
}

interface OmniSearchBarProps {
  placeholder?: string;
  onSearch: (query: string, filters: OmniSearchFilters) => void;
  onClear?: () => void;
  className?: string;
  autoFocus?: boolean;
  defaultFilters?: Partial<OmniSearchFilters>;
  isLoading?: boolean;
}

const DEFAULT_ENTITY_TYPES: EntityType[] = [
  'users', 'therapists', 'posts', 'comments', 'communities', 'worksheets', 'messages'
];

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  users: 'Users',
  therapists: 'Therapists', 
  posts: 'Posts',
  comments: 'Comments',
  communities: 'Communities',
  worksheets: 'Worksheets',
  messages: 'Messages',
};

export const OmniSearchBar: React.FC<OmniSearchBarProps> = ({
  placeholder = 'Search everything...',
  onSearch,
  onClear,
  className = '',
  autoFocus = false,
  defaultFilters = {},
  isLoading = false,
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<OmniSearchFilters>({
    entityTypes: defaultFilters.entityTypes || DEFAULT_ENTITY_TYPES,
    showFilters: defaultFilters.showFilters || false,
  });
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchQuery: string, searchFilters: OmniSearchFilters) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        onSearch(searchQuery, searchFilters);
      }, 400); // 400ms debounce for better performance
    },
    [onSearch]
  );

  // Handle query change
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery, filters);
  };

  // Handle filter changes
  const handleEntityTypeToggle = (entityType: EntityType) => {
    const newFilters = {
      ...filters,
      entityTypes: filters.entityTypes.includes(entityType)
        ? filters.entityTypes.filter(type => type !== entityType)
        : [...filters.entityTypes, entityType]
    };
    setFilters(newFilters);
    
    // Re-trigger search with new filters if there's a query
    if (query.trim()) {
      debouncedSearch(query, newFilters);
    }
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setFilters({
      ...filters,
      entityTypes: DEFAULT_ENTITY_TYPES,
    });
    onClear?.();
  };

  // Handle form submission (Enter key)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    onSearch(query, filters);
  };

  const activeFilterCount = DEFAULT_ENTITY_TYPES.length - filters.entityTypes.length;

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Enhanced Search Container */}
          <div className={cn(
            'relative flex items-center bg-background border border-input rounded-xl',
            'transition-all duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent',
            'hover:border-ring/50 shadow-sm hover:shadow-md',
            isLoading && 'pr-2'
          )}>
            {/* Search Icon */}
            <div className="flex items-center justify-center w-12 h-12">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            
            {/* Enhanced Search Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder={placeholder}
              className={cn(
                'flex-1 h-12 px-0 text-base border-0 bg-transparent',
                'focus:outline-none focus:ring-0',
                'placeholder:text-muted-foreground/70',
                'min-w-0' // Prevent input from growing too wide
              )}
              aria-label="Search input"
              aria-describedby="search-help"
            />

            {/* Right Side Actions Container */}
            <div className="flex items-center gap-2 pr-3">
              {/* Loading Spinner */}
              {isLoading && (
                <div className="flex items-center justify-center w-6 h-6">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Clear Button */}
              {query && !isLoading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 w-8 p-0 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}

              {/* Filters Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-8 w-8 p-0 rounded-lg transition-colors',
                      activeFilterCount > 0 && 'bg-primary/10 text-primary hover:bg-primary/20'
                    )}
                    aria-label="Search filters"
                  >
                    <div className="relative">
                      <Filter className="w-4 h-4" />
                      {activeFilterCount > 0 && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                          {activeFilterCount}
                        </div>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Search In</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {DEFAULT_ENTITY_TYPES.map((entityType) => (
                    <DropdownMenuCheckboxItem
                      key={entityType}
                      checked={filters.entityTypes.includes(entityType)}
                      onCheckedChange={() => handleEntityTypeToggle(entityType)}
                    >
                      {ENTITY_TYPE_LABELS[entityType]}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({ ...filters, entityTypes: DEFAULT_ENTITY_TYPES })}
                    className="w-full justify-start h-auto p-2"
                  >
                    Select All
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </form>

      {/* Active Filters Display - Improved Design */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3 px-1">
          <span className="text-sm text-muted-foreground font-medium">Excluding:</span>
          {DEFAULT_ENTITY_TYPES
            .filter(type => !filters.entityTypes.includes(type))
            .map(type => (
              <Badge 
                key={type} 
                variant="outline" 
                className={cn(
                  'text-xs px-2 py-1 cursor-pointer transition-colors',
                  'hover:bg-destructive hover:text-destructive-foreground',
                  'border-muted-foreground/30'
                )}
                onClick={() => handleEntityTypeToggle(type)}
              >
                {ENTITY_TYPE_LABELS[type]}
                <X className="w-3 h-3 ml-1.5" />
              </Badge>
            ))}
        </div>
      )}

      {/* Screen reader help */}
      <div 
        id="search-help" 
        className="sr-only"
      >
        Search across users, therapists, posts, communities, worksheets, and messages. 
        Use the filter button to narrow your search. Press Enter or wait for automatic search.
      </div>
    </div>
  );
};

export default OmniSearchBar;