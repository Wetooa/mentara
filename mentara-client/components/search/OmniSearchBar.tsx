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

export type EntityType = 'users' | 'therapists' | 'posts' | 'communities' | 'worksheets' | 'messages';

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
  'users', 'therapists', 'posts', 'communities', 'worksheets', 'messages'
];

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  users: 'Users',
  therapists: 'Therapists', 
  posts: 'Posts',
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
      }, 300); // 300ms debounce
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
        <div className="relative flex items-center">
          {/* Search Icon */}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          
          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder={placeholder}
            className={cn(
              'w-full pl-10 pr-20 py-3 text-sm border border-input rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
              'placeholder:text-muted-foreground bg-background',
              isLoading && 'pr-24'
            )}
            aria-label="Omnisearch input"
            aria-describedby="search-help"
          />

          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Filters Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                aria-label="Search filters"
              >
                <Filter className="w-4 h-4" />
                {activeFilterCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 text-xs rounded-full p-0 flex items-center justify-center"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
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
      </form>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="text-xs text-muted-foreground">Excluding:</span>
          {DEFAULT_ENTITY_TYPES
            .filter(type => !filters.entityTypes.includes(type))
            .map(type => (
              <Badge 
                key={type} 
                variant="secondary" 
                className="text-xs cursor-pointer"
                onClick={() => handleEntityTypeToggle(type)}
              >
                {ENTITY_TYPE_LABELS[type]}
                <X className="w-3 h-3 ml-1" />
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