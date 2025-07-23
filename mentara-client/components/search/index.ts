// Legacy user search components
export { UserSearchBar } from './UserSearchBar';
export { UserSearchItem } from './UserSearchItem';
export { UserSearchResults } from './UserSearchResults';
export { RecentSearches } from './RecentSearches';
export { useUserSearch } from './hooks/useUserSearch';
export { useRecentSearches } from './hooks/useRecentSearches';
export type { User } from './UserSearchItem';
export type { RecentSearch } from './hooks/useRecentSearches';

// New omnisearch components
export { OmniSearchBar } from './OmniSearchBar';
export { LayoutOmniSearchBar } from './LayoutOmniSearchBar';
export { OmniSearchResults } from './OmniSearchResults';
export { TabbedSearchResults } from './TabbedSearchResults';
export { 
  useOmniSearch, 
  useSearchSuggestions, 
  useTrendingSearches, 
  useSearchHistory,
  useAdvancedSearch,
  usePrefetchSearch 
} from './hooks/useOmniSearch';
export type { EntityType, OmniSearchFilters } from './OmniSearchBar';
export type { SearchResult, OmniSearchResultsData } from './OmniSearchResults';
export type { TabbedSearchResultsData } from './TabbedSearchResults';