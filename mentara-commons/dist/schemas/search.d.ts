import { z } from 'zod';
export declare const SearchRequestDtoSchema: z.ZodObject<{
    query: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["all", "users", "therapists", "posts", "communities", "sessions", "worksheets"]>>;
    filters: z.ZodOptional<z.ZodObject<{
        dateFrom: z.ZodOptional<z.ZodString>;
        dateTo: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        specialties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        priceRange: z.ZodOptional<z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            min?: number | undefined;
            max?: number | undefined;
        }, {
            min?: number | undefined;
            max?: number | undefined;
        }>>;
        availability: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rating: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        location?: string | undefined;
        rating?: number | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        specialties?: string[] | undefined;
        availability?: string[] | undefined;
        priceRange?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
    }, {
        location?: string | undefined;
        rating?: number | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        specialties?: string[] | undefined;
        availability?: string[] | undefined;
        priceRange?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
    }>>;
    pagination: z.ZodOptional<z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
    }, {
        page?: number | undefined;
        limit?: number | undefined;
    }>>;
    sortBy: z.ZodDefault<z.ZodEnum<["relevance", "date", "rating", "price", "name"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    type: "sessions" | "users" | "posts" | "therapists" | "communities" | "all" | "worksheets";
    sortBy: "date" | "rating" | "name" | "price" | "relevance";
    sortOrder: "asc" | "desc";
    query: string;
    filters?: {
        location?: string | undefined;
        rating?: number | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        specialties?: string[] | undefined;
        availability?: string[] | undefined;
        priceRange?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
    } | undefined;
    pagination?: {
        page: number;
        limit: number;
    } | undefined;
}, {
    query: string;
    type?: "sessions" | "users" | "posts" | "therapists" | "communities" | "all" | "worksheets" | undefined;
    sortBy?: "date" | "rating" | "name" | "price" | "relevance" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    filters?: {
        location?: string | undefined;
        rating?: number | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        specialties?: string[] | undefined;
        availability?: string[] | undefined;
        priceRange?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
    } | undefined;
    pagination?: {
        page?: number | undefined;
        limit?: number | undefined;
    } | undefined;
}>;
export declare const SearchResultItemSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["user", "therapist", "post", "community", "session", "worksheet"]>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    score: z.ZodNumber;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    highlightedFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "user" | "therapist" | "community" | "post" | "session" | "worksheet";
    id: string;
    title: string;
    score: number;
    description?: string | undefined;
    metadata?: Record<string, any> | undefined;
    imageUrl?: string | undefined;
    highlightedFields?: string[] | undefined;
}, {
    type: "user" | "therapist" | "community" | "post" | "session" | "worksheet";
    id: string;
    title: string;
    score: number;
    description?: string | undefined;
    metadata?: Record<string, any> | undefined;
    imageUrl?: string | undefined;
    highlightedFields?: string[] | undefined;
}>;
export declare const SearchResponseDtoSchema: z.ZodObject<{
    query: z.ZodString;
    totalResults: z.ZodNumber;
    totalPages: z.ZodNumber;
    currentPage: z.ZodNumber;
    results: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["user", "therapist", "post", "community", "session", "worksheet"]>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
        score: z.ZodNumber;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        highlightedFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "user" | "therapist" | "community" | "post" | "session" | "worksheet";
        id: string;
        title: string;
        score: number;
        description?: string | undefined;
        metadata?: Record<string, any> | undefined;
        imageUrl?: string | undefined;
        highlightedFields?: string[] | undefined;
    }, {
        type: "user" | "therapist" | "community" | "post" | "session" | "worksheet";
        id: string;
        title: string;
        score: number;
        description?: string | undefined;
        metadata?: Record<string, any> | undefined;
        imageUrl?: string | undefined;
        highlightedFields?: string[] | undefined;
    }>, "many">;
    suggestions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    filters: z.ZodOptional<z.ZodObject<{
        appliedFilters: z.ZodRecord<z.ZodString, z.ZodAny>;
        availableFilters: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        appliedFilters: Record<string, any>;
        availableFilters: Record<string, string[]>;
    }, {
        appliedFilters: Record<string, any>;
        availableFilters: Record<string, string[]>;
    }>>;
    executionTime: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    totalPages: number;
    query: string;
    totalResults: number;
    currentPage: number;
    results: {
        type: "user" | "therapist" | "community" | "post" | "session" | "worksheet";
        id: string;
        title: string;
        score: number;
        description?: string | undefined;
        metadata?: Record<string, any> | undefined;
        imageUrl?: string | undefined;
        highlightedFields?: string[] | undefined;
    }[];
    filters?: {
        appliedFilters: Record<string, any>;
        availableFilters: Record<string, string[]>;
    } | undefined;
    suggestions?: string[] | undefined;
    executionTime?: number | undefined;
}, {
    totalPages: number;
    query: string;
    totalResults: number;
    currentPage: number;
    results: {
        type: "user" | "therapist" | "community" | "post" | "session" | "worksheet";
        id: string;
        title: string;
        score: number;
        description?: string | undefined;
        metadata?: Record<string, any> | undefined;
        imageUrl?: string | undefined;
        highlightedFields?: string[] | undefined;
    }[];
    filters?: {
        appliedFilters: Record<string, any>;
        availableFilters: Record<string, string[]>;
    } | undefined;
    suggestions?: string[] | undefined;
    executionTime?: number | undefined;
}>;
export declare const AdvancedSearchDtoSchema: z.ZodObject<{
    criteria: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<["equals", "contains", "startsWith", "endsWith", "greaterThan", "lessThan", "between"]>;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodString, "many">]>;
        weight: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | string[];
        field: string;
        operator: "startsWith" | "endsWith" | "equals" | "contains" | "greaterThan" | "lessThan" | "between";
        weight?: number | undefined;
    }, {
        value: string | number | boolean | string[];
        field: string;
        operator: "startsWith" | "endsWith" | "equals" | "contains" | "greaterThan" | "lessThan" | "between";
        weight?: number | undefined;
    }>, "many">;
    logicalOperator: z.ZodDefault<z.ZodEnum<["AND", "OR"]>>;
    pagination: z.ZodOptional<z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
    }, {
        page?: number | undefined;
        limit?: number | undefined;
    }>>;
    includeHighlights: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    criteria: {
        value: string | number | boolean | string[];
        field: string;
        operator: "startsWith" | "endsWith" | "equals" | "contains" | "greaterThan" | "lessThan" | "between";
        weight?: number | undefined;
    }[];
    logicalOperator: "AND" | "OR";
    includeHighlights: boolean;
    pagination?: {
        page: number;
        limit: number;
    } | undefined;
}, {
    criteria: {
        value: string | number | boolean | string[];
        field: string;
        operator: "startsWith" | "endsWith" | "equals" | "contains" | "greaterThan" | "lessThan" | "between";
        weight?: number | undefined;
    }[];
    pagination?: {
        page?: number | undefined;
        limit?: number | undefined;
    } | undefined;
    logicalOperator?: "AND" | "OR" | undefined;
    includeHighlights?: boolean | undefined;
}>;
export declare const TherapistSearchDtoSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    specialties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    location: z.ZodOptional<z.ZodString>;
    maxDistance: z.ZodOptional<z.ZodNumber>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "any"]>>;
    languages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    priceRange: z.ZodOptional<z.ZodObject<{
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        min?: number | undefined;
        max?: number | undefined;
    }, {
        min?: number | undefined;
        max?: number | undefined;
    }>>;
    availability: z.ZodOptional<z.ZodObject<{
        dayOfWeek: z.ZodOptional<z.ZodArray<z.ZodEnum<["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]>, "many">>;
        timeRange: z.ZodOptional<z.ZodObject<{
            start: z.ZodOptional<z.ZodString>;
            end: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            start?: string | undefined;
            end?: string | undefined;
        }, {
            start?: string | undefined;
            end?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        dayOfWeek?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
        timeRange?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }, {
        dayOfWeek?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
        timeRange?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }>>;
    rating: z.ZodOptional<z.ZodNumber>;
    experienceYears: z.ZodOptional<z.ZodNumber>;
    verifiedOnly: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["relevance", "rating", "price", "experience", "distance"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "rating" | "price" | "experience" | "relevance" | "distance";
    location?: string | undefined;
    rating?: number | undefined;
    query?: string | undefined;
    specialties?: string[] | undefined;
    availability?: {
        dayOfWeek?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
        timeRange?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    } | undefined;
    experienceYears?: number | undefined;
    languages?: string[] | undefined;
    priceRange?: {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
    maxDistance?: number | undefined;
    gender?: "male" | "female" | "any" | undefined;
    verifiedOnly?: boolean | undefined;
}, {
    location?: string | undefined;
    rating?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "rating" | "price" | "experience" | "relevance" | "distance" | undefined;
    query?: string | undefined;
    specialties?: string[] | undefined;
    availability?: {
        dayOfWeek?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
        timeRange?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    } | undefined;
    experienceYears?: number | undefined;
    languages?: string[] | undefined;
    priceRange?: {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
    maxDistance?: number | undefined;
    gender?: "male" | "female" | "any" | undefined;
    verifiedOnly?: boolean | undefined;
}>;
export declare const SearchAutocompleteDtoSchema: z.ZodObject<{
    query: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["all", "therapists", "specialties", "locations"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "therapists" | "specialties" | "all" | "locations";
    limit: number;
    query: string;
}, {
    query: string;
    type?: "therapists" | "specialties" | "all" | "locations" | undefined;
    limit?: number | undefined;
}>;
export declare const SearchAnalyticsDtoSchema: z.ZodObject<{
    query: z.ZodString;
    resultCount: z.ZodNumber;
    clickedResult: z.ZodOptional<z.ZodString>;
    clickPosition: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    query: string;
    timestamp: string;
    resultCount: number;
    sessionId?: string | undefined;
    clickedResult?: string | undefined;
    clickPosition?: number | undefined;
}, {
    query: string;
    timestamp: string;
    resultCount: number;
    sessionId?: string | undefined;
    clickedResult?: string | undefined;
    clickPosition?: number | undefined;
}>;
export type SearchRequestDto = z.infer<typeof SearchRequestDtoSchema>;
export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;
export type SearchResponseDto = z.infer<typeof SearchResponseDtoSchema>;
export type AdvancedSearchDto = z.infer<typeof AdvancedSearchDtoSchema>;
export type TherapistSearchDto = z.infer<typeof TherapistSearchDtoSchema>;
export type SearchAutocompleteDto = z.infer<typeof SearchAutocompleteDtoSchema>;
export type SearchAnalyticsDto = z.infer<typeof SearchAnalyticsDtoSchema>;
export declare const SearchTherapistsQueryDtoSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    specialties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    location: z.ZodOptional<z.ZodString>;
    maxDistance: z.ZodOptional<z.ZodNumber>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "any"]>>;
    languages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    priceRange: z.ZodOptional<z.ZodObject<{
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        min?: number | undefined;
        max?: number | undefined;
    }, {
        min?: number | undefined;
        max?: number | undefined;
    }>>;
    availability: z.ZodOptional<z.ZodObject<{
        dayOfWeek: z.ZodOptional<z.ZodArray<z.ZodEnum<["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]>, "many">>;
        timeRange: z.ZodOptional<z.ZodObject<{
            start: z.ZodOptional<z.ZodString>;
            end: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            start?: string | undefined;
            end?: string | undefined;
        }, {
            start?: string | undefined;
            end?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        dayOfWeek?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
        timeRange?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }, {
        dayOfWeek?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
        timeRange?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    }>>;
    rating: z.ZodOptional<z.ZodNumber>;
    experienceYears: z.ZodOptional<z.ZodNumber>;
    verifiedOnly: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["relevance", "rating", "price", "experience", "distance"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "rating" | "price" | "experience" | "relevance" | "distance";
    sortOrder: "asc" | "desc";
    location?: string | undefined;
    rating?: number | undefined;
    query?: string | undefined;
    specialties?: string[] | undefined;
    availability?: {
        dayOfWeek?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
        timeRange?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    } | undefined;
    experienceYears?: number | undefined;
    languages?: string[] | undefined;
    priceRange?: {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
    maxDistance?: number | undefined;
    gender?: "male" | "female" | "any" | undefined;
    verifiedOnly?: boolean | undefined;
}, {
    location?: string | undefined;
    rating?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "rating" | "price" | "experience" | "relevance" | "distance" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    query?: string | undefined;
    specialties?: string[] | undefined;
    availability?: {
        dayOfWeek?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
        timeRange?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    } | undefined;
    experienceYears?: number | undefined;
    languages?: string[] | undefined;
    priceRange?: {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
    maxDistance?: number | undefined;
    gender?: "male" | "female" | "any" | undefined;
    verifiedOnly?: boolean | undefined;
}>;
export declare const SearchPostsQueryDtoSchema: z.ZodObject<{
    query: z.ZodString;
    communityId: z.ZodOptional<z.ZodString>;
    authorId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["text", "image", "video", "link", "poll"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    includeComments: z.ZodDefault<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["relevance", "date", "popularity", "comments"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "date" | "comments" | "relevance" | "popularity";
    query: string;
    includeComments: boolean;
    type?: "video" | "image" | "text" | "link" | "poll" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    communityId?: string | undefined;
    tags?: string[] | undefined;
    authorId?: string | undefined;
}, {
    query: string;
    type?: "video" | "image" | "text" | "link" | "poll" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "date" | "comments" | "relevance" | "popularity" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    communityId?: string | undefined;
    tags?: string[] | undefined;
    authorId?: string | undefined;
    includeComments?: boolean | undefined;
}>;
export declare const SearchCommunitiesQueryDtoSchema: z.ZodObject<{
    query: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    isPrivate: z.ZodOptional<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    minMembers: z.ZodOptional<z.ZodNumber>;
    maxMembers: z.ZodOptional<z.ZodNumber>;
    activeOnly: z.ZodDefault<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["relevance", "members", "activity", "created"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "members" | "activity" | "created" | "relevance";
    query: string;
    activeOnly: boolean;
    category?: string | undefined;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
    maxMembers?: number | undefined;
    minMembers?: number | undefined;
}, {
    query: string;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "members" | "activity" | "created" | "relevance" | undefined;
    category?: string | undefined;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
    maxMembers?: number | undefined;
    minMembers?: number | undefined;
    activeOnly?: boolean | undefined;
}>;
export declare const SearchUsersQueryDtoSchema: z.ZodObject<{
    query: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["client", "therapist", "moderator", "admin"]>>;
    location: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    verifiedOnly: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["relevance", "name", "joined", "activity"]>>;
    includeProfile: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "name" | "activity" | "relevance" | "joined";
    isActive: boolean;
    query: string;
    includeProfile: boolean;
    role?: "client" | "therapist" | "moderator" | "admin" | undefined;
    location?: string | undefined;
    verifiedOnly?: boolean | undefined;
}, {
    query: string;
    role?: "client" | "therapist" | "moderator" | "admin" | undefined;
    location?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "name" | "activity" | "relevance" | "joined" | undefined;
    isActive?: boolean | undefined;
    verifiedOnly?: boolean | undefined;
    includeProfile?: boolean | undefined;
}>;
export declare const GlobalSearchQueryDtoSchema: z.ZodObject<{
    query: z.ZodString;
    types: z.ZodOptional<z.ZodArray<z.ZodEnum<["users", "therapists", "posts", "communities", "worksheets"]>, "many">>;
    filters: z.ZodOptional<z.ZodObject<{
        dateFrom: z.ZodOptional<z.ZodString>;
        dateTo: z.ZodOptional<z.ZodString>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        location?: string | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        tags?: string[] | undefined;
        categories?: string[] | undefined;
    }, {
        location?: string | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        tags?: string[] | undefined;
        categories?: string[] | undefined;
    }>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["relevance", "date", "popularity"]>>;
    includeHighlights: z.ZodDefault<z.ZodBoolean>;
    faceted: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "date" | "relevance" | "popularity";
    query: string;
    includeHighlights: boolean;
    faceted: boolean;
    filters?: {
        location?: string | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        tags?: string[] | undefined;
        categories?: string[] | undefined;
    } | undefined;
    types?: ("users" | "posts" | "therapists" | "communities" | "worksheets")[] | undefined;
}, {
    query: string;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "date" | "relevance" | "popularity" | undefined;
    filters?: {
        location?: string | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        tags?: string[] | undefined;
        categories?: string[] | undefined;
    } | undefined;
    includeHighlights?: boolean | undefined;
    types?: ("users" | "posts" | "therapists" | "communities" | "worksheets")[] | undefined;
    faceted?: boolean | undefined;
}>;
export type SearchTherapistsQueryDto = z.infer<typeof SearchTherapistsQueryDtoSchema>;
export type SearchPostsQueryDto = z.infer<typeof SearchPostsQueryDtoSchema>;
export type SearchCommunitiesQueryDto = z.infer<typeof SearchCommunitiesQueryDtoSchema>;
export type SearchUsersQueryDto = z.infer<typeof SearchUsersQueryDtoSchema>;
export type GlobalSearchQueryDto = z.infer<typeof GlobalSearchQueryDtoSchema>;
export declare const SearchTherapistParamsSchema: z.ZodObject<{
    q: z.ZodString;
    specialties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    languages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    minExperience: z.ZodOptional<z.ZodNumber>;
    maxExperience: z.ZodOptional<z.ZodNumber>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    location: z.ZodOptional<z.ZodString>;
    insurance: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    availableFrom: z.ZodOptional<z.ZodString>;
    availableTo: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    q: string;
    location?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    specialties?: string[] | undefined;
    languages?: string[] | undefined;
    minExperience?: number | undefined;
    maxExperience?: number | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    insurance?: string[] | undefined;
    availableFrom?: string | undefined;
    availableTo?: string | undefined;
}, {
    q: string;
    location?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    specialties?: string[] | undefined;
    languages?: string[] | undefined;
    minExperience?: number | undefined;
    maxExperience?: number | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    insurance?: string[] | undefined;
    availableFrom?: string | undefined;
    availableTo?: string | undefined;
}>;
export declare const PostSearchParamsSchema: z.ZodObject<{
    q: z.ZodString;
    communityId: z.ZodOptional<z.ZodString>;
    roomId: z.ZodOptional<z.ZodString>;
    authorId: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    q: string;
    limit?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    roomId?: string | undefined;
    offset?: number | undefined;
    communityId?: string | undefined;
    tags?: string[] | undefined;
    authorId?: string | undefined;
}, {
    q: string;
    limit?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    roomId?: string | undefined;
    offset?: number | undefined;
    communityId?: string | undefined;
    tags?: string[] | undefined;
    authorId?: string | undefined;
}>;
export declare const UserSearchParamsSchema: z.ZodObject<{
    q: z.ZodString;
    role: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    q: string;
    role?: string | undefined;
    limit?: number | undefined;
    isActive?: boolean | undefined;
    offset?: number | undefined;
}, {
    q: string;
    role?: string | undefined;
    limit?: number | undefined;
    isActive?: boolean | undefined;
    offset?: number | undefined;
}>;
export declare const CommunitySearchParamsSchema: z.ZodObject<{
    q: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    q: string;
    limit?: number | undefined;
    isPublic?: boolean | undefined;
    offset?: number | undefined;
    category?: string | undefined;
}, {
    q: string;
    limit?: number | undefined;
    isPublic?: boolean | undefined;
    offset?: number | undefined;
    category?: string | undefined;
}>;
export declare const GlobalSearchParamsSchema: z.ZodObject<{
    q: z.ZodString;
    type: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    q: string;
    type?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}, {
    q: string;
    type?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const SearchResultSchema: z.ZodObject<{
    results: z.ZodArray<z.ZodAny, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    totalPages: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    page: number;
    totalPages: number;
    hasMore: boolean;
    total: number;
    results: any[];
}, {
    page: number;
    totalPages: number;
    hasMore: boolean;
    total: number;
    results: any[];
}>;
export declare const TherapistSearchResultSchema: z.ZodObject<{
    id: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    specialties: z.ZodArray<z.ZodString, "many">;
    experience: z.ZodNumber;
    rating: z.ZodNumber;
    priceRange: z.ZodObject<{
        min: z.ZodNumber;
        max: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        min: number;
        max: number;
    }, {
        min: number;
        max: number;
    }>;
    location: z.ZodString;
    languages: z.ZodArray<z.ZodString, "many">;
    profileImage: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    id: string;
    location: string;
    rating: number;
    specialties: string[];
    experience: number;
    languages: string[];
    priceRange: {
        min: number;
        max: number;
    };
    bio?: string | undefined;
    profileImage?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    id: string;
    location: string;
    rating: number;
    specialties: string[];
    experience: number;
    languages: string[];
    priceRange: {
        min: number;
        max: number;
    };
    bio?: string | undefined;
    profileImage?: string | undefined;
}>;
export declare const PostSearchResultSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    authorId: z.ZodString;
    authorName: z.ZodString;
    communityId: z.ZodString;
    communityName: z.ZodString;
    tags: z.ZodArray<z.ZodString, "many">;
    createdAt: z.ZodString;
    likeCount: z.ZodNumber;
    commentCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    title: string;
    content: string;
    communityId: string;
    tags: string[];
    authorId: string;
    likeCount: number;
    commentCount: number;
    authorName: string;
    communityName: string;
}, {
    id: string;
    createdAt: string;
    title: string;
    content: string;
    communityId: string;
    tags: string[];
    authorId: string;
    likeCount: number;
    commentCount: number;
    authorName: string;
    communityName: string;
}>;
export declare const UserSearchResultSchema: z.ZodObject<{
    id: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    role: z.ZodString;
    profileImage: z.ZodOptional<z.ZodString>;
    isActive: z.ZodBoolean;
    joinedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    role: string;
    id: string;
    isActive: boolean;
    joinedAt: string;
    email?: string | undefined;
    profileImage?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    role: string;
    id: string;
    isActive: boolean;
    joinedAt: string;
    email?: string | undefined;
    profileImage?: string | undefined;
}>;
export declare const CommunitySearchResultSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    memberCount: z.ZodNumber;
    category: z.ZodString;
    isPublic: z.ZodBoolean;
    tags: z.ZodArray<z.ZodString, "many">;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    description: string;
    isPublic: boolean;
    name: string;
    memberCount: number;
    category: string;
    tags: string[];
}, {
    id: string;
    createdAt: string;
    description: string;
    isPublic: boolean;
    name: string;
    memberCount: number;
    category: string;
    tags: string[];
}>;
export declare const GlobalSearchResultSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    url: z.ZodString;
    metadata: z.ZodRecord<z.ZodString, z.ZodAny>;
    score: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: string;
    id: string;
    title: string;
    description: string;
    url: string;
    metadata: Record<string, any>;
    score: number;
}, {
    type: string;
    id: string;
    title: string;
    description: string;
    url: string;
    metadata: Record<string, any>;
    score: number;
}>;
export type SearchTherapistParams = z.infer<typeof SearchTherapistParamsSchema>;
export type PostSearchParams = z.infer<typeof PostSearchParamsSchema>;
export type UserSearchParams = z.infer<typeof UserSearchParamsSchema>;
export type CommunitySearchParams = z.infer<typeof CommunitySearchParamsSchema>;
export type GlobalSearchParams = z.infer<typeof GlobalSearchParamsSchema>;
export type SearchResult<T = any> = z.infer<typeof SearchResultSchema> & {
    results: T[];
};
export type TherapistSearchResult = z.infer<typeof TherapistSearchResultSchema>;
export type PostSearchResult = z.infer<typeof PostSearchResultSchema>;
export type UserSearchResult = z.infer<typeof UserSearchResultSchema>;
export type CommunitySearchResult = z.infer<typeof CommunitySearchResultSchema>;
export type GlobalSearchResult = z.infer<typeof GlobalSearchResultSchema>;
//# sourceMappingURL=search.d.ts.map