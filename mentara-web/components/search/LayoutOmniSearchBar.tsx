"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { Search, X, Loader2, User, Users, FileText, Building, PenTool, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOmniSearch } from "./hooks/useOmniSearch";
import { type EntityType } from "./OmniSearchBar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { logger } from "@/lib/logger";

// Role-based entity type configurations
const ROLE_ENTITY_TYPES: Record<string, EntityType[]> = {
  therapist: ["users", "posts", "communities", "worksheets"],
  client: ["therapists", "posts", "communities", "worksheets"],
  admin: [
    "users",
    "therapists",
    "posts",
    "communities",
    "worksheets",
    "messages",
  ],
  moderator: ["users", "posts", "communities"],
};

export interface LayoutOmniSearchBarProps {
  placeholder?: string;
  className?: string;
  onResultSelect?: (result: any, type: EntityType) => void;
  showRecentSearches?: boolean;
  maxResults?: number;
}

export const LayoutOmniSearchBar: React.FC<LayoutOmniSearchBarProps> = ({
  placeholder = "Search...",
  className = "",
  onResultSelect,
  showRecentSearches = true,
  maxResults = 8,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const router = useRouter();

  // Get role-based entity types
  const entityTypes = useMemo(() => {
    return (
      ROLE_ENTITY_TYPES[user?.role || "client"] || ROLE_ENTITY_TYPES.client
    );
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
        items.forEach((item) => {
          allResults.push({ item, type: type as EntityType });
        });
      }
    });

    return allResults.slice(0, maxResults);
  }, [results, maxResults]);

  // Handle input change with debouncing
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      setQuery(newQuery);
      setSelectedIndex(-1);

      if (newQuery.trim().length >= 1) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    },
    []
  );

  // Handle result selection
  const handleResultSelect = useCallback(
    (result: any, type: EntityType) => {
      setQuery("");
      setIsOpen(false);
      setSelectedIndex(-1);

      if (onResultSelect) {
        onResultSelect(result, type);
        return;
      }

      // Default navigation logic based on entity type and user role
      const userRole = user?.role || "client";

      switch (type) {
        case "users":
          const userId = result.id || result.userId;
          if (userId) {
            if (userRole === "therapist") {
              router.push(`/therapist/profile/${userId}`);
            } else {
              router.push(`/client/profile/${userId}`);
            }
          } else {
            logger.error("LayoutOmniSearchBar", "User ID not found", { result });
          }
          break;
        case "therapists":
          if (userRole === "client") {
            // Therapist search returns userId (therapist's userId) or user.id
            const therapistId = result.userId || result.user?.id || result.id;
            if (therapistId) {
              router.push(`/client/profile/${therapistId}`);
            } else {
              logger.error("LayoutOmniSearchBar", "Therapist ID not found", { result });
            }
          }
          break;
        case "posts":
          const postId = result.id;
          if (postId) {
            router.push(`/${userRole}/community/posts/${postId}`);
          } else {
            logger.error("LayoutOmniSearchBar", "Post ID not found", { result });
          }
          break;
        case "communities":
          router.push(`/${userRole}/community`);
          break;
        case "worksheets":
          const worksheetId = result.id;
          if (worksheetId) {
            if (userRole === "therapist") {
              router.push(`/therapist/worksheets/${worksheetId}`);
            } else {
              router.push(`/client/worksheets/${worksheetId}`);
            }
          } else {
            logger.error("LayoutOmniSearchBar", "Worksheet ID not found", { result });
          }
          break;
        default:
          logger.debug("LayoutOmniSearchBar", "Selected result", { result, type });
      }
    },
    [onResultSelect, user?.role, router]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || flatResults.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < flatResults.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && flatResults[selectedIndex]) {
            const { item, type } = flatResults[selectedIndex];
            handleResultSelect(item, type);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, flatResults, selectedIndex, handleResultSelect]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear input
  const handleClear = useCallback(() => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  // Get display name for result
  const getResultDisplayName = (item: any, type: EntityType): string => {
    console.log("getResultDisplayName called with item:", item, "type:", type);
    switch (type) {
      case "users":
        return (
          `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
          item.email ||
          "Unknown User"
        );
      case "therapists":
        console.log(
          "getResultDisplayName for user/therapist:",
          item.firstName,
          item.lastName,
          item.email
        );
        return (
          `${item.user.firstName || ""} ${item.user.lastName || ""}`.trim() ||
          item.email ||
          "Unknown User"
        );
      case "posts":
        return item.title || item.content?.substring(0, 50) || "Post";
      case "communities":
        return item.name || "Community";
      case "worksheets":
        return item.title || "Worksheet";

      default:
        return item.name || item.title || item.content || "Item";
    }
  };

  // Get icon component for entity type
  const getEntityIcon = (type: EntityType) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case "users":
        return <User className={iconClass} />;
      case "therapists":
        return <Users className={iconClass} />;
      case "posts":
        return <FileText className={iconClass} />;
      case "communities":
        return <Building className={iconClass} />;
      case "worksheets":
        return <PenTool className={iconClass} />;
      case "messages":
        return <MessageCircle className={iconClass} />;
      default:
        return <Search className={iconClass} />;
    }
  };

  // Highlight matching text in a string
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-primary/20 text-primary font-medium px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Get additional info for result
  const getResultInfo = (item: any, type: EntityType): { subtitle?: string; metadata?: string } => {
    switch (type) {
      case "users":
        return {
          subtitle: item.email,
          metadata: item.role ? `Role: ${item.role}` : undefined,
        };
      case "therapists":
        return {
          subtitle: item.user?.email || item.email,
          metadata: item.bio ? item.bio.substring(0, 60) + '...' : undefined,
        };
      case "posts":
        return {
          subtitle: item.content ? item.content.substring(0, 80) + '...' : undefined,
          metadata: item.community?.name ? `Community: ${item.community.name}` : undefined,
        };
      case "communities":
        return {
          subtitle: item.description ? item.description.substring(0, 80) + '...' : undefined,
          metadata: item.memberCount ? `${item.memberCount} members` : undefined,
        };
      case "worksheets":
        return {
          subtitle: item.instructions ? item.instructions.substring(0, 80) + '...' : undefined,
          metadata: item.status ? `Status: ${item.status}` : undefined,
        };
      default:
        return {};
    }
  };

  // Determine which field matched
  const getMatchedField = (item: any, type: EntityType, query: string): string | null => {
    const lowerQuery = query.toLowerCase();
    
    switch (type) {
      case "users":
      case "therapists":
        const name = type === "therapists" 
          ? `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.toLowerCase()
          : `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
        if (name.includes(lowerQuery)) return "name";
        if (item.email?.toLowerCase().includes(lowerQuery)) return "email";
        break;
      case "posts":
        if (item.title?.toLowerCase().includes(lowerQuery)) return "title";
        if (item.content?.toLowerCase().includes(lowerQuery)) return "content";
        break;
      case "communities":
        if (item.name?.toLowerCase().includes(lowerQuery)) return "name";
        if (item.description?.toLowerCase().includes(lowerQuery)) return "description";
        break;
      case "worksheets":
        if (item.title?.toLowerCase().includes(lowerQuery)) return "title";
        if (item.instructions?.toLowerCase().includes(lowerQuery)) return "instructions";
        break;
    }
    return null;
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <div
          className={cn(
            "relative flex items-center bg-background/80 backdrop-blur-sm border-0 shadow-lg ring-1 ring-border/50 rounded-xl",
            "transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/30 focus-within:shadow-xl",
            "hover:shadow-xl hover:ring-primary/20"
          )}
        >
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
              "w-full h-10 pl-10 pr-10 bg-transparent border-0 text-sm",
              "placeholder:text-muted-foreground/70 focus:outline-none"
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
        <div
          className={cn(
            "absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-xl z-50",
            "max-h-96 overflow-y-auto"
          )}
        >
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Searching...
              </span>
            </div>
          )}

          {!isLoading && flatResults.length === 0 && query.trim() && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {!isLoading && flatResults.length > 0 && (
            <div ref={resultsRef} className="py-2">
              {flatResults.map(({ item, type }, index) => {
                const displayName = getResultDisplayName(item, type);
                const info = getResultInfo(item, type);
                const matchedField = getMatchedField(item, type, query);
                const Icon = getEntityIcon(type);
                const avatarUrl = item.avatarUrl || item.user?.avatarUrl;

                return (
                  <button
                    key={`${type}-${item.id || index}`}
                    onClick={() => handleResultSelect(item, type)}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-start gap-3",
                      selectedIndex === index && "bg-muted/50"
                    )}
                  >
                    {/* Icon or Avatar */}
                    <div className="flex-shrink-0 mt-0.5">
                      {avatarUrl ? (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={avatarUrl} alt={displayName} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {Icon}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {Icon}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-sm truncate">
                          {highlightText(displayName, query)}
                        </div>
                        <Badge variant="secondary" className="text-xs capitalize flex-shrink-0">
                          {type === "users" ? item.role || "user" : type.slice(0, -1)}
                        </Badge>
                        {matchedField && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            Matched: {matchedField}
                          </Badge>
                        )}
                      </div>
                      
                      {info.subtitle && (
                        <div className="text-xs text-muted-foreground line-clamp-1 mb-1">
                          {highlightText(info.subtitle, query)}
                        </div>
                      )}
                      
                      {info.metadata && (
                        <div className="text-xs text-muted-foreground/70">
                          {info.metadata}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LayoutOmniSearchBar;
