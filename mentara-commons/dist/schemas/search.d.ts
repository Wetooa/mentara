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
        specialties?: string[] | undefined;
        rating?: number | undefined;
        availability?: string[] | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        location?: string | undefined;
        priceRange?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
    }, {
        specialties?: string[] | undefined;
        rating?: number | undefined;
        availability?: string[] | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        location?: string | undefined;
        priceRange?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
    }>>;
    pagination: z.ZodOptional<z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        page: number;
    }, {
        limit?: number | undefined;
        page?: number | undefined;
    }>>;
    sortBy: z.ZodDefault<z.ZodEnum<["relevance", "date", "rating", "price", "name"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    type: "therapists" | "sessions" | "users" | "all" | "posts" | "communities" | "worksheets";
    sortBy: "date" | "rating" | "name" | "relevance" | "price";
    sortOrder: "asc" | "desc";
    query: string;
    filters?: {
        specialties?: string[] | undefined;
        rating?: number | undefined;
        availability?: string[] | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        location?: string | undefined;
        priceRange?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
    } | undefined;
    pagination?: {
        limit: number;
        page: number;
    } | undefined;
}, {
    query: string;
    type?: "therapists" | "sessions" | "users" | "all" | "posts" | "communities" | "worksheets" | undefined;
    sortBy?: "date" | "rating" | "name" | "relevance" | "price" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    filters?: {
        specialties?: string[] | undefined;
        rating?: number | undefined;
        availability?: string[] | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        location?: string | undefined;
        priceRange?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
    } | undefined;
    pagination?: {
        limit?: number | undefined;
        page?: number | undefined;
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
    id: string;
    type: "user" | "therapist" | "post" | "community" | "session" | "worksheet";
    title: string;
    score: number;
    description?: string | undefined;
    metadata?: Record<string, any> | undefined;
    imageUrl?: string | undefined;
    highlightedFields?: string[] | undefined;
}, {
    id: string;
    type: "user" | "therapist" | "post" | "community" | "session" | "worksheet";
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
        id: string;
        type: "user" | "therapist" | "post" | "community" | "session" | "worksheet";
        title: string;
        score: number;
        description?: string | undefined;
        metadata?: Record<string, any> | undefined;
        imageUrl?: string | undefined;
        highlightedFields?: string[] | undefined;
    }, {
        id: string;
        type: "user" | "therapist" | "post" | "community" | "session" | "worksheet";
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
        id: string;
        type: "user" | "therapist" | "post" | "community" | "session" | "worksheet";
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
        id: string;
        type: "user" | "therapist" | "post" | "community" | "session" | "worksheet";
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
        limit: number;
        page: number;
    }, {
        limit?: number | undefined;
        page?: number | undefined;
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
        limit: number;
        page: number;
    } | undefined;
}, {
    criteria: {
        value: string | number | boolean | string[];
        field: string;
        operator: "startsWith" | "endsWith" | "equals" | "contains" | "greaterThan" | "lessThan" | "between";
        weight?: number | undefined;
    }[];
    pagination?: {
        limit?: number | undefined;
        page?: number | undefined;
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
    limit: number;
    page: number;
    sortBy: "experience" | "rating" | "relevance" | "price" | "distance";
    languages?: string[] | undefined;
    specialties?: string[] | undefined;
    rating?: number | undefined;
    availability?: {
        dayOfWeek?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
        timeRange?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    } | undefined;
    query?: string | undefined;
    experienceYears?: number | undefined;
    location?: string | undefined;
    priceRange?: {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
    maxDistance?: number | undefined;
    gender?: "male" | "female" | "any" | undefined;
    verifiedOnly?: boolean | undefined;
}, {
    languages?: string[] | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    specialties?: string[] | undefined;
    rating?: number | undefined;
    availability?: {
        dayOfWeek?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
        timeRange?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    } | undefined;
    sortBy?: "experience" | "rating" | "relevance" | "price" | "distance" | undefined;
    query?: string | undefined;
    experienceYears?: number | undefined;
    location?: string | undefined;
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
    resultCount: number;
    timestamp: string;
    sessionId?: string | undefined;
    clickedResult?: string | undefined;
    clickPosition?: number | undefined;
}, {
    query: string;
    resultCount: number;
    timestamp: string;
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
    limit: number;
    page: number;
    sortBy: "experience" | "rating" | "relevance" | "price" | "distance";
    sortOrder: "asc" | "desc";
    languages?: string[] | undefined;
    specialties?: string[] | undefined;
    rating?: number | undefined;
    availability?: {
        dayOfWeek?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
        timeRange?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    } | undefined;
    query?: string | undefined;
    experienceYears?: number | undefined;
    location?: string | undefined;
    priceRange?: {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
    maxDistance?: number | undefined;
    gender?: "male" | "female" | "any" | undefined;
    verifiedOnly?: boolean | undefined;
}, {
    languages?: string[] | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    specialties?: string[] | undefined;
    rating?: number | undefined;
    availability?: {
        dayOfWeek?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
        timeRange?: {
            start?: string | undefined;
            end?: string | undefined;
        } | undefined;
    } | undefined;
    sortBy?: "experience" | "rating" | "relevance" | "price" | "distance" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    query?: string | undefined;
    experienceYears?: number | undefined;
    location?: string | undefined;
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
    limit: number;
    page: number;
    sortBy: "date" | "relevance" | "popularity" | "comments";
    query: string;
    includeComments: boolean;
    type?: "video" | "image" | "text" | "link" | "poll" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    tags?: string[] | undefined;
    communityId?: string | undefined;
    authorId?: string | undefined;
}, {
    query: string;
    type?: "video" | "image" | "text" | "link" | "poll" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "date" | "relevance" | "popularity" | "comments" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    tags?: string[] | undefined;
    communityId?: string | undefined;
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
    limit: number;
    page: number;
    sortBy: "created" | "relevance" | "members" | "activity";
    query: string;
    activeOnly: boolean;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
    category?: string | undefined;
    maxMembers?: number | undefined;
    minMembers?: number | undefined;
}, {
    query: string;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "created" | "relevance" | "members" | "activity" | undefined;
    isPrivate?: boolean | undefined;
    tags?: string[] | undefined;
    category?: string | undefined;
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
    isActive: boolean;
    limit: number;
    page: number;
    sortBy: "name" | "relevance" | "activity" | "joined";
    query: string;
    includeProfile: boolean;
    role?: "client" | "therapist" | "moderator" | "admin" | undefined;
    location?: string | undefined;
    verifiedOnly?: boolean | undefined;
}, {
    query: string;
    role?: "client" | "therapist" | "moderator" | "admin" | undefined;
    isActive?: boolean | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "name" | "relevance" | "activity" | "joined" | undefined;
    location?: string | undefined;
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
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        tags?: string[] | undefined;
        location?: string | undefined;
        categories?: string[] | undefined;
    }, {
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        tags?: string[] | undefined;
        location?: string | undefined;
        categories?: string[] | undefined;
    }>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["relevance", "date", "popularity"]>>;
    includeHighlights: z.ZodDefault<z.ZodBoolean>;
    faceted: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "date" | "relevance" | "popularity";
    query: string;
    includeHighlights: boolean;
    faceted: boolean;
    filters?: {
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        tags?: string[] | undefined;
        location?: string | undefined;
        categories?: string[] | undefined;
    } | undefined;
    types?: ("therapists" | "users" | "posts" | "communities" | "worksheets")[] | undefined;
}, {
    query: string;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "date" | "relevance" | "popularity" | undefined;
    filters?: {
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        tags?: string[] | undefined;
        location?: string | undefined;
        categories?: string[] | undefined;
    } | undefined;
    includeHighlights?: boolean | undefined;
    types?: ("therapists" | "users" | "posts" | "communities" | "worksheets")[] | undefined;
    faceted?: boolean | undefined;
}>;
export type SearchTherapistsQueryDto = z.infer<typeof SearchTherapistsQueryDtoSchema>;
export type SearchPostsQueryDto = z.infer<typeof SearchPostsQueryDtoSchema>;
export type SearchCommunitiesQueryDto = z.infer<typeof SearchCommunitiesQueryDtoSchema>;
export type SearchUsersQueryDto = z.infer<typeof SearchUsersQueryDtoSchema>;
export type GlobalSearchQueryDto = z.infer<typeof GlobalSearchQueryDtoSchema>;
//# sourceMappingURL=search.d.ts.map