"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalSearchQueryDtoSchema = exports.SearchUsersQueryDtoSchema = exports.SearchCommunitiesQueryDtoSchema = exports.SearchPostsQueryDtoSchema = exports.SearchTherapistsQueryDtoSchema = exports.SearchAnalyticsDtoSchema = exports.SearchAutocompleteDtoSchema = exports.TherapistSearchDtoSchema = exports.AdvancedSearchDtoSchema = exports.SearchResponseDtoSchema = exports.SearchResultItemSchema = exports.SearchRequestDtoSchema = void 0;
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
//# sourceMappingURL=search.js.map