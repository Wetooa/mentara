import { z } from 'zod';
export declare const PostSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    authorId: z.ZodString;
    communityId: z.ZodString;
    type: z.ZodEnum<["text", "image", "video", "link", "poll"]>;
    isEdited: z.ZodBoolean;
    isDeleted: z.ZodBoolean;
    isPinned: z.ZodBoolean;
    viewCount: z.ZodNumber;
    likeCount: z.ZodNumber;
    commentCount: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    type: "video" | "image" | "text" | "link" | "poll";
    title: string;
    content: string;
    isDeleted: boolean;
    communityId: string;
    authorId: string;
    isEdited: boolean;
    isPinned: boolean;
    viewCount: number;
    likeCount: number;
    commentCount: number;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    type: "video" | "image" | "text" | "link" | "poll";
    title: string;
    content: string;
    isDeleted: boolean;
    communityId: string;
    authorId: string;
    isEdited: boolean;
    isPinned: boolean;
    viewCount: number;
    likeCount: number;
    commentCount: number;
}>;
export declare const CreatePostDtoSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    communityId: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["text", "image", "video", "link", "poll"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    pollOptions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    linkUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "video" | "image" | "text" | "link" | "poll";
    title: string;
    content: string;
    communityId: string;
    attachments?: string[] | undefined;
    tags?: string[] | undefined;
    pollOptions?: string[] | undefined;
    linkUrl?: string | undefined;
}, {
    title: string;
    content: string;
    communityId: string;
    type?: "video" | "image" | "text" | "link" | "poll" | undefined;
    attachments?: string[] | undefined;
    tags?: string[] | undefined;
    pollOptions?: string[] | undefined;
    linkUrl?: string | undefined;
}>;
export declare const UpdatePostDtoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isPinned: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    content?: string | undefined;
    tags?: string[] | undefined;
    isPinned?: boolean | undefined;
}, {
    title?: string | undefined;
    content?: string | undefined;
    tags?: string[] | undefined;
    isPinned?: boolean | undefined;
}>;
export declare const PostReactionSchema: z.ZodObject<{
    id: z.ZodString;
    postId: z.ZodString;
    userId: z.ZodString;
    type: z.ZodEnum<["like", "dislike", "heart", "laugh", "angry"]>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    type: "like" | "dislike" | "heart" | "laugh" | "angry";
    userId: string;
    postId: string;
}, {
    id: string;
    createdAt: string;
    type: "like" | "dislike" | "heart" | "laugh" | "angry";
    userId: string;
    postId: string;
}>;
export declare const CreatePostReactionDtoSchema: z.ZodObject<{
    type: z.ZodEnum<["like", "dislike", "heart", "laugh", "angry"]>;
}, "strip", z.ZodTypeAny, {
    type: "like" | "dislike" | "heart" | "laugh" | "angry";
}, {
    type: "like" | "dislike" | "heart" | "laugh" | "angry";
}>;
export declare const ReportPostDtoSchema: z.ZodObject<{
    reason: z.ZodEnum<["spam", "harassment", "inappropriate", "misinformation", "copyright", "other"]>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: "spam" | "harassment" | "other" | "inappropriate" | "misinformation" | "copyright";
    description?: string | undefined;
}, {
    reason: "spam" | "harassment" | "other" | "inappropriate" | "misinformation" | "copyright";
    description?: string | undefined;
}>;
export declare const PollVoteDtoSchema: z.ZodObject<{
    optionIndex: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    optionIndex: number;
}, {
    optionIndex: number;
}>;
export declare const PostQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    communityId: z.ZodOptional<z.ZodString>;
    authorId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["text", "image", "video", "link", "poll"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    search: z.ZodOptional<z.ZodString>;
    isPinned: z.ZodOptional<z.ZodBoolean>;
    includeDeleted: z.ZodOptional<z.ZodBoolean>;
    sortBy: z.ZodOptional<z.ZodEnum<["createdAt", "updatedAt", "likeCount", "commentCount", "viewCount"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    type?: "video" | "image" | "text" | "link" | "poll" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "viewCount" | "likeCount" | "commentCount" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    communityId?: string | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
    authorId?: string | undefined;
    includeDeleted?: boolean | undefined;
    isPinned?: boolean | undefined;
}, {
    type?: "video" | "image" | "text" | "link" | "poll" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "viewCount" | "likeCount" | "commentCount" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    communityId?: string | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
    authorId?: string | undefined;
    includeDeleted?: boolean | undefined;
    isPinned?: boolean | undefined;
}>;
export declare const ModeratePostDtoSchema: z.ZodObject<{
    action: z.ZodEnum<["approve", "reject", "remove", "pin", "unpin"]>;
    reason: z.ZodOptional<z.ZodString>;
    notifyAuthor: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    action: "approve" | "reject" | "remove" | "pin" | "unpin";
    notifyAuthor: boolean;
    reason?: string | undefined;
}, {
    action: "approve" | "reject" | "remove" | "pin" | "unpin";
    reason?: string | undefined;
    notifyAuthor?: boolean | undefined;
}>;
export declare const PostIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const PostReactionParamSchema: z.ZodObject<{
    postId: z.ZodString;
    reactionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    postId: string;
    reactionId: string;
}, {
    postId: string;
    reactionId: string;
}>;
export type Post = z.infer<typeof PostSchema>;
export type CreatePostDto = z.infer<typeof CreatePostDtoSchema>;
export type UpdatePostDto = z.infer<typeof UpdatePostDtoSchema>;
export type PostReaction = z.infer<typeof PostReactionSchema>;
export type CreatePostReactionDto = z.infer<typeof CreatePostReactionDtoSchema>;
export type ReportPostDto = z.infer<typeof ReportPostDtoSchema>;
export type PollVoteDto = z.infer<typeof PollVoteDtoSchema>;
export type PostQuery = z.infer<typeof PostQuerySchema>;
export type ModeratePostDto = z.infer<typeof ModeratePostDtoSchema>;
export type PostIdParam = z.infer<typeof PostIdParamSchema>;
export type PostReactionParam = z.infer<typeof PostReactionParamSchema>;
export declare const PostParamsDtoSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const PostCreateInputDtoSchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    communityId: z.ZodOptional<z.ZodString>;
    roomId: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<["text", "image", "video", "link", "poll", "announcement"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isAnonymous: z.ZodDefault<z.ZodBoolean>;
    allowComments: z.ZodDefault<z.ZodBoolean>;
    scheduledAt: z.ZodOptional<z.ZodString>;
    pollOptions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    linkUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "video" | "image" | "text" | "link" | "poll" | "announcement";
    title: string;
    content: string;
    isAnonymous: boolean;
    allowComments: boolean;
    roomId?: string | undefined;
    attachments?: string[] | undefined;
    communityId?: string | undefined;
    tags?: string[] | undefined;
    scheduledAt?: string | undefined;
    pollOptions?: string[] | undefined;
    linkUrl?: string | undefined;
}, {
    title: string;
    content: string;
    type?: "video" | "image" | "text" | "link" | "poll" | "announcement" | undefined;
    isAnonymous?: boolean | undefined;
    roomId?: string | undefined;
    attachments?: string[] | undefined;
    communityId?: string | undefined;
    tags?: string[] | undefined;
    scheduledAt?: string | undefined;
    pollOptions?: string[] | undefined;
    linkUrl?: string | undefined;
    allowComments?: boolean | undefined;
}>, {
    type: "video" | "image" | "text" | "link" | "poll" | "announcement";
    title: string;
    content: string;
    isAnonymous: boolean;
    allowComments: boolean;
    roomId?: string | undefined;
    attachments?: string[] | undefined;
    communityId?: string | undefined;
    tags?: string[] | undefined;
    scheduledAt?: string | undefined;
    pollOptions?: string[] | undefined;
    linkUrl?: string | undefined;
}, {
    title: string;
    content: string;
    type?: "video" | "image" | "text" | "link" | "poll" | "announcement" | undefined;
    isAnonymous?: boolean | undefined;
    roomId?: string | undefined;
    attachments?: string[] | undefined;
    communityId?: string | undefined;
    tags?: string[] | undefined;
    scheduledAt?: string | undefined;
    pollOptions?: string[] | undefined;
    linkUrl?: string | undefined;
    allowComments?: boolean | undefined;
}>;
export declare const PostUpdateInputDtoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isPinned: z.ZodOptional<z.ZodBoolean>;
    allowComments: z.ZodOptional<z.ZodBoolean>;
    scheduledAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    content?: string | undefined;
    tags?: string[] | undefined;
    scheduledAt?: string | undefined;
    isPinned?: boolean | undefined;
    allowComments?: boolean | undefined;
}, {
    title?: string | undefined;
    content?: string | undefined;
    tags?: string[] | undefined;
    scheduledAt?: string | undefined;
    isPinned?: boolean | undefined;
    allowComments?: boolean | undefined;
}>;
export declare const PostRoomParamsDtoSchema: z.ZodObject<{
    roomId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    roomId: string;
}, {
    roomId: string;
}>;
export declare const VoteContentDtoSchema: z.ZodObject<{
    contentId: z.ZodString;
    contentType: z.ZodEnum<["POST", "COMMENT"]>;
    voteType: z.ZodEnum<["UPVOTE", "DOWNVOTE"]>;
}, "strip", z.ZodTypeAny, {
    contentId: string;
    contentType: "POST" | "COMMENT";
    voteType: "UPVOTE" | "DOWNVOTE";
}, {
    contentId: string;
    contentType: "POST" | "COMMENT";
    voteType: "UPVOTE" | "DOWNVOTE";
}>;
export declare const GiveAwardDtoSchema: z.ZodObject<{
    contentId: z.ZodString;
    contentType: z.ZodEnum<["POST", "COMMENT"]>;
    awardType: z.ZodEnum<["SILVER", "GOLD", "PLATINUM", "HELPFUL", "WHOLESOME", "ROCKET_LIKE"]>;
    message: z.ZodOptional<z.ZodString>;
    isAnonymous: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isAnonymous: boolean;
    contentId: string;
    contentType: "POST" | "COMMENT";
    awardType: "SILVER" | "GOLD" | "PLATINUM" | "HELPFUL" | "WHOLESOME" | "ROCKET_LIKE";
    message?: string | undefined;
}, {
    contentId: string;
    contentType: "POST" | "COMMENT";
    awardType: "SILVER" | "GOLD" | "PLATINUM" | "HELPFUL" | "WHOLESOME" | "ROCKET_LIKE";
    message?: string | undefined;
    isAnonymous?: boolean | undefined;
}>;
export declare const CreateNestedCommentDtoSchema: z.ZodObject<{
    postId: z.ZodString;
    parentId: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
    postId: string;
    parentId?: string | undefined;
}, {
    content: string;
    postId: string;
    parentId?: string | undefined;
}>;
export declare const ReportContentDtoSchema: z.ZodObject<{
    contentId: z.ZodString;
    contentType: z.ZodEnum<["POST", "COMMENT"]>;
    reason: z.ZodEnum<["SPAM", "HARASSMENT", "HATE_SPEECH", "VIOLENCE", "SEXUAL_CONTENT", "MISINFORMATION", "COPYRIGHT", "SELF_HARM", "OTHER"]>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: "SPAM" | "HARASSMENT" | "HATE_SPEECH" | "VIOLENCE" | "SEXUAL_CONTENT" | "MISINFORMATION" | "COPYRIGHT" | "SELF_HARM" | "OTHER";
    contentId: string;
    contentType: "POST" | "COMMENT";
    description?: string | undefined;
}, {
    reason: "SPAM" | "HARASSMENT" | "HATE_SPEECH" | "VIOLENCE" | "SEXUAL_CONTENT" | "MISINFORMATION" | "COPYRIGHT" | "SELF_HARM" | "OTHER";
    contentId: string;
    contentType: "POST" | "COMMENT";
    description?: string | undefined;
}>;
export type PostParamsDto = z.infer<typeof PostParamsDtoSchema>;
export type PostCreateInputDto = z.infer<typeof PostCreateInputDtoSchema>;
export type PostUpdateInputDto = z.infer<typeof PostUpdateInputDtoSchema>;
export type PostRoomParamsDto = z.infer<typeof PostRoomParamsDtoSchema>;
export type VoteContentDto = z.infer<typeof VoteContentDtoSchema>;
export type GiveAwardDto = z.infer<typeof GiveAwardDtoSchema>;
export type CreateNestedCommentDto = z.infer<typeof CreateNestedCommentDtoSchema>;
export type ReportContentDto = z.infer<typeof ReportContentDtoSchema>;
export declare const PostListParamsDtoSchema: z.ZodObject<{
    roomId: z.ZodOptional<z.ZodString>;
    authorId: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["newest", "oldest", "popular"]>>;
    isAnonymous: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    sortBy: "newest" | "oldest" | "popular";
    offset: number;
    isAnonymous?: boolean | undefined;
    roomId?: string | undefined;
    tags?: string[] | undefined;
    authorId?: string | undefined;
}, {
    isAnonymous?: boolean | undefined;
    limit?: number | undefined;
    sortBy?: "newest" | "oldest" | "popular" | undefined;
    roomId?: string | undefined;
    offset?: number | undefined;
    tags?: string[] | undefined;
    authorId?: string | undefined;
}>;
export declare const PostByUserParamsDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    roomId: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["newest", "oldest", "popular"]>>;
    isAnonymous: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    limit: number;
    sortBy: "newest" | "oldest" | "popular";
    offset: number;
    isAnonymous?: boolean | undefined;
    roomId?: string | undefined;
    tags?: string[] | undefined;
}, {
    userId: string;
    isAnonymous?: boolean | undefined;
    limit?: number | undefined;
    sortBy?: "newest" | "oldest" | "popular" | undefined;
    roomId?: string | undefined;
    offset?: number | undefined;
    tags?: string[] | undefined;
}>;
export declare const PostByRoomParamsDtoSchema: z.ZodObject<{
    roomId: z.ZodString;
    authorId: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["newest", "oldest", "popular"]>>;
    isAnonymous: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    sortBy: "newest" | "oldest" | "popular";
    roomId: string;
    offset: number;
    isAnonymous?: boolean | undefined;
    tags?: string[] | undefined;
    authorId?: string | undefined;
}, {
    roomId: string;
    isAnonymous?: boolean | undefined;
    limit?: number | undefined;
    sortBy?: "newest" | "oldest" | "popular" | undefined;
    offset?: number | undefined;
    tags?: string[] | undefined;
    authorId?: string | undefined;
}>;
export type PostListParamsDto = z.infer<typeof PostListParamsDtoSchema>;
export type PostByUserParamsDto = z.infer<typeof PostByUserParamsDtoSchema>;
export type PostByRoomParamsDto = z.infer<typeof PostByRoomParamsDtoSchema>;
export declare const PostHeartSchema: z.ZodObject<{
    id: z.ZodString;
    postId: z.ZodString;
    userId: z.ZodString;
    user: z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        avatarUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
    }, {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
    }>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
    };
    id: string;
    createdAt: string;
    userId: string;
    postId: string;
}, {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
    };
    id: string;
    createdAt: string;
    userId: string;
    postId: string;
}>;
export declare const CommentHeartSchema: z.ZodObject<{
    id: z.ZodString;
    commentId: z.ZodString;
    userId: z.ZodString;
    user: z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        avatarUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
    }, {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
    }>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
    };
    id: string;
    createdAt: string;
    userId: string;
    commentId: string;
}, {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
    };
    id: string;
    createdAt: string;
    userId: string;
    commentId: string;
}>;
export declare const PostCommentSchema: z.ZodType<any>;
export declare const PostWithDetailsSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    authorId: z.ZodString;
    communityId: z.ZodString;
    type: z.ZodEnum<["text", "image", "video", "link", "poll"]>;
    isEdited: z.ZodBoolean;
    isDeleted: z.ZodBoolean;
    isPinned: z.ZodBoolean;
    viewCount: z.ZodNumber;
    likeCount: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    author: z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        avatarUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
    }, {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
    }>;
    room: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        slug: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        slug: string;
    }, {
        id: string;
        name: string;
        slug: string;
    }>;
    hearts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        postId: z.ZodString;
        userId: z.ZodString;
        user: z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            avatarUrl: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string;
        }, {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string;
        }>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string;
        };
        id: string;
        createdAt: string;
        userId: string;
        postId: string;
    }, {
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string;
        };
        id: string;
        createdAt: string;
        userId: string;
        postId: string;
    }>, "many">;
    heartCount: z.ZodNumber;
    isHearted: z.ZodOptional<z.ZodBoolean>;
    comments: z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">;
    commentCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    type: "video" | "image" | "text" | "link" | "poll";
    title: string;
    content: string;
    isDeleted: boolean;
    communityId: string;
    comments: any[];
    authorId: string;
    isEdited: boolean;
    isPinned: boolean;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    author: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
    };
    hearts: {
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string;
        };
        id: string;
        createdAt: string;
        userId: string;
        postId: string;
    }[];
    heartCount: number;
    room: {
        id: string;
        name: string;
        slug: string;
    };
    isHearted?: boolean | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    type: "video" | "image" | "text" | "link" | "poll";
    title: string;
    content: string;
    isDeleted: boolean;
    communityId: string;
    comments: any[];
    authorId: string;
    isEdited: boolean;
    isPinned: boolean;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    author: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
    };
    hearts: {
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string;
        };
        id: string;
        createdAt: string;
        userId: string;
        postId: string;
    }[];
    heartCount: number;
    room: {
        id: string;
        name: string;
        slug: string;
    };
    isHearted?: boolean | undefined;
}>;
export declare const PostListResponseSchema: z.ZodObject<{
    posts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        content: z.ZodString;
        authorId: z.ZodString;
        communityId: z.ZodString;
        type: z.ZodEnum<["text", "image", "video", "link", "poll"]>;
        isEdited: z.ZodBoolean;
        isDeleted: z.ZodBoolean;
        isPinned: z.ZodBoolean;
        viewCount: z.ZodNumber;
        likeCount: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    } & {
        author: z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            avatarUrl: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string;
        }, {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string;
        }>;
        room: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            slug: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            slug: string;
        }, {
            id: string;
            name: string;
            slug: string;
        }>;
        hearts: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            postId: z.ZodString;
            userId: z.ZodString;
            user: z.ZodObject<{
                id: z.ZodString;
                firstName: z.ZodString;
                lastName: z.ZodString;
                avatarUrl: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string;
            }, {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string;
            }>;
            createdAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string;
            };
            id: string;
            createdAt: string;
            userId: string;
            postId: string;
        }, {
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string;
            };
            id: string;
            createdAt: string;
            userId: string;
            postId: string;
        }>, "many">;
        heartCount: z.ZodNumber;
        isHearted: z.ZodOptional<z.ZodBoolean>;
        comments: z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">;
        commentCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        type: "video" | "image" | "text" | "link" | "poll";
        title: string;
        content: string;
        isDeleted: boolean;
        communityId: string;
        comments: any[];
        authorId: string;
        isEdited: boolean;
        isPinned: boolean;
        viewCount: number;
        likeCount: number;
        commentCount: number;
        author: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string;
        };
        hearts: {
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string;
            };
            id: string;
            createdAt: string;
            userId: string;
            postId: string;
        }[];
        heartCount: number;
        room: {
            id: string;
            name: string;
            slug: string;
        };
        isHearted?: boolean | undefined;
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        type: "video" | "image" | "text" | "link" | "poll";
        title: string;
        content: string;
        isDeleted: boolean;
        communityId: string;
        comments: any[];
        authorId: string;
        isEdited: boolean;
        isPinned: boolean;
        viewCount: number;
        likeCount: number;
        commentCount: number;
        author: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string;
        };
        hearts: {
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string;
            };
            id: string;
            createdAt: string;
            userId: string;
            postId: string;
        }[];
        heartCount: number;
        room: {
            id: string;
            name: string;
            slug: string;
        };
        isHearted?: boolean | undefined;
    }>, "many">;
    total: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    hasMore: boolean;
    posts: {
        id: string;
        createdAt: string;
        updatedAt: string;
        type: "video" | "image" | "text" | "link" | "poll";
        title: string;
        content: string;
        isDeleted: boolean;
        communityId: string;
        comments: any[];
        authorId: string;
        isEdited: boolean;
        isPinned: boolean;
        viewCount: number;
        likeCount: number;
        commentCount: number;
        author: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string;
        };
        hearts: {
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string;
            };
            id: string;
            createdAt: string;
            userId: string;
            postId: string;
        }[];
        heartCount: number;
        room: {
            id: string;
            name: string;
            slug: string;
        };
        isHearted?: boolean | undefined;
    }[];
    total: number;
}, {
    hasMore: boolean;
    posts: {
        id: string;
        createdAt: string;
        updatedAt: string;
        type: "video" | "image" | "text" | "link" | "poll";
        title: string;
        content: string;
        isDeleted: boolean;
        communityId: string;
        comments: any[];
        authorId: string;
        isEdited: boolean;
        isPinned: boolean;
        viewCount: number;
        likeCount: number;
        commentCount: number;
        author: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string;
        };
        hearts: {
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string;
            };
            id: string;
            createdAt: string;
            userId: string;
            postId: string;
        }[];
        heartCount: number;
        room: {
            id: string;
            name: string;
            slug: string;
        };
        isHearted?: boolean | undefined;
    }[];
    total: number;
}>;
export declare const HeartPostResponseSchema: z.ZodObject<{
    isHearted: z.ZodBoolean;
    heartCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    heartCount: number;
    isHearted: boolean;
}, {
    heartCount: number;
    isHearted: boolean;
}>;
export declare const CheckHeartedResponseSchema: z.ZodObject<{
    isHearted: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    isHearted: boolean;
}, {
    isHearted: boolean;
}>;
export type PostHeart = z.infer<typeof PostHeartSchema>;
export type CommentHeart = z.infer<typeof CommentHeartSchema>;
export type PostComment = z.infer<typeof PostCommentSchema>;
export type PostWithDetails = z.infer<typeof PostWithDetailsSchema>;
export type PostListResponse = z.infer<typeof PostListResponseSchema>;
export type HeartPostResponse = z.infer<typeof HeartPostResponseSchema>;
export type CheckHeartedResponse = z.infer<typeof CheckHeartedResponseSchema>;
//# sourceMappingURL=posts.d.ts.map