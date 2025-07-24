'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOmniSearch } from './hooks/useOmniSearch';
import { type EntityType } from './OmniSearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Role-based entity type configurations
const ROLE_ENTITY_TYPES: Record<string, EntityType[]> = {
  therapist: ['users', 'posts', 'communities', 'worksheets'],
  client: ['therapists', 'posts', 'communities', 'worksheets'],
  admin: ['users', 'therapists', 'posts', 'communities', 'worksheets', 'messages'],
  moderator: ['users', 'posts', 'communities'],
};

export interface LayoutOmniSearchBarProps {
  placeholder?: string;
  className?: string;
  onResultSelect?: (result: any, type: EntityType) => void;
  showRecentSearches?: boolean;
  maxResults?: number;
}

export const LayoutOmniSearchBar: React.FC<LayoutOmniSearchBarProps> = ({
  placeholder = 'Search...',
  className = '',
  onResultSelect,
  showRecentSearches = true,
  maxResults = 8,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const router = useRouter();
  
  // Get role-based entity types
  const entityTypes = useMemo(() => {
    return ROLE_ENTITY_TYPES[user?.role || 'client'] || ROLE_ENTITY_TYPES.client;
  }, [user?.role]);

  // Use omnisearch hook with role-based filtering
  const { results, isLoading, search } = useOmniSearch(query, entityTypes, {
    minQueryLength: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes for layout searches
  });

  // Flatten and limit results
  const flatResults = useMemo(() => {
    if (!results) return [];
    
    const allResults: Array<{ item: any; type: EntityType }> = [];
    
    Object.entries(results).forEach(([type, items]) => {
      if (Array.isArray(items)) {
        items.forEach(item => {
          allResults.push({ item, type: type as EntityType });
        });
      }
    });
    
    return allResults.slice(0, maxResults);
  }, [results, maxResults]);

  // Handle input change with debouncing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setSelectedIndex(-1);
    
    if (newQuery.trim().length >= 1) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, []);

  // Handle result selection
  const handleResultSelect = useCallback((result: any, type: EntityType) => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    
    if (onResultSelect) {
      onResultSelect(result, type);
      return;
    }

    // Default navigation logic based on entity type and user role
    const userRole = user?.role || 'client';
    
    switch (type) {
      case 'users':
        if (userRole === 'therapist') {
          router.push(`/therapist/profile/${result.id}`);
        } else {
          router.push(`/client/profile/${result.id}`);
        }
        break;
      case 'therapists':
        if (userRole === 'client') {
          router.push(`/client/therapist/${result.id}`);
        }
        break;
      case 'posts':
        router.push(`/${userRole}/community/posts/${result.id}`);
        break;
      case 'communities':
        router.push(`/${userRole}/community`);
        break;
      case 'worksheets':
        if (userRole === 'therapist') {
          router.push(`/therapist/worksheets/${result.id}`);
        } else {
          router.push(`/client/worksheets/${result.id}`);
        }
        break;
      default:
        console.log('Selected result:', result, 'Type:', type);
    }
  }, [onResultSelect, user?.role, router]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || flatResults.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < flatResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && flatResults[selectedIndex]) {
          const { item, type } = flatResults[selectedIndex];
          handleResultSelect(item, type);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, flatResults, selectedIndex, handleResultSelect]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear input
  const handleClear = useCallback(() => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  // Get display name for result
  const getResultDisplayName = (item: any, type: EntityType): string => {
    switch (type) {
      case 'users':
      case 'therapists':
        return `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email || 'Unknown User';
      case 'posts':
        return item.title || item.content?.substring(0, 50) || 'Post';
      case 'communities':
        return item.name || 'Community';
      case 'worksheets':
        return item.title || 'Worksheet';
      default:
        return item.name || item.title || 'Item';
    }
  };

  // Get icon for entity type
  const getEntityIcon = (type: EntityType): string => {
    switch (type) {
      case 'users':
      case 'therapists':
        return '👤';
      case 'posts':
        return '📝';
      case 'communities':
        return '👥';
      case 'worksheets':
        return '📋';
      default:
        return '🔍';
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <div className={cn(
          'relative flex items-center bg-background/80 backdrop-blur-sm border-0 shadow-lg ring-1 ring-border/50 rounded-xl',
          'transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/30 focus-within:shadow-xl',
          'hover:shadow-xl hover:ring-primary/20'
        )}>
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground/70" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim().length >= 1 && setIsOpen(true)}
            placeholder={placeholder}
            className={cn(
              'w-full h-10 pl-10 pr-10 bg-transparent border-0 text-sm',
              'placeholder:text-muted-foreground/70 focus:outline-none'
            )}
          />
          {isLoading && (
            <Loader2 className="absolute right-8 h-4 w-4 text-muted-foreground animate-spin" />
          )}
          {query && !isLoading && (
            <button
              onClick={handleClear}
              className="absolute right-3 p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className={cn(
          'absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-xl z-50',
          'max-h-96 overflow-y-auto'
        )}>
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          )}
          
          {!isLoading && flatResults.length === 0 && query.trim() && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          )}
          
          {!isLoading && flatResults.length > 0 && (
            <div ref={resultsRef} className="py-2">
              {flatResults.map(({ item, type }, index) => (
                <button
                  key={`${type}-${item.id || index}`}
                  onClick={() => handleResultSelect(item, type)}
                  className={cn(
                    'w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3',
                    selectedIndex === index && 'bg-muted/50'
                  )}
                >
                  <span className="text-lg">{getEntityIcon(type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {getResultDisplayName(item, type)}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {type === 'users' ? (item.role || 'user') : type.slice(0, -1)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LayoutOmniSearchBar;