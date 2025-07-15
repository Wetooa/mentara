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
    reason: "other" | "spam" | "harassment" | "inappropriate" | "misinformation" | "copyright";
    description?: string | undefined;
}, {
    reason: "other" | "spam" | "harassment" | "inappropriate" | "misinformation" | "copyright";
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
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "viewCount" | "likeCount" | "commentCount" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    tags?: string[] | undefined;
    communityId?: string | undefined;
    search?: string | undefined;
    authorId?: string | undefined;
    includeDeleted?: boolean | undefined;
    isPinned?: boolean | undefined;
}, {
    type?: "video" | "image" | "text" | "link" | "poll" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "viewCount" | "likeCount" | "commentCount" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    tags?: string[] | undefined;
    communityId?: string | undefined;
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
    attachments?: string[] | undefined;
    tags?: string[] | undefined;
    communityId?: string | undefined;
    roomId?: string | undefined;
    pollOptions?: string[] | undefined;
    linkUrl?: string | undefined;
    scheduledAt?: string | undefined;
}, {
    title: string;
    content: string;
    type?: "video" | "image" | "text" | "link" | "poll" | "announcement" | undefined;
    isAnonymous?: boolean | undefined;
    attachments?: string[] | undefined;
    tags?: string[] | undefined;
    communityId?: string | undefined;
    roomId?: string | undefined;
    pollOptions?: string[] | undefined;
    linkUrl?: string | undefined;
    allowComments?: boolean | undefined;
    scheduledAt?: string | undefined;
}>, {
    type: "video" | "image" | "text" | "link" | "poll" | "announcement";
    title: string;
    content: string;
    isAnonymous: boolean;
    allowComments: boolean;
    attachments?: string[] | undefined;
    tags?: string[] | undefined;
    communityId?: string | undefined;
    roomId?: string | undefined;
    pollOptions?: string[] | undefined;
    linkUrl?: string | undefined;
    scheduledAt?: string | undefined;
}, {
    title: string;
    content: string;
    type?: "video" | "image" | "text" | "link" | "poll" | "announcement" | undefined;
    isAnonymous?: boolean | undefined;
    attachments?: string[] | undefined;
    tags?: string[] | undefined;
    communityId?: string | undefined;
    roomId?: string | undefined;
    pollOptions?: string[] | undefined;
    linkUrl?: string | undefined;
    allowComments?: boolean | undefined;
    scheduledAt?: string | undefined;
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
    isPinned?: boolean | undefined;
    allowComments?: boolean | undefined;
    scheduledAt?: string | undefined;
}, {
    title?: string | undefined;
    content?: string | undefined;
    tags?: string[] | undefined;
    isPinned?: boolean | undefined;
    allowComments?: boolean | undefined;
    scheduledAt?: string | undefined;
}>;
export declare const PostRoomParamsDtoSchema: z.ZodObject<{
    roomId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    roomId: string;
}, {
    roomId: string;
}>;
export type PostParamsDto = z.infer<typeof PostParamsDtoSchema>;
export type PostCreateInputDto = z.infer<typeof PostCreateInputDtoSchema>;
export type PostUpdateInputDto = z.infer<typeof PostUpdateInputDtoSchema>;
export type PostRoomParamsDto = z.infer<typeof PostRoomParamsDtoSchema>;
//# sourceMappingURL=posts.d.ts.map