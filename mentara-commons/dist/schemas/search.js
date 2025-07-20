"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalSearchResultSchema = exports.CommunitySearchResultSchema = exports.UserSearchResultSchema = exports.PostSearchResultSchema = exports.TherapistSearchResultSchema = exports.SearchResultSchema = exports.GlobalSearchParamsSchema = exports.CommunitySearchParamsSchema = exports.UserSearchParamsSchema = exports.PostSearchParamsSchema = exports.SearchTherapistParamsSchema = exports.GlobalSearchQueryDtoSchema = exports.SearchUsersQueryDtoSchema = exports.SearchCommunitiesQueryDtoSchema = exports.SearchPostsQueryDtoSchema = exports.SearchTherapistsQueryDtoSchema = exports.SearchAnalyticsDtoSchema = exports.SearchAutocompleteDtoSchema = exports.TherapistSearchDtoSchema = exports.AdvancedSearchDtoSchema = exports.SearchResponseDtoSchema = exports.SearchResultItemSchema = exports.SearchRequestDtoSchema = void 0;
const zod_1 = require("zod");
// Search Request Schema
exports.SearchRequestDtoSchema = zod_1.z.object({
    query: zod_1.z.string().min(1, 'Search query is required').max(200, 'Query too long'),
    type: zod_1.z.enum(['all', 'users', 'therapists', 'posts', 'communities', 'sessions', 'worksheets']).default('all'),
    filters: zod_1.z.object({
        dateFrom: zod_1.z.string().datetime().optional(),
        dateTo: zod_1.z.string().datetime().optional(),
        location: zod_1.z.string().optional(),
        specialties: zod_1.z.array(zod_1.z.string()).optional(),
        priceRange: zod_1.z.object({
            min: zod_1.z.number().min(0).optional(),
            max: zod_1.z.number().min(0).optional()
        }).optional(),
        availability: zod_1.z.array(zod_1.z.string()).optional(),
        rating: zod_1.z.number().min(1).max(5).optional()
    }).optional(),
    pagination: zod_1.z.object({
        page: zod_1.z.number().min(1).default(1),
        limit: zod_1.z.number().min(1).max(100).default(20)
    }).optional(),
    sortBy: zod_1.z.enum(['relevance', 'date', 'rating', 'price', 'name']).default('relevance'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
});
// Search Result Item Schema
exports.SearchResultItemSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['user', 'therapist', 'post', 'community', 'session', 'worksheet']),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().url().optional(),
    score: zod_1.z.number(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    highlightedFields: zod_1.z.array(zod_1.z.string()).optional()
});
// Search Response Schema
exports.SearchResponseDtoSchema = zod_1.z.object({
    query: zod_1.z.string(),
    totalResults: zod_1.z.number(),
    totalPages: zod_1.z.number(),
    currentPage: zod_1.z.number(),
    results: zod_1.z.array(exports.SearchResultItemSchema),
    suggestions: zod_1.z.array(zod_1.z.string()).optional(),
    filters: zod_1.z.object({
        appliedFilters: zod_1.z.record(zod_1.z.any()),
        availableFilters: zod_1.z.record(zod_1.z.array(zod_1.z.string()))
    }).optional(),
    executionTime: zod_1.z.number().optional()
});
// Advanced Search Schema
exports.AdvancedSearchDtoSchema = zod_1.z.object({
    criteria: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        operator: zod_1.z.enum(['equals', 'contains', 'startsWith', 'endsWith', 'greaterThan', 'lessThan', 'between']),
        value: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean(), zod_1.z.array(zod_1.z.string())]),
        weight: zod_1.z.number().min(0).max(10).optional()
    })).min(1, 'At least one search criteria is required'),
    logicalOperator: zod_1.z.enum(['AND', 'OR']).default('AND'),
    pagination: zod_1.z.object({
        page: zod_1.z.number().min(1).default(1),
        limit: zod_1.z.number().min(1).max(100).default(20)
    }).optional(),
    includeHighlights: zod_1.z.boolean().default(true)
});
// Therapist Search Schema
exports.TherapistSearchDtoSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    specialties: zod_1.z.array(zod_1.z.string()).optional(),
    location: zod_1.z.string().optional(),
    maxDistance: zod_1.z.number().min(0).optional(),
    gender: zod_1.z.enum(['male', 'female', 'any']).optional(),
    languages: zod_1.z.array(zod_1.z.string()).optional(),
    priceRange: zod_1.z.object({
        min: zod_1.z.number().min(0).optional(),
        max: zod_1.z.number().min(0).optional()
    }).optional(),
    availability: zod_1.z.object({
        dayOfWeek: zod_1.z.array(zod_1.z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
        timeRange: zod_1.z.object({
            start: zod_1.z.string().optional(),
            end: zod_1.z.string().optional()
        }).optional()
    }).optional(),
    rating: zod_1.z.number().min(1).max(5).optional(),
    experienceYears: zod_1.z.number().min(0).optional(),
    verifiedOnly: zod_1.z.boolean().optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['relevance', 'rating', 'price', 'experience', 'distance']).default('relevance')
});
// Search Autocomplete Schema
exports.SearchAutocompleteDtoSchema = zod_1.z.object({
    query: zod_1.z.string().min(1, 'Query is required').max(100, 'Query too long'),
    type: zod_1.z.enum(['all', 'therapists', 'specialties', 'locations']).default('all'),
    limit: zod_1.z.number().min(1).max(20).default(10)
});
// Search Analytics Schema
exports.SearchAnalyticsDtoSchema = zod_1.z.object({
    query: zod_1.z.string(),
    resultCount: zod_1.z.number(),
    clickedResult: zod_1.z.string().uuid().optional(),
    clickPosition: zod_1.z.number().optional(),
    sessionId: zod_1.z.string().optional(),
    timestamp: zod_1.z.string().datetime()
});
// Additional DTOs for SearchController endpoints
exports.SearchTherapistsQueryDtoSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    specialties: zod_1.z.array(zod_1.z.string()).optional(),
    location: zod_1.z.string().optional(),
    maxDistance: zod_1.z.number().min(0).optional(),
    gender: zod_1.z.enum(['male', 'female', 'any']).optional(),
    languages: zod_1.z.array(zod_1.z.string()).optional(),
    priceRange: zod_1.z.object({
        min: zod_1.z.number().min(0).optional(),
        max: zod_1.z.number().min(0).optional()
    }).optional(),
    availability: zod_1.z.object({
        dayOfWeek: zod_1.z.array(zod_1.z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
        timeRange: zod_1.z.object({
            start: zod_1.z.string().optional(),
            end: zod_1.z.string().optional()
        }).optional()
    }).optional(),
    rating: zod_1.z.number().min(1).max(5).optional(),
    experienceYears: zod_1.z.number().min(0).optional(),
    verifiedOnly: zod_1.z.boolean().optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['relevance', 'rating', 'price', 'experience', 'distance']).default('relevance'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
});
exports.SearchPostsQueryDtoSchema = zod_1.z.object({
    query: zod_1.z.string().min(1, 'Search query is required'),
    communityId: zod_1.z.string().uuid().optional(),
    authorId: zod_1.z.string().uuid().optional(),
    type: zod_1.z.enum(['text', 'image', 'video', 'link', 'poll']).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    includeComments: zod_1.z.boolean().default(false),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['relevance', 'date', 'popularity', 'comments']).default('relevance')
});
exports.SearchCommunitiesQueryDtoSchema = zod_1.z.object({
    query: zod_1.z.string().min(1, 'Search query is required'),
    category: zod_1.z.string().optional(),
    isPrivate: zod_1.z.boolean().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    minMembers: zod_1.z.number().min(0).optional(),
    maxMembers: zod_1.z.number().min(1).optional(),
    activeOnly: zod_1.z.boolean().default(true),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['relevance', 'members', 'activity', 'created']).default('relevance')
});
exports.SearchUsersQueryDtoSchema = zod_1.z.object({
    query: zod_1.z.string().min(1, 'Search query is required'),
    role: zod_1.z.enum(['client', 'therapist', 'moderator', 'admin']).optional(),
    location: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().default(true),
    verifiedOnly: zod_1.z.boolean().optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['relevance', 'name', 'joined', 'activity']).default('relevance'),
    includeProfile: zod_1.z.boolean().default(false)
});
exports.GlobalSearchQueryDtoSchema = zod_1.z.object({
    query: zod_1.z.string().min(1, 'Search query is required').max(200, 'Query too long'),
    types: zod_1.z.array(zod_1.z.enum(['users', 'therapists', 'posts', 'communities', 'worksheets'])).optional(),
    filters: zod_1.z.object({
        dateFrom: zod_1.z.string().datetime().optional(),
        dateTo: zod_1.z.string().datetime().optional(),
        categories: zod_1.z.array(zod_1.z.string()).optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        location: zod_1.z.string().optional()
    }).optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(50).default(20),
    sortBy: zod_1.z.enum(['relevance', 'date', 'popularity']).default('relevance'),
    includeHighlights: zod_1.z.boolean().default(true),
    faceted: zod_1.z.boolean().default(false) // Include faceted search results
});
// Legacy interfaces for backward compatibility moved from frontend services
exports.SearchTherapistParamsSchema = zod_1.z.object({
    q: zod_1.z.string().min(1),
    specialties: zod_1.z.array(zod_1.z.string()).optional(),
    languages: zod_1.z.array(zod_1.z.string()).optional(),
    minExperience: zod_1.z.number().min(0).optional(),
    maxExperience: zod_1.z.number().min(0).optional(),
    minPrice: zod_1.z.number().min(0).optional(),
    maxPrice: zod_1.z.number().min(0).optional(),
    location: zod_1.z.string().optional(),
    insurance: zod_1.z.array(zod_1.z.string()).optional(),
    availableFrom: zod_1.z.string().datetime().optional(),
    availableTo: zod_1.z.string().datetime().optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    offset: zod_1.z.number().min(0).optional()
});
exports.PostSearchParamsSchema = zod_1.z.object({
    q: zod_1.z.string().min(1),
    communityId: zod_1.z.string().uuid().optional(),
    roomId: zod_1.z.string().uuid().optional(),
    authorId: zod_1.z.string().uuid().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    offset: zod_1.z.number().min(0).optional()
});
exports.UserSearchParamsSchema = zod_1.z.object({
    q: zod_1.z.string().min(1),
    role: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    offset: zod_1.z.number().min(0).optional()
});
exports.CommunitySearchParamsSchema = zod_1.z.object({
    q: zod_1.z.string().min(1),
    category: zod_1.z.string().optional(),
    isPublic: zod_1.z.boolean().optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    offset: zod_1.z.number().min(0).optional()
});
exports.GlobalSearchParamsSchema = zod_1.z.object({
    q: zod_1.z.string().min(1),
    type: zod_1.z.string().optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    offset: zod_1.z.number().min(0).optional()
});
exports.SearchResultSchema = zod_1.z.object({
    results: zod_1.z.array(zod_1.z.any()),
    total: zod_1.z.number().min(0),
    page: zod_1.z.number().min(1),
    totalPages: zod_1.z.number().min(1),
    hasMore: zod_1.z.boolean()
});
exports.TherapistSearchResultSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    specialties: zod_1.z.array(zod_1.z.string()),
    experience: zod_1.z.number().min(0),
    rating: zod_1.z.number().min(0).max(5),
    priceRange: zod_1.z.object({
        min: zod_1.z.number().min(0),
        max: zod_1.z.number().min(0)
    }),
    location: zod_1.z.string().min(1),
    languages: zod_1.z.array(zod_1.z.string()),
    profileImage: zod_1.z.string().url().optional(),
    bio: zod_1.z.string().optional()
});
exports.PostSearchResultSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1),
    content: zod_1.z.string().min(1),
    authorId: zod_1.z.string().uuid(),
    authorName: zod_1.z.string().min(1),
    communityId: zod_1.z.string().uuid(),
    communityName: zod_1.z.string().min(1),
    tags: zod_1.z.array(zod_1.z.string()),
    createdAt: zod_1.z.string().datetime(),
    likeCount: zod_1.z.number().min(0),
    commentCount: zod_1.z.number().min(0)
});
exports.UserSearchResultSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    role: zod_1.z.string().min(1),
    profileImage: zod_1.z.string().url().optional(),
    isActive: zod_1.z.boolean(),
    joinedAt: zod_1.z.string().datetime()
});
exports.CommunitySearchResultSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    memberCount: zod_1.z.number().min(0),
    category: zod_1.z.string().min(1),
    isPublic: zod_1.z.boolean(),
    tags: zod_1.z.array(zod_1.z.string()),
    createdAt: zod_1.z.string().datetime()
});
exports.GlobalSearchResultSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    type: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    url: zod_1.z.string().url(),
    metadata: zod_1.z.record(zod_1.z.any()),
    score: zod_1.z.number().min(0)
});
//# sourceMappingURL=search.js.map