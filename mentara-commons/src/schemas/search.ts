import { z } from 'zod';

// Search Request Schema
export const SearchRequestDtoSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200, 'Query too long'),
  type: z.enum(['all', 'users', 'therapists', 'posts', 'communities', 'sessions', 'worksheets']).default('all'),
  filters: z.object({
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    location: z.string().optional(),
    specialties: z.array(z.string()).optional(),
    priceRange: z.object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional()
    }).optional(),
    availability: z.array(z.string()).optional(),
    rating: z.number().min(1).max(5).optional()
  }).optional(),
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20)
  }).optional(),
  sortBy: z.enum(['relevance', 'date', 'rating', 'price', 'name']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Search Result Item Schema
export const SearchResultItemSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['user', 'therapist', 'post', 'community', 'session', 'worksheet']),
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  score: z.number(),
  metadata: z.record(z.any()).optional(),
  highlightedFields: z.array(z.string()).optional()
});

// Search Response Schema
export const SearchResponseDtoSchema = z.object({
  query: z.string(),
  totalResults: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  results: z.array(SearchResultItemSchema),
  suggestions: z.array(z.string()).optional(),
  filters: z.object({
    appliedFilters: z.record(z.any()),
    availableFilters: z.record(z.array(z.string()))
  }).optional(),
  executionTime: z.number().optional()
});

// Advanced Search Schema
export const AdvancedSearchDtoSchema = z.object({
  criteria: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'contains', 'startsWith', 'endsWith', 'greaterThan', 'lessThan', 'between']),
    value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
    weight: z.number().min(0).max(10).optional()
  })).min(1, 'At least one search criteria is required'),
  logicalOperator: z.enum(['AND', 'OR']).default('AND'),
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20)
  }).optional(),
  includeHighlights: z.boolean().default(true)
});

// Therapist Search Schema
export const TherapistSearchDtoSchema = z.object({
  query: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  location: z.string().optional(),
  maxDistance: z.number().min(0).optional(),
  gender: z.enum(['male', 'female', 'any']).optional(),
  languages: z.array(z.string()).optional(),
  priceRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional()
  }).optional(),
  availability: z.object({
    dayOfWeek: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
    timeRange: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional()
  }).optional(),
  rating: z.number().min(1).max(5).optional(),
  experienceYears: z.number().min(0).optional(),
  verifiedOnly: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['relevance', 'rating', 'price', 'experience', 'distance']).default('relevance')
});

// Search Autocomplete Schema
export const SearchAutocompleteDtoSchema = z.object({
  query: z.string().min(1, 'Query is required').max(100, 'Query too long'),
  type: z.enum(['all', 'therapists', 'specialties', 'locations']).default('all'),
  limit: z.number().min(1).max(20).default(10)
});

// Search Analytics Schema
export const SearchAnalyticsDtoSchema = z.object({
  query: z.string(),
  resultCount: z.number(),
  clickedResult: z.string().uuid().optional(),
  clickPosition: z.number().optional(),
  sessionId: z.string().optional(),
  timestamp: z.string().datetime()
});

// Export type inference helpers
export type SearchRequestDto = z.infer<typeof SearchRequestDtoSchema>;
export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;
export type SearchResponseDto = z.infer<typeof SearchResponseDtoSchema>;
export type AdvancedSearchDto = z.infer<typeof AdvancedSearchDtoSchema>;
export type TherapistSearchDto = z.infer<typeof TherapistSearchDtoSchema>;
export type SearchAutocompleteDto = z.infer<typeof SearchAutocompleteDtoSchema>;
export type SearchAnalyticsDto = z.infer<typeof SearchAnalyticsDtoSchema>;

// Additional DTOs for SearchController endpoints
export const SearchTherapistsQueryDtoSchema = z.object({
  query: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  location: z.string().optional(),
  maxDistance: z.number().min(0).optional(),
  gender: z.enum(['male', 'female', 'any']).optional(),
  languages: z.array(z.string()).optional(),
  priceRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional()
  }).optional(),
  availability: z.object({
    dayOfWeek: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
    timeRange: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional()
  }).optional(),
  rating: z.number().min(1).max(5).optional(),
  experienceYears: z.number().min(0).optional(),
  verifiedOnly: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['relevance', 'rating', 'price', 'experience', 'distance']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const SearchPostsQueryDtoSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  communityId: z.string().uuid().optional(),
  authorId: z.string().uuid().optional(),
  type: z.enum(['text', 'image', 'video', 'link', 'poll']).optional(),
  tags: z.array(z.string()).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  includeComments: z.boolean().default(false),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['relevance', 'date', 'popularity', 'comments']).default('relevance')
});

export const SearchCommunitiesQueryDtoSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  category: z.string().optional(),
  isPrivate: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  minMembers: z.number().min(0).optional(),
  maxMembers: z.number().min(1).optional(),
  activeOnly: z.boolean().default(true),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['relevance', 'members', 'activity', 'created']).default('relevance')
});

export const SearchUsersQueryDtoSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  role: z.enum(['client', 'therapist', 'moderator', 'admin']).optional(),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
  verifiedOnly: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['relevance', 'name', 'joined', 'activity']).default('relevance'),
  includeProfile: z.boolean().default(false)
});

export const GlobalSearchQueryDtoSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200, 'Query too long'),
  types: z.array(z.enum(['users', 'therapists', 'posts', 'communities', 'worksheets'])).optional(),
  filters: z.object({
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    location: z.string().optional()
  }).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  sortBy: z.enum(['relevance', 'date', 'popularity']).default('relevance'),
  includeHighlights: z.boolean().default(true),
  faceted: z.boolean().default(false) // Include faceted search results
});

// Type exports for new DTOs
export type SearchTherapistsQueryDto = z.infer<typeof SearchTherapistsQueryDtoSchema>;
export type SearchPostsQueryDto = z.infer<typeof SearchPostsQueryDtoSchema>;
export type SearchCommunitiesQueryDto = z.infer<typeof SearchCommunitiesQueryDtoSchema>;
export type SearchUsersQueryDto = z.infer<typeof SearchUsersQueryDtoSchema>;
export type GlobalSearchQueryDto = z.infer<typeof GlobalSearchQueryDtoSchema>;