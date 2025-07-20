'use client';

import React, { useState, useCallback, useRef } from 'react';
import Autosuggest from 'react-autosuggest';
import { Search, X, User, UserCircle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUserSearch } from './hooks/useUserSearch';
import { useRecentSearches } from './hooks/useRecentSearches';
import { RecentSearches } from './RecentSearches';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: 'client' | 'therapist' | 'moderator' | 'admin';
  createdAt: string;
}

interface UserSearchBarProps {
  placeholder?: string;
  onUserSelect: (user: User) => void;
  roleFilter?: 'all' | 'client' | 'therapist' | 'moderator';
  showRoleFilter?: boolean;
  className?: string;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'therapist':
      return <UserCircle className="w-3 h-3" />;
    case 'moderator':
    case 'admin':
      return <Shield className="w-3 h-3" />;
    default:
      return <User className="w-3 h-3" />;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'therapist':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'moderator':
    case 'admin':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

export const UserSearchBar: React.FC<UserSearchBarProps> = ({
  placeholder = 'Search users...',
  onUserSelect,
  roleFilter = 'all',
  showRoleFilter = false,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRoleFilter, setCurrentRoleFilter] = useState<string>(roleFilter);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const { searchUsers } = useUserSearch();
  const { addRecentSearch } = useRecentSearches();

  // Update role filter when prop changes
  React.useEffect(() => {
    setCurrentRoleFilter(roleFilter);
  }, [roleFilter]);

  const debouncedSearch = useCallback(
    async (searchQuery: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          setIsLoading(true);
          const role = currentRoleFilter === 'all' ? undefined : currentRoleFilter;
          const results = await searchUsers(searchQuery, role);
          setSuggestions(results || []);
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    },
    [searchUsers, currentRoleFilter]
  );

  const onSuggestionsFetchRequested = useCallback(
    ({ value }: { value: string }) => {
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const onSuggestionsClearRequested = useCallback(() => {
    setSuggestions([]);
  }, []);

  const getSuggestionValue = (suggestion: User) => {
    return `${suggestion.firstName} ${suggestion.lastName}`;
  };

  const renderSuggestion = (suggestion: User, { isHighlighted }: { isHighlighted: boolean }) => (
    <div
      className={cn(
        'flex items-center gap-3 p-3 cursor-pointer transition-colors',
        isHighlighted ? 'bg-accent' : 'hover:bg-accent/50'
      )}
      role="option"
      aria-selected={isHighlighted}
      aria-label={`${suggestion.firstName} ${suggestion.lastName}, ${suggestion.role}, ${suggestion.email}`}
    >
      <Avatar className="w-8 h-8">
        <AvatarImage src={suggestion.avatarUrl} alt={`${suggestion.firstName} ${suggestion.lastName}`} />
        <AvatarFallback>
          {suggestion.firstName.charAt(0)}
          {suggestion.lastName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">
            {suggestion.firstName} {suggestion.lastName}
          </p>
          <Badge variant="secondary" className={cn('text-xs', getRoleColor(suggestion.role))}>
            <span className="flex items-center gap-1">
              {getRoleIcon(suggestion.role)}
              {suggestion.role}
            </span>
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{suggestion.email}</p>
      </div>
    </div>
  );

  const renderSuggestionsContainer = ({ containerProps, children }: { containerProps: React.HTMLProps<HTMLDivElement>; children: React.ReactNode }) => (
    <div
      {...containerProps}
      className={cn(
        'absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto',
        containerProps.className
      )}
      role="listbox"
      aria-label="Search suggestions"
    >
      {isLoading && (
        <div className="flex items-center justify-center p-4" role="status" aria-live="polite">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Searching...
          </div>
        </div>
      )}
      
      {!isLoading && query.length >= 2 && suggestions.length === 0 && (
        <div className="p-4 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
          No users found for &quot;{query}&quot;
        </div>
      )}
      
      {!isLoading && children}
    </div>
  );

  const inputProps = {
    placeholder,
    value: query,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      setShowRecentSearches(false);
    },
    onFocus: () => {
      if (query.trim().length === 0) {
        setShowRecentSearches(true);
      }
    },
    onBlur: () => {
      // Delay hiding recent searches to allow clicking on them
      setTimeout(() => {
        setShowRecentSearches(false);
      }, 200);
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setQuery('');
        setSuggestions([]);
        setShowRecentSearches(false);
      }
    },
    className: cn(
      'w-full pl-10 pr-4 py-2 text-sm border border-input rounded-md',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
      'placeholder:text-muted-foreground'
    ),
    'aria-label': 'Search for users',
    'aria-describedby': 'search-instructions',
    'aria-expanded': suggestions.length > 0 || showRecentSearches,
    'aria-haspopup': 'listbox',
    'aria-autocomplete': 'list' as const,
    'role': 'combobox',
  };

  const handleSuggestionSelected = (
    event: React.FormEvent<HTMLFormElement>,
    { suggestion }: { suggestion: User }
  ) => {
    // Add to recent searches
    addRecentSearch(query, suggestion);
    
    onUserSelect(suggestion);
    setQuery('');
    setSuggestions([]);
    setShowRecentSearches(false);
  };

  const handleRecentSearchSelect = (searchQuery: string) => {
    setQuery(searchQuery);
    setShowRecentSearches(false);
    // Trigger search
    debouncedSearch(searchQuery);
  };

  const handleRecentUserSelect = (user: User) => {
    onUserSelect(user);
    setQuery('');
    setShowRecentSearches(false);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Screen reader instructions */}
      <div 
        id="search-instructions" 
        className="sr-only"
        aria-live="polite"
      >
        Search for users by name or email. Use arrow keys to navigate suggestions, Enter to select, Escape to clear.
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          renderSuggestionsContainer={renderSuggestionsContainer}
          onSuggestionSelected={handleSuggestionSelected}
          inputProps={inputProps}
          focusInputOnSuggestionClick={false}
        />
        
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Recent Searches */}
      {showRecentSearches && !query && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50">
          <RecentSearches
            onSearchSelect={handleRecentSearchSelect}
            onUserSelect={handleRecentUserSelect}
            maxItems={5}
          />
        </div>
      )}

      {/* Role Filter */}
      {showRoleFilter && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-background border border-border rounded-md shadow-lg z-40">
          <div className="flex flex-wrap gap-2">
            {(['all', 'client', 'therapist', 'moderator'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setCurrentRoleFilter(role)}
                className={cn(
                  'px-3 py-1 text-xs rounded-full transition-colors',
                  currentRoleFilter === role
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearchBar;