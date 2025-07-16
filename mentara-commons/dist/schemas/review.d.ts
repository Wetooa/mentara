import { z } from 'zod';
export declare const ReviewStatusSchema: z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "FLAGGED"]>;
export declare const RatingSchema: z.ZodNumber;
export declare const ReviewClientSchema: z.ZodObject<{
    id: z.ZodString;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
}, {
    id: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
}>;
export declare const ReviewTherapistSchema: z.ZodObject<{
    id: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    firstName: string;
    lastName: string;
}, {
    id: string;
    firstName: string;
    lastName: string;
}>;
export declare const ReviewSchema: z.ZodObject<{
    id: z.ZodString;
    rating: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    therapistId: z.ZodString;
    clientId: z.ZodString;
    meetingId: z.ZodOptional<z.ZodString>;
    isAnonymous: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "FLAGGED"]>>;
    helpfulCount: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    moderationNote: z.ZodOptional<z.ZodString>;
    client: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
    }, {
        id: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
    }>>;
    therapist: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        firstName: string;
        lastName: string;
    }, {
        id: string;
        firstName: string;
        lastName: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
    rating: number;
    therapistId: string;
    clientId: string;
    isAnonymous: boolean;
    helpfulCount: number;
    client?: {
        id: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
    } | undefined;
    therapist?: {
        id: string;
        firstName: string;
        lastName: string;
    } | undefined;
    title?: string | undefined;
    content?: string | undefined;
    meetingId?: string | undefined;
    moderationNote?: string | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    rating: number;
    therapistId: string;
    clientId: string;
    client?: {
        id: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
    } | undefined;
    therapist?: {
        id: string;
        firstName: string;
        lastName: string;
    } | undefined;
    status?: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | undefined;
    title?: string | undefined;
    content?: string | undefined;
    meetingId?: string | undefined;
    isAnonymous?: boolean | undefined;
    helpfulCount?: number | undefined;
    moderationNote?: string | undefined;
}>;
export declare const CreateReviewRequestSchema: z.ZodEffects<z.ZodObject<{
    rating: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    therapistId: z.ZodString;
    meetingId: z.ZodOptional<z.ZodString>;
    isAnonymous: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    rating: number;
    therapistId: string;
    isAnonymous: boolean;
    title?: string | undefined;
    content?: string | undefined;
    meetingId?: string | undefined;
}, {
    rating: number;
    therapistId: string;
    title?: string | undefined;
    content?: string | undefined;
    meetingId?: string | undefined;
    isAnonymous?: boolean | undefined;
}>, {
    rating: number;
    therapistId: string;
    isAnonymous: boolean;
    title?: string | undefined;
    content?: string | undefined;
    meetingId?: string | undefined;
}, {
    rating: number;
    therapistId: string;
    title?: string | undefined;
    content?: string | undefined;
    meetingId?: string | undefined;
    isAnonymous?: boolean | undefined;
}>;
export declare const UpdateReviewRequestSchema: z.ZodObject<{
    rating: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    isAnonymous: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    rating?: number | undefined;
    title?: string | undefined;
    content?: string | undefined;
    isAnonymous?: boolean | undefined;
}, {
    rating?: number | undefined;
    title?: string | undefined;
    content?: string | undefined;
    isAnonymous?: boolean | undefined;
}>;
export declare const ReviewListParamsSchema: z.ZodEffects<z.ZodObject<{
    therapistId: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "FLAGGED"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "rating", "helpfulCount"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    minRating: z.ZodOptional<z.ZodNumber>;
    maxRating: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "createdAt" | "rating" | "helpfulCount";
    sortOrder: "asc" | "desc";
    status?: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}, {
    status?: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "rating" | "helpfulCount" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}>, {
    page: number;
    limit: number;
    sortBy: "createdAt" | "rating" | "helpfulCount";
    sortOrder: "asc" | "desc";
    status?: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}, {
    status?: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "rating" | "helpfulCount" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}>;
export declare const ReviewListResponseSchema: z.ZodObject<{
    reviews: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        rating: z.ZodNumber;
        title: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
        therapistId: z.ZodString;
        clientId: z.ZodString;
        meetingId: z.ZodOptional<z.ZodString>;
        isAnonymous: z.ZodDefault<z.ZodBoolean>;
        status: z.ZodDefault<z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "FLAGGED"]>>;
        helpfulCount: z.ZodDefault<z.ZodNumber>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        moderationNote: z.ZodOptional<z.ZodString>;
        client: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            firstName?: string | undefined;
            lastName?: string | undefined;
        }, {
            id: string;
            firstName?: string | undefined;
            lastName?: string | undefined;
        }>>;
        therapist: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            firstName: string;
            lastName: string;
        }, {
            id: string;
            firstName: string;
            lastName: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
        rating: number;
        therapistId: string;
        clientId: string;
        isAnonymous: boolean;
        helpfulCount: number;
        client?: {
            id: string;
            firstName?: string | undefined;
            lastName?: string | undefined;
        } | undefined;
        therapist?: {
            id: string;
            firstName: string;
            lastName: string;
        } | undefined;
        title?: string | undefined;
        content?: string | undefined;
        meetingId?: string | undefined;
        moderationNote?: string | undefined;
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        rating: number;
        therapistId: string;
        clientId: string;
        client?: {
            id: string;
            firstName?: string | undefined;
            lastName?: string | undefined;
        } | undefined;
        therapist?: {
            id: string;
            firstName: string;
            lastName: string;
        } | undefined;
        status?: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | undefined;
        title?: string | undefined;
        content?: string | undefined;
        meetingId?: string | undefined;
        isAnonymous?: boolean | undefined;
        helpfulCount?: number | undefined;
        moderationNote?: string | undefined;
    }>, "many">;
    totalCount: z.ZodNumber;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
    totalPages: z.ZodNumber;
    averageRating: z.ZodOptional<z.ZodNumber>;
    ratingDistribution: z.ZodOptional<z.ZodObject<{
        '1': z.ZodNumber;
        '2': z.ZodNumber;
        '3': z.ZodNumber;
        '4': z.ZodNumber;
        '5': z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        '1': number;
        '2': number;
        '3': number;
        '4': number;
        '5': number;
    }, {
        '1': number;
        '2': number;
        '3': number;
        '4': number;
        '5': number;
    }>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    reviews: {
        id: string;
        createdAt: string;
        updatedAt: string;
        status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
        rating: number;
        therapistId: string;
        clientId: string;
        isAnonymous: boolean;
        helpfulCount: number;
        client?: {
            id: string;
            firstName?: string | undefined;
            lastName?: string | undefined;
        } | undefined;
        therapist?: {
            id: string;
            firstName: string;
            lastName: string;
        } | undefined;
        title?: string | undefined;
        content?: string | undefined;
        meetingId?: string | undefined;
        moderationNote?: string | undefined;
    }[];
    totalCount: number;
    pageSize: number;
    totalPages: number;
    averageRating?: number | undefined;
    ratingDistribution?: {
        '1': number;
        '2': number;
        '3': number;
        '4': number;
        '5': number;
    } | undefined;
}, {
    page: number;
    reviews: {
        id: string;
        createdAt: string;
        updatedAt: string;
        rating: number;
        therapistId: string;
        clientId: string;
        client?: {
            id: string;
            firstName?: string | undefined;
            lastName?: string | undefined;
        } | undefined;
        therapist?: {
            id: string;
            firstName: string;
            lastName: string;
        } | undefined;
        status?: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | undefined;
        title?: string | undefined;
        content?: string | undefined;
        meetingId?: string | undefined;
        isAnonymous?: boolean | undefined;
        helpfulCount?: number | undefined;
        moderationNote?: string | undefined;
    }[];
    totalCount: number;
    pageSize: number;
    totalPages: number;
    averageRating?: number | undefined;
    ratingDistribution?: {
        '1': number;
        '2': number;
        '3': number;
        '4': number;
        '5': number;
    } | undefined;
}>;
export declare const ReviewStatsSchema: z.ZodObject<{
    totalReviews: z.ZodNumber;
    averageRating: z.ZodNumber;
    ratingDistribution: z.ZodObject<{
        '1': z.ZodNumber;
        '2': z.ZodNumber;
        '3': z.ZodNumber;
        '4': z.ZodNumber;
        '5': z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        '1': number;
        '2': number;
        '3': number;
        '4': number;
        '5': number;
    }, {
        '1': number;
        '2': number;
        '3': number;
        '4': number;
        '5': number;
    }>;
    monthlyReviews: z.ZodArray<z.ZodObject<{
        month: z.ZodString;
        count: z.ZodNumber;
        averageRating: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        averageRating: number;
        month: string;
        count: number;
    }, {
        averageRating: number;
        month: string;
        count: number;
    }>, "many">;
    recentReviews: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        rating: z.ZodNumber;
        title: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
        therapistId: z.ZodString;
        clientId: z.ZodString;
        meetingId: z.ZodOptional<z.ZodString>;
        isAnonymous: z.ZodDefault<z.ZodBoolean>;
        status: z.ZodDefault<z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "FLAGGED"]>>;
        helpfulCount: z.ZodDefault<z.ZodNumber>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        moderationNote: z.ZodOptional<z.ZodString>;
        client: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            firstName?: string | undefined;
            lastName?: string | undefined;
        }, {
            id: string;
            firstName?: string | undefined;
            lastName?: string | undefined;
        }>>;
        therapist: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            firstName: string;
            lastName: string;
        }, {
            id: string;
            firstName: string;
            lastName: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
        rating: number;
        therapistId: string;
        clientId: string;
        isAnonymous: boolean;
        helpfulCount: number;
        client?: {
            id: string;
            firstName?: string | undefined;
            lastName?: string | undefined;
        } | undefined;
        therapist?: {
            id: string;
            firstName: string;
            lastName: string;
        } | undefined;
        title?: string | undefined;
        content?: string | undefined;
        meetingId?: string | undefined;
        moderationNote?: string | undefined;
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        rating: number;
        therapistId: string;
        clientId: string;
        client?: {
            id: string;
            firstName?: string | undefined;
            lastName?: string | undefined;
        } | undefined;
        therapist?: {
            id: string;
            firstName: string;
            lastName: string;
        } | undefined;
        status?: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | undefined;
        title?: string | undefined;
        content?: string | undefined;
        meetingId?: string | undefined;
        isAnonymous?: boolean | undefined;
        helpfulCount?: number | undefined;
        moderationNote?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    averageRating: number;
    ratingDistribution: {
        '1': number;
        '2': number;
        '3': number;
        '4': number;
        '5': number;
    };
    totalReviews: number;
    monthlyReviews: {
        averageRating: number;
        month: string;
        count: number;
    }[];
    recentReviews: {
        id: string;
        createdAt: string;
        updatedAt: string;
        status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
        rating: number;
        therapistId: string;
        clientId: string;
        isAnonymous: boolean;
        helpfulCount: number;
        client?: {
            id: string;
            firstName?: string | undefined;
            lastName?: string | undefined;
        } | undefined;
        therapist?: {
            id: string;
            firstName: string;
            lastName: string;
        } | undefined;
        title?: string | undefined;
        content?: string | undefined;
        meetingId?: string | undefined;
        moderationNote?: string | undefined;
    }[];
}, {
    averageRating: number;
    ratingDistribution: {
        '1': number;
        '2': number;
        '3': number;
        '4': number;
        '5': number;
    };
    totalReviews: number;
    monthlyReviews: {
        averageRating: number;
        month: string;
        count: number;
    }[];
    recentReviews: {
        id: string;
        createdAt: string;
        updatedAt: string;
        rating: number;
        therapistId: string;
        clientId: string;
        client?: {
            id: string;
            firstName?: string | undefined;
            lastName?: string | undefined;
        } | undefined;
        therapist?: {
            id: string;
            firstName: string;
            lastName: string;
        } | undefined;
        status?: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | undefined;
        title?: string | undefined;
        content?: string | undefined;
        meetingId?: string | undefined;
        isAnonymous?: boolean | undefined;
        helpfulCount?: number | undefined;
        moderationNote?: string | undefined;
    }[];
}>;
export declare const TherapistReviewParamsSchema: z.ZodObject<{
    therapistId: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "FLAGGED"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    therapistId: string;
    page: number;
    limit: number;
    status?: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | undefined;
}, {
    therapistId: string;
    status?: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const ModerateReviewRequestSchema: z.ZodEffects<z.ZodObject<{
    status: z.ZodEnum<["approved", "rejected"]>;
    moderationNote: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "approved" | "rejected";
    moderationNote?: string | undefined;
}, {
    status: "approved" | "rejected";
    moderationNote?: string | undefined;
}>, {
    status: "approved" | "rejected";
    moderationNote?: string | undefined;
}, {
    status: "approved" | "rejected";
    moderationNote?: string | undefined;
}>;
export declare const ReviewHelpfulActionSchema: z.ZodObject<{
    reviewId: z.ZodString;
    isHelpful: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    reviewId: string;
    isHelpful: boolean;
}, {
    reviewId: string;
    isHelpful: boolean;
}>;
export declare const ReviewReportSchema: z.ZodObject<{
    id: z.ZodString;
    reviewId: z.ZodString;
    reporterId: z.ZodString;
    reason: z.ZodEnum<["inappropriate_content", "spam", "fake_review", "harassment", "other"]>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["pending", "reviewed", "dismissed"]>>;
    createdAt: z.ZodString;
    reviewedAt: z.ZodOptional<z.ZodString>;
    reviewedBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    status: "pending" | "reviewed" | "dismissed";
    reason: "inappropriate_content" | "spam" | "fake_review" | "harassment" | "other";
    reviewId: string;
    reporterId: string;
    description?: string | undefined;
    reviewedAt?: string | undefined;
    reviewedBy?: string | undefined;
}, {
    id: string;
    createdAt: string;
    reason: "inappropriate_content" | "spam" | "fake_review" | "harassment" | "other";
    reviewId: string;
    reporterId: string;
    status?: "pending" | "reviewed" | "dismissed" | undefined;
    description?: string | undefined;
    reviewedAt?: string | undefined;
    reviewedBy?: string | undefined;
}>;
export declare const ReviewAnalyticsSchema: z.ZodObject<{
    therapistId: z.ZodString;
    timeframe: z.ZodEnum<["week", "month", "quarter", "year"]>;
    metrics: z.ZodObject<{
        totalReviews: z.ZodNumber;
        averageRating: z.ZodNumber;
        ratingTrend: z.ZodNumber;
        responseRate: z.ZodNumber;
        improvementAreas: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        averageRating: number;
        totalReviews: number;
        ratingTrend: number;
        responseRate: number;
        improvementAreas: string[];
    }, {
        averageRating: number;
        totalReviews: number;
        ratingTrend: number;
        responseRate: number;
        improvementAreas: string[];
    }>;
    comparisons: z.ZodObject<{
        previousPeriod: z.ZodObject<{
            averageRating: z.ZodNumber;
            totalReviews: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            averageRating: number;
            totalReviews: number;
        }, {
            averageRating: number;
            totalReviews: number;
        }>;
        platformAverage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        previousPeriod: {
            averageRating: number;
            totalReviews: number;
        };
        platformAverage: number;
    }, {
        previousPeriod: {
            averageRating: number;
            totalReviews: number;
        };
        platformAverage: number;
    }>;
}, "strip", z.ZodTypeAny, {
    therapistId: string;
    timeframe: "month" | "week" | "quarter" | "year";
    metrics: {
        averageRating: number;
        totalReviews: number;
        ratingTrend: number;
        responseRate: number;
        improvementAreas: string[];
    };
    comparisons: {
        previousPeriod: {
            averageRating: number;
            totalReviews: number;
        };
        platformAverage: number;
    };
}, {
    therapistId: string;
    timeframe: "month" | "week" | "quarter" | "year";
    metrics: {
        averageRating: number;
        totalReviews: number;
        ratingTrend: number;
        responseRate: number;
        improvementAreas: string[];
    };
    comparisons: {
        previousPeriod: {
            averageRating: number;
            totalReviews: number;
        };
        platformAverage: number;
    };
}>;
export declare const ReviewResponseSchema: z.ZodObject<{
    id: z.ZodString;
    reviewId: z.ZodString;
    therapistId: z.ZodString;
    content: z.ZodString;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    content: string;
    therapistId: string;
    reviewId: string;
    isPublic: boolean;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    content: string;
    therapistId: string;
    reviewId: string;
    isPublic?: boolean | undefined;
}>;
export declare const CreateReviewResponseSchema: z.ZodObject<{
    content: z.ZodString;
    isPublic: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    content: string;
    isPublic: boolean;
}, {
    content: string;
    isPublic?: boolean | undefined;
}>;
export declare const CreateReviewDtoSchema: z.ZodObject<{
    rating: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    therapistId: z.ZodString;
    meetingId: z.ZodOptional<z.ZodString>;
    isAnonymous: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    rating: number;
    therapistId: string;
    isAnonymous: boolean;
    title?: string | undefined;
    content?: string | undefined;
    meetingId?: string | undefined;
}, {
    rating: number;
    therapistId: string;
    title?: string | undefined;
    content?: string | undefined;
    meetingId?: string | undefined;
    isAnonymous?: boolean | undefined;
}>;
export declare const UpdateReviewDtoSchema: z.ZodObject<{
    rating: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    isAnonymous: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    rating?: number | undefined;
    title?: string | undefined;
    content?: string | undefined;
    isAnonymous?: boolean | undefined;
}, {
    rating?: number | undefined;
    title?: string | undefined;
    content?: string | undefined;
    isAnonymous?: boolean | undefined;
}>;
export declare const ModerateReviewDtoSchema: z.ZodObject<{
    status: z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "FLAGGED"]>;
    moderationNote: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
    moderationNote?: string | undefined;
}, {
    status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
    moderationNote?: string | undefined;
}>;
export declare const GetReviewsDtoSchema: z.ZodObject<{
    therapistId: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "FLAGGED"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    rating: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    status?: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | undefined;
    rating?: number | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
}, {
    status?: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | undefined;
    rating?: number | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const ReviewStatsDtoSchema: z.ZodObject<{
    therapistId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    therapistId: string;
}, {
    therapistId: string;
}>;
export declare const ReviewIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;
export type Rating = z.infer<typeof RatingSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type ReviewClient = z.infer<typeof ReviewClientSchema>;
export type ReviewTherapist = z.infer<typeof ReviewTherapistSchema>;
export type CreateReviewRequest = z.infer<typeof CreateReviewRequestSchema>;
export type UpdateReviewRequest = z.infer<typeof UpdateReviewRequestSchema>;
export type ReviewListParams = z.infer<typeof ReviewListParamsSchema>;
export type ReviewListResponse = z.infer<typeof ReviewListResponseSchema>;
export type ReviewStats = z.infer<typeof ReviewStatsSchema>;
export type TherapistReviewParams = z.infer<typeof TherapistReviewParamsSchema>;
export type ModerateReviewRequest = z.infer<typeof ModerateReviewRequestSchema>;
export type ReviewHelpfulAction = z.infer<typeof ReviewHelpfulActionSchema>;
export type ReviewReport = z.infer<typeof ReviewReportSchema>;
export type ReviewAnalytics = z.infer<typeof ReviewAnalyticsSchema>;
export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;
export type CreateReviewResponse = z.infer<typeof CreateReviewResponseSchema>;
export type CreateReviewDto = z.infer<typeof CreateReviewDtoSchema>;
export type UpdateReviewDto = z.infer<typeof UpdateReviewDtoSchema>;
export type ModerateReviewDto = z.infer<typeof ModerateReviewDtoSchema>;
export type GetReviewsDto = z.infer<typeof GetReviewsDtoSchema>;
export type ReviewStatsDto = z.infer<typeof ReviewStatsDtoSchema>;
export type ReviewIdParam = z.infer<typeof ReviewIdParamSchema>;
//# sourceMappingURL=review.d.ts.map