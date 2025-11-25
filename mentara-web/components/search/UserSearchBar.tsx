"use client";

/**
 * @deprecated UserSearchBar is deprecated. Use LayoutOmniSearchBar for layout search
 * or OmniSearchBar for comprehensive search functionality instead.
 *
 * UserSearchBar provides limited user-only search capabilities and is being phased out
 * in favor of omnisearch components that support multiple entity types with better
 * performance and user experience.
 */

import React, { useState, useCallback, useRef } from "react";
import { Search, X, User, UserCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useUserSearch } from "./hooks/useUserSearch";
import { useRecentSearches } from "./hooks/useRecentSearches";
import { RecentSearches } from "./RecentSearches";
import { logger } from "@/lib/logger";
// import { ConnectionStatus, useGlobalConnectionStatus } from '@/components/realtime/ConnectionStatus';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: "client" | "therapist" | "moderator" | "admin";
  createdAt: string;
}

interface UserSearchBarProps {
  placeholder?: string;
  onUserSelect: (user: User) => void;
  roleFilter?: "all" | "client" | "therapist" | "moderator";
  showRoleFilter?: boolean;
  showConnectionStatus?: boolean;
  className?: string;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "therapist":
      return <UserCircle className="w-3 h-3" />;
    case "moderator":
    case "admin":
      return <Shield className="w-3 h-3" />;
    default:
      return <User className="w-3 h-3" />;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "therapist":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "moderator":
    case "admin":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};

export const UserSearchBar: React.FC<UserSearchBarProps> = ({
  placeholder = "Search users...",
  onUserSelect,
  roleFilter = "all",
  showRoleFilter = false,
  showConnectionStatus = true,
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRoleFilter, setCurrentRoleFilter] =
    useState<string>(roleFilter);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const { searchUsers } = useUserSearch();
  const { addRecentSearch } = useRecentSearches();
  const connectionStatus = useGlobalConnectionStatus();

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
          const role =
            currentRoleFilter === "all" ? undefined : currentRoleFilter;
          const results = await searchUsers(searchQuery, role);
          setSuggestions(results || []);
        } catch (error) {
          logger.error("Search error:", error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    },
    [searchUsers, currentRoleFilter]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setShowRecentSearches(false);

      // Open popover when typing
      if (value.length > 0) {
        setIsOpen(true);
      }

      // Trigger search
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleSuggestionSelected = (suggestion: User) => {
    // Add to recent searches
    addRecentSearch(query, suggestion);

    onUserSelect(suggestion);
    setQuery("");
    setSuggestions([]);
    setShowRecentSearches(false);
    setIsOpen(false);
  };

  const handleRecentSearchSelect = (searchQuery: string) => {
    setQuery(searchQuery);
    setShowRecentSearches(false);
    // Trigger search
    debouncedSearch(searchQuery);
  };

  const handleRecentUserSelect = (user: User) => {
    onUserSelect(user);
    setQuery("");
    setShowRecentSearches(false);
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (query.trim().length === 0) {
      setShowRecentSearches(true);
      setIsOpen(true);
    } else if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setQuery("");
      setSuggestions([]);
      setShowRecentSearches(false);
      setIsOpen(false);
    } else if (e.key === "ArrowDown" && !isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Screen reader instructions */}
      <div id="search-instructions" className="sr-only" aria-live="polite">
        Search for users by name or email. Use arrow keys to navigate
        suggestions, Enter to select, Escape to clear.
      </div>

      <div className="flex items-center gap-3">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <PopoverTrigger asChild>
              <input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyDown={handleInputKeyDown}
                className={cn(
                  "w-full pl-10 pr-4 py-2 text-sm border border-input rounded-md",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                  "placeholder:text-muted-foreground"
                )}
                aria-label="Search for users"
                aria-describedby="search-instructions"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-autocomplete="list"
                role="combobox"
              />
            </PopoverTrigger>

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

            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Command shouldFilter={false}>
                <CommandList className="max-h-96">
                  {isLoading && (
                    <div
                      className="flex items-center justify-center p-4"
                      role="status"
                      aria-live="polite"
                    >
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Searching...
                      </div>
                    </div>
                  )}

                  {!isLoading &&
                    query.length >= 2 &&
                    suggestions.length === 0 && (
                      <CommandEmpty>No users found for "{query}"</CommandEmpty>
                    )}

                  {!isLoading && suggestions.length > 0 && (
                    <CommandGroup>
                      {suggestions.map((suggestion) => (
                        <CommandItem
                          key={suggestion.id}
                          value={`${suggestion.firstName} ${suggestion.lastName} ${suggestion.email}`}
                          onSelect={() => handleSuggestionSelected(suggestion)}
                          className="flex items-center gap-3 p-3 cursor-pointer"
                          aria-label={`${suggestion.firstName} ${suggestion.lastName}, ${suggestion.role}, ${suggestion.email}`}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={suggestion.avatarUrl}
                              alt={`${suggestion.firstName} ${suggestion.lastName}`}
                            />
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
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs",
                                  getRoleColor(suggestion.role)
                                )}
                              >
                                <span className="flex items-center gap-1">
                                  {getRoleIcon(suggestion.role)}
                                  {suggestion.role}
                                </span>
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {suggestion.email}
                            </p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </div>
        </Popover>

        {/* WebSocket Connection Status Indicator */}
        {showConnectionStatus && (
          <div className="flex-shrink-0">
            <ConnectionStatus
              {...connectionStatus}
              onReconnect={connectionStatus.reconnect}
              compact={true}
              showDetails={false}
              className="flex items-center"
            />
          </div>
        )}
      </div>

      {/* Recent Searches */}
      {showRecentSearches && !query && isOpen && (
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
            {(["all", "client", "therapist", "moderator"] as const).map(
              (role) => (
                <button
                  key={role}
                  onClick={() => setCurrentRoleFilter(role)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full transition-colors",
                    currentRoleFilter === role
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {role === "all"
                    ? "All"
                    : role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearchBar;
