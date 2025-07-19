import { z } from 'zod';
export declare const CommentSchema: z.ZodObject<{
    id: z.ZodString;
    content: z.ZodString;
    userId: z.ZodString;
    postId: z.ZodString;
    parentId: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    attachmentUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    attachmentNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    attachmentSizes: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    content: string;
    postId: string;
    parentId?: string | undefined;
    attachmentUrls?: string[] | undefined;
    attachmentNames?: string[] | undefined;
    attachmentSizes?: number[] | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    content: string;
    postId: string;
    parentId?: string | undefined;
    attachmentUrls?: string[] | undefined;
    attachmentNames?: string[] | undefined;
    attachmentSizes?: number[] | undefined;
}>;
export declare const CreateCommentDtoSchema: z.ZodObject<{
    content: z.ZodString;
    postId: z.ZodString;
    parentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    content: string;
    postId: string;
    parentId?: string | undefined;
}, {
    content: string;
    postId: string;
    parentId?: string | undefined;
}>;
export declare const UpdateCommentDtoSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export declare const CommentHeartSchema: z.ZodObject<{
    id: z.ZodString;
    commentId: z.ZodString;
    userId: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    userId: string;
    commentId: string;
}, {
    id: string;
    createdAt: string;
    userId: string;
    commentId: string;
}>;
export declare const HeartToggleResponseSchema: z.ZodObject<{
    hearted: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    hearted: boolean;
}, {
    hearted: boolean;
}>;
export declare const ReportCommentDtoSchema: z.ZodObject<{
    reason: z.ZodEnum<["spam", "harassment", "inappropriate", "misinformation", "other"]>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: "spam" | "harassment" | "other" | "inappropriate" | "misinformation";
    description?: string | undefined;
}, {
    reason: "spam" | "harassment" | "other" | "inappropriate" | "misinformation";
    description?: string | undefined;
}>;
export declare const CommentQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    postId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodString>;
    includeDeleted: z.ZodOptional<z.ZodBoolean>;
    sortBy: z.ZodOptional<z.ZodEnum<["createdAt", "updatedAt", "hearts"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    userId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "hearts" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    postId?: string | undefined;
    parentId?: string | undefined;
    includeDeleted?: boolean | undefined;
}, {
    userId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "hearts" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    postId?: string | undefined;
    parentId?: string | undefined;
    includeDeleted?: boolean | undefined;
}>;
export declare const CommentIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type Comment = z.infer<typeof CommentSchema>;
export type CreateCommentDto = z.infer<typeof CreateCommentDtoSchema>;
export type UpdateCommentDto = z.infer<typeof UpdateCommentDtoSchema>;
export type CommentHeart = z.infer<typeof CommentHeartSchema>;
export type HeartToggleResponse = z.infer<typeof HeartToggleResponseSchema>;
export type ReportCommentDto = z.infer<typeof ReportCommentDtoSchema>;
export type CommentQuery = z.infer<typeof CommentQuerySchema>;
export type CommentIdParam = z.infer<typeof CommentIdParamSchema>;
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
    parentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    content: string;
    postId: string;
    parentId?: string | undefined;
}, {
    content: string;
    postId: string;
    parentId?: string | undefined;
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