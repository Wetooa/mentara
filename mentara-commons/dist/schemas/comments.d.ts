import { z } from 'zod';
export declare const CommentSchema: z.ZodObject<{
    id: z.ZodString;
    content: z.ZodString;
    authorId: z.ZodString;
    postId: z.ZodString;
    parentCommentId: z.ZodOptional<z.ZodString>;
    isEdited: z.ZodBoolean;
    isDeleted: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    content: string;
    isDeleted: boolean;
    authorId: string;
    postId: string;
    isEdited: boolean;
    parentCommentId?: string | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    content: string;
    isDeleted: boolean;
    authorId: string;
    postId: string;
    isEdited: boolean;
    parentCommentId?: string | undefined;
}>;
export declare const CreateCommentDtoSchema: z.ZodObject<{
    content: z.ZodString;
    postId: z.ZodString;
    parentCommentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    content: string;
    postId: string;
    parentCommentId?: string | undefined;
}, {
    content: string;
    postId: string;
    parentCommentId?: string | undefined;
}>;
export declare const UpdateCommentDtoSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export declare const CommentReactionSchema: z.ZodObject<{
    id: z.ZodString;
    commentId: z.ZodString;
    userId: z.ZodString;
    type: z.ZodEnum<["like", "dislike", "heart", "laugh"]>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    type: "like" | "dislike" | "heart" | "laugh";
    userId: string;
    commentId: string;
}, {
    id: string;
    createdAt: string;
    type: "like" | "dislike" | "heart" | "laugh";
    userId: string;
    commentId: string;
}>;
export declare const CreateReactionDtoSchema: z.ZodObject<{
    type: z.ZodEnum<["like", "dislike", "heart", "laugh"]>;
}, "strip", z.ZodTypeAny, {
    type: "like" | "dislike" | "heart" | "laugh";
}, {
    type: "like" | "dislike" | "heart" | "laugh";
}>;
export declare const ReportCommentDtoSchema: z.ZodObject<{
    reason: z.ZodEnum<["spam", "harassment", "inappropriate", "misinformation", "other"]>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: "other" | "spam" | "harassment" | "inappropriate" | "misinformation";
    description?: string | undefined;
}, {
    reason: "other" | "spam" | "harassment" | "inappropriate" | "misinformation";
    description?: string | undefined;
}>;
export declare const CommentQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    postId: z.ZodOptional<z.ZodString>;
    authorId: z.ZodOptional<z.ZodString>;
    parentCommentId: z.ZodOptional<z.ZodString>;
    includeDeleted: z.ZodOptional<z.ZodBoolean>;
    sortBy: z.ZodOptional<z.ZodEnum<["createdAt", "updatedAt", "likes"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "likes" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    authorId?: string | undefined;
    postId?: string | undefined;
    parentCommentId?: string | undefined;
    includeDeleted?: boolean | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "likes" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    authorId?: string | undefined;
    postId?: string | undefined;
    parentCommentId?: string | undefined;
    includeDeleted?: boolean | undefined;
}>;
export declare const CommentIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const CommentReactionParamSchema: z.ZodObject<{
    commentId: z.ZodString;
    reactionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    commentId: string;
    reactionId: string;
}, {
    commentId: string;
    reactionId: string;
}>;
export type Comment = z.infer<typeof CommentSchema>;
export type CreateCommentDto = z.infer<typeof CreateCommentDtoSchema>;
export type UpdateCommentDto = z.infer<typeof UpdateCommentDtoSchema>;
export type CommentReaction = z.infer<typeof CommentReactionSchema>;
export type CreateReactionDto = z.infer<typeof CreateReactionDtoSchema>;
export type ReportCommentDto = z.infer<typeof ReportCommentDtoSchema>;
export type CommentQuery = z.infer<typeof CommentQuerySchema>;
export type CommentIdParam = z.infer<typeof CommentIdParamSchema>;
export type CommentReactionParam = z.infer<typeof CommentReactionParamSchema>;
export declare const CommentParamsDtoSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const CommentPostParamsDtoSchema: z.ZodObject<{
    postId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    postId: string;
}, {
    postId: string;
}>;
export declare const CommentCreateInputDtoSchema: z.ZodObject<{
    content: z.ZodString;
    postId: z.ZodString;
    parentCommentId: z.ZodOptional<z.ZodString>;
    isAnonymous: z.ZodDefault<z.ZodBoolean>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    content: string;
    isAnonymous: boolean;
    postId: string;
    attachments?: string[] | undefined;
    parentCommentId?: string | undefined;
}, {
    content: string;
    postId: string;
    isAnonymous?: boolean | undefined;
    attachments?: string[] | undefined;
    parentCommentId?: string | undefined;
}>;
export declare const CommentUpdateInputDtoSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export type CommentParamsDto = z.infer<typeof CommentParamsDtoSchema>;
export type CommentPostParamsDto = z.infer<typeof CommentPostParamsDtoSchema>;
export type CommentCreateInputDto = z.infer<typeof CommentCreateInputDtoSchema>;
export type CommentUpdateInputDto = z.infer<typeof CommentUpdateInputDtoSchema>;
//# sourceMappingURL=comments.d.ts.map